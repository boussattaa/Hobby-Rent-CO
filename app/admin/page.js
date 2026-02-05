import { createClient } from '@/utils/supabase/server';
import AdminDashboardClient from './AdminDashboardClient';

export default async function AdminDashboard() {
    const supabase = await createClient();

    // Fetch High-Level Stats
    const { count: usersCount } = await supabase.from('profiles').select('*', { count: 'exact', head: true });
    const { count: itemsCount } = await supabase.from('items').select('*', { count: 'exact', head: true });
    // Switch to bookings table
    const { count: rentalsCount } = await supabase.from('bookings').select('*', { count: 'exact', head: true });

    // Get Recent Activity Data (Bookings)
    const { data: recentRentals } = await supabase
        .from('bookings')
        .select('*, items(name), profiles:user_id(email)') // Note: user_id is the renter in bookings table
        .order('created_at', { ascending: false })
        .limit(20);

    const { data: recentUsers } = await supabase
        .from('profiles')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(10);

    const { data: recentItems } = await supabase
        .from('items')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(10);

    // Get Chart Data (Last 90 days)
    const { data: chartRentals } = await supabase
        .from('bookings')
        .select('created_at, total_price')
        .gte('created_at', new Date(Date.now() - 90 * 24 * 60 * 60 * 1000).toISOString())
        .order('created_at', { ascending: true });

    // Get Pending Verifications
    const { data: pendingUsers } = await supabase
        .from('profiles')
        .select('*')
        .eq('id_verified_status', 'pending');

    return (
        <AdminDashboardClient
            usersCount={usersCount}
            itemsCount={itemsCount}
            rentalsCount={rentalsCount}
            recentRentals={recentRentals}
            recentUsers={recentUsers}
            recentItems={recentItems}
            chartRentals={chartRentals}
            pendingUsers={pendingUsers || []}
        />
    );
}
