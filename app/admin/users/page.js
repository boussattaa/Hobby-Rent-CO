import { createClient } from '@/utils/supabase/server';
import AdminUsersClient from './AdminUsersClient';

export default async function AdminUsersPage() {
    const supabase = await createClient();

    const { data: users } = await supabase
        .from('profiles')
        .select('*')
        .order('created_at', { ascending: false });

    return <AdminUsersClient users={users} />;
}
