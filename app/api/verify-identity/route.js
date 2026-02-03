import { NextResponse } from 'next/server';
import Stripe from 'stripe';
import { createClient } from '@/utils/supabase/server';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

export async function POST(request) {
    try {
        const supabase = await createClient();
        const { data: { user } } = await supabase.auth.getUser();

        if (!user) {
            return NextResponse.json({ error: { message: 'Unauthorized' } }, { status: 401 });
        }

        // Create the session
        const verificationSession = await stripe.identity.verificationSessions.create({
            type: 'document',
            options: {
                document: {
                    require_matching_selfie: true, // High trust factor
                },
            },
            metadata: {
                user_id: user.id
            },
        });

        // Return the client secret to the frontend
        return NextResponse.json({
            clientSecret: verificationSession.client_secret,
        });
    } catch (error) {
        console.error('Error creating verification session:', error);
        return NextResponse.json(
            { error: { message: error.message } },
            { status: 500 }
        );
    }
}
