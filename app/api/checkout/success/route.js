import { createClient as createAdminClient } from '@supabase/supabase-js';

export async function POST(request) {
    if (!process.env.STRIPE_SECRET_KEY) {
        return NextResponse.json({ error: 'Stripe Secret Key missing' }, { status: 500 });
    }

    try {
        const { sessionId } = await request.json();
        const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

        // Use Admin Client to bypass RLS for status update
        const supabaseAdmin = createAdminClient(
            process.env.NEXT_PUBLIC_SUPABASE_URL,
            process.env.SUPABASE_SERVICE_ROLE_KEY,
            {
                auth: {
                    autoRefreshToken: false,
                    persistSession: false
                }
            }
        );

        // 1. Verify Session
        const session = await stripe.checkout.sessions.retrieve(sessionId);
        if (!session || session.payment_status !== 'paid') {
            return NextResponse.json({ error: 'Payment not successful' }, { status: 400 });
        }

        const rentalId = session.metadata.rentalId;
        if (!rentalId) {
            return NextResponse.json({ error: 'No rental ID in metadata' }, { status: 400 });
        }

        // 2. Update Rental Status and save payment intent for refunds
        const { error } = await supabaseAdmin
            .from('rentals')
            .update({
                status: 'approved',
                stripe_payment_intent_id: session.payment_intent // Save for refunds
            })
            .eq('id', rentalId);

        if (error) throw error;

        // 3. Trigger Emails (Non-blocking)
        const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000';

        // Notify Renter (Approved)
        fetch(`${baseUrl}/api/send-email`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ type: 'status_change', bookingId: rentalId })
        }).catch(err => console.error("Renter Email Failed:", err));

        // Notify Owner (Confirmed)
        fetch(`${baseUrl}/api/send-email`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ type: 'new_booking_confirmed', bookingId: rentalId })
        }).catch(err => console.error("Owner Email Failed:", err));

        return NextResponse.json({ success: true, rentalId });

    } catch (err) {
        console.error("Payment Verification Error:", err);
        return NextResponse.json({ error: err.message }, { status: 500 });
    }
}
