import { createClient } from '@/utils/supabase/server';
import { redirect } from 'next/navigation';
import EarningsClient from './EarningsClient';

export default async function EarningsPage() {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
        redirect('/login');
    }

    // Fetch Profile for Stripe Status
    const { data: profile } = await supabase
        .from('profiles')
        .select('stripe_account_id, stripe_details_submitted')
        .eq('id', user.id)
        .single();

    // Fetch Rentals where user is owner
    const { data: rentals } = await supabase
        .from('rentals')
        .select('*, items(name, price)')
        .eq('owner_id', user.id)
        .order('created_at', { ascending: false });

    // Calculate Earnings
    // Logic: Completed rentals count towards Total Earnings. Active/Approved counts towards Pending.
    // Assuming 10% platform fee for simple math (so user gets 90%)

    // NOTE: This logic should ideally match Stripe Transfer logic exactly. 
    // Here we estimate.

    let totalEarnings = 0;
    let pendingPayout = 0;
    let activeRentalsCount = 0;

    rentals?.forEach(rental => {
        const amount = rental.total_price || 0;
        const netAmount = amount * 0.9; // Deduct 10% fee

        if (rental.status === 'completed') {
            totalEarnings += netAmount;
        } else if (['active', 'approved'].includes(rental.status)) {
            pendingPayout += netAmount;
            activeRentalsCount++;
        }
    });

    return (
        <EarningsClient
            profile={profile}
            rentals={rentals || []}
            totalEarnings={totalEarnings.toFixed(2)}
            pendingPayout={pendingPayout.toFixed(2)}
            activeRentals={activeRentalsCount}
        />
    );
}
