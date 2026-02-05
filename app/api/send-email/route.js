import { NextResponse } from 'next/server';
import { Resend } from 'resend';
import { createClient } from '@supabase/supabase-js';

const resend = new Resend(process.env.RESEND_API_KEY);
const supabaseAdmin = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY,
    {
        auth: {
            autoRefreshToken: false,
            persistSession: false
        }
    }
);

export async function POST(request) {
    try {
        const { type, bookingId } = await request.json();

        if (!bookingId) {
            return NextResponse.json({ error: 'Missing bookingId' }, { status: 400 });
        }

        // 1. Fetch Booking Details (with Item and Profiles)
        // Note: We need join tables. Since we are admin, we can query safely.
        // However, our standard client might be easier if RLS allows, but admin is safer.
        const { data: booking, error: bookingError } = await supabaseAdmin
            .from('bookings')
            .select(`
        *,
        items (
          title,
          price,
          price_type
        )
      `)
            .eq('id', bookingId)
            .single();

        if (bookingError || !booking) {
            return NextResponse.json({ error: 'Booking not found' }, { status: 404 });
        }

        // 2. Determine Recipient and Email Content
        let recipientId;
        let subject;
        let htmlContent;

        if (type === 'new_request') {
            recipientId = booking.owner_id;
            subject = `New Booking Request: ${booking.items.title}`;
            htmlContent = `
        <h1>New Booking Request!</h1>
        <p>You have received a request to rent <strong>${booking.items.title}</strong>.</p>
        <p><strong>Total:</strong> $${booking.total_price}</p>
        <p><strong>Dates:</strong> ${new Date(booking.start_date).toLocaleDateString()} - ${new Date(booking.end_date).toLocaleDateString()}</p>
        <br/>
        <a href="${process.env.NEXT_PUBLIC_BASE_URL}/rentals/manage" style="background-color: #000; color: #fff; padding: 10px 20px; text-decoration: none; border-radius: 5px;">View Request</a>
      `;
        } else if (type === 'status_change') {
            // Notify Renter
            recipientId = booking.user_id; // Renter
            subject = `Booking Update: ${booking.status.toUpperCase()}`;
            htmlContent = `
        <h1>Booking Update</h1>
        <p>Your booking for <strong>${booking.items.title}</strong> is now <strong>${booking.status}</strong>.</p>
        <br/>
        <a href="${process.env.NEXT_PUBLIC_BASE_URL}/rentals" style="background-color: #000; color: #fff; padding: 10px 20px; text-decoration: none; border-radius: 5px;">View Booking</a>
      `;
        } else {
            return NextResponse.json({ error: 'Invalid email type' }, { status: 400 });
        }

        // 3. Fetch Recipient Email from Auth Users
        const { data: userData, error: userError } = await supabaseAdmin.auth.admin.getUserById(recipientId);

        if (userError || !userData.user) {
            console.error('User fetch error:', userError);
            return NextResponse.json({ error: 'Recipient user not found' }, { status: 404 });
        }

        const recipientEmail = userData.user.email;

        // 4. Send Email via Resend
        // Use a verified domain or the testing domain 'onboarding@resend.dev' if strictly testing.
        // For specific user emails to work in test mode, you must send to the exact email registered in Resend,
        // OR use the 'delivered@resend.dev' for a generic success.
        // Assuming user wants to see it work:
        // If we are in dev/test, send to the developer's email or the specific allowed test email.
        // Since we don't know if the user verified their domain, we'll try to send to the fetched email 
        // BUT Resend free tier only allows sending to your own email.
        // We will default to a safe value or try the real one. 
        // Let's send to the actual user email. If it fails due to "unverified", we catch it.

        const { data: emailData, error: emailError } = await resend.emails.send({
            from: 'HobbyRent <onboarding@resend.dev>', // Standard Resend Test Sender
            to: recipientEmail, // This might fail if not verified in Resend Dashboard
            subject: subject,
            html: htmlContent,
        });

        if (emailError) {
            console.error('Resend Error:', emailError);
            // Don't fail the request, just log it. 
            // Or return error if strict.
            return NextResponse.json({ error: emailError.message }, { status: 500 });
        }

        return NextResponse.json({ success: true, emailId: emailData.id });

    } catch (err) {
        console.error('API Error:', err);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
