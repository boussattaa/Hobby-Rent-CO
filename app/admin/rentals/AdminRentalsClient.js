'use client';

import { useState } from 'react';
import Link from 'next/link';

export default function AdminRentalsClient({ rentals: initialRentals }) {
    const [rentals, setRentals] = useState(initialRentals);

    const handleDelete = async (rentalId) => {
        if (!confirm('Are you sure you want to delete this rental? This cannot be undone.')) return;

        try {
            const res = await fetch('/api/admin/delete-rental', {
                method: 'DELETE',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ rentalId })
            });

            const data = await res.json();

            if (res.ok) {
                setRentals(prev => prev.filter(r => r.id !== rentalId));
            } else {
                alert(`Delete failed: ${data.error}`);
            }
        } catch (err) {
            alert(`Error deleting: ${err.message}`);
        }
    };

    const handleRefund = async (rental) => {
        const confirmMsg = `Refund $${rental.total_price} to ${rental.renter?.email}?\n\nThis will cancel the rental and refund the full amount via Stripe.`;
        if (!confirm(confirmMsg)) return;

        try {
            const res = await fetch('/api/admin/refund', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ rentalId: rental.id })
            });

            const data = await res.json();

            if (res.ok) {
                alert(`Refund successful! $${data.amountRefunded} refunded.\nRefund ID: ${data.refundId}`);
                // Update local state to show cancelled
                setRentals(prev => prev.map(r =>
                    r.id === rental.id ? { ...r, status: 'cancelled', refunded: true } : r
                ));
            } else {
                alert(`Refund failed: ${data.error}`);
            }
        } catch (err) {
            alert(`Error processing refund: ${err.message}`);
        }
    };

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
                            <th>Owner</th>
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
                                    <div style={{ fontWeight: 600 }}>{rental.items?.name || rental.item_name || 'Deleted Item'}</div>
                                    <div style={{ fontSize: '0.8rem', color: '#64748b' }}>ID: {rental.item_id ? rental.item_id.split('-')[0] : 'N/A'}...</div>
                                </td>
                                <td>
                                    <div>{rental.renter?.email}</div>
                                    <div style={{ fontSize: '0.8rem', color: '#64748b' }}>
                                        {rental.renter?.first_name} {rental.renter?.last_name}
                                    </div>
                                </td>
                                <td>
                                    <div>{rental.owner?.email}</div>
                                    <div style={{ fontSize: '0.8rem', color: '#64748b' }}>
                                        {rental.owner?.first_name} {rental.owner?.last_name}
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
                                    <span className={`status-badge ${rental.status}`}>{rental.status === 'awaiting_payment' ? 'Pending Pay' : rental.status}</span>
                                </td>
                                <td>
                                    <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center', flexWrap: 'wrap' }}>
                                        <Link href={`/rentals/${rental.id}`} className="btn-view">
                                            View
                                        </Link>
                                        {rental.refunded ? (
                                            <span style={{ fontSize: '0.75rem', color: '#16a34a', fontWeight: 600 }}>✓ Refunded</span>
                                        ) : rental.status !== 'cancelled' && (
                                            <button
                                                onClick={() => handleRefund(rental)}
                                                className="btn-refund"
                                                title="Issue Refund"
                                            >
                                                💸 Refund
                                            </button>
                                        )}
                                        <button
                                            onClick={() => handleDelete(rental.id)}
                                            className="btn-delete"
                                            title="Delete Rental"
                                        >
                                            🗑️
                                        </button>
                                    </div>
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
            .status-badge.cancelled { background: #fef3c7; color: #d97706; }

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

            .btn-delete {
                background: transparent;
                border: 1px solid #ef4444;
                color: #ef4444;
                padding: 0.25rem 0.5rem;
                border-radius: 6px;
                cursor: pointer;
                font-size: 0.8rem;
            }
            .btn-delete:hover {
                background: #fef2f2;
            }

            .btn-refund {
                background: #dbeafe;
                border: 1px solid #3b82f6;
                color: #1d4ed8;
                padding: 0.25rem 0.5rem;
                border-radius: 6px;
                cursor: pointer;
                font-size: 0.75rem;
                font-weight: 600;
            }
            .btn-refund:hover {
                background: #bfdbfe;
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

