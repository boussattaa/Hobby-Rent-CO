'use client';

import { createClient } from '@/utils/supabase/client';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';

export default function RentalsPage() {
    const supabase = createClient();
    const [rentals, setRentals] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchRentals = async () => {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) return;

            const { data, error } = await supabase
                .from('rentals')
                .select(`
            *,
            items (
                name,
                image_url,
                location
            )
        `)
                .eq('renter_id', user.id)
                .order('created_at', { ascending: false });

            if (data) setRentals(data);
            setLoading(false);
        };

        fetchRentals();
    }, []);

    if (loading) return <div className="container" style={{ padding: '4rem' }}>Loading rentals...</div>;

    return (
        <div className="rentals-page">
            <div className="container">
                <h1>My Rentals</h1>

                {rentals.length === 0 ? (
                    <div className="empty-state">
                        <p>You haven't rented anything yet.</p>
                        <Link href="/" className="btn btn-primary">Find Gear</Link>
                    </div>
                ) : (
                    <div className="rentals-grid">
                        {rentals.map(rental => (
                            <div key={rental.id} className="rental-card">
                                <div className="card-header">
                                    <span className={`status-badge ${rental.status}`}>{rental.status}</span>
                                    <span className="dates">
                                        {new Date(rental.start_date).toLocaleDateString()} - {new Date(rental.end_date).toLocaleDateString()}
                                    </span>
                                </div>

                                <div className="card-body">
                                    <div className="item-preview">
                                        <div className="img-wrapper">
                                            <Image
                                                src={rental.items?.image_url || '/images/dirt-hero.png'}
                                                alt={rental.items?.name || 'Item'}
                                                fill
                                                style={{ objectFit: 'cover' }}
                                            />
                                        </div>
                                        <div className="item-info">
                                            <h3>{rental.items?.name}</h3>
                                            <p>📍 {rental.items?.location}</p>
                                        </div>
                                    </div>

                                    <div className="actions">
                                        {rental.status === 'approved' && (
                                            <Link href={`/rentals/${rental.id}/inspection`} className="btn btn-primary full-width">
                                                Start Pickup Inspection
                                            </Link>
                                        )}
                                        {rental.status === 'active' && (
                                            <Link href={`/rentals/${rental.id}/inspection`} className="btn btn-secondary full-width">
                                                Start Dropoff Inspection
                                            </Link>
                                        )}
                                        {rental.status === 'pending' && (
                                            <button disabled className="btn btn-disabled full-width">Awaiting Approval</button>
                                        )}
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            <style jsx>{`
        .rentals-page { padding: 4rem 0; min-height: 80vh; }
        .empty-state { text-align: center; padding: 4rem; background: #f8fafc; border-radius: 16px; margin-top: 2rem; }
        
        .rentals-grid { display: grid; gap: 1.5rem; margin-top: 2rem; }
        
        .rental-card {
            background: white;
            border: 1px solid var(--border-color);
            border-radius: 12px;
            overflow: hidden;
        }
        
        .card-header {
            padding: 1rem;
            background: #f8fafc;
            border-bottom: 1px solid var(--border-color);
            display: flex;
            justify-content: space-between;
            align-items: center;
        }
        
        .status-badge {
            padding: 0.25rem 0.75rem;
            border-radius: 50px;
            font-size: 0.8rem;
            font-weight: 600;
            text-transform: uppercase;
        }
        .status-badge.pending { background: #fef3c7; color: #d97706; }
        .status-badge.approved { background: #dcfce7; color: #166534; }
        .status-badge.active { background: #dbeafe; color: #1e40af; }
        .status-badge.completed { background: #f1f5f9; color: #64748b; }
        
        .card-body { padding: 1.5rem; }
        
        .item-preview { display: flex; gap: 1rem; margin-bottom: 1.5rem; }
        .img-wrapper { position: relative; width: 80px; height: 80px; border-radius: 8px; overflow: hidden; flex-shrink: 0; }
        .item-info h3 { font-size: 1.1rem; margin-bottom: 0.25rem; }
        .item-info p { color: var(--text-secondary); font-size: 0.9rem; }
        
        .btn-disabled { background: #e2e8f0; color: #94a3b8; cursor: not-allowed; border: none; }
        .full-width { width: 100%; text-align: center; display: block; }
      `}</style>
        </div>
    );
}
