"use client";

import { useRouter, useSearchParams } from 'next/navigation';
import { useState, useEffect } from 'react';

export default function MobileFilterBar({ categories, priceMax = 1000 }) {
    const router = useRouter();
    const searchParams = useSearchParams();

    // Get current values from URL or defaults
    const currentSubcat = searchParams.get('subcat') || '';
    const currentPrice = searchParams.get('max_price') || '';
    const currentSort = searchParams.get('sort') || 'newest';

    const [mobileSubcat, setMobileSubcat] = useState(currentSubcat);
    const [mobilePrice, setMobilePrice] = useState(currentPrice);
    const [mobileSort, setMobileSort] = useState(currentSort);

    // Price ranges (dynamic based on max)
    const priceRanges = [
        { value: '', label: 'Any Price' },
        { value: '50', label: 'Under $50/day' },
        { value: '100', label: 'Under $100/day' },
        { value: '200', label: 'Under $200/day' },
        { value: '500', label: 'Under $500/day' },
        { value: '1000', label: 'Under $1000/day' },
    ];

    const handleFilterChange = (type, value) => {
        const params = new URLSearchParams(searchParams.toString());

        // Update local state and URL params
        if (type === 'subcat') {
            setMobileSubcat(value);
            if (value) params.set('subcat', value);
            else params.delete('subcat');
        } else if (type === 'price') {
            setMobilePrice(value);
            if (value) params.set('max_price', value);
            else params.delete('max_price');
        } else if (type === 'sort') {
            setMobileSort(value);
            params.set('sort', value);
        }

        router.push(`?${params.toString()}`, { scroll: false });
    };

    return (
        <div className="mobile-filter-bar">
            {/* 3-column grid for Subcategory, Price, Sort */}
            <div className="filter-col">
                <select
                    value={mobileSubcat}
                    onChange={(e) => handleFilterChange('subcat', e.target.value)}
                    className="mobile-select"
                >
                    <option value="">All Types</option>
                    {categories.map(cat => (
                        <option key={cat} value={cat}>{cat}</option>
                    ))}
                </select>
            </div>

            <div className="filter-col">
                <select
                    value={mobilePrice}
                    onChange={(e) => handleFilterChange('price', e.target.value)}
                    className="mobile-select"
                >
                    {priceRanges.map(range => (
                        <option key={range.value} value={range.value}>{range.label}</option>
                    ))}
                </select>
            </div>

            <div className="filter-col">
                <select
                    value={mobileSort}
                    onChange={(e) => handleFilterChange('sort', e.target.value)}
                    className="mobile-select"
                >
                    <option value="newest">Newest</option>
                    <option value="price_asc">$-$$$</option>
                    <option value="price_desc">$$$-$</option>
                </select>
            </div>

            <style jsx>{`
        .mobile-filter-bar {
          display: none;
        }

        @media (max-width: 900px) {
          .mobile-filter-bar {
            display: grid;
            grid-template-columns: 1fr 1fr 1fr;
            gap: 0.5rem;
            margin-bottom: 1.5rem;
            position: sticky;
            top: 70px; /* Adjust based on navbar height */
            z-index: 90;
            background: #f8fafc;
            padding: 0.5rem 0;
          }

          .mobile-select {
            width: 100%;
            padding: 0.6rem 0.25rem;
            border: 1px solid var(--border-color);
            border-radius: 8px;
            font-size: 0.85rem;
            background: white;
            color: var(--text-primary);
            text-overflow: ellipsis;
          }
        }
      `}</style>
        </div>
    );
}
