"use client";

import { useState } from 'react';

export default function AvailabilityCalendar({ onDateSelect, blockedDates = [] }) {
    const [selectedStart, setSelectedStart] = useState('');
    const [selectedEnd, setSelectedEnd] = useState('');

    const handleDateChange = (type, val) => {
        if (type === 'start') {
            setSelectedStart(val);
            // Reset end date if invalid
            if (selectedEnd && val > selectedEnd) setSelectedEnd('');
        } else {
            setSelectedEnd(val);
        }

        if (type === 'end' && selectedStart && val) {
            onDateSelect({ start: selectedStart, end: val });
        } else if (type === 'start' && val && selectedEnd) {
            onDateSelect({ start: val, end: selectedEnd });
        }
    };

    // Get current date in YYYY-MM-DD format for min attribute
    const today = new Date().toISOString().split('T')[0];

    return (
        <div className="availability-picker">
            <h3>Select Rental Dates</h3>
            <div className="date-inputs">
                <div className="input-group">
                    <label>Start Date</label>
                    <input
                        type="date"
                        min={today}
                        value={selectedStart}
                        onChange={(e) => handleDateChange('start', e.target.value)}
                    />
                </div>
                <div className="input-group">
                    <label>End Date</label>
                    <input
                        type="date"
                        min={selectedStart || today}
                        value={selectedEnd}
                        onChange={(e) => handleDateChange('end', e.target.value)}
                    />
                </div>
            </div>

            {/* Visual blocked dates indicator (simplified) */}
            {blockedDates.length > 0 && (
                <div className="blocked-dates-info">
                    <span className="dot"></span>
                    <span>{blockedDates.length} days booked this month</span>
                </div>
            )}

            <style jsx>{`
        .availability-picker {
          background: #f8fafc;
          padding: 1rem;
          border-radius: 12px;
          border: 1px solid var(--border-color);
        }
        h3 { 
            font-size: 1rem; 
            margin-bottom: 1rem; 
            color: var(--text-primary);
        }
        .date-inputs {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 1rem;
        }
        .input-group label {
          display: block;
          font-size: 0.8rem;
          color: var(--text-secondary);
          margin-bottom: 0.25rem;
        }
        .input-group input {
          width: 100%;
          padding: 0.5rem;
          border: 1px solid var(--border-color);
          border-radius: 6px;
          font-family: inherit;
        }
        .blocked-dates-info {
           margin-top: 0.75rem;
           font-size: 0.8rem;
           color: var(--text-secondary);
           display: flex;
           align-items: center;
           gap: 0.5rem;
        }
        .dot {
            width: 8px; height: 8px; background: #cbd5e1; border-radius: 50%;
        }
      `}</style>
        </div>
    );
}
