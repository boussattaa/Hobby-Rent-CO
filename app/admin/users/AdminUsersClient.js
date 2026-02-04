'use client';

import { toggleVerifyUser } from '../actions';

export default function AdminUsersClient({ users }) {
    return (
        <div className="admin-users-page">
            <div className="header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
                <h1>Users Management</h1>
                <span className="count-badge">{users?.length} Users</span>
            </div>

            <div className="table-container">
                <table>
                    <thead>
                        <tr>
                            <th>User</th>
                            <th>Status</th>
                            <th>Role</th>
                            <th>Joined</th>
                            <th>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {users?.map(user => (
                            <tr key={user.id}>
                                <td>
                                    <div style={{ display: 'flex', flexDirection: 'column' }}>
                                        <span style={{ fontWeight: 600 }}>{user.first_name || 'N/A'} {user.last_name || ''}</span>
                                        <span style={{ fontSize: '0.8rem', color: '#64748b' }}>{user.email || 'No Email'}</span>
                                    </div>
                                </td>
                                <td>
                                    {user.is_verified ? (
                                        <span className="badge verified">Verified</span>
                                    ) : (
                                        <span className="badge unverified">Unverified</span>
                                    )}
                                </td>
                                <td>
                                    {user.is_admin ? (
                                        <span className="badge admin">Admin</span>
                                    ) : (
                                        <span className="badge user">User</span>
                                    )}
                                </td>
                                <td>{user.created_at ? new Date(user.created_at).toLocaleDateString() : 'N/A'}</td>
                                <td>
                                    <button
                                        onClick={async () => {
                                            await toggleVerifyUser(user.id, user.is_verified);
                                        }}
                                        className="btn-action"
                                    >
                                        {user.is_verified ? 'Unverify' : 'Verify'}
                                    </button>
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
                
                .badge { padding: 0.25rem 0.75rem; border-radius: 50px; font-size: 0.75rem; font-weight: 700; text-transform: uppercase; }
                .badge.verified { background: #dcfce7; color: #16a34a; }
                .badge.unverified { background: #f1f5f9; color: #64748b; }
                .badge.admin { background: #fee2e2; color: #dc2626; }
                .badge.user { background: #e0f2fe; color: #0284c7; }

                .btn-action {
                    border: 1px solid var(--border-color);
                    background: white;
                    padding: 0.4rem 0.8rem;
                    border-radius: 6px;
                    cursor: pointer;
                    font-size: 0.85rem;
                    transition: all 0.2s;
                }
                .btn-action:hover {
                    background: #f1f5f9;
                    border-color: #cbd5e1;
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
