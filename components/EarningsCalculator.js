"use client";

import { useState } from 'react';

export default function EarningsCalculator() {
  const [dailyPrice, setDailyPrice] = useState(100);
  const [daysRented, setDaysRented] = useState(5);

  const monthlyGross = dailyPrice * daysRented;
  const yearlyGross = monthlyGross * 12;

  // Fees: 10% Platform + Stripe (2.9% + 0.30)
  const calculateNet = (gross) => {
    if (gross === 0) return 0;
    const platformFee = gross * 0.10;
    const stripeFee = (gross * 0.029) + 0.30;
    return gross - platformFee - stripeFee;
  };

  const netMonthly = calculateNet(monthlyGross);
  const netYearly = calculateNet(yearlyGross);

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
            onChange={(e) => {
              const val = Number(e.target.value);
              setDailyPrice(val);
            }}
            className="calc-range-input"
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
            onChange={(e) => {
              const val = Number(e.target.value);
              setDaysRented(val);
            }}
            className="calc-range-input"
          />
          <div className="slider-labels">
            <span>1 Day</span>
            <span>30 Days</span>
          </div>
        </div>

        <div className="results-box">
          <div className="result-row">
            <span>Monthly Take-Home</span>
            <span className="amount highlight">${netMonthly.toLocaleString(undefined, { maximumFractionDigits: 0 })}</span>
          </div>
          <div className="result-row">
            <span>Yearly Take-Home</span>
            <span className="amount highlight">${netYearly.toLocaleString(undefined, { maximumFractionDigits: 0 })}</span>
          </div>
          <div className="fee-breakdown">
            <span>Deductions: 10% platform fee + Stripe processing (2.9% + $0.30)</span>
          </div>
          <p className="disclaimer">Actual earnings vary by demand and seasonal factors.</p>
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
          position: relative;
          z-index: 10;
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

        .calc-range-input {
          width: 100%;
          height: 8px;
          background: #e2e8f0;
          border-radius: 4px;
          appearance: none;
          -webkit-appearance: none;
          cursor: pointer;
          outline: none;
          display: block;
          margin: 10px 0;
          position: relative;
          z-index: 20;
        }

        /* Webkit/Chrome Styles */
        .calc-range-input::-webkit-slider-runnable-track {
          width: 100%;
          height: 8px;
          cursor: pointer;
          background: #e2e8f0;
          border-radius: 4px;
        }

        .calc-range-input::-webkit-slider-thumb {
          appearance: none;
          -webkit-appearance: none;
          width: 24px;
          height: 24px;
          background: #3b82f6; /* Hardcoded blue to ensure visibility */
          border-radius: 50%;
          cursor: pointer;
          border: 2px solid white;
          box-shadow: 0 2px 6px rgba(0,0,0,0.2);
          margin-top: -8px; /* Centers thumb on track */
          position: relative;
          z-index: 30;
        }

        /* Firefox Styles */
        .calc-range-input::-moz-range-track {
          width: 100%;
          height: 8px;
          cursor: pointer;
          background: #e2e8f0;
          border-radius: 4px;
        }

        .calc-range-input::-moz-range-thumb {
          width: 24px;
          height: 24px;
          background: #3b82f6;
          border-radius: 50%;
          cursor: pointer;
          border: 2px solid white;
          box-shadow: 0 2px 6px rgba(0,0,0,0.2);
          border: none;
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

        .fee-breakdown {
          font-size: 0.8rem;
          color: rgba(255,255,255,0.7);
          text-align: center;
          margin-top: 1rem;
          padding-top: 1rem;
          border-top: 1px dashed rgba(255,255,255,0.2);
        }

        .disclaimer {
          font-size: 0.7rem;
          color: rgba(255,255,255,0.4);
          text-align: center;
          margin-top: 0.5rem;
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
