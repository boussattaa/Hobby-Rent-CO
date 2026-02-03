
import { headers } from 'next/headers';
import { NextResponse } from 'next/server';
import Stripe from 'stripe';
import { createClient } from '@supabase/supabase-js';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET; // We need to get this from Stripe Dashboard, but valid for now

export async function POST(req) {
    const body = await req.text();
    const signature = headers().get('stripe-signature');

    let event;

    try {
        // Verify the event came consistently from Stripe
        // process.env.STRIPE_WEBHOOK_SECRET must be set for this to work in production
        // For local dev, we might skip if secret is missing (but risky)
        if (process.env.STRIPE_WEBHOOK_SECRET) {
            event = stripe.webhooks.constructEvent(body, signature, process.env.STRIPE_WEBHOOK_SECRET);
        } else {
            // Fallback for testing without signature verification (NOT FOR PRODUCTION)
            event = JSON.parse(body);
        }
    } catch (err) {
        console.error(`Webhook signature verification failed: ${err.message}`);
        return new NextResponse(`Webhook Error: ${err.message}`, { status: 400 });
    }

    // Handle the event
    switch (event.type) {
        case 'identity.verification_session.verified':
            const session = event.data.object;
            console.log('Verification Success!', session);

            // Update Supabase
            await updateUserVerificationStatus(session.metadata.user_id || session.client_reference_id);
            break;

        // Handle other events if needed
        default:
            console.log(`Unhandled event type ${event.type}`);
    }

    return NextResponse.json({ received: true });
}

async function updateUserVerificationStatus(userId) {
    if (!userId) {
        console.error("No user ID found in session metadata");
        return;
    }

    const supabase = createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL,
        process.env.SUPABASE_SERVICE_ROLE_KEY
    );

    const { error } = await supabase
        .from('profiles')
        .update({ is_verified: true })
        .eq('id', userId);

    if (error) {
        console.error('Error updating profile verification:', error);
    } else {
        console.log(`User ${userId} marked as verified.`);
    }
}
