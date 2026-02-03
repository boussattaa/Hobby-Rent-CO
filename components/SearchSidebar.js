"use client";

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';

const CATEGORY_DATA = {
    offroad: [
        'UTVs / Side-by-Sides', 'ATVs / Quads', 'Dirt Bikes', 'Snowmobiles'
    ],
    water: [
        'Boats', 'Personal Watercraft (PWC)', 'Kayaks', 'SUPs', 'Wakeboards'
    ],
    trailers: [
        'Car Haulers', 'Utility Trailers', 'Dump Trailers', 'Enclosed Cargo', 'Travel Trailers'
    ],
    housing: [
        'Heavy Equipment', 'Lawn & Garden', 'Construction', 'Power Tools', 'Cleaning/Finish'
    ]
};

export default function SearchSidebar() {
    const router = useRouter();
    const searchParams = useSearchParams();

    // 1. Initialize State from URL
    const initialCat = searchParams.get('category') || '';
    const initialSubcats = searchParams.get('subcat')?.split(',') || [];
    const initialMaxPrice = searchParams.get('max_price') || 2000;
    const initialLocation = searchParams.get('location') || '';
    const initialRadius = searchParams.get('radius') || 50;

    const [selectedCategory, setSelectedCategory] = useState(initialCat);
    const [selectedSubcats, setSelectedSubcats] = useState(initialSubcats);
    const [price, setPrice] = useState(initialMaxPrice);
    const [location, setLocation] = useState(initialLocation);
    const [radius, setRadius] = useState(initialRadius);

    // 2. Sync to URL
    const applyFilters = () => {
        const params = new URLSearchParams(searchParams.toString());

        // Category
        if (selectedCategory) params.set('category', selectedCategory);
        else {
            params.delete('category');
            params.delete('subcat'); // Clear subcats if no category
        }

        // Subcats
        if (selectedSubcats.length > 0 && selectedCategory) {
            params.set('subcat', selectedSubcats.join(','));
        } else {
            params.delete('subcat');
        }

        // Price
        if (price < 2000) params.set('max_price', price);
        else params.delete('max_price');

        // Location
        if (location) params.set('location', location);
        else params.delete('location');

        if (location && radius !== 50) params.set('radius', radius);
        else if (!location) params.delete('radius');

        router.push(`/search?${params.toString()}`, { scroll: false });
    };

    // Auto-apply filters when they change (debounced for inputs)
    useEffect(() => {
        const timer = setTimeout(() => {
            applyFilters();
        }, 800);
        return () => clearTimeout(timer);
    }, [selectedCategory, selectedSubcats, price, location, radius]);


    const toggleSubcat = (sub) => {
        if (selectedSubcats.includes(sub)) {
            setSelectedSubcats(prev => prev.filter(s => s !== sub));
        } else {
            setSelectedSubcats(prev => [...prev, sub]);
        }
    };

    return (
        <aside className="filters sidebar-glass">
            <div className="filter-header">
                <h3>Filter Results</h3>
                <button
                    className="clear-btn"
                    onClick={() => {
                        setSelectedCategory('');
                        setSelectedSubcats([]);
                        setPrice(2000);
                        setLocation('');
                        setRadius(50);
                        router.push('/search');
                    }}
                >
                    Reset All
                </button>
            </div>

            {/* 1. Location */}
            <div className="filter-group">
                <label className="group-label">Location</label>
                <div className="input-row">
                    <span className="icon">📍</span>
                    <input
                        type="text"
                        placeholder="City or Zip"
                        value={location}
                        onChange={(e) => setLocation(e.target.value)}
                        className="filter-input"
                    />
                </div>
                {location && (
                    <div className="radius-control">
                        <label className="sub-label">Distance: {radius} miles</label>
                        <input
                            type="range"
                            min="10"
                            max="500"
                            step="10"
                            value={radius}
                            onChange={(e) => setRadius(Number(e.target.value))}
                            className="range-input"
                        />
                    </div>
                )}
            </div>

            {/* 2. Category */}
            <div className="filter-group">
                <label className="group-label">Category</label>
                <select
                    value={selectedCategory}
                    onChange={(e) => {
                        setSelectedCategory(e.target.value);
                        setSelectedSubcats([]); // Reset subcats on cat change
                    }}
                    className="filter-select"
                >
                    <option value="">All Categories</option>
                    <option value="offroad">Offroad</option>
                    <option value="water">Watersports</option>
                    <option value="trailers">Trailers</option>
                    <option value="housing">Tools & Equipment</option>
                </select>
            </div>

            {/* 3. Subcategories (if category selected) */}
            {selectedCategory && CATEGORY_DATA[selectedCategory] && (
                <div className="filter-group anim-fade-in">
                    <label className="group-label">Type</label>
                    <div className="checkbox-list">
                        {CATEGORY_DATA[selectedCategory].map(item => (
                            <label key={item} className="checkbox-item">
                                <input
                                    type="checkbox"
                                    checked={selectedSubcats.includes(item)}
                                    onChange={() => toggleSubcat(item)}
                                />
                                <span>{item}</span>
                            </label>
                        ))}
                    </div>
                </div>
            )}

            {/* 4. Price */}
            <div className="filter-group">
                <div className="price-header">
                    <label className="group-label">Max Price / Day</label>
                    <span className="price-value">${price}</span>
                </div>
                <input
                    type="range"
                    min="0"
                    max="2000"
                    step="50"
                    value={price}
                    onChange={(e) => setPrice(Number(e.target.value))}
                    className="range-input"
                />
                <div className="range-labels">
                    <span>$0</span>
                    <span>$2k+</span>
                </div>
            </div>

            <style jsx>{`
        .sidebar-glass {
            background: white;
            padding: 1.5rem;
            border-radius: 16px;
            border: 1px solid var(--border-color);
            position: sticky;
            top: 100px;
            max-height: 80vh;
            overflow-y: auto;
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
            color: var(--text-secondary);
            font-size: 0.85rem;
            cursor: pointer;
            text-decoration: underline;
        }

        .filter-group {
            margin-bottom: 2rem;
        }

        .group-label {
            display: block;
            font-weight: 600;
            margin-bottom: 0.75rem;
            font-size: 0.95rem;
            color: var(--text-primary);
        }

        .input-row {
            position: relative;
            display: flex;
            align-items: center;
        }
        
        .icon {
            position: absolute;
            left: 10px;
            font-size: 1.1rem;
            pointer-events: none;
        }

        .filter-input, .filter-select {
            width: 100%;
            padding: 0.75rem 0.75rem 0.75rem 2.5rem; /* Space for icon */
            border: 1px solid var(--border-color);
            border-radius: 8px;
            font-size: 0.95rem;
            background: #fff;
        }

        .filter-select {
            padding-left: 0.75rem; /* No icon needed */
            cursor: pointer;
        }

        .radius-control {
            margin-top: 1rem;
            padding: 1rem;
            background: #f8fafc;
            border-radius: 8px;
        }
        .sub-label {
            display: block;
            font-size: 0.85rem;
            color: var(--text-secondary);
            margin-bottom: 0.5rem;
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
            font-size: 0.9rem;
            color: var(--text-secondary);
        }
        
        .checkbox-item input {
            accent-color: var(--primary-color);
            width: 16px; 
            height: 16px;
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
            width: 18px;
            height: 18px;
            background: var(--primary-color);
            border-radius: 50%;
            cursor: pointer;
        }

        .range-labels {
            display: flex;
            justify-content: space-between;
            font-size: 0.75rem;
            color: var(--text-secondary);
            margin-top: 0.5rem;
        }

        .price-header {
            display: flex;
            justify-content: space-between;
            margin-bottom: 0.5rem;
        }
        .price-value {
            font-weight: 700;
            color: var(--accent-color);
        }

        .anim-fade-in {
            animation: fadeIn 0.3s ease;
        }
        
        @keyframes fadeIn {
            from { opacity: 0; transform: translateY(-5px); }
            to { opacity: 1; transform: translateY(0); }
        }
      `}</style>
        </aside>
    );
}
