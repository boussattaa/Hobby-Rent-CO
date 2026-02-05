import { NextResponse } from 'next/server';
import { stripe } from '@/utils/stripe';
import { createClient } from '@/utils/supabase/server';

export async function POST(request) {
    try {
        const supabase = await createClient();
        const { data: { user } } = await supabase.auth.getUser();

        if (!user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        // Create a Verification Session
        const verificationSession = await stripe.identity.verificationSessions.create({
            type: 'document',
            metadata: {
                user_id: user.id,
            },
            return_url: `${process.env.NEXT_PUBLIC_BASE_URL}/verify?session_id={CHECKOUT_SESSION_ID}`, // Note: Identity uses a different return URL logic usually, but let's check docs. 
            // Identity uses 'return_url' for the flow redirect.
        });

        return NextResponse.json({ clientSecret: verificationSession.client_secret });
    } catch (error) {
        console.error('Stripe Identity Error:', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
