'use client';

import { toggleVerifyUser } from '@/app/admin/actions';
import Link from 'next/link';

export default function ActivityFeed({ activities }) {

    const getIcon = (type) => {
        if (type === 'user') return '👤';
        if (type === 'item') return '📦';
        if (type === 'rental') return '🔑';
        if (type === 'review') return '⭐';
        return '•';
    };

    const getDescription = (act) => {
        if (act.type === 'user') {
            return (
                <span>
                    New user signed up: <strong>{act.data.email}</strong>
                    {!act.data.is_verified && (
                        <button
                            className="action-btn verify"
                            onClick={async () => await toggleVerifyUser(act.data.id, false)}
                        >
                            Verify
                        </button>
                    )}
                </span>
            );
        }
        if (act.type === 'item') {
            return (
                <span>
                    New item listed: <strong>{act.data.name}</strong> (${act.data.price}/day)
                    <Link href={`/item/${act.data.id}`} className="action-link">View</Link>
                </span>
            );
        }
        if (act.type === 'rental') {
            return (
                <span>
                    New booking for <strong>{act.data.items?.name || 'Item'}</strong> ({act.data.status})
                    <Link href={`/admin/rentals`} className="action-link">Details</Link>
                </span>
            );
        }
        return 'Unknown activity';
    };

    return (
        <div className="feed-container">
            <h3>Recent Activity</h3>
            <div className="feed-list">
                {activities.length === 0 ? (
                    <p className="empty">No recent activity found.</p>
                ) : (
                    activities.map((act, i) => (
                        <div key={i} className="feed-item">
                            <div className={`icon-bubble ${act.type}`}>
                                {getIcon(act.type)}
                            </div>
                            <div className="feed-content">
                                <p className="description">{getDescription(act)}</p>
                                <span className="time">{new Date(act.created_at).toLocaleString()}</span>
                            </div>
                        </div>
                    ))
                )}
            </div>

            <style jsx>{`
                .feed-container {
                    background: white;
                    padding: 1.5rem;
                    border-radius: 12px;
                    border: 1px solid #e2e8f0;
                    height: 100%;
                    max-height: 500px;
                    overflow: hidden;
                    display: flex;
                    flex-direction: column;
                }
                
                h3 { font-size: 0.9rem; color: #64748b; margin-bottom: 1.5rem; text-transform: uppercase; }
                
                .feed-list { 
                    flex: 1; 
                    overflow-y: auto; 
                    padding-right: 0.5rem; 
                }
                
                .feed-item {
                    display: flex;
                    gap: 1rem;
                    margin-bottom: 1.5rem;
                    position: relative;
                }
                
                /* Connector Line */
                .feed-item:not(:last-child)::after {
                    content: '';
                    position: absolute;
                    left: 16px;
                    top: 36px;
                    bottom: -24px;
                    width: 2px;
                    background: #f1f5f9;
                }

                .icon-bubble {
                    width: 34px;
                    height: 34px;
                    border-radius: 50%;
                    background: #f8fafc;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    border: 1px solid #e2e8f0;
                    z-index: 1;
                    flex-shrink: 0;
                }
                .icon-bubble.user { background: #eff6ff; border-color: #bfdbfe; color: #2563eb; }
                .icon-bubble.item { background: #f0fdf4; border-color: #bbf7d0; color: #16a34a; }
                .icon-bubble.rental { background: #fff7ed; border-color: #fed7aa; color: #ea580c; }

                .feed-content { font-size: 0.9rem; margin-top: 0.2rem; }
                .description { margin: 0 0 0.25rem 0; color: #334155; line-height: 1.5; }
                .time { font-size: 0.75rem; color: #94a3b8; }
                
                .action-link { margin-left: 0.5rem; color: #3b82f6; text-decoration: none; font-size: 0.8rem; }
                .action-btn { 
                    margin-left: 0.5rem; 
                    padding: 0.1rem 0.5rem; 
                    font-size: 0.75rem; 
                    border-radius: 4px; 
                    border: 1px solid #2563eb; 
                    background: white; 
                    color: #2563eb; 
                    cursor: pointer; 
                }
                .action-btn:hover { background: #eff6ff; }
            `}</style>
        </div>
    );
}
