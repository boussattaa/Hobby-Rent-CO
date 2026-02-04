import { createClient } from '@/utils/supabase/server';
import AdminRentalsClient from './AdminRentalsClient';

export const dynamic = 'force-dynamic';

export default async function AdminRentalsPage() {
    const supabase = await createClient();

    // 1. Fetch Rentals
    const { data: rentals, error } = await supabase
        .from('rentals')
        .select(`
            *,
            items (name, owner_id)
        `)
        .order('created_at', { ascending: false });

    if (error) {
        return <div style={{ padding: '2rem', color: 'red' }}>Error loading rentals: {error.message}</div>;
    }

    if (!rentals || rentals.length === 0) {
        return <div style={{ padding: '2rem' }}>No rentals found.</div>;
    }

    // 2. Fetch Profiles Manually (Avoids JOIN error on auth.users)
    const userIds = new Set();
    rentals.forEach(r => {
        if (r.renter_id) userIds.add(r.renter_id);
        if (r.owner_id) userIds.add(r.owner_id);
    });

    const { data: profiles } = await supabase
        .from('profiles')
        .select('id, email, first_name, last_name')
        .in('id', Array.from(userIds));

    // 3. Map Profiles to Rentals
    const profileMap = new Map((profiles || []).map(p => [p.id, p]));

    const rentalsWithProfiles = rentals.map(r => ({
        ...r,
        renter: profileMap.get(r.renter_id) || { email: 'Unknown' },
        owner: profileMap.get(r.owner_id) || { email: 'Unknown' }
    }));

    return <AdminRentalsClient rentals={rentalsWithProfiles} />;
}
