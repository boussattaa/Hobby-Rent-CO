'use server';

import { createClient } from '@/utils/supabase/server';
import { stripe } from '@/utils/stripe'; // Assuming we have a stripe utility initialized
import { redirect } from 'next/navigation';

export async function createStripeConnectAccount() {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) throw new Error('Not authenticated');

    // 1. Create a Standard/Express account
    const account = await stripe.accounts.create({
        type: 'express',
        email: user.email,
        capabilities: {
            card_payments: { requested: true },
            transfers: { requested: true },
        },
    });

    // 2. Save account ID to profile
    await supabase
        .from('profiles')
        .update({ stripe_account_id: account.id })
        .eq('id', user.id);

    // 3. Create Account Link for onboarding
    const accountLink = await stripe.accountLinks.create({
        account: account.id,
        refresh_url: `${process.env.NEXT_PUBLIC_BASE_URL}/earnings`,
        return_url: `${process.env.NEXT_PUBLIC_BASE_URL}/earnings`,
        type: 'account_onboarding',
    });

    return accountLink.url;
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
