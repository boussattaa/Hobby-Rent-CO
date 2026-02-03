'use client';

import { createStripeConnectAccount, getStripeDashboardLink } from './actions';
import { useState } from 'react';

export default function EarningsClient({ profile, rentals, totalEarnings, activeRentals, pendingPayout }) {
    const [loading, setLoading] = useState(false);

    const handleConnect = async () => {
        setLoading(true);
        try {
            if (profile.stripe_account_id && profile.stripe_details_submitted) {
                const link = await getStripeDashboardLink();
                window.location.href = link;
            } else {
                const link = await createStripeConnectAccount();
                window.location.href = link;
            }
            setLoading(false);
        } catch (error) {
            console.error(error);
            alert(error.message || 'Error connecting to Stripe');
            setLoading(false);
        }
    };

    const isConnected = profile?.stripe_details_submitted;

    return (
        <div className="earnings-page">
            <div className="container">
                <header className="page-header">
                    <h1>Earnings Dashboard</h1>
                    <p className="subtitle">Track your rental income and payouts</p>

                    <div className="connect-section">
                        {!isConnected ? (
                            <div className="connect-cta">
                                <p>To receive payouts, you must connect your bank account.</p>
                                <button onClick={handleConnect} disabled={loading} className="btn btn-primary">
                                    {loading ? 'Processing...' : 'Connect with Stripe'}
                                </button>
                            </div>
                        ) : (
                            <button onClick={handleConnect} disabled={loading} className="btn btn-secondary">
                                {loading ? 'Opening...' : 'View Payout Dashboard ↗'}
                            </button>
                        )}
                    </div>
                </header>

                <div className="stats-grid">
                    <div className="stat-card">
                        <div className="stat-icon">💰</div>
                        <div className="stat-content">
                            <span className="stat-value">${totalEarnings}</span>
                            <span className="stat-label">Total Earnings</span>
                        </div>
                    </div>
                    <div className="stat-card">
                        <div className="stat-icon">⏳</div>
                        <div className="stat-content">
                            <span className="stat-value">${pendingPayout}</span>
                            <span className="stat-label">Pending Payout</span>
                        </div>
                    </div>
                    <div className="stat-card">
                        <div className="stat-icon">📦</div>
                        <div className="stat-content">
                            <span className="stat-value">{activeRentals}</span>
                            <span className="stat-label">Active Rentals</span>
                        </div>
                    </div>
                </div>

                <div className="section">
                    <h2>Recent Earnings</h2>
                    {rentals.length > 0 ? (
                        <div className="table-container">
                            <table>
                                <thead>
                                    <tr>
                                        <th>Item</th>
                                        <th>Date</th>
                                        <th>Amount</th>
                                        <th>Status</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {rentals.map(rental => (
                                        <tr key={rental.id}>
                                            <td>{rental.items?.name}</td>
                                            <td>{new Date(rental.created_at).toLocaleDateString()}</td>
                                            <td style={{ fontWeight: 600 }}>${rental.total_price}</td>
                                            <td><span className={`status-badge ${rental.status}`}>{rental.status}</span></td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    ) : (
                        <div className="empty-state">
                            <p>No earnings yet.</p>
                        </div>
                    )}
                </div>
            </div>

            <style jsx>{`
                .earnings-page { padding: 8rem 0 4rem; min-height: 100vh; background: linear-gradient(180deg, #f8fafc 0%, #e2e8f0 100%); }
                .page-header { text-align: center; margin-bottom: 3rem; }
                .connect-section { margin-top: 2rem; }
                .connect-cta { background: #fff7ed; border: 1px solid #fed7aa; padding: 1.5rem; border-radius: 12px; display: inline-block; }
                .connect-cta p { color: #c2410c; margin-bottom: 1rem; font-weight: 500; }
                
                .stats-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(250px, 1fr)); gap: 1.5rem; margin-bottom: 3rem; }
                .stat-card { background: white; border-radius: 16px; padding: 1.5rem; display: flex; align-items: center; gap: 1rem; border: 1px solid var(--border-color); box-shadow: 0 2px 8px rgba(0,0,0,0.04); }
                .stat-icon { font-size: 2rem; width: 60px; height: 60px; background: #f8fafc; border-radius: 12px; display: flex; align-items: center; justify-content: center; }
                .stat-value { font-size: 1.5rem; font-weight: 700; color: var(--text-primary); display: block; }
                .stat-label { font-size: 0.85rem; color: var(--text-secondary); }
                
                .table-container { background: white; border-radius: 12px; border: 1px solid var(--border-color); overflow: hidden; }
                table { width: 100%; border-collapse: collapse; }
                th, td { padding: 1rem; text-align: left; border-bottom: 1px solid var(--border-color); }
                th { background: #f8fafc; font-weight: 600; color: var(--text-secondary); font-size: 0.9rem; }
                tr:last-child td { border-bottom: none; }
                
                .status-badge { padding: 0.25rem 0.75rem; border-radius: 50px; font-size: 0.8rem; font-weight: 600; text-transform: uppercase; }
                .status-badge.completed { background: #dcfce7; color: #166534; }
                .status-badge.active { background: #dbeafe; color: #1e40af; }
                .status-badge.pending { background: #fef3c7; color: #d97706; }
                
                .empty-state { text-align: center; padding: 3rem; background: white; border-radius: 12px; color: var(--text-secondary); }
            `}</style>
        </div>
    );
}
