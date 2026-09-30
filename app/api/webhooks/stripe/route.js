
import { headers } from 'next/headers';
import { NextResponse } from 'next/server';
import Stripe from 'stripe';
import { createClient } from '@supabase/supabase-js';

// Ensure this route is not cached and body is available as raw text
export const dynamic = 'force-dynamic';

export async function POST(req) {
    if (!process.env.STRIPE_SECRET_KEY) {
        return new NextResponse('Stripe Secret Key missing', { status: 500 });
    }
    if (!process.env.STRIPE_WEBHOOK_SECRET) {
        // Refuse to process webhooks without a secret — never parse unverified bodies
        console.error('STRIPE_WEBHOOK_SECRET is not set. Rejecting webhook.');
        return new NextResponse('Webhook secret not configured', { status: 500 });
    }

    const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

    try {
        const body = await req.text();
        const headerList = await headers();
        const signature = headerList.get('stripe-signature');

        let event;
        try {
            event = stripe.webhooks.constructEvent(body, signature, process.env.STRIPE_WEBHOOK_SECRET);
        } catch (err) {
            console.error(`Webhook signature verification failed: ${err.message}`);
            return new NextResponse(`Webhook Error: ${err.message}`, { status: 400 });
        }

        // Handle events idempotently
        switch (event.type) {
            case 'identity.verification_session.verified': {
                const session = event.data.object;
                const userId = session.metadata?.user_id || session.client_reference_id;
                if (userId) {
                    await updateUserVerificationStatus(userId);
                } else {
                    console.error('identity.verification_session.verified: no user_id in metadata', session);
                }
                break;
            }

            case 'checkout.session.completed': {
                const checkoutSession = event.data.object;
                if (checkoutSession.payment_status === 'paid') {
                    const rentalId = checkoutSession.metadata?.rentalId;
                    if (rentalId) {
                        await updateRentalPaymentStatus(rentalId, checkoutSession.payment_intent);
                    } else {
                        console.error('checkout.session.completed: no rentalId in metadata', checkoutSession.metadata);
                    }
                }
                break;
            }

            case 'payment_intent.succeeded': {
                // Secondary confirmation — rental may already be approved via checkout.session.completed
                const pi = event.data.object;
                const rentalId = pi.metadata?.rentalId;
                if (rentalId) {
                    await updateRentalPaymentStatus(rentalId, pi.id);
                }
                break;
            }

            case 'account.updated': {
                // Stripe Connect account status change
                const account = event.data.object;
                if (account.charges_enabled) {
                    await updateStripeConnectStatus(account.id, true);
                }
                break;
            }

            default:
                console.log(`Unhandled event type ${event.type}`);
        }

        return NextResponse.json({ received: true });

    } catch (err) {
        console.error('SERVER ERROR in Webhook:', err);
        return new NextResponse(`Server Error: ${err.message}`, { status: 500 });
    }
}

function getAdminClient() {
    if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY) {
        throw new Error('Missing Supabase configuration (URL or Service Role Key)');
    }
    return createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL,
        process.env.SUPABASE_SERVICE_ROLE_KEY,
        { auth: { autoRefreshToken: false, persistSession: false } }
    );
}

async function updateUserVerificationStatus(userId) {
    const supabase = getAdminClient();
    const { error } = await supabase
        .from('profiles')
        .update({ is_verified: true, id_verified_status: 'verified' })
        .eq('id', userId);
    if (error) {
        console.error('Supabase verification update error:', error);
        throw new Error(`Database Update Failed: ${error.message}`);
    }
    console.log(`User ${userId} marked as verified.`);
}

async function updateRentalPaymentStatus(rentalId, paymentIntentId) {
    const supabase = getAdminClient();
    // Idempotency check
    const { data: rental } = await supabase
        .from('rentals')
        .select('status')
        .eq('id', rentalId)
        .single();

    if (rental?.status === 'approved' || rental?.status === 'active') {
        console.log(`Rental ${rentalId} already approved — skipping duplicate webhook.`);
        return;
    }

    const { error } = await supabase
        .from('rentals')
        .update({
            status: 'approved',
            stripe_payment_intent_id: paymentIntentId,
            waiver_signed: true,
            contract_signed: true,
        })
        .eq('id', rentalId);

    if (error) {
        console.error('Rental payment status update error:', error);
        throw new Error(`Rental Update Failed: ${error.message}`);
    }
    console.log(`Rental ${rentalId} approved via webhook.`);
}

async function updateStripeConnectStatus(stripeAccountId, chargesEnabled) {
    const supabase = getAdminClient();
    const { error } = await supabase
        .from('profiles')
        .update({ stripe_connect_charges_enabled: chargesEnabled })
        .eq('stripe_account_id', stripeAccountId);
    if (error) {
        console.error('Stripe Connect status update error:', error);
    }
}
