import { NextResponse } from 'next/server';
import Stripe from 'stripe';
import { createClient } from '@/utils/supabase/server';

export async function POST(request) {
    if (!process.env.STRIPE_SECRET_KEY) {
        return NextResponse.json({ error: 'Stripe not configured' }, { status: 500 });
    }

    const supabase = await createClient();

    // Check if user is logged in (admin check would go here in production)
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    try {
        const { rentalId, amount, reason } = await request.json();

        if (!rentalId) {
            return NextResponse.json({ error: 'Rental ID required' }, { status: 400 });
        }

        // 1. Get rental details
        const { data: rental, error: rentalError } = await supabase
            .from('rentals')
            .select('*')
            .eq('id', rentalId)
            .single();

        if (rentalError || !rental) {
            return NextResponse.json({ error: 'Rental not found' }, { status: 404 });
        }

        if (!rental.stripe_payment_intent_id) {
            return NextResponse.json({ error: 'No payment found for this rental. Cannot refund.' }, { status: 400 });
        }

        // 2. Create Stripe refund
        const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

        const refundParams = {
            payment_intent: rental.stripe_payment_intent_id,
            reason: reason || 'requested_by_customer'
        };

        // If amount specified, do partial refund; otherwise full refund
        if (amount && amount > 0) {
            refundParams.amount = Math.round(amount * 100); // Convert to cents
        }

        const refund = await stripe.refunds.create(refundParams);

        // 3. Update rental status
        const { error: updateError } = await supabase
            .from('rentals')
            .update({
                status: 'cancelled',
                refunded: true,
                refund_amount: refund.amount / 100, // Store in dollars
                refund_id: refund.id,
                refunded_at: new Date().toISOString()
            })
            .eq('id', rentalId);

        if (updateError) {
            console.error('Error updating rental after refund:', updateError);
            // Refund was processed, but DB update failed - log this
        }

        return NextResponse.json({
            success: true,
            refundId: refund.id,
            amountRefunded: refund.amount / 100
        });

    } catch (error) {
        console.error('Refund error:', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
