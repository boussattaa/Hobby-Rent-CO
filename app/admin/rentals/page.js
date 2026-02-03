import { createClient } from '@/utils/supabase/server';
import AdminRentalsClient from './AdminRentalsClient';

export default async function AdminRentalsPage() {
    const supabase = await createClient();

    const { data: rentals } = await supabase
        .from('rentals')
        .select(`
        *,
        items (name, owner_id),
        profiles:renter_id (email, first_name, last_name)
    `)
        .order('created_at', { ascending: false });

    return <AdminRentalsClient rentals={rentals} />;
}
