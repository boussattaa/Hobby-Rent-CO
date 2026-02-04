'use client';

import { useMemo } from 'react';

export default function RevenueChart({ rentals }) {
    const data = useMemo(() => {
        // Group by day (last 14 days)
        const days = {};
        const today = new Date();

        for (let i = 13; i >= 0; i--) {
            const d = new Date(today);
            d.setDate(d.getDate() - i);
            const key = d.toISOString().split('T')[0];
            days[key] = 0;
        }

        rentals.forEach(r => {
            const key = r.created_at.split('T')[0];
            if (days[key] !== undefined) {
                days[key] += (r.total_price || 0); // Total booking volume
            }
        });

        return Object.entries(days).map(([date, amount]) => ({
            date: new Date(date).toLocaleDateString(undefined, { month: 'short', day: 'numeric' }),
            amount,
            height: Math.min(100, (amount / 500) * 100) // Scale: $500 max height for demo
        }));
    }, [rentals]);

    return (
        <div className="chart-container">
            <h3>Booking Volume (Last 14 Days)</h3>
            <div className="bar-chart">
                {data.map((d, i) => (
                    <div key={i} className="bar-group">
                        <div className="bar-wrapper">
                            <div
                                className="bar"
                                style={{ height: `${d.height}%` }}
                                title={`$${d.amount}`}
                            />
                        </div>
                        <span className="label">{d.date}</span>
                    </div>
                ))}
            </div>

            <style jsx>{`
                .chart-container {
                    background: white;
                    padding: 1.5rem;
                    border-radius: 12px;
                    border: 1px solid #e2e8f0;
                    height: 100%;
                }
                h3 { font-size: 0.9rem; color: #64748b; margin-bottom: 1.5rem; text-transform: uppercase; }
                
                .bar-chart {
                    display: flex;
                    align-items: flex-end;
                    justify-content: space-between;
                    height: 200px;
                    padding-bottom: 1rem;
                }
                
                .bar-group {
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                    width: 100%;
                    height: 100%;
                }
                
                .bar-wrapper {
                    flex: 1;
                    width: 100%;
                    display: flex;
                    align-items: flex-end;
                    justify-content: center;
                    margin-bottom: 0.5rem;
                }
                
                .bar {
                    width: 60%;
                    background: #3b82f6;
                    border-radius: 4px 4px 0 0;
                    opacity: 0.8;
                    transition: all 0.3s;
                    min-height: 4px; /* Ensure 0 values show tiny bar */
                }
                .bar:hover { opacity: 1; transform: scaleY(1.05); }
                
                .label {
                    font-size: 0.65rem;
                    color: #94a3b8;
                    white-space: nowrap;
                    transform: rotate(-45deg);
                    transform-origin: center;
                    margin-top: 0.5rem;
                }
            `}</style>
        </div>
    );
}
