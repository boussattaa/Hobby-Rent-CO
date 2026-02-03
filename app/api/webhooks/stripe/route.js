
import { headers } from 'next/headers';
import { NextResponse } from 'next/server';
import Stripe from 'stripe';
import { createClient } from '@supabase/supabase-js';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

export async function POST(req) {
    try {
        const body = await req.text();
        // Fixed for Next.js 15/16: headers() is async
        const headerList = await headers();
        const signature = headerList.get('stripe-signature');

        let event;

        try {
            if (process.env.STRIPE_WEBHOOK_SECRET) {
                event = stripe.webhooks.constructEvent(body, signature, process.env.STRIPE_WEBHOOK_SECRET);
            } else {
                console.warn("Missing STRIPE_WEBHOOK_SECRET, skipping signature verification (unsafe)");
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

            default:
                console.log(`Unhandled event type ${event.type}`);
        }

        return NextResponse.json({ received: true });

    } catch (err) {
        console.error('SERVER ERROR in Webhook:', err);
        return new NextResponse(`Server Error: ${err.message}`, { status: 500 });
    }
}

async function updateUserVerificationStatus(userId) {
    if (!userId) {
        throw new Error("No user ID found in session metadata");
    }

    if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY) {
        throw new Error("Missing Supabase configuration (URL or Service Role Key) in environment variables");
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
        console.error("Supabase Update Error:", error);
        throw new Error(`Database Update Failed: ${error.message}`);
    } else {
        console.log(`User ${userId} marked as verified.`);
    }
}
