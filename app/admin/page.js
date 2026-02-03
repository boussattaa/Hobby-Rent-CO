import { createClient } from '@/utils/supabase/server';

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
        <div className="admin-dashboard">
            <h1>Dashboard</h1>

            <div className="stats-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1.5rem', margin: '2rem 0' }}>
                <div className="stat-card">
                    <h3>Total Users</h3>
                    <p className="stat-value">{usersCount}</p>
                </div>
                <div className="stat-card">
                    <h3>Active Listings</h3>
                    <p className="stat-value">{itemsCount}</p>
                </div>
                <div className="stat-card">
                    <h3>Total Rentals</h3>
                    <p className="stat-value">{rentalsCount}</p>
                </div>
            </div>

            <div className="section">
                <h2>Recent Activity</h2>
                <div className="table-container" style={{ background: 'white', borderRadius: '12px', boxShadow: '0 2px 8px rgba(0,0,0,0.05)', overflow: 'hidden' }}>
                    <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                        <thead>
                            <tr style={{ background: '#f1f5f9', textAlign: 'left' }}>
                                <th style={{ padding: '1rem' }}>Item</th>
                                <th style={{ padding: '1rem' }}>Renter</th>
                                <th style={{ padding: '1rem' }}>Status</th>
                                <th style={{ padding: '1rem' }}>Date</th>
                            </tr>
                        </thead>
                        <tbody>
                            {recentRentals?.map(rental => (
                                <tr key={rental.id} style={{ borderBottom: '1px solid var(--border-color)' }}>
                                    <td style={{ padding: '1rem' }}>{rental.items?.name || 'Unknown Item'}</td>
                                    <td style={{ padding: '1rem' }}>{rental.profiles?.email || 'Unknown User'}</td>
                                    <td style={{ padding: '1rem' }}>
                                        <span className={`status-badge ${rental.status}`}>{rental.status}</span>
                                    </td>
                                    <td style={{ padding: '1rem' }}>{new Date(rental.created_at).toLocaleDateString()}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            <style jsx>{`
        .stat-card {
            background: white;
            padding: 1.5rem;
            border-radius: 12px;
            box-shadow: 0 4px 6px rgba(0,0,0,0.05);
            border: 1px solid var(--border-color);
        }
        .stat-card h3 { font-size: 0.9rem; color: var(--text-secondary); margin-bottom: 0.5rem; }
        .stat-value { font-size: 2rem; font-weight: 700; color: var(--text-primary); }
        
        .status-badge {
            padding: 0.25rem 0.75rem;
            border-radius: 50px;
            font-size: 0.85rem;
            font-weight: 600;
        }
        .status-badge.pending { background: #fee2e2; color: #dc2626; }
        .status-badge.approved { background: #dcfce7; color: #16a34a; }
        .status-badge.active { background: #dbeafe; color: #2563eb; }
        .status-badge.completed { background: #f3f4f6; color: #4b5563; }
      `}</style>
        </div>
    );
}
