"use client";

import { useState } from 'react';

export default function SearchFilters({ onFilterChange, currentFilters = {} }) {
    const [localFilters, setLocalFilters] = useState({
        instantBook: currentFilters.instantBook || false
    });

    const handleChange = (key, value) => {
        const newFilters = { ...localFilters, [key]: value };
        setLocalFilters(newFilters);
        onFilterChange(newFilters);
    };

    return (
        <div className="advanced-filters">
            <label className="toggle-label">
                <input
                    type="checkbox"
                    checked={localFilters.instantBook}
                    onChange={(e) => handleChange('instantBook', e.target.checked)}
                />
                <span>⚡ Instant Book</span>
            </label>


            <style jsx>{`
            .advanced-filters {
                display: flex;
                flex-direction: column;
                gap: 0.75rem;
                padding: 1rem 0;
                border-top: 1px solid var(--border-color);
                border-bottom: 1px solid var(--border-color);
                margin: 1rem 0;
            }
            .toggle-label {
                display: flex;
                align-items: center;
                gap: 0.5rem;
                cursor: pointer;
                font-size: 0.9rem;
                color: var(--text-primary);
            }
            .toggle-label input {
                width: 16px;
                height: 16px;
                accent-color: var(--primary-color);
            }
        `}</style>
        </div>
    );
}
