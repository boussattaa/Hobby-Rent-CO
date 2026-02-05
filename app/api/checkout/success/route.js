import { NextResponse } from 'next/server';
import Stripe from 'stripe';
import { createClient } from '@/utils/supabase/server';

export async function POST(request) {
    if (!process.env.STRIPE_SECRET_KEY) {
        return NextResponse.json({ error: 'Stripe Secret Key missing' }, { status: 500 });
    }

    try {
        const { sessionId } = await request.json();
        const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
        const supabase = await createClient();

        // 1. Verify Session
        const session = await stripe.checkout.sessions.retrieve(sessionId);
        if (!session || session.payment_status !== 'paid') {
            return NextResponse.json({ error: 'Payment not successful' }, { status: 400 });
        }

        const rentalId = session.metadata.rentalId;
        if (!rentalId) {
            return NextResponse.json({ error: 'No rental ID in metadata' }, { status: 400 });
        }

        // 2. Update Rental Status and save payment intent for refunds
        const { error } = await supabase
            .from('rentals')
            .update({
                status: 'approved',
                stripe_payment_intent_id: session.payment_intent // Save for refunds
            })
            .eq('id', rentalId);

        if (error) throw error;

        return NextResponse.json({ success: true, rentalId });

    } catch (err) {
        console.error("Payment Verification Error:", err);
        return NextResponse.json({ error: err.message }, { status: 500 });
    }
}
