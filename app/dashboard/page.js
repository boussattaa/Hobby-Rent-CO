
import { createClient } from '@/utils/supabase/server';
import { redirect } from 'next/navigation';
import DashboardClient from './DashboardClient';

export default async function DashboardPage() {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
        redirect('/login?message=Please log in to view your dashboard');
    }

    // 1. Fetch Rentals first
    const { data: rentalsData, error: rentalsError } = await supabase
        .from('rentals')
        .select('*')
        .eq('owner_id', user.id)
        .order('created_at', { ascending: false });

    if (rentalsError) {
        console.error("Error fetching rentals:", JSON.stringify(rentalsError, null, 2));
        return <div className="container">Error loading rentals</div>;
    }

    // 2. Manual Join if rentals exist
    let enrichedRentals = [];
    if (rentalsData && rentalsData.length > 0) {
        // Fetch Items
        const itemIds = [...new Set(rentalsData.map(r => r.item_id))];
        const { data: items } = await supabase.from('items').select('id, name, image_url').in('id', itemIds);
        const itemsMap = new Map(items?.map(i => [i.id, i]) || []);

        // Fetch Renters
        const renterIds = [...new Set(rentalsData.map(r => r.renter_id))];
        const { data: renters } = await supabase.from('profiles').select('id, first_name, email, is_verified').in('id', renterIds);
        const rentersMap = new Map(renters?.map(u => [u.id, u]) || []);

        enrichedRentals = rentalsData.map(r => ({
            ...r,
            items: itemsMap.get(r.item_id),
            renter: rentersMap.get(r.renter_id)
        }));
    }

    if (error) {
        console.error("Error fetching admin rentals:", error);
    }

    return (
        <DashboardClient
            rentals={enrichedRentals}
            user={user}
        />
    );
}
