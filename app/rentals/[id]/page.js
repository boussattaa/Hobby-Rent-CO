'use client';

import { createClient } from '@/utils/supabase/client';
import { useEffect, useState, use } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import ChatWindow from '@/components/ChatWindow';
import ReviewModal from '@/components/ReviewModal';

export default function RentalDetailsPage({ params }) {
    // Unwrap params using React.use() - Next.js 15+ requirement
    const { id } = use(params);

    const supabase = createClient();
    const [rental, setRental] = useState(null);
    const [loading, setLoading] = useState(true);
    const [currentUser, setCurrentUser] = useState(null);
    const [isOwner, setIsOwner] = useState(false);
    const [isChatOpen, setIsChatOpen] = useState(false);
    const [isReviewOpen, setIsReviewOpen] = useState(false);
    const [hasReviewed, setHasReviewed] = useState(false);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchRentalDetails = async () => {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) {
                setError("Please log in to view this rental.");
                setLoading(false);
                return;
            }
            setCurrentUser(user);

            // 1. Fetch Rental Basic Data
            const { data: rentalData, error: rentalError } = await supabase
                .from('rentals')
                .select('*')
                .eq('id', id)
                .single();

            if (rentalError) {
                console.error("Error fetching rental:", JSON.stringify(rentalError, null, 2));
                setError("Rental not found or access denied.");
                setLoading(false);
                return;
            }

            // 2. Fetch Related Data Manually
            const [itemRes, renterRes, ownerRes] = await Promise.all([
                supabase.from('items').select('id, name, image_url, price, location, owner_id').eq('id', rentalData.item_id).single(),
                supabase.from('profiles').select('id, first_name, email, is_verified').eq('id', rentalData.renter_id).single(),
                supabase.from('profiles').select('id, first_name, email, is_verified').eq('id', rentalData.owner_id).single()
            ]);

            const enrichedRental = {
                ...rentalData,
                items: itemRes.data,
                renter: renterRes.data,
                owner: ownerRes.data
            };

            // Determine Role
            const isUserOwner = enrichedRental.owner_id === user.id;
            const isUserRenter = enrichedRental.renter_id === user.id;
            setIsOwner(isUserOwner);

            if (!isUserOwner && !isUserRenter) {
                setError("You do not have permission to view this rental.");
                setLoading(false);
                return;
            }

            // Securely Fetch Private Address (For Renter Only)
            if (isUserRenter && enrichedRental.item_id && (enrichedRental.status === 'approved' || enrichedRental.status === 'active')) {
                const { data: privateData, error: privateError } = await supabase
                    .from('item_private_details')
                    .select('storage_address, emergency_contact')
                    .eq('item_id', enrichedRental.item_id)
                    .single();

                // Only log actual errors, not "no rows found" (PGRST116)
                if (privateError && privateError.code !== 'PGRST116') {
                    console.error("Error fetching private details:", privateError);
                }

                if (privateData) {
                    enrichedRental.privateDetails = privateData;
                }
            }

            // Check if already reviewed (for Renter)
            if (isUserRenter && enrichedRental.status === 'completed') {
                const { data: review } = await supabase
                    .from('reviews')
                    .select('id')
                    .eq('rental_id', id)
                    .single();

                if (review) setHasReviewed(true);
            }

            setRental(enrichedRental);
            setLoading(false);
        };

        fetchRentalDetails();
    }, [id, supabase]);

    if (loading) return <div className="container center-loading">Loading details...</div>;
    if (error) return <div className="container center-loading"><h1>Error</h1><p>{error}</p></div>;
    if (!rental) return null;

    return (
        <div className="rental-details-page">
            <div className="container">
                <header className="page-header">
                    <div className="breadcrumbs">
                        <Link href={isOwner ? "/earnings" : "/rentals"}>
                            ← Back to {isOwner ? "Earnings" : "My Trips"}
                        </Link>
                    </div>
                    <h1>{isOwner ? "Booking Management" : "Trip Details"}</h1>
                    <div className="status-row">
                        <span className={`status-badge ${rental.status}`}>{rental.status}</span>
                        <span className="ref-id">Ref: {rental.id.slice(0, 8)}</span>
                    </div>
                </header>

                <div className="dashboard-grid">
                    {/* Main Info Column */}
                    <div className="info-column">
                        <div className="card item-card">
                            <div className="item-preview">
                                <div className="img-wrapper">
                                    <Image
                                        src={rental.items?.image_url || '/images/dirt-hero.png'}
                                        alt={rental.items?.name}
                                        fill
                                        style={{ objectFit: 'cover' }}
                                    />
                                </div>
                                <div>
                                    <h2>{rental.items?.name}</h2>
                                    <p className="location">📍 {rental.items?.location}</p>
                                </div>
                            </div>
                            <div className="dates-row">
                                <div className="date-block">
                                    <label>Start Date</label>
                                    <p>{new Date(rental.start_date).toLocaleDateString()}</p>
                                </div>
                                <div className="arrow">➝</div>
                                <div className="date-block">
                                    <label>End Date</label>
                                    <p>{new Date(rental.end_date).toLocaleDateString()}</p>
                                </div>
                            </div>
                        </div>

                        {/* PRIVATE ADDRESS SECTION (RENTER ONLY) */}
                        {!isOwner && (
                            <div className="card address-card">
                                <h3>📍 Pickup Location</h3>
                                {rental.privateDetails?.storage_address ? (
                                    <>
                                        <p className="address-text">{rental.privateDetails.storage_address}</p>
                                        <a
                                            href={`https://maps.google.com/?q=${encodeURIComponent(rental.privateDetails.storage_address)}`}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="btn btn-secondary btn-sm"
                                            style={{ marginTop: '1rem', display: 'inline-block' }}
                                        >
                                            View on Maps 🗺️
                                        </a>
                                        {rental.privateDetails.emergency_contact && (
                                            <div style={{ marginTop: '1.5rem', paddingTop: '1rem', borderTop: '1px solid #eee' }}>
                                                <label style={{ fontSize: '0.8rem', fontWeight: 600, color: '#64748b' }}>Emergency Contact</label>
                                                <p>{rental.privateDetails.emergency_contact}</p>
                                            </div>
                                        )}
                                    </>
                                ) : (
                                    <div className="locked-state">
                                        <p>Address will be revealed once the booking is approved.</p>
                                    </div>
                                )}
                            </div>
                        )}

                        {!isOwner && (
                            <div className="action-buttons">
                                <button className="btn btn-primary full-width" onClick={() => setIsChatOpen(true)}>
                                    💬 Message {rental.owner?.first_name || 'Owner'}
                                </button>
                                {rental.status === 'approved' && (
                                    <Link href={`/rentals/${rental.id}/inspection`} className="btn btn-secondary full-width">
                                        Start Pickup Inspection
                                    </Link>
                                )}
                                {rental.status === 'completed' && !hasReviewed && (
                                    <button className="btn btn-primary full-width" style={{ background: '#f59e0b', borderColor: '#f59e0b' }} onClick={() => setIsReviewOpen(true)}>
                                        ★ Leave a Review
                                    </button>
                                )}
                                {rental.status === 'completed' && hasReviewed && (
                                    <div className="btn full-width" style={{ background: '#f1f5f9', color: '#64748b', cursor: 'default', textAlign: 'center', fontWeight: 600 }}>
                                        ✓ Reviewed
                                    </div>
                                )}
                            </div>
                        )}

                        {/* OWNER CONTROLS */}
                        {isOwner && (
                            <div className="card owner-controls">
                                <h3>Renter Information</h3>
                                <div className="user-profile-row">
                                    <div className="avatar">
                                        {rental.renter?.first_name?.[0] || 'R'}
                                    </div>
                                    <div>
                                        <p className="name">
                                            {rental.renter?.first_name || 'Renter'}
                                            {rental.renter?.is_verified && <span className="verified">✓</span>}
                                        </p>
                                        <p className="email">{rental.renter?.email}</p>
                                    </div>
                                </div>
                                <button className="btn btn-secondary full-width" onClick={() => setIsChatOpen(true)}>
                                    Message Renter
                                </button>
                            </div>
                        )}
                    </div>

                    {/* Financial Column */}
                    <div className="finance-column">
                        <div className="card finance-card">
                            <h3>Payment Details</h3>
                            <div className="summary-row">
                                <span>Total Price</span>
                                <span>${rental.total_price}</span>
                            </div>

                            {isOwner && (
                                <>
                                    <div className="summary-row">
                                        <span>Platform Fee (10%)</span>
                                        <span>-${(rental.total_price * 0.10).toFixed(2)}</span>
                                    </div>
                                    <div className="summary-row total">
                                        <span>Net Earnings</span>
                                        <span>${(rental.total_price * 0.90).toFixed(2)}</span>
                                    </div>

                                    <div className={`payout-status ${rental.paid_out ? 'paid' : 'pending'}`}>
                                        {rental.paid_out ? '✅ Paid Out' : '⏳ Payout Pending'}
                                    </div>
                                </>
                            )}

                            {!isOwner && (
                                <>
                                    {/* SHOW PAY NOW IF AWAITING PAYMENT (Strict Flow) */}
                                    {rental.status === 'awaiting_payment' && (
                                        <div className="payment-alert">
                                            <p className="mb-2 text-sm text-amber-800">Owner has approved! Please complete payment to confirm.</p>
                                            <button
                                                className="btn btn-primary full-width"
                                                onClick={async () => {
                                                    try {
                                                        const res = await fetch('/api/checkout', {
                                                            method: 'POST',
                                                            headers: { 'Content-Type': 'application/json' },
                                                            body: JSON.stringify({
                                                                rentalId: rental.id,
                                                                // Pass dummy values just in case validation needs them, though API should handle
                                                                itemId: rental.item_id,
                                                                price: rental.total_price,
                                                                name: rental.items?.name
                                                            })
                                                        });
                                                        const data = await res.json();
                                                        if (data.url) window.location.href = data.url;
                                                        else alert('Payment initialization failed');
                                                    } catch (e) {
                                                        console.error(e);
                                                        alert('Error starting payment');
                                                    }
                                                }}
                                            >
                                                💳 Pay Now (${rental.total_price})
                                            </button>
                                        </div>
                                    )}

                                    {/* ALREADY PAID */}
                                    {(rental.status === 'approved' || rental.status === 'active' || rental.status === 'completed') && (
                                        <div className="payment-status success">
                                            Payment Confirmed ✅
                                        </div>
                                    )}
                                </>
                            )}

                            {isOwner && rental.status === 'awaiting_payment' && (
                                <div className="payment-status pending-owner">
                                    Waiting for Renter Payment ⏳
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            <ReviewModal
                isOpen={isReviewOpen}
                onClose={() => setIsReviewOpen(false)}
                rentalId={rental.id}
                itemId={rental.item_id}
                onSubmitted={() => {
                    // Optimistically hide the button or refresh
                    setHasReviewed(true);
                    alert("Review submitted! Thank you.");
                }}
            />

            <ChatWindow
                currentUser={currentUser}
                receiverId={isOwner ? rental.renter_id : rental.owner_id}
                receiverName={isOwner ? (rental.renter?.first_name || 'Renter') : (rental.owner?.first_name || 'Owner')}
                rentalId={rental.id} // Link chat to this rental context
                isOpen={isChatOpen}
                onClose={() => setIsChatOpen(false)}
            />

            <style jsx>{`
                .rental-details-page { padding: 6rem 0; min-height: 100vh; background: #f8fafc; }
                .center-loading { padding: 6rem 0; text-align: center; }
                
                .payment-status.success { background: #dcfce7; color: #166534; padding: 1rem; border-radius: 8px; text-align: center; font-weight: 600; margin-top: 1rem; }
                .payment-status.pending-owner { background: #fff7ed; color: #c2410c; padding: 1rem; border-radius: 8px; text-align: center; font-weight: 600; margin-top: 1rem; }
                .payment-alert { background: #fffbeb; border: 1px solid #fcd34d; padding: 1rem; border-radius: 8px; margin-top: 1rem; }
                .text-amber-800 { color: #92400e; }
                .mb-2 { margin-bottom: 0.5rem; }
                .text-sm { font-size: 0.875rem; }

                .page-header { margin-bottom: 2rem; }
                .breadcrumbs { margin-bottom: 1rem; }
                .breadcrumbs a { color: #64748b; text-decoration: none; font-size: 0.9rem; }
                .breadcrumbs a:hover { text-decoration: underline; }
                
                h1 { margin-bottom: 0.5rem; }
                .status-row { display: flex; align-items: center; gap: 1rem; }
                .ref-id { color: #94a3b8; font-family: monospace; }
                
                .dashboard-grid { 
                    display: grid; 
                    grid-template-columns: 1.5fr 1fr; 
                    gap: 2rem; 
                }
                
                .card { background: white; border-radius: 12px; padding: 1.5rem; border: 1px solid #e2e8f0; margin-bottom: 1.5rem; }
                
                .item-preview { display: flex; gap: 1rem; align-items: center; margin-bottom: 1.5rem; padding-bottom: 1.5rem; border-bottom: 1px solid #f1f5f9; }
                .img-wrapper { position: relative; width: 80px; height: 80px; border-radius: 8px; overflow: hidden; flex-shrink: 0; }
                .item-preview h2 { font-size: 1.2rem; margin: 0 0 0.25rem 0; }
                .location { color: #64748b; font-size: 0.9rem; margin: 0; }
                
                .dates-row { display: flex; justify-content: space-between; align-items: center; background: #f8fafc; padding: 1rem; border-radius: 8px; }
                .date-block label { display: block; font-size: 0.75rem; text-transform: uppercase; color: #94a3b8; font-weight: 600; margin-bottom: 0.25rem; }
                .date-block p { width: 100%; margin: 0; font-weight: 600; }
                .arrow { color: #cbd5e1; }

                .address-text { font-size: 1.1rem; font-weight: 500; line-height: 1.5; }
                .locked-state { color: #64748b; font-style: italic; background: #f1f5f9; padding: 1rem; border-radius: 8px; text-align: center; }

                .user-profile-row { display: flex; align-items: center; gap: 1rem; margin-bottom: 1.5rem; }
                .avatar { width: 48px; height: 48px; border-radius: 50%; background: #3b82f6; color: white; display: flex; align-items: center; justify-content: center; font-weight: bold; font-size: 1.2rem; }
                .name { font-weight: 600; margin: 0; }
                .email { color: #64748b; font-size: 0.9rem; margin: 0; }
                .verified { color: #16a34a; margin-left: 0.25rem; }

                .finance-card h3 { margin-bottom: 1.5rem; }
                .summary-row { display: flex; justify-content: space-between; margin-bottom: 0.75rem; color: #64748b; }
                .summary-row.total { color: #0f172a; font-weight: 700; font-size: 1.1rem; border-top: 1px solid #e2e8f0; padding-top: 1rem; margin-top: 1rem; }
                
                .payout-status { margin-top: 1.5rem; padding: 0.75rem; text-align: center; border-radius: 8px; font-weight: 600; font-size: 0.9rem; }
                .payout-status.paid { background: #dcfce7; color: #166534; }
                .payout-status.pending { background: #fff7ed; color: #c2410c; }
                
                .payment-status.success { margin-top: 1.5rem; text-align: center; color: #16a34a; font-weight: 600; background: #f0fdf4; padding: 0.75rem; border-radius: 8px; }

                .action-buttons { display: flex; flex-direction: column; gap: 1rem; }
                .full-width { width: 100%; }
                .btn-sm { font-size: 0.85rem; padding: 0.4rem 0.8rem; }

                .status-badge { padding: 0.25rem 0.75rem; border-radius: 50px; font-size: 0.8rem; font-weight: 600; text-transform: uppercase; }
                .status-badge.approved { background: #dcfce7; color: #166534; }
                .status-badge.active { background: #dbeafe; color: #1e40af; }
                .status-badge.completed { background: #f1f5f9; color: #64748b; }

                @media (max-width: 768px) {
                    .dashboard-grid { grid-template-columns: 1fr; }
                }
            `}</style>
        </div >
    );
}
