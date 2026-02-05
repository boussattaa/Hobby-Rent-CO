'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { createClient } from '@/utils/supabase/client';

import { approveRental, rejectRental } from './actions';

export default function DashboardClient({ rentals, user, messages: initialMessages }) {
    const [activeTab, setActiveTab] = useState('overview');
    const [messages, setMessages] = useState(initialMessages || []);
    const supabase = createClient();

    useEffect(() => {
        const channel = supabase
            .channel('dashboard_messages')
            .on('postgres_changes', {
                event: 'INSERT',
                schema: 'public',
                table: 'messages',
                filter: `receiver_id=eq.${user.id}`
            }, async (payload) => {
                // Fetch full message with booking/item/sender details
                const { data, error } = await supabase
                    .from('messages')
                    .select(`
                        *,
                        sender:sender_id(email, first_name),
                        booking:booking_id(
                            id,
                            item:item_id(id, name, image_url)
                        )
                    `)
                    .eq('id', payload.new.id)
                    .single();

                if (data) {
                    setMessages(prev => [data, ...prev]);
                }
            })
            .subscribe();

        return () => {
            supabase.removeChannel(channel);
        };
    }, [user.id, supabase]);

    // Group rentals by status
    const pendingParams = ['pending'];
    const activeParams = ['approved', 'active'];
    const completedParams = ['completed', 'cancelled'];

    const pendingRentals = rentals.filter(r => pendingParams.includes(r.status));
    const activeRentals = rentals.filter(r => activeParams.includes(r.status));
    const historyRentals = rentals.filter(r => completedParams.includes(r.status));

    // Group messages by Item/Listing
    const messagesByItem = {};
    if (messages) {
        messages.forEach(msg => {
            // Check if attached to booking and thus item, otherwise group as 'General'
            // We fetched: booking: { id, item: { id, name, image_url } }
            const item = msg.booking?.item;
            const itemId = item?.id || 'general';
            const itemName = item?.name || 'General Inquiries';
            const itemImage = item?.image_url;

            if (!messagesByItem[itemId]) {
                messagesByItem[itemId] = {
                    itemId,
                    itemName,
                    itemImage,
                    messages: [],
                    unreadCount: 0
                };
            }
            messagesByItem[itemId].messages.push(msg);
            if (!msg.is_read) messagesByItem[itemId].unreadCount++;
        });
    }
    const messageGroups = Object.values(messagesByItem);

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
                    <button
                        className={`tab ${activeTab === 'messages' ? 'active' : ''}`}
                        onClick={() => setActiveTab('messages')}
                    >
                        Messages {messageGroups.some(g => g.unreadCount > 0) && <span className="tab-badge" />}
                    </button>
                </div>

                {activeTab === 'overview' && (
                    <div className="tab-pane">

                        {/* Quick Message Preview (if any unread) */}
                        {messageGroups.some(g => g.unreadCount > 0) && (
                            <div className="section alert-section">
                                <h2>New Messages 💬</h2>
                                <div className="messages-preview-list">
                                    {messageGroups.filter(g => g.unreadCount > 0).map(group => (
                                        <div key={group.itemId} className="message-group-card" onClick={() => setActiveTab('messages')}>
                                            <div className="group-info">
                                                <div className="img-wrapper-sm">
                                                    {group.itemImage ? (
                                                        <Image src={group.itemImage} alt={group.itemName} fill style={{ objectFit: 'cover' }} />
                                                    ) : (
                                                        <div className="placeholder-img">💬</div>
                                                    )}
                                                </div>
                                                <div className="group-details">
                                                    <h3>{group.itemName}</h3>
                                                    <p>{group.unreadCount} new message(s)</p>
                                                </div>
                                            </div>
                                            <button className="btn btn-secondary btn-sm">View</button>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

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

                {activeTab === 'messages' && (
                    <div className="tab-pane">
                        <div className="section">
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                                <h2>Messages by Listing</h2>
                                <Link href="/inbox" className="btn btn-secondary btn-sm">Go to Full Inbox →</Link>
                            </div>

                            {messageGroups.length === 0 ? (
                                <p className="empty-text">No messages yet.</p>
                            ) : (
                                <div className="messages-grid-list">
                                    {messageGroups.map(group => (
                                        <div key={group.itemId} className="message-group-item">
                                            <div className="group-header">
                                                <div className="img-wrapper-sm">
                                                    {group.itemImage ? (
                                                        <Image src={group.itemImage} alt={group.itemName} fill style={{ objectFit: 'cover' }} />
                                                    ) : (
                                                        <div className="placeholder-img">💬</div>
                                                    )}
                                                </div>
                                                <div className="header-info">
                                                    <h3>{group.itemName}</h3>
                                                    <span className="msg-count">{group.messages.length} conversation(s)</span>
                                                </div>
                                            </div>

                                            <div className="recent-preview">
                                                {group.messages.slice(0, 3).map((msg, i) => (
                                                    <div key={msg.id || i} className={`preview-row ${!msg.is_read ? 'unread' : ''}`}>
                                                        <span className="sender">{msg.sender?.first_name || msg.sender?.email || 'User'}:</span>
                                                        <span className="content">{msg.content}</span>
                                                        <span className="time">{new Date(msg.created_at).toLocaleDateString()}</span>
                                                    </div>
                                                ))}
                                            </div>

                                            <div className="group-actions">
                                                <Link href="/inbox" className="btn btn-primary btn-sm btn-block">Reply in Inbox</Link>
                                            </div>
                                        </div>
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

                .tab-badge { width: 8px; height: 8px; background: #ef4444; border-radius: 50%; display: inline-block; margin-left: 6px; vertical-align: middle; }

                .messages-preview-list { display: grid; gap: 1rem; grid-template-columns: repeat(auto-fill, minmax(300px, 1fr)); }
                .message-group-card { 
                    background: white; padding: 1rem; border-radius: 12px; border: 1px solid #e2e8f0; 
                    display: flex; justify-content: space-between; align-items: center; cursor: pointer; transition: all 0.2s;
                }
                .message-group-card:hover { transform: translateY(-2px); box-shadow: 0 4px 12px rgba(0,0,0,0.05); }
                .group-info { display: flex; gap: 1rem; align-items: center; }
                .img-wrapper-sm { position: relative; width: 40px; height: 40px; border-radius: 8px; overflow: hidden; background: #f1f5f9; flex-shrink: 0; }
                .placeholder-img { display: flex; align-items: center; justify-content: center; height: 100%; font-size: 1.2rem; }
                .group-details h3 { font-size: 0.95rem; margin: 0; font-weight: 600; }
                .group-details p { font-size: 0.8rem; color: #64748b; margin: 2px 0 0 0; }

                .messages-grid-list { display: grid; gap: 1.5rem; grid-template-columns: repeat(auto-fill, minmax(350px, 1fr)); }
                .message-group-item { background: white; border: 1px solid #e2e8f0; border-radius: 16px; overflow: hidden; display: flex; flex-direction: column; }
                .group-header { padding: 1rem; background: #f8fafc; border-bottom: 1px solid #e2e8f0; display: flex; align-items: center; gap: 0.75rem; }
                .header-info h3 { font-size: 1rem; margin: 0; }
                .msg-count { font-size: 0.8rem; color: #64748b; }
                
                .recent-preview { padding: 1rem; flex: 1; display: flex; flex-direction: column; gap: 0.75rem; }
                .preview-row { font-size: 0.9rem; display: flex; gap: 0.5rem; color: #475569; }
                .preview-row.unread { font-weight: 600; color: #0f172a; }
                .preview-row .sender { color: #3b82f6; }
                .preview-row .content { flex: 1; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
                .preview-row .time { font-size: 0.75rem; color: #94a3b8; }
                
                .group-actions { padding: 1rem; border-top: 1px solid #e2e8f0; background: #fff; }
                .btn-block { display: block; width: 100%; text-align: center; }
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
