import Stripe from 'stripe';

const key = process.env.STRIPE_SECRET_KEY || 'sk_test_dummy_key_for_build_purposes_only';

if (!process.env.STRIPE_SECRET_KEY) {
    console.warn('Stripe is not configured (STRIPE_SECRET_KEY is missing). Stripe is running in STANDBY/PAUSE mode.');
}

export const stripe = new Stripe(key, {
    apiVersion: '2023-10-16',
});

