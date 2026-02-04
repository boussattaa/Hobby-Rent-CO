import { createClient } from '@/utils/supabase/server';
import { NextResponse } from 'next/server';
import Stripe from 'stripe';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

export async function POST(request) {
    try {
        const supabase = await createClient();

        // Verify admin
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { data: profile } = await supabase
            .from('profiles')
            .select('is_admin')
            .eq('id', user.id)
            .single();

        if (!profile?.is_admin) {
            return NextResponse.json({ error: 'Admin access required' }, { status: 403 });
        }

        // Get rental ID from request
        const { rentalId } = await request.json();
        if (!rentalId) {
            return NextResponse.json({ error: 'Rental ID required' }, { status: 400 });
        }

        // Fetch rental with item and owner info
        const { data: rental, error: rentalError } = await supabase
            .from('rentals')
            .select(`
                *,
                items (owner_id, name)
            `)
            .eq('id', rentalId)
            .single();

        if (rentalError || !rental) {
            return NextResponse.json({ error: 'Rental not found' }, { status: 404 });
        }

        if (rental.paid_out) {
            return NextResponse.json({ error: 'Already paid out' }, { status: 400 });
        }

        // Get owner's Stripe account
        const { data: ownerProfile } = await supabase
            .from('profiles')
            .select('stripe_account_id, email')
            .eq('id', rental.items.owner_id)
            .single();

        if (!ownerProfile?.stripe_account_id) {
            return NextResponse.json({
                error: 'Owner has not connected Stripe. They need to complete onboarding at /earnings first.'
            }, { status: 400 });
        }

        // Calculate payout (85% to owner)
        const ownerPayout = Math.round(rental.total_price * 0.85);

        // Create Stripe Transfer to connected account
        const transfer = await stripe.transfers.create({
            amount: ownerPayout,
            currency: 'usd',
            destination: ownerProfile.stripe_account_id,
            metadata: {
                rental_id: rentalId,
                item_name: rental.items.name,
                owner_email: ownerProfile.email
            }
        });

        // Mark rental as paid out
        await supabase
            .from('rentals')
            .update({ paid_out: true })
            .eq('id', rentalId);

        return NextResponse.json({
            success: true,
            transferId: transfer.id,
            amount: ownerPayout
        });

    } catch (error) {
        console.error('Payout error:', error);
        return NextResponse.json({
            error: error.message || 'Payout failed'
        }, { status: 500 });
    }
}
