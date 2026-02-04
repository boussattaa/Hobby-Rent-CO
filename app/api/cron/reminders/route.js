import { createClient } from '@supabase/supabase-js';
import { NextResponse } from 'next/server';
import { sendEmail, rentalReminderRenterHtml, rentalReminderOwnerHtml } from '@/utils/resend';

export const dynamic = 'force-dynamic';

export async function GET(request) {
    // Check for authorization (Optional: Add a CRON_SECRET check here)
    // const authHeader = request.headers.get('authorization');
    // if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    //   return new Response('Unauthorized', { status: 401 });
    // }

    if (!process.env.SUPABASE_SERVICE_ROLE_KEY) {
        return NextResponse.json({ error: 'Missing Service Role Key' }, { status: 500 });
    }

    // Init Admin Client (Bypass RLS)
    const supabase = createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL,
        process.env.SUPABASE_SERVICE_ROLE_KEY
    );

    // Calculate tomorrow's date (YYYY-MM-DD)
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    const targetDate = tomorrow.toISOString().split('T')[0];

    console.log(`Checking rentals for date: ${targetDate}`);

    try {
        // 1. Fetch upcoming rentals
        const { data: rentals, error: rentalsError } = await supabase
            .from('rentals')
            .select(`
                id,
                start_date,
                status,
                renter_id,
                owner_id,
                item_id,
                item:items(name)
            `)
            .eq('start_date', targetDate)
            .in('status', ['approved', 'active']); // Assuming 'approved' is the confirmed state before start

        if (rentalsError) throw rentalsError;

        console.log(`Found ${rentals.length} rentals starting tomorrow.`);
        let emailsSent = 0;

        // 2. Process each rental
        for (const rental of rentals) {
            // Fetch Profiles (so we have emails)
            // Note: profiles table usually has public info, but we need email which might be protected or in profiles if we added it.
            // Earlier we added email to profiles SELECT policy? Or we relying on it being there.
            // If profiles doesn't contain email for everyone, we might need auth.admin.getUser(id) which is slow in loop,
            // OR assuming your profiles table has an 'email' column synced.
            // Based on previous step, profiles has email.

            const { data: renter } = await supabase.from('profiles').select('email, first_name').eq('id', rental.renter_id).single();
            const { data: owner } = await supabase.from('profiles').select('email, first_name').eq('id', rental.owner_id).single();

            // Fetch Private Details (Address)
            const { data: privateDetails } = await supabase
                .from('item_private_details')
                .select('storage_address')
                .eq('item_id', rental.item_id)
                .single();

            const pickupAddress = privateDetails?.storage_address || "Address not provided. Please message the owner.";
            const itemName = rental.item?.name || "Item";

            // Send Renter Email
            if (renter?.email) {
                await sendEmail({
                    to: renter.email,
                    subject: `Get ready for your rental - ${itemName}`,
                    html: rentalReminderRenterHtml(renter.first_name || 'Renter', itemName, rental.start_date, pickupAddress)
                });
                emailsSent++;
            }

            // Send Owner Email
            if (owner?.email) {
                await sendEmail({
                    to: owner.email,
                    subject: `Reminder: Pickup Tomorrow - ${itemName}`,
                    html: rentalReminderOwnerHtml(owner.first_name || 'Owner', itemName, rental.start_date, renter?.first_name)
                });
                emailsSent++;
            }
        }

        return NextResponse.json({ success: true, processed: rentals.length, emails_sent: emailsSent });

    } catch (err) {
        console.error('Cron job failed:', err);
        return NextResponse.json({ error: err.message }, { status: 500 });
    }
}
