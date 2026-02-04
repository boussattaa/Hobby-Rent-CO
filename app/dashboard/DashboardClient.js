'use client';

import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';

import { approveRental, rejectRental } from './actions';

export default function DashboardClient({ rentals, user }) {
    const [activeTab, setActiveTab] = useState('overview');

    // Group rentals by status
    const pendingParams = ['pending'];
    const activeParams = ['approved', 'active'];
    const completedParams = ['completed', 'cancelled'];

    const pendingRentals = rentals.filter(r => pendingParams.includes(r.status));
    const activeRentals = rentals.filter(r => activeParams.includes(r.status));
    const historyRentals = rentals.filter(r => completedParams.includes(r.status));

    // Calculate basic stats
    const totalEarnings = rentals
        .filter(r => r.status === 'completed')
        .reduce((sum, r) => sum + (r.total_price * 0.9), 0);

    return (
        <div className="dashboard-page">
            <header className="dashboard-header">
                <div className="container">
                    <h1>Owner Dashboard</h1>
                    <p>Welcome back, {user.email?.split('@')[0]}</p>
                </div>
            </header>

            <div className="container dashboard-content">

                {/* Metrics Row */}
                <div className="stats-grid">
                    <div className="stat-card">
                        <div className="stat-label">Total Earnings</div>
                        <div className="stat-value">${totalEarnings.toFixed(2)}</div>
                        <Link href="/earnings" className="stat-link">View Details →</Link>
                    </div>
                    <div className="stat-card">
                        <div className="stat-label">Active Bookings</div>
                        <div className="stat-value">{activeRentals.length}</div>
                    </div>
                    <div className="stat-card">
                        <div className="stat-label">Pending Requests</div>
                        <div className={`stat-value ${pendingRentals.length > 0 ? 'alert' : ''}`}>
                            {pendingRentals.length}
                        </div>
                    </div>
                </div>

                {/* Tabs */}
                <div className="tabs">
                    <button
                        className={`tab ${activeTab === 'overview' ? 'active' : ''}`}
                        onClick={() => setActiveTab('overview')}
                    >
                        Overview
                    </button>
                    <button
                        className={`tab ${activeTab === 'bookings' ? 'active' : ''}`}
                        onClick={() => setActiveTab('bookings')}
                    >
                        All Bookings
                    </button>
                </div>

                {activeTab === 'overview' && (
                    <div className="tab-pane">

                        {/* 1. Pending Requests (Priority) */}
                        {pendingRentals.length > 0 && (
                            <div className="section alert-section">
                                <h2>Needs Attention ⚠️</h2>
                                <div className="rentals-list">
                                    {pendingRentals.map(rental => (
                                        <RentalRow key={rental.id} rental={rental} />
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* 2. Active & Upcoming */}
                        <div className="section">
                            <h2>Active & Upcoming</h2>
                            {activeRentals.length === 0 ? (
                                <p className="empty-text">No active bookings right now.</p>
                            ) : (
                                <div className="rentals-list">
                                    {activeRentals.map(rental => (
                                        <RentalRow key={rental.id} rental={rental} />
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>
                )}

                {activeTab === 'bookings' && (
                    <div className="tab-pane">
                        <div className="section">
                            <h2>All Booking History</h2>
                            {rentals.length === 0 ? (
                                <p className="empty-text">No bookings found.</p>
                            ) : (
                                <div className="rentals-list">
                                    {rentals.map(rental => (
                                        <RentalRow key={rental.id} rental={rental} />
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>
                )}

            </div>

            <style jsx>{`
                .dashboard-page { min-height: 100vh; background: #f8fafc; padding-bottom: 4rem; }
                .dashboard-header { background: white; border-bottom: 1px solid #e2e8f0; padding: 6rem 0 2rem; }
                .dashboard-header h1 { margin-bottom: 0.5rem; }
                .dashboard-content { margin-top: 2rem; }

                .stats-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(250px, 1fr)); gap: 1.5rem; margin-bottom: 3rem; }
                .stat-card { background: white; padding: 1.5rem; border-radius: 12px; border: 1px solid #e2e8f0; box-shadow: 0 2px 4px rgba(0,0,0,0.02); }
                .stat-label { color: #64748b; font-size: 0.9rem; font-weight: 600; text-transform: uppercase; margin-bottom: 0.5rem; }
                .stat-value { font-size: 2rem; font-weight: 700; color: #0f172a; }
                .stat-value.alert { color: #ea580c; }
                .stat-link { display: block; margin-top: 1rem; color: #3b82f6; font-size: 0.9rem; text-decoration: none; font-weight: 500; }

                .tabs { display: flex; gap: 2rem; border-bottom: 1px solid #e2e8f0; margin-bottom: 2rem; }
                .tab { background: none; border: none; padding: 0.75rem 0; font-size: 1rem; color: #64748b; cursor: pointer; border-bottom: 2px solid transparent; transition: all 0.2s; }
                .tab.active { color: #3b82f6; border-bottom-color: #3b82f6; font-weight: 600; }
                
                .section { margin-bottom: 3rem; }
                .section h2 { font-size: 1.25rem; margin-bottom: 1rem; color: #1e293b; }
                .alert-section h2 { color: #ea580c; }
                
                .rentals-list { display: flex; flex-direction: column; gap: 1rem; }
                .empty-text { color: #94a3b8; font-style: italic; }

                /* Mobile responsive grid */
                @media (max-width: 768px) {
                    .stats-grid { grid-template-columns: 1fr; }
                }
            `}</style>
        </div>
    );
}

function RentalRow({ rental }) {
    return (
        <div className="rental-card">
            <div className="rental-info">
                <div className="img-wrapper">
                    <Image
                        src={rental.items?.image_url || '/images/dirt-hero.png'}
                        alt={rental.items?.name || 'Item'}
                        fill
                        style={{ objectFit: 'cover' }}
                    />
                </div>
                <div className="details">
                    <h3>{rental.items?.name}</h3>
                    <div className="meta">
                        <span>👤 {rental.renter?.first_name || 'Renter'}</span>
                        <span className="bullet">•</span>
                        <span>📅 {new Date(rental.start_date).toLocaleDateString()} - {new Date(rental.end_date).toLocaleDateString()}</span>
                    </div>
                </div>
            </div>

            <div className="rental-actions">
                {rental.status === 'pending' ? (
                    <>
                        <button
                            onClick={async () => {
                                if (confirm('Approve this rental?')) {
                                    await approveRental(rental.id);
                                }
                            }}
                            className="btn btn-primary btn-sm"
                        >
                            Approve
                        </button>
                        <button
                            onClick={async () => {
                                if (confirm('Reject this rental?')) {
                                    await rejectRental(rental.id);
                                }
                            }}
                            className="btn btn-secondary btn-sm reject"
                        >
                            Reject
                        </button>
                    </>
                ) : (
                    <span className={`status-badge ${rental.status}`}>{rental.status === 'awaiting_payment' ? 'Awaiting Payment' : rental.status}</span>
                )}
                <Link href={`/rentals/${rental.id}`} className="btn btn-secondary btn-sm">
                    Manage →
                </Link>
            </div>

            <style jsx>{`
                .rental-card { 
                    background: white; 
                    border: 1px solid #e2e8f0; 
                    border-radius: 12px; 
                    padding: 1rem; 
                    display: flex; 
                    justify-content: space-between; 
                    align-items: center; 
                    transition: all 0.2s;
                }
                .rental-card:hover { border-color: #cbd5e1; box-shadow: 0 4px 12px rgba(0,0,0,0.04); }

                .rental-info { display: flex; gap: 1rem; align-items: center; }
                .img-wrapper { position: relative; width: 60px; height: 60px; border-radius: 8px; overflow: hidden; flex-shrink: 0; }
                .details h3 { font-size: 1rem; margin: 0 0 0.25rem 0; font-weight: 600; }
                .meta { font-size: 0.85rem; color: #64748b; display: flex; align-items: center; gap: 0.5rem; flex-wrap: wrap; }
                .bullet { color: #cbd5e1; }

                .rental-actions { display: flex; align-items: center; gap: 1rem; }
                .btn-sm { padding: 0.4rem 0.8rem; font-size: 0.85rem; }

                .status-badge { padding: 0.25rem 0.75rem; border-radius: 50px; font-size: 0.75rem; font-weight: 600; text-transform: uppercase; }
                .status-badge.approved { background: #dcfce7; color: #166534; }
                .status-badge.active { background: #dbeafe; color: #1e40af; }
                .status-badge.completed { background: #f1f5f9; color: #64748b; }
                .status-badge.pending { background: #fff7ed; color: #c2410c; }
                .status-badge.cancelled { background: #fef2f2; color: #991b1b; }
                .status-badge.awaiting_payment { background: #fffbeb; color: #b45309; }
                
                .btn-sm.reject { color: #dc2626; border-color: #fecaca; }
                .btn-sm.reject:hover { background: #fef2f2; }

                @media (max-width: 640px) {
                    .rental-card { flex-direction: column; align-items: flex-start; gap: 1rem; }
                    .rental-actions { width: 100%; justify-content: space-between; }
                }
            `}</style>
        </div>
    );
}
