"use client";

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';

export default function FilterSidebar({ categories = [], priceMax = 1000 }) {
    const router = useRouter();
    const searchParams = useSearchParams();

    // State initialization from URL
    const initialSubcats = searchParams.get('subcat')?.split(',') || [];
    const initialMaxPrice = searchParams.get('max_price') || priceMax;

    const [selectedSubcats, setSelectedSubcats] = useState(initialSubcats);
    const [price, setPrice] = useState(initialMaxPrice);

    // Debounce price update to avoid URL spam
    useEffect(() => {
        const timer = setTimeout(() => {
            updateUrl(selectedSubcats, price);
        }, 500);
        return () => clearTimeout(timer);
    }, [price]);

    // Handle immediate subcat update
    const handleSubcatChange = (cat) => {
        const newSubcats = selectedSubcats.includes(cat)
            ? selectedSubcats.filter(c => c !== cat)
            : [...selectedSubcats, cat];

        setSelectedSubcats(newSubcats);
        updateUrl(newSubcats, price);
    };

    const updateUrl = (subcats, currentPrice) => {
        const params = new URLSearchParams(searchParams.toString());

        if (subcats.length > 0) {
            params.set('subcat', subcats.join(','));
        } else {
            params.delete('subcat');
        }

        if (currentPrice < priceMax) {
            params.set('max_price', currentPrice);
        } else {
            params.delete('max_price');
        }

        router.push(`?${params.toString()}`, { scroll: false });
    };

    return (
        <aside className="filters">
            <div className="filter-header">
                <h3>Filters</h3>
                {(selectedSubcats.length > 0 || price < priceMax) && (
                    <button
                        className="clear-btn"
                        onClick={() => {
                            setSelectedSubcats([]);
                            setPrice(priceMax);
                            updateUrl([], priceMax);
                        }}
                    >
                        Clear
                    </button>
                )}
            </div>

            {/* Categories */}
            <div className="filter-group">
                <label className="group-label">Category</label>
                <div className="checkbox-list">
                    {categories.map((cat) => (
                        <label key={cat} className="checkbox-item">
                            <input
                                type="checkbox"
                                checked={selectedSubcats.includes(cat)}
                                onChange={() => handleSubcatChange(cat)}
                            />
                            <span>{cat}</span>
                        </label>
                    ))}
                </div>
            </div>

            {/* Price Range */}
            <div className="filter-group">
                <div className="price-header">
                    <label className="group-label">Max Price</label>
                    <span className="price-value">${price}</span>
                </div>
                <input
                    type="range"
                    min="0"
                    max={priceMax}
                    step="10"
                    value={price}
                    onChange={(e) => setPrice(Number(e.target.value))}
                    className="range-input"
                />
                <div className="range-labels">
                    <span>$0</span>
                    <span>${priceMax}+</span>
                </div>
            </div>

            <style jsx>{`
        .filters {
          background: white;
          padding: 1.5rem;
          border-radius: 12px;
          border: 1px solid var(--border-color);
          height: fit-content;
          position: sticky;
          top: 100px;
        }

        .filter-header {
            display: flex;
            justify-content: space-between;
            align-items: center;
            margin-bottom: 1.5rem;
            padding-bottom: 1rem;
            border-bottom: 1px solid #eee;
        }

        .clear-btn {
            background: none;
            border: none;
            color: var(--accent-color);
            font-size: 0.9rem;
            cursor: pointer;
            text-decoration: underline;
            padding: 0;
        }

        .filter-group {
            margin-bottom: 2rem;
        }

        .group-label {
            display: block;
            margin-bottom: 1rem;
            font-weight: 600;
            font-size: 1rem;
            color: var(--text-primary);
        }

        .checkbox-list {
            display: flex;
            flex-direction: column;
            gap: 0.75rem;
        }

        .checkbox-item {
            display: flex;
            align-items: center;
            gap: 0.75rem;
            cursor: pointer;
            font-size: 0.95rem;
            color: var(--text-secondary);
        }
        
        .checkbox-item input[type="checkbox"] {
            width: 18px;
            height: 18px;
            accent-color: var(--primary-color);
            cursor: pointer;
        }

        .range-input {
            width: 100%;
            height: 6px;
            background: #e2e8f0;
            border-radius: 4px;
            appearance: none;
            cursor: pointer;
        }
        .range-input::-webkit-slider-thumb {
            appearance: none;
            width: 20px;
            height: 20px;
            background: var(--primary-color);
            border-radius: 50%;
            cursor: pointer;
        }

        .price-header {
            display: flex;
            justify-content: space-between;
            align-items: center;
            margin-bottom: 0.5rem;
        }
        .price-value {
            font-weight: 700;
            color: var(--primary-color);
        }

        .range-labels {
            display: flex;
            justify-content: space-between;
            font-size: 0.8rem;
            color: var(--text-secondary);
            margin-top: 0.5rem;
        }

        @media (max-width: 900px) {
            .filters {
                display: none;
            }
        }
      `}</style>
        </aside>
    );
}
