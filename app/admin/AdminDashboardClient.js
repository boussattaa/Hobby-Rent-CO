'use client';

export default function AdminDashboardClient({ usersCount, itemsCount, rentalsCount, recentRentals }) {
    return (
        <div className="admin-dashboard">
            <h1>Dashboard</h1>

            <div className="stats-grid">
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
                <div className="table-container">
                    <table>
                        <thead>
                            <tr>
                                <th>Item</th>
                                <th>Renter</th>
                                <th>Status</th>
                                <th>Date</th>
                            </tr>
                        </thead>
                        <tbody>
                            {recentRentals?.map(rental => (
                                <tr key={rental.id}>
                                    <td>{rental.items?.name || 'Unknown Item'}</td>
                                    <td>{rental.profiles?.email || 'Unknown User'}</td>
                                    <td>
                                        <span className={`status-badge ${rental.status}`}>{rental.status}</span>
                                    </td>
                                    <td>{new Date(rental.created_at).toLocaleDateString()}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            <style jsx>{`
                .stats-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 1.5rem; margin: 2rem 0; }
                .stat-card {
                    background: white;
                    padding: 1.5rem;
                    border-radius: 12px;
                    box-shadow: 0 4px 6px rgba(0,0,0,0.05);
                    border: 1px solid var(--border-color);
                }
                .stat-card h3 { font-size: 0.9rem; color: var(--text-secondary); margin-bottom: 0.5rem; }
                .stat-value { font-size: 2rem; font-weight: 700; color: var(--text-primary); }
                
                .section h2 { margin-bottom: 1rem; font-size: 1.25rem; }

                .table-container {
                    background: white;
                    border-radius: 12px;
                    box-shadow: 0 2px 8px rgba(0,0,0,0.05);
                    overflow: hidden;
                    border: 1px solid var(--border-color);
                }
                table { width: 100%; border-collapse: collapse; }
                thead tr { background: #f1f5f9; text-align: left; }
                th, td { padding: 1rem; border-bottom: 1px solid var(--border-color); }
                th { font-weight: 600; font-size: 0.9rem; color: var(--text-secondary); }
                tr:last-child td { border-bottom: none; }
                
                .status-badge {
                    padding: 0.25rem 0.75rem;
                    border-radius: 50px;
                    font-size: 0.85rem;
                    font-weight: 600;
                    text-transform: capitalize;
                }
                .status-badge.pending { background: #fee2e2; color: #dc2626; }
                .status-badge.approved { background: #dcfce7; color: #16a34a; }
                .status-badge.active { background: #dbeafe; color: #2563eb; }
                .status-badge.completed { background: #f3f4f6; color: #4b5563; }
            `}</style>
        </div>
    );
}
