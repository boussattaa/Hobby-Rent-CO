import { createClient } from '@supabase/supabase-js';
import { createClient as createServerClient } from '@/utils/supabase/server';
import { NextResponse } from 'next/server';

export async function DELETE(request) {
    // First verify user is authenticated using normal client
    const supabase = await createServerClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // TODO: Add proper admin check in production
    // For now, we trust authenticated users have admin access to this route

    try {
        const { rentalId } = await request.json();

        if (!rentalId) {
            return NextResponse.json({ error: 'Rental ID required' }, { status: 400 });
        }

        // Use service role client to bypass RLS for admin operations
        const adminClient = createClient(
            process.env.NEXT_PUBLIC_SUPABASE_URL,
            process.env.SUPABASE_SERVICE_ROLE_KEY
        );

        const { error } = await adminClient
            .from('rentals')
            .delete()
            .eq('id', rentalId);

        if (error) {
            console.error('Delete error:', error);
            throw error;
        }

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error('Delete error:', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

