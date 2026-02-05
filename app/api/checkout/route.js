
import { NextResponse } from 'next/server';
import Stripe from 'stripe';
import { createClient } from '@/utils/supabase/server';

export async function POST(request) {
    if (!process.env.STRIPE_SECRET_KEY) {
        return NextResponse.json({ error: 'Stripe Secret Key missing' }, { status: 500 });
    }

    const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

    try {
        const { itemId, price, name, protectionPlan, protectionFee, startDate, endDate, rentalId, waiverSignature } = await request.json();
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

            const { data: item } = await supabase.from('items').select('owner_id, name').eq('id', itemId).single();
            if (!item) throw new Error("Item not found");

            // 2. Create Rental Record
            // Determine timestamps vs dates
            const isHourly = startDate && startDate.includes('T');
            const newRentalData = {
                item_id: itemId,
                item_name: item.name, // Preserve item name for historical records
                renter_id: user.id,
                owner_id: item.owner_id,
                total_price: price + 15 + (protectionFee || 0),
                status: 'pending', // Default to pending
                waiver_signed: !!waiverSignature,
                waiver_signature: waiverSignature || null,
                protection_plan_level: protectionPlan || 'basic',
                protection_fee: protectionFee || 0
            };

            if (isHourly) {
                // Passed as ISO strings
                newRentalData.start_time = startDate;
                newRentalData.end_time = endDate;
                // Derive dates for legacy/daily blocking logic
                newRentalData.start_date = startDate.split('T')[0];
                newRentalData.end_date = endDate.split('T')[0];
            } else {
                // Daily (legacy)
                newRentalData.start_date = startDate || new Date().toISOString();
                newRentalData.end_date = endDate || new Date().toISOString();
                // We could backfill start_time/end_time here too?
                // Optional: set start_time to 00:00 and end_time to 23:59?
                // For now, leave null for Daily to distinguishing them, or fill consistent with migration?
                // Migration backfilled them. Let's fill them for consistency.
                // start_date is just YYYY-MM-DD.
                newRentalData.start_time = `${newRentalData.start_date}T00:00:00Z`; // Naive UTC assumption or just 00:00
                newRentalData.end_time = `${newRentalData.end_date}T23:59:59Z`;
            }

            const { data: newRental, error: rentalError } = await supabase
                .from('rentals')
                .insert(newRentalData)
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

        if (protectionFee > 0) {
            line_items.push({
                price_data: {
                    currency: 'usd',
                    product_data: {
                        name: `Protection Plan (${protectionPlan})`,
                        description: protectionPlan === 'premier'
                            ? '$0 Deductible, $1,500 max out of pocket'
                            : 'Standard Protection Plan'
                    },
                    unit_amount: Math.round(protectionFee * 100),
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
