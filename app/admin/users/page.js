import { createClient } from '@/utils/supabase/server';
import AdminUsersClient from './AdminUsersClient';

export const dynamic = 'force-dynamic';

export default async function AdminUsersPage() {
    const supabase = await createClient();

    // Check if user is authenticated
    const { data: { user } } = await supabase.auth.getUser();

    const { data: users, error } = await supabase
        .from('profiles')
        .select('*')
        .order('created_at', { ascending: false });

    // Debug: show what we got
    if (error) {
        return <div style={{ padding: '2rem', color: 'red' }}>Error loading users: {error.message}</div>;
    }

    if (!users || users.length === 0) {
        return <div style={{ padding: '2rem' }}>No users found. Current user: {user?.email || 'Not logged in'}</div>;
    }

    return <AdminUsersClient users={users} />;
}
