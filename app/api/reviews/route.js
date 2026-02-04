
import { createClient } from '@/utils/supabase/server';
import { NextResponse } from 'next/server';

export async function POST(request) {
    const supabase = await createClient();

    // 1. Auth Check
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (!user || authError) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    try {
        const { rentalId, itemId, rating, comment } = await request.json();

        if (!rentalId || !itemId || !rating) {
            return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
        }

        // 2. Insert Review
        // RLS Policies will ensure:
        // - User is the renter
        // - Rental is completed
        // - One review per rental (unique constraint)
        const { data, error } = await supabase
            .from('reviews')
            .insert({
                rental_id: rentalId,
                item_id: itemId,
                reviewer_id: user.id,
                rating: rating,
                comment: comment
            })
            .select()
            .single();

        if (error) {
            console.error("Review insertion error:", error);
            if (error.code === '23505') { // Unique violation
                return NextResponse.json({ error: "You have already reviewed this rental." }, { status: 409 });
            }
            if (error.code === '42501') { // RLS violation
                return NextResponse.json({ error: "You are not authorized to review this rental (Trip must be completed)." }, { status: 403 });
            }
            throw error;
        }

        return NextResponse.json({ success: true, review: data });

    } catch (err) {
        console.error("Review API Error:", err);
        return NextResponse.json({ error: err.message || "Internal Server Error" }, { status: 500 });
    }
}
