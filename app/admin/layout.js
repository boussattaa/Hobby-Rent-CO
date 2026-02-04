import { createClient } from '@/utils/supabase/server';
import { redirect } from 'next/navigation';
import Link from 'next/link';

export default async function AdminLayout({ children }) {
    const supabase = await createClient();

    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
        redirect('/login');
    }

    // Check if user is admin
    const { data: profile } = await supabase
        .from('profiles')
        .select('is_admin')
        .eq('id', user.id)
        .single();

    if (!profile || !profile.is_admin) {
        redirect('/'); // Not authorized
    }

    return (
        <div className="admin-layout" style={{ display: 'flex', paddingTop: 'var(--header-height)', minHeight: '100vh' }}>
            <aside className="admin-sidebar" style={{ width: '250px', background: 'white', borderRight: '1px solid var(--border-color)', padding: '2rem' }}>
                <h2 style={{ fontSize: '1.2rem', marginBottom: '2rem' }}>👮 Admin</h2>
                <nav style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                    <Link href="/admin" className="admin-link" style={{ textDecoration: 'none', color: 'var(--text-secondary)', fontWeight: 500 }}>Dashboard</Link>
                    <Link href="/admin/users" className="admin-link" style={{ textDecoration: 'none', color: 'var(--text-secondary)', fontWeight: 500 }}>Users</Link>
                    <Link href="/admin/rentals" className="admin-link" style={{ textDecoration: 'none', color: 'var(--text-secondary)', fontWeight: 500 }}>Rentals</Link>
                    <Link href="/admin/payments" className="admin-link" style={{ textDecoration: 'none', color: 'var(--text-secondary)', fontWeight: 500 }}>💰 Payments</Link>
                </nav>
            </aside>
            <main style={{ flex: 1, padding: '2rem', background: '#f8fafc' }}>
                {children}
            </main>
        </div>
    );
}
