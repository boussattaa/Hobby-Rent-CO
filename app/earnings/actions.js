'use server';

import { createClient } from '@/utils/supabase/server';
import { stripe } from '@/utils/stripe'; // Assuming we have a stripe utility initialized
import { redirect } from 'next/navigation';

export async function createStripeConnectAccount() {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) throw new Error('Not authenticated');

    // Default to localhost for development if not set
    let baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000';

    // Stripe Live Mode requires HTTPS for redirects.
    // If we are using a live key, we MUST use https.
    if (process.env.STRIPE_SECRET_KEY && process.env.STRIPE_SECRET_KEY.startsWith('sk_live')) {
        baseUrl = baseUrl.replace('http://', 'https://');
    }

    if (!baseUrl) {
        // Should effectively never happen with the default above, but good for safety
        throw new Error('Missing NEXT_PUBLIC_BASE_URL environment variable');
    }

    // 1. Create a Standard/Express account
    try {
        const account = await stripe.accounts.create({
            type: 'express',
            email: user.email,
            capabilities: {
                card_payments: { requested: true },
                transfers: { requested: true },
            },
        });

        // 2. Save account ID to profile
        // Only update if not already set, or handle updates gracefully
        await supabase
            .from('profiles')
            .update({ stripe_account_id: account.id })
            .eq('id', user.id);

        // 3. Create Account Link for onboarding
        const accountLink = await stripe.accountLinks.create({
            account: account.id,
            refresh_url: `${baseUrl}/earnings`,
            return_url: `${baseUrl}/earnings`,
            type: 'account_onboarding',
        });

        return accountLink.url;
    } catch (error) {
        console.error('Stripe Connect Error:', error);
        throw new Error(`Stripe Error: ${error.message}`);
    }
}

export async function getStripeDashboardLink() {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('Not authenticated');

    const { data: profile } = await supabase.from('profiles').select('stripe_account_id').eq('id', user.id).single();
    if (!profile?.stripe_account_id) throw new Error('No attached Stripe account');

    const loginLink = await stripe.accounts.createLoginLink(profile.stripe_account_id);
    return loginLink.url;
}
