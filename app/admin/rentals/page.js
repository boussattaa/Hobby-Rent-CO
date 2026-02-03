import { createClient } from '@/utils/supabase/server';
import Link from 'next/link';

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

    // We need to fetch owner emails separately or use a join if we modify the query, 
    // but for now let's just show renter info as that's usually more critical for "who is renting what".
    // Actually, let's try to get owner email too if possible. 
    // Supabase complex joins can be tricky. Let's stick to simple first.

    return (
        <div className="admin-rentals-page">
            <div className="header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
                <h1>All Rentals</h1>
                <span className="count-badge">{rentals?.length} Total</span>
            </div>

            <div className="table-container">
                <table>
                    <thead>
                        <tr>
                            <th>Item</th>
                            <th>Renter</th>
                            <th>Dates</th>
                            <th>Total</th>
                            <th>Status</th>
                            <th>Action</th>
                        </tr>
                    </thead>
                    <tbody>
                        {rentals?.map(rental => (
                            <tr key={rental.id}>
                                <td>
                                    <div style={{ fontWeight: 600 }}>{rental.items?.name || 'Unknown Item'}</div>
                                    <div style={{ fontSize: '0.8rem', color: '#64748b' }}>ID: {rental.item_id.split('-')[0]}...</div>
                                </td>
                                <td>
                                    <div>{rental.profiles?.email}</div>
                                    <div style={{ fontSize: '0.8rem', color: '#64748b' }}>
                                        {rental.profiles?.first_name} {rental.profiles?.last_name}
                                    </div>
                                </td>
                                <td>
                                    <div style={{ fontSize: '0.9rem' }}>
                                        {new Date(rental.start_date).toLocaleDateString()} -
                                    </div>
                                    <div style={{ fontSize: '0.9rem' }}>
                                        {new Date(rental.end_date).toLocaleDateString()}
                                    </div>
                                </td>
                                <td style={{ fontWeight: 600 }}>
                                    ${rental.total_price}
                                </td>
                                <td>
                                    <span className={`status-badge ${rental.status}`}>{rental.status}</span>
                                </td>
                                <td>
                                    <Link href={`/rentals/${rental.id}/inspection`} className="btn-view">
                                        View
                                    </Link>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            <style jsx>{`
            .table-container {
                background: white;
                border-radius: 12px;
                box-shadow: 0 4px 6px rgba(0,0,0,0.05);
                border: 1px solid var(--border-color);
                overflow-x: auto;
            }
            table { width: 100%; border-collapse: collapse; }
            th, td { padding: 1rem; text-align: left; border-bottom: 1px solid var(--border-color); }
            th { background: #f8fafc; font-weight: 600; font-size: 0.9rem; color: var(--text-secondary); }
            tr:last-child td { border-bottom: none; }
            
            .status-badge {
                padding: 0.25rem 0.75rem;
                border-radius: 50px;
                font-size: 0.75rem;
                font-weight: 700;
                text-transform: uppercase;
            }
            .status-badge.pending { background: #fee2e2; color: #dc2626; }
            .status-badge.approved { background: #dcfce7; color: #16a34a; }
            .status-badge.active { background: #dbeafe; color: #2563eb; }
            .status-badge.completed { background: #f3f4f6; color: #4b5563; }

            .btn-view {
                text-decoration: none;
                color: var(--text-primary);
                font-size: 0.85rem;
                border: 1px solid var(--border-color);
                padding: 0.4rem 0.8rem;
                border-radius: 6px;
                transition: all 0.2s;
            }
            .btn-view:hover {
                background: #f8fafc;
                border-color: #cbd5e1;
            }
            
            .count-badge {
                background: var(--text-primary);
                color: white;
                padding: 0.25rem 0.75rem;
                border-radius: 50px;
                font-weight: 600;
                font-size: 0.9rem;
            }
        `}</style>
        </div>
    );
}
