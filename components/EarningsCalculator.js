"use client";

import { useState } from 'react';

export default function EarningsCalculator() {
    const [dailyPrice, setDailyPrice] = useState(100);
    const [daysRented, setDaysRented] = useState(5);

    const monthlyEarnings = dailyPrice * daysRented;
    const yearlyEarnings = monthlyEarnings * 12;

    // Assumed platform fee for display accuracy (e.g. 20%)
    const platformFee = 0.20;
    const netMonthly = monthlyEarnings * (1 - platformFee);
    const netYearly = yearlyEarnings * (1 - platformFee);

    return (
        <div className="calculator-card glass">
            <div className="calc-header">
                <h3>💰 Estimate Your Earnings</h3>
                <p>See how much you could make by listing your idle gear.</p>
            </div>

            <div className="calc-body">
                <div className="input-group">
                    <label>
                        Daily Rental Price
                        <span className="value-badge">${dailyPrice}</span>
                    </label>
                    <input
                        type="range"
                        min="20"
                        max="1000"
                        step="10"
                        value={dailyPrice}
                        onChange={(e) => setDailyPrice(Number(e.target.value))}
                        className="slider"
                    />
                    <div className="slider-labels">
                        <span>$20</span>
                        <span>$1000</span>
                    </div>
                </div>

                <div className="input-group">
                    <label>
                        Days Rented per Month
                        <span className="value-badge">{daysRented} Days</span>
                    </label>
                    <input
                        type="range"
                        min="1"
                        max="30"
                        step="1"
                        value={daysRented}
                        onChange={(e) => setDaysRented(Number(e.target.value))}
                        className="slider"
                    />
                    <div className="slider-labels">
                        <span>1 Day</span>
                        <span>30 Days</span>
                    </div>
                </div>

                <div className="results-box">
                    <div className="result-row">
                        <span>Monthly Potential</span>
                        <span className="amount highlight">${netMonthly.toLocaleString(undefined, { maximumFractionDigits: 0 })}</span>
                    </div>
                    <div className="result-row">
                        <span>Yearly Potential</span>
                        <span className="amount highlight">${netYearly.toLocaleString(undefined, { maximumFractionDigits: 0 })}</span>
                    </div>
                    <p className="disclaimer">*Estimates after 20% platform fee. Actual earnings vary by demand.</p>
                </div>
            </div>

            <style jsx>{`
        .calculator-card {
          background: linear-gradient(145deg, #ffffff, #f8fafc);
          border: 1px solid var(--border-color);
          border-radius: 24px;
          padding: 2rem;
          margin-bottom: 3rem;
          box-shadow: 0 10px 30px -10px rgba(0,0,0,0.1);
        }

        .calc-header {
          text-align: center;
          margin-bottom: 2rem;
        }

        .calc-header h3 {
          color: var(--primary-color);
          margin-bottom: 0.5rem;
        }

        .input-group {
          margin-bottom: 2rem;
        }

        .input-group label {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 1rem;
          font-weight: 600;
          color: var(--text-primary);
        }

        .value-badge {
          background: var(--primary-color);
          color: white;
          padding: 4px 12px;
          border-radius: 999px;
          font-size: 0.9rem;
        }

        .slider {
          width: 100%;
          height: 8px;
          background: #e2e8f0;
          border-radius: 4px;
          appearance: none;
          cursor: pointer;
        }

        .slider::-webkit-slider-thumb {
          appearance: none;
          width: 24px;
          height: 24px;
          background: var(--accent-color);
          border-radius: 50%;
          cursor: pointer;
          border: 2px solid white;
          box-shadow: 0 2px 6px rgba(0,0,0,0.2);
        }

        .slider-labels {
          display: flex;
          justify-content: space-between;
          font-size: 0.8rem;
          color: var(--text-secondary);
          margin-top: 0.5rem;
        }

        .results-box {
          background: #1a1a1a;
          color: white;
          padding: 1.5rem;
          border-radius: 16px;
          margin-top: 2rem;
        }

        .result-row {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 1rem;
          padding-bottom: 1rem;
          border-bottom: 1px solid rgba(255,255,255,0.1);
        }

        .result-row:last-of-type {
          border-bottom: none;
          padding-bottom: 0;
          margin-bottom: 0.5rem;
        }

        .amount {
          font-size: 1.5rem;
          font-weight: 700;
          color: #fbbf24; /* Amber 400 */
        }

        .disclaimer {
          font-size: 0.75rem;
          color: rgba(255,255,255,0.5);
          text-align: center;
          margin-top: 1rem;
        }

        @media (min-width: 768px) {
           .calculator-card {
              max-width: 600px;
              margin: 0 auto 3rem;
           }
        }
      `}</style>
        </div>
    );
}
