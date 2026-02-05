'use client';

import { useState } from 'react';

export default function AdminPaymentsClient({ pendingPayouts, upcomingPayouts, paidPayouts }) {
    const [processing, setProcessing] = useState({});
    const [payouts, setPayouts] = useState(pendingPayouts);
    const [upcoming, setUpcoming] = useState(upcomingPayouts);
    const [history, setHistory] = useState(paidPayouts);

    const handlePayout = async (rental) => {
        if (processing[rental.id]) return;

        setProcessing(prev => ({ ...prev, [rental.id]: true }));

        try {
            const res = await fetch('/api/admin/payout', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ rentalId: rental.id })
            });

            const data = await res.json();

            if (res.ok) {
                // Remove from pending list
                setPayouts(prev => prev.filter(p => p.id !== rental.id));
                alert(`Payout successful! Transfer ID: ${data.transferId}`);
            } else {
                alert(`Payout failed: ${data.error}`);
            }
        } catch (err) {
            alert(`Error: ${err.message}`);
        } finally {
            setProcessing(prev => ({ ...prev, [rental.id]: false }));
        }
    };

    const handleDelete = async (rentalId, type) => {
        if (!confirm('Are you sure you want to delete this Record? This cannot be undone.')) return;

        try {
            const res = await fetch('/api/admin/delete-rental', {
                method: 'DELETE',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ rentalId })
            });

            const data = await res.json();

            if (res.ok) {
                if (type === 'upcoming') setUpcoming(prev => prev.filter(r => r.id !== rentalId));
                if (type === 'pending') setPayouts(prev => prev.filter(r => r.id !== rentalId));
                if (type === 'history') setHistory(prev => prev.filter(r => r.id !== rentalId));
            } else {
                alert(`Delete failed: ${data.error}`);
            }
        } catch (err) {
            alert(`Error deleting: ${err.message}`);
        }
    };

    const formatCurrency = (cents) => {
        return new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: 'USD'
        }).format(cents / 100);
    };

    const DeleteButton = ({ id, type }) => (
        <button
            onClick={() => handleDelete(id, type)}
            style={{
                background: 'transparent',
                border: '1px solid #ef4444',
                color: '#ef4444',
                padding: '0.25rem 0.5rem',
                borderRadius: '6px',
                cursor: 'pointer',
                marginLeft: '10px',
                fontSize: '0.8rem'
            }}
            title="Delete Record"
        >
            🗑️
        </button>
    );

    return (
        <div className="admin-payments-page">
            <div className="header">
                <h1>Payments & Payouts</h1>
                <span className="count-badge">{payouts.length} Pending</span>
            </div>

            {/* Upcoming Payouts Section (Approved/Active) */}
            <section className="section">
                <h2>Upcoming Payouts (Active Rentals)</h2>
                {upcoming.length === 0 ? (
                    <div className="empty-state">
                        <p>No active rentals awaiting completion.</p>
                    </div>
                ) : (
                    <div className="table-container">
                        <table>
                            <thead>
                                <tr>
                                    <th>Item</th>
                                    <th>Rental Dates</th>
                                    <th>Total Amount</th>
                                    <th>Estimated Payout</th>
                                    <th>Status</th>
                                    <th>Action</th>
                                </tr>
                            </thead>
                            <tbody>
                                {upcoming.map(rental => {
                                    const ownerPayout = Math.round(rental.total_price * 0.85); // 85% to owner
                                    return (
                                        <tr key={rental.id}>
                                            <td>
                                                <strong>{rental.items?.name || rental.item_name || 'Deleted Item'}</strong>
                                            </td>
                                            <td>
                                                {new Date(rental.start_date).toLocaleDateString()} - {new Date(rental.end_date).toLocaleDateString()}
                                            </td>
                                            <td>{formatCurrency(rental.total_price)}</td>
                                            <td>
                                                <span className="payout-amount" style={{ color: '#3b82f6' }}>{formatCurrency(ownerPayout)}</span>
                                            </td>
                                            <td>
                                                <span className={`badge ${rental.status}`} style={{ textTransform: 'uppercase', fontSize: '0.75rem', fontWeight: 700, padding: '0.25rem 0.75rem', borderRadius: '50px', background: '#dbeafe', color: '#2563eb' }}>
                                                    {rental.status}
                                                </span>
                                            </td>
                                            <td>
                                                <DeleteButton id={rental.id} type="upcoming" />
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>
                )}
            </section>

            {/* Pending Payouts Section */}
            <section className="section">
                <h2>Pending Payouts (Ready to Release)</h2>
                {payouts.length === 0 ? (
                    <div className="empty-state">
                        <p>No completed rentals waiting for payout.</p>
                    </div>
                ) : (
                    <div className="table-container">
                        <table>
                            <thead>
                                <tr>
                                    <th>Item</th>
                                    <th>Rental Dates</th>
                                    <th>Total Amount</th>
                                    <th>Owner Payout</th>
                                    <th>Action</th>
                                </tr>
                            </thead>
                            <tbody>
                                {payouts.map(rental => {
                                    const ownerPayout = Math.round(rental.total_price * 0.85); // 85% to owner
                                    return (
                                        <tr key={rental.id}>
                                            <td>
                                                <strong>{rental.items?.name || rental.item_name || 'Deleted Item'}</strong>
                                            </td>
                                            <td>
                                                {new Date(rental.start_date).toLocaleDateString()} - {new Date(rental.end_date).toLocaleDateString()}
                                            </td>
                                            <td>{formatCurrency(rental.total_price)}</td>
                                            <td>
                                                <span className="payout-amount">{formatCurrency(ownerPayout)}</span>
                                                <span className="fee-note">(15% platform fee)</span>
                                            </td>
                                            <td>
                                                <button
                                                    onClick={() => handlePayout(rental)}
                                                    disabled={processing[rental.id]}
                                                    className="btn-payout"
                                                >
                                                    {processing[rental.id] ? 'Processing...' : '💸 Send Payout'}
                                                </button>
                                                <DeleteButton id={rental.id} type="pending" />
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>
                )}
            </section>

            {/* Payout History Section */}
            <section className="section">
                <h2>Payout History</h2>
                {history.length === 0 ? (
                    <div className="empty-state">
                        <p>No payout history yet.</p>
                    </div>
                ) : (
                    <div className="table-container">
                        <table>
                            <thead>
                                <tr>
                                    <th>Item</th>
                                    <th>Rental Dates</th>
                                    <th>Amount Paid</th>
                                    <th>Status</th>
                                    <th>Action</th>
                                </tr>
                            </thead>
                            <tbody>
                                {history.map(rental => {
                                    const ownerPayout = Math.round(rental.total_price * 0.85);
                                    return (
                                        <tr key={rental.id}>
                                            <td>{rental.items?.name || rental.item_name || 'Deleted Item'}</td>
                                            <td>
                                                {new Date(rental.start_date).toLocaleDateString()} - {new Date(rental.end_date).toLocaleDateString()}
                                            </td>
                                            <td>{formatCurrency(ownerPayout)}</td>
                                            <td><span className="badge paid">✓ Paid</span></td>
                                            <td>
                                                <DeleteButton id={rental.id} type="history" />
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>
                )}
            </section>

            <style jsx>{`
                .header {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    margin-bottom: 2rem;
                }
                .header h1 { margin: 0; }
                .count-badge {
                    background: #10b981;
                    color: white;
                    padding: 0.25rem 0.75rem;
                    border-radius: 50px;
                    font-weight: 600;
                }

                .section {
                    margin-bottom: 3rem;
                }
                .section h2 {
                    font-size: 1.25rem;
                    margin-bottom: 1rem;
                    color: var(--text-secondary);
                }

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

                .payout-amount {
                    font-weight: 700;
                    color: #10b981;
                }
                .fee-note {
                    font-size: 0.75rem;
                    color: var(--text-secondary);
                    margin-left: 0.5rem;
                }

                .btn-payout {
                    background: linear-gradient(135deg, #10b981, #059669);
                    color: white;
                    border: none;
                    padding: 0.5rem 1rem;
                    border-radius: 8px;
                    font-weight: 600;
                    cursor: pointer;
                    transition: all 0.2s;
                }
                .btn-payout:hover:not(:disabled) {
                    transform: translateY(-1px);
                    box-shadow: 0 4px 12px rgba(16, 185, 129, 0.3);
                }
                .btn-payout:disabled {
                    opacity: 0.6;
                    cursor: not-allowed;
                }

                .badge.paid {
                    background: #dcfce7;
                    color: #16a34a;
                    padding: 0.25rem 0.75rem;
                    border-radius: 50px;
                    font-size: 0.8rem;
                    font-weight: 600;
                }

                .empty-state {
                    text-align: center;
                    padding: 3rem;
                    background: white;
                    border-radius: 12px;
                    border: 1px dashed var(--border-color);
                    color: var(--text-secondary);
                }
            `}</style>
        </div>
    );
}
