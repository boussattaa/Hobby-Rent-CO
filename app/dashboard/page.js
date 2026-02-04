
import { createClient } from '@/utils/supabase/server';
import { redirect } from 'next/navigation';
import DashboardClient from './DashboardClient';

export default async function DashboardPage() {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
        redirect('/login?message=Please log in to view your dashboard');
    }

    // Fetch all rentals where user is owner
    const { data: rentals, error } = await supabase
        .from('rentals')
        .select(`
            *,
            items (
                name,
                image_url
            ),
            renter:profiles!renter_id (
                first_name,
                email,
                is_verified
            )
        `)
        .eq('owner_id', user.id)
        .order('created_at', { ascending: false });

    if (error) {
        console.error("Error fetching admin rentals:", error);
    }

    return (
        <DashboardClient
            rentals={rentals || []}
            user={user}
        />
    );
}
