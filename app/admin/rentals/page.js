import { createClient } from '@/utils/supabase/server';
import AdminRentalsClient from './AdminRentalsClient';

export const dynamic = 'force-dynamic';

export default async function AdminRentalsPage() {
    const supabase = await createClient();

    const { data: rentals, error } = await supabase
        .from('rentals')
        .select(`
            *,
            items (name, owner_id),
            profiles:renter_id (email, first_name, last_name)
        `)
        .order('created_at', { ascending: false });

    // Debug: show what we got
    if (error) {
        return <div style={{ padding: '2rem', color: 'red' }}>Error loading rentals: {error.message}</div>;
    }

    if (!rentals || rentals.length === 0) {
        return <div style={{ padding: '2rem' }}>No rentals found. (Rentals are created when someone books an item)</div>;
    }

    return <AdminRentalsClient rentals={rentals} />;
}
