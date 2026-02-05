'use client';

import Link from 'next/link';
import Image from 'next/image';
import VerificationBadge from '@/components/VerificationBadge';

const categoryLabels = {
    offroad: '🏍️ Offroad',
    water: '🚤 Watersports',
    trailers: '🚛 Trailers',
    housing: '🔧 Tools',
};

export default function PublicProfileClient({ profile, listings, displayName }) {
    return (
        <div className="profile-page">
            <div className="profile-header">
                <div className="avatar">
                    {profile.avatar_url ? (
                        <Image
                            src={profile.avatar_url}
                            alt={displayName}
                            width={120}
                            height={120}
                            style={{ borderRadius: '50%', objectFit: 'cover' }}
                        />
                    ) : (
                        <div className="avatar-placeholder">
                            {(profile.first_name?.[0] || 'U').toUpperCase()}
                        </div>
                    )}
                </div>
                <div className="profile-info">
                    <h1>{displayName}</h1>

                    <div className="badges-row">
                        {profile.is_verified && <VerificationBadge status="verified" />}
                        {profile.id_verified_status && profile.id_verified_status !== 'unverified' && (
                            <VerificationBadge status={profile.id_verified_status} />
                        )}
                        <span className="joined-date">Member since {new Date(profile.created_at || Date.now()).getFullYear()}</span>
                    </div>

                    {profile.bio && <p className="bio">{profile.bio}</p>}

                    {profile.social_links && Object.keys(profile.social_links).length > 0 && (
                        <div className="social-links">
                            {Object.entries(profile.social_links).map(([platform, handle]) => (
                                <a key={platform} href={`https://${platform}.com/${handle}`} target="_blank" rel="noopener noreferrer" className="social-link">
                                    {platform}
                                </a>
                            ))}
                        </div>
                    )}
                </div>
            </div>

            <div className="listings-section">
                <h2>{profile.first_name || 'User'}'s Listings ({listings?.length || 0})</h2>

                {(!listings || listings.length === 0) ? (
                    <div className="empty-state">
                        <p>No listings yet.</p>
                    </div>
                ) : (
                    <div className="listings-grid">
                        {listings.map(item => (
                            <Link href={`/item/${item.id}`} key={item.id} className="listing-card">
                                <div className="listing-image">
                                    {item.images?.[0] ? (
                                        <Image
                                            src={item.images[0]}
                                            alt={item.name}
                                            width={300}
                                            height={200}
                                            style={{ objectFit: 'cover', width: '100%', height: '200px', borderRadius: '8px' }}
                                        />
                                    ) : (
                                        <div className="no-image">No Image</div>
                                    )}
                                </div>
                                <h3>{item.name}</h3>
                                <p className="price">${item.price || item.daily_rate}/day</p>
                                <span className="category">{categoryLabels[item.category] || item.category}</span>
                            </Link>
                        ))}
                    </div>
                )}
            </div>

            <style jsx>{`
                .profile-page {
                    max-width: 1000px;
                    margin: 0 auto;
                    padding: 2rem;
                    padding-top: calc(var(--header-height) + 2rem);
                }
                .profile-header {
                    display: flex;
                    align-items: center;
                    gap: 2rem;
                    padding: 2rem;
                    background: white;
                    border-radius: 16px;
                    box-shadow: 0 4px 12px rgba(0,0,0,0.05);
                    margin-bottom: 2rem;
                }
                .avatar-placeholder {
                    width: 120px;
                    height: 120px;
                    border-radius: 50%;
                    background: linear-gradient(135deg, #6366f1, #8b5cf6);
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    color: white;
                    font-size: 3rem;
                    font-weight: 600;
                }
                .profile-info h1 {
                    margin: 0 0 0.5rem 0;
                    font-size: 2rem;
                }
                .verified-badge {
                    /* Legacy style support */
                    display: inline-block;
                    background: #dcfce7;
                    color: #16a34a;
                    padding: 0.25rem 0.75rem;
                    border-radius: 50px;
                    font-size: 0.85rem;
                    font-weight: 600;
                }
                
                .badges-row {
                    display: flex;
                    align-items: center;
                    gap: 1rem;
                    flex-wrap: wrap;
                    margin-bottom: 1rem;
                }

                .joined-date {
                    color: var(--text-secondary);
                    font-size: 0.9rem;
                }

                .bio {
                    color: var(--text-secondary);
                    line-height: 1.6;
                    margin-bottom: 1rem;
                    max-width: 600px;
                }

                .social-links {
                    display: flex;
                    gap: 0.75rem;
                }

                .social-link {
                    background: #f1f5f9;
                    padding: 0.25rem 0.75rem;
                    border-radius: 6px;
                    font-size: 0.85rem;
                    color: var(--text-secondary);
                    text-decoration: none;
                    text-transform: capitalize;
                    transition: all 0.2s;
                }

                .social-link:hover {
                    background: var(--text-primary);
                    color: white;
                }

                .listings-section h2 {
                    font-size: 1.25rem;
                    margin-bottom: 1.5rem;
                }
                .listings-grid {
                    display: grid;
                    grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
                    gap: 1.5rem;
                }
                .listing-card {
                    background: white;
                    border-radius: 12px;
                    overflow: hidden;
                    box-shadow: 0 2px 8px rgba(0,0,0,0.05);
                    text-decoration: none;
                    color: inherit;
                    transition: transform 0.2s, box-shadow 0.2s;
                    padding: 1rem;
                }
                .listing-card:hover {
                    transform: translateY(-4px);
                    box-shadow: 0 8px 24px rgba(0,0,0,0.1);
                }
                .listing-card h3 {
                    margin: 0.75rem 0 0.25rem;
                    font-size: 1.1rem;
                }
                .price {
                    font-weight: 600;
                    color: #10b981;
                    margin: 0;
                }
                .category {
                    font-size: 0.8rem;
                    color: var(--text-secondary);
                    text-transform: capitalize;
                }
                .no-image {
                    height: 200px;
                    background: #f1f5f9;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    color: #94a3b8;
                    border-radius: 8px;
                }
                .empty-state {
                    text-align: center;
                    padding: 3rem;
                    background: white;
                    border-radius: 12px;
                    color: var(--text-secondary);
                }

                @media (max-width: 600px) {
                    .profile-header {
                        flex-direction: column;
                        text-align: center;
                    }
                }
            `}</style>
        </div>
    );
}
