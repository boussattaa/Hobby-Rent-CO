
import { NextResponse } from 'next/server';
import Stripe from 'stripe';
import { createClient } from '@/utils/supabase/server';

export async function POST(request) {
    if (!process.env.STRIPE_SECRET_KEY) {
        return NextResponse.json({ error: 'Stripe Secret Key missing' }, { status: 500 });
    }

    const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

    try {
        const { itemId, price, name, addProtection, startDate, endDate, rentalId } = await request.json();
        const supabase = await createClient();

        let rental;

        if (rentalId) {
            // PAYING FOR EXISTING RENTAL
            const { data: existingRental, error: fetchError } = await supabase
                .from('rentals')
                .select('*, items(name, price)')
                .eq('id', rentalId)
                .single();

            if (fetchError || !existingRental) throw new Error("Rental not found");
            rental = existingRental;
        } else {
            // CREATE NEW RENTAL (Legacy / Instant Book)
            // 1. Get User/Owner info
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) throw new Error("User not logged in");

            const { data: item } = await supabase.from('items').select('owner_id').eq('id', itemId).single();
            if (!item) throw new Error("Item not found");

            // 2. Create Rental Record
            const { data: newRental, error: rentalError } = await supabase
                .from('rentals')
                .insert({
                    item_id: itemId,
                    renter_id: user.id,
                    owner_id: item.owner_id,
                    start_date: startDate || new Date().toISOString(),
                    end_date: endDate || new Date().toISOString(),
                    total_price: price + 15 + (addProtection ? 20 : 0),
                    status: 'pending' // Default to pending now!
                })
                .select()
                .single();

            if (rentalError) throw new Error("Failed to create rental: " + rentalError.message);
            rental = newRental;
        }

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
            metadata: {
                rentalId: rental.id
            },
            success_url: `${request.headers.get('origin')}/success?session_id={CHECKOUT_SESSION_ID}`,
            cancel_url: `${request.headers.get('origin')}/item/${itemId}`,
        });

        return NextResponse.json({ url: session.url });
    } catch (err) {
        console.error(err);
        return NextResponse.json({ error: 'Error creating checkout session' }, { status: 500 });
    }
}
