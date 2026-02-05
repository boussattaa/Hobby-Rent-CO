'use client';

import { useState } from 'react';
import { verifyUser, rejectUser } from '@/app/actions/admin';
import Link from 'next/link';

export default function UserVerificationTable({ users }) {
    const [userList, setUserList] = useState(users);
    const [loading, setLoading] = useState({}); // { userId: boolean }

    if (!userList || userList.length === 0) {
        return (
            <div className="empty-state">
                <p>No pending verifications.</p>
                <style jsx>{`
                    .empty-state {
                        padding: 2rem;
                        text-align: center;
                        color: #64748b;
                        background: white;
                        border-radius: 8px;
                        border: 1px solid #e2e8f0;
                    }
                `}</style>
            </div>
        );
    }

    const handleVerify = async (userId) => {
        if (!confirm('Are you sure you want to verify this user?')) return;
        setLoading(prev => ({ ...prev, [userId]: 'verifying' }));

        try {
            await verifyUser(userId);
            setUserList(prev => prev.filter(u => u.id !== userId));
        } catch (error) {
            console.error(error);
            alert('Failed to verify user');
        } finally {
            setLoading(prev => ({ ...prev, [userId]: false }));
        }
    };

    const handleReject = async (userId) => {
        if (!confirm('Reject this verification request?')) return;
        setLoading(prev => ({ ...prev, [userId]: 'rejecting' }));

        try {
            await rejectUser(userId);
            setUserList(prev => prev.filter(u => u.id !== userId));
        } catch (error) {
            console.error(error);
            alert('Failed to reject user');
        } finally {
            setLoading(prev => ({ ...prev, [userId]: false }));
        }
    };

    return (
        <div className="table-wrapper">
            <table>
                <thead>
                    <tr>
                        <th>User</th>
                        <th>Email</th>
                        <th>Documents</th>
                        <th>Actions</th>
                    </tr>
                </thead>
                <tbody>
                    {userList.map(user => (
                        <tr key={user.id}>
                            <td>
                                <div className="user-info">
                                    <div className="avatar">
                                        {(user.first_name?.[0] || user.email[0]).toUpperCase()}
                                    </div>
                                    <span>{user.first_name || 'No Name'} {user.last_name || ''}</span>
                                </div>
                            </td>
                            <td>{user.email}</td>
                            <td>
                                {/* Link to Supabase Storage bucket for this user's verification docs */}
                                <a
                                    href={`${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/list/verification_docs/verification_docs/${user.id}`}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="doc-link"
                                >
                                    📂 View Uploaded Docs
                                </a>
                            </td>
                            <td>
                                <div className="actions">
                                    <button
                                        className="btn-approve"
                                        onClick={() => handleVerify(user.id)}
                                        disabled={loading[user.id]}
                                    >
                                        {loading[user.id] === 'verifying' ? '...' : '✓ Approve'}
                                    </button>
                                    <button
                                        className="btn-reject"
                                        onClick={() => handleReject(user.id)}
                                        disabled={loading[user.id]}
                                    >
                                        {loading[user.id] === 'rejecting' ? '...' : '✕ Reject'}
                                    </button>
                                </div>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>

            <style jsx>{`
                .table-wrapper {
                    background: white;
                    border-radius: 12px;
                    border: 1px solid #e2e8f0;
                    overflow: hidden;
                    box-shadow: 0 2px 4px rgba(0,0,0,0.02);
                }
                table { width: 100%; border-collapse: collapse; }
                th, td { padding: 1rem; text-align: left; border-bottom: 1px solid #f1f5f9; }
                th { background: #f8fafc; font-size: 0.8rem; text-transform: uppercase; color: #64748b; font-weight: 600; }
                tr:last-child td { border-bottom: none; }
                
                .user-info { display: flex; align-items: center; gap: 0.75rem; font-weight: 500; }
                .avatar {
                    width: 32px; height: 32px; background: #3b82f6; color: white;
                    border-radius: 50%; display: flex; align-items: center; justify-content: center;
                    font-size: 0.8rem;
                }
                
                .doc-link { color: #2563eb; text-decoration: underline; font-size: 0.9rem; }
                
                .actions { display: flex; gap: 0.5rem; }
                button {
                    padding: 0.4rem 0.8rem; border-radius: 6px; border: none; cursor: pointer;
                    font-size: 0.85rem; font-weight: 600; transition: opacity 0.2s;
                }
                button:disabled { opacity: 0.5; cursor: not-allowed; }
                
                .btn-approve { background: #dcfce7; color: #166534; }
                .btn-approve:hover:not(:disabled) { background: #bbf7d0; }
                
                .btn-reject { background: #fee2e2; color: #991b1b; }
                .btn-reject:hover:not(:disabled) { background: #fecaca; }
            `}</style>
        </div>
    );
}
