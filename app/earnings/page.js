"use client";

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { createClient } from '@/utils/supabase/client';
import { useRouter } from 'next/navigation';

export default function EarningsPage() {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const supabase = createClient();
    const router = useRouter();

    useEffect(() => {
        const checkUser = async () => {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) {
                router.push('/login');
            } else {
                setUser(user);
            }
            setLoading(false);
        };
        checkUser();
    }, [router, supabase]);

    if (loading) {
        return (
            <div className="earnings-page">
                <div className="container">
                    <div className="loading">Loading...</div>
                </div>
            </div>
        );
    }

    return (
        <div className="earnings-page">
            <div className="container">
                <header className="page-header">
                    <h1>Earnings Dashboard</h1>
                    <p className="subtitle">Track your rental income and payouts</p>
                </header>

                {/* Stats Cards */}
                <div className="stats-grid">
                    <div className="stat-card">
                        <div className="stat-icon">💰</div>
                        <div className="stat-content">
                            <span className="stat-value">$0.00</span>
                            <span className="stat-label">Total Earnings</span>
                        </div>
                    </div>
                    <div className="stat-card">
                        <div className="stat-icon">⏳</div>
                        <div className="stat-content">
                            <span className="stat-value">$0.00</span>
                            <span className="stat-label">Pending Payout</span>
                        </div>
                    </div>
                    <div className="stat-card">
                        <div className="stat-icon">📦</div>
                        <div className="stat-content">
                            <span className="stat-value">0</span>
                            <span className="stat-label">Active Rentals</span>
                        </div>
                    </div>
                    <div className="stat-card">
                        <div className="stat-icon">✅</div>
                        <div className="stat-content">
                            <span className="stat-value">0</span>
                            <span className="stat-label">Completed Rentals</span>
                        </div>
                    </div>
                </div>

                {/* Coming Soon Section */}
                <div className="coming-soon-card">
                    <div className="coming-soon-icon">🚀</div>
                    <h2>Full Earnings Dashboard Coming Soon!</h2>
                    <p>
                        We're building a comprehensive earnings dashboard where you'll be able to:
                    </p>
                    <ul className="feature-list">
                        <li>📊 View detailed rental history and income reports</li>
                        <li>💳 Connect your bank account for automatic payouts</li>
                        <li>📈 Track your top-performing listings</li>
                        <li>📅 See upcoming and past rentals</li>
                    </ul>
                    <div className="cta-group">
                        <Link href="/my-listings" className="btn btn-secondary">
                            View My Listings
                        </Link>
                        <Link href="/list-your-gear" className="btn btn-primary">
                            List More Gear
                        </Link>
                    </div>
                </div>
            </div>

            <style jsx>{`
                .earnings-page {
                    padding: 8rem 0 4rem;
                    min-height: 100vh;
                    background: linear-gradient(180deg, #f8fafc 0%, #e2e8f0 100%);
                }

                .page-header {
                    text-align: center;
                    margin-bottom: 3rem;
                }

                .page-header h1 {
                    font-size: 2.5rem;
                    margin-bottom: 0.5rem;
                }

                .subtitle {
                    color: var(--text-secondary);
                    font-size: 1.1rem;
                }

                .stats-grid {
                    display: grid;
                    grid-template-columns: repeat(4, 1fr);
                    gap: 1.5rem;
                    margin-bottom: 3rem;
                }

                .stat-card {
                    background: white;
                    border-radius: 16px;
                    padding: 1.5rem;
                    display: flex;
                    align-items: center;
                    gap: 1rem;
                    border: 1px solid var(--border-color);
                    box-shadow: 0 2px 8px rgba(0,0,0,0.04);
                }

                .stat-icon {
                    font-size: 2rem;
                    width: 60px;
                    height: 60px;
                    background: #f8fafc;
                    border-radius: 12px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                }

                .stat-content {
                    display: flex;
                    flex-direction: column;
                }

                .stat-value {
                    font-size: 1.5rem;
                    font-weight: 700;
                    color: var(--text-primary);
                }

                .stat-label {
                    font-size: 0.85rem;
                    color: var(--text-secondary);
                }

                .coming-soon-card {
                    background: white;
                    border-radius: 24px;
                    padding: 3rem;
                    text-align: center;
                    border: 1px solid var(--border-color);
                    box-shadow: 0 4px 20px rgba(0,0,0,0.06);
                }

                .coming-soon-icon {
                    font-size: 4rem;
                    margin-bottom: 1rem;
                }

                .coming-soon-card h2 {
                    font-size: 1.75rem;
                    margin-bottom: 1rem;
                }

                .coming-soon-card > p {
                    color: var(--text-secondary);
                    font-size: 1.1rem;
                    margin-bottom: 2rem;
                }

                .feature-list {
                    list-style: none;
                    display: grid;
                    grid-template-columns: repeat(2, 1fr);
                    gap: 1rem;
                    max-width: 600px;
                    margin: 0 auto 2rem;
                    text-align: left;
                }

                .feature-list li {
                    padding: 0.75rem 1rem;
                    background: #f8fafc;
                    border-radius: 8px;
                    font-size: 0.95rem;
                }

                .cta-group {
                    display: flex;
                    gap: 1rem;
                    justify-content: center;
                }

                .loading {
                    text-align: center;
                    padding: 4rem;
                    color: var(--text-secondary);
                }

                @media (max-width: 1024px) {
                    .stats-grid {
                        grid-template-columns: repeat(2, 1fr);
                    }
                }

                @media (max-width: 600px) {
                    .stats-grid {
                        grid-template-columns: 1fr;
                    }
                    .feature-list {
                        grid-template-columns: 1fr;
                    }
                    .cta-group {
                        flex-direction: column;
                    }
                }
            `}</style>
        </div>
    );
}
