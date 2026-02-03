
import { NextResponse } from 'next/server';
import Stripe from 'stripe';

export async function POST(request) {
    if (!process.env.STRIPE_SECRET_KEY) {
        return NextResponse.json({ error: 'Stripe Secret Key missing' }, { status: 500 });
    }

    const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

    try {
        const { itemId, price, name, addProtection } = await request.json();

        const line_items = [
            {
                price_data: {
                    currency: 'usd',
                    product_data: {
                        name: `Rental: ${name}`,
                    },
                    unit_amount: Math.round(price * 100), // Stripe expects cents
                },
                quantity: 1,
            },
            {
                price_data: {
                    currency: 'usd',
                    product_data: {
                        name: 'Service Fee',
                    },
                    unit_amount: 1500, // $15.00
                },
                quantity: 1,
            }
        ];

        if (addProtection) {
            line_items.push({
                price_data: {
                    currency: 'usd',
                    product_data: {
                        name: 'Damage Protection Plan',
                        description: 'Coverage for accidental damage up to $5,000'
                    },
                    unit_amount: 2000, // $20.00
                },
                quantity: 1,
            });
        }

        const session = await stripe.checkout.sessions.create({
            payment_method_types: ['card'],
            line_items: line_items,
            mode: 'payment',
            success_url: `${request.headers.get('origin')}/success?session_id={CHECKOUT_SESSION_ID}`,
            cancel_url: `${request.headers.get('origin')}/item/${itemId}`,
        });

        return NextResponse.json({ url: session.url });
    } catch (err) {
        console.error(err);
        return NextResponse.json({ error: 'Error creating checkout session' }, { status: 500 });
    }
}
