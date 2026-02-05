'use client';

import ActivityFeed from '@/components/admin/ActivityFeed';
import RevenueChart from '@/components/admin/RevenueChart';
import UserVerificationTable from '@/components/admin/UserVerificationTable';

export default function AdminDashboardClient({
    usersCount, itemsCount, rentalsCount,
    recentRentals, recentUsers, recentItems, chartRentals, pendingUsers
}) {

    // Merge and sort activities
    const activities = [
        ...(recentUsers || []).map(u => ({ type: 'user', created_at: u.created_at, data: u })),
        ...(recentItems || []).map(i => ({ type: 'item', created_at: i.created_at, data: i })),
        ...(recentRentals || []).map(r => ({ type: 'rental', created_at: r.created_at, data: r }))
    ].sort((a, b) => new Date(b.created_at) - new Date(a.created_at)).slice(0, 20);

    return (
        <div className="admin-dashboard">
            <header className="header">
                <h1>Admin Command Center</h1>
                <p className="subtitle">Platform Overview & Activity</p>
            </header>

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

            <div className="dashboard-grid">
                {/* Left Column: Analytics */}
                <div className="analytics-col">

                    {/* Pending Verifications */}
                    {pendingUsers && pendingUsers.length > 0 && (
                        <div className="section mb-8">
                            <div className="flex justify-between items-center mb-4">
                                <h2>Pending Verifications <span className="badge-count">{pendingUsers.length}</span></h2>
                            </div>
                            <UserVerificationTable users={pendingUsers} />
                        </div>
                    )}

                    <RevenueChart rentals={chartRentals || []} />

                    <div className="section mt-6">
                        <h2>Recent Bookings</h2>
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
                                    {recentRentals?.slice(0, 5).map(rental => (
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
                </div>

                {/* Right Column: Activity Feed */}
                <div className="feed-col">
                    <ActivityFeed activities={activities} />
                </div>
            </div>

            <style jsx>{`
                .admin-dashboard { padding-bottom: 4rem; }
                .header { margin-bottom: 2rem; }
                .header h1 { font-size: 1.8rem; margin-bottom: 0.25rem; }
                .subtitle { color: #64748b; }

                .stats-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 1.5rem; margin-bottom: 2rem; }
                .stat-card {
                    background: white;
                    padding: 1.5rem;
                    border-radius: 12px;
                    box-shadow: 0 4px 6px rgba(0,0,0,0.02);
                    border: 1px solid var(--border-color);
                }
                .stat-card h3 { font-size: 0.85rem; color: var(--text-secondary); margin-bottom: 0.5rem; text-transform: uppercase; letter-spacing: 0.05em; }
                .stat-value { font-size: 2rem; font-weight: 700; color: var(--text-primary); }
                
                .dashboard-grid {
                    display: grid;
                    grid-template-columns: 1fr 350px;
                    gap: 1.5rem;
                }

                @media (max-width: 1024px) {
                    .dashboard-grid { grid-template-columns: 1fr; }
                }
                
                .section h2 { margin-bottom: 1rem; font-size: 1.1rem; color: #334155; }
                .mt-6 { margin-top: 2rem; }

                .table-container {
                    background: white;
                    border-radius: 12px;
                    box-shadow: 0 2px 8px rgba(0,0,0,0.02);
                    overflow: hidden;
                    border: 1px solid var(--border-color);
                }
                table { width: 100%; border-collapse: collapse; font-size: 0.9rem; }
                thead tr { background: #f8fafc; text-align: left; }
                th, td { padding: 1rem; border-bottom: 1px solid #f1f5f9; }
                th { font-weight: 600; color: #64748b; font-size: 0.8rem; text-transform: uppercase; }
                tr:last-child td { border-bottom: none; }
                
                .status-badge {
                    padding: 0.2rem 0.6rem;
                    border-radius: 50px;
                    font-size: 0.75rem;
                    font-weight: 600;
                    text-transform: capitalize;
                }
                .status-badge.pending { background: #fff7ed; color: #c2410c; }
                .status-badge.approved { background: #dcfce7; color: #166534; }
                .status-badge.active { background: #dbeafe; color: #1e40af; }
                .status-badge.completed { background: #f1f5f9; color: #475569; }

                .badge-count {
                    background: #ef4444; 
                    color: white; 
                    padding: 0.1rem 0.5rem; 
                    border-radius: 50px; 
                    font-size: 0.8rem;
                    margin-left: 0.5rem;
                    vertical-align: middle;
                }
                .mb-8 { margin-bottom: 2rem; }
            `}</style>
        </div>
    );
}
