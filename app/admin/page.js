import { createClient } from '@/utils/supabase/server';
import AdminDashboardClient from './AdminDashboardClient';

export default async function AdminDashboard() {
    const supabase = await createClient();

    // Fetch High-Level Stats
    const { count: usersCount } = await supabase.from('profiles').select('*', { count: 'exact', head: true });
    const { count: itemsCount } = await supabase.from('items').select('*', { count: 'exact', head: true });
    const { count: rentalsCount } = await supabase.from('rentals').select('*', { count: 'exact', head: true });

    // Get Recent Rentals
    const { data: recentRentals } = await supabase
        .from('rentals')
        .select('*, items(name), profiles:renter_id(email)')
        .order('created_at', { ascending: false })
        .limit(5);

    return (
        <AdminDashboardClient
            usersCount={usersCount}
            itemsCount={itemsCount}
            rentalsCount={rentalsCount}
            recentRentals={recentRentals}
        />
    );
}
