"use client";

import { useRouter, useSearchParams } from 'next/navigation';
import { useState, useEffect } from 'react';
import { geocode } from '@/app/search/actions';

export default function MobileFilterBar({ categories, priceMax = 1000 }) {
    const router = useRouter();
    const searchParams = useSearchParams();

    // Get current values from URL or defaults
    const currentSubcat = searchParams.get('subcat') || '';
    const currentPrice = searchParams.get('max_price') || '';
    const currentSort = searchParams.get('sort') || 'newest';
    const currentLoc = searchParams.get('loc') || '';

    const [mobileSubcat, setMobileSubcat] = useState(currentSubcat);
    const [mobilePrice, setMobilePrice] = useState(currentPrice);
    const [mobileSort, setMobileSort] = useState(currentSort);
    const [mobileLoc, setMobileLoc] = useState(currentLoc);
    const [locLoading, setLocLoading] = useState(false);

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

    const handleLocSubmit = async () => {
        if (!mobileLoc.trim()) {
            // Clear location
            const params = new URLSearchParams(searchParams.toString());
            params.delete('lat');
            params.delete('lng');
            params.delete('radius');
            params.delete('loc');
            router.push(`?${params.toString()}`, { scroll: false });
            return;
        }

        if (mobileLoc === currentLoc && searchParams.get('lat')) return;

        setLocLoading(true);
        const coords = await geocode(mobileLoc);

        const params = new URLSearchParams(searchParams.toString());
        if (coords) {
            params.set('lat', coords.lat);
            params.set('lng', coords.lng);
            params.set('loc', mobileLoc);
            if (!params.get('radius')) params.set('radius', 50); // Default radius
        } else {
            // Should handled error UI, but for compact bar just fallback
            // Maybe clear params if invalid?
        }

        // Auto-select distance sort if location provided?
        // User asked to "include it in the sort option", implies manual selection.
        // But auto-switching helps. I'll stick to manual for now unless requested.

        router.push(`?${params.toString()}`, { scroll: false });
        setLocLoading(false);
    };

    const handleKeyDown = (e) => {
        if (e.key === 'Enter') {
            handleLocSubmit();
            e.target.blur();
        }
    };

    return (
        <div className="mobile-filter-bar">
            {/* Row 1: Category & Price */}
            <div className="filter-row">
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
            </div>

            {/* Row 2: Location Input & Sort */}
            <div className="filter-row">
                <div className="filter-col">
                    <div className="input-wrapper">
                        <input
                            type="text"
                            value={mobileLoc}
                            onChange={(e) => setMobileLoc(e.target.value)}
                            onBlur={handleLocSubmit}
                            onKeyDown={handleKeyDown}
                            placeholder="Zip Code"
                            className="mobile-input"
                        />
                        {locLoading && <span className="spinner">⌛</span>}
                    </div>
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
                        <option value="distance" disabled={!searchParams.get('lat')}>Nearest</option>
                    </select>
                </div>
            </div>

            <style jsx>{`
        .mobile-filter-bar {
          display: none;
        }

        @media (max-width: 900px) {
          .mobile-filter-bar {
            display: flex;
            flex-direction: column;
            gap: 0.5rem;
            margin-bottom: 1.5rem;
            position: sticky;
            top: 70px;
            z-index: 90;
            background: #f8fafc;
            padding: 0.75rem 0.5rem;
            border-bottom: 1px solid #e2e8f0;
          }

          .filter-row {
            display: flex;
            gap: 0.5rem;
            width: 100%;
          }

          .filter-col {
            flex: 1;
            min-width: 0; /* Prevent overflow */
          }

          .mobile-select, .mobile-input {
            width: 100%;
            height: 38px;
            padding: 0 0.5rem;
            border: 1px solid var(--border-color);
            border-radius: 8px;
            font-size: 0.9rem;
            background: white;
            color: var(--text-primary);
          }
          
          .input-wrapper {
            position: relative;
            width: 100%;
          }
           
          .spinner {
            position: absolute;
            right: 8px;
            top: 50%;
            transform: translateY(-50%);
            font-size: 0.8rem;
          }
        }
      `}</style>
        </div>
    );
}
