"use client";

import { Suspense } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { useState, useEffect } from 'react';
import { createClient } from '@/utils/supabase/client';
import ListingCard from '@/components/ListingCard';
import SearchSidebar from '@/components/SearchSidebar';

function SearchContent() {
    const searchParams = useSearchParams();
    const router = useRouter();
    const query = searchParams.get('q') || '';

    // Filters from URL
    const location = searchParams.get('location') || '';
    const category = searchParams.get('category') || '';
    const subcats = searchParams.get('subcat')?.split(',') || [];
    const maxPrice = searchParams.get('max_price') || '';

    const [items, setItems] = useState([]);
    const [loading, setLoading] = useState(true);
    const supabase = createClient();

    // Mobile search state
    const [mobileQuery, setMobileQuery] = useState(query);
    const [mobileLocation, setMobileLocation] = useState(location);
    const [mobileCategory, setMobileCategory] = useState(category);
    const [mobileMaxPrice, setMobileMaxPrice] = useState(maxPrice);

    const categories = [
        { value: '', label: 'All Categories' },
        { value: 'offroad', label: '🏍️ Offroad' },
        { value: 'water', label: '🚤 Watersports' },
        { value: 'trailers', label: '🚛 Trailers' },
        { value: 'housing', label: '🔧 Tools' },
    ];

    const priceRanges = [
        { value: '', label: 'Any Price' },
        { value: '50', label: 'Under $50/day' },
        { value: '100', label: 'Under $100/day' },
        { value: '200', label: 'Under $200/day' },
        { value: '500', label: 'Under $500/day' },
    ];

    useEffect(() => {
        const fetchResults = async () => {
            setLoading(true);

            let queryBuilder = supabase.from('items').select('*');

            if (query) {
                queryBuilder = queryBuilder.or(`name.ilike.%${query}%,description.ilike.%${query}%`);
            }
            if (category) {
                queryBuilder = queryBuilder.eq('category', category);
            }
            if (subcats.length > 0) {
                queryBuilder = queryBuilder.in('subcategory', subcats);
            }
            if (maxPrice) {
                queryBuilder = queryBuilder.lte('price', maxPrice);
            }

            // Location Filter with Geocoding
            if (location) {
                console.log('Geocoding search location:', location);
                const coords = await geocodeLocation(location);

                if (coords) {
                    // Approx 50 mile radius (0.7 degrees rough approximation)
                    // This creates a bounding box
                    const r = 0.7;
                    queryBuilder = queryBuilder
                        .gte('lat', coords.lat - r)
                        .lte('lat', coords.lat + r)
                        .gte('lng', coords.lng - r)
                        .lte('lng', coords.lng + r);
                    console.log('Applying coordinate filter:', coords);
                } else {
                    // Fallback to text match if geocoding fails
                    queryBuilder = queryBuilder.ilike('location', `%${location}%`);
                    console.log('Geocoding failed, falling back to text match');
                }
            }

            const { data, error } = await queryBuilder;

            if (data) {
                setItems(data);
            } else if (error) {
                console.error('Search error:', error);
            }

            setLoading(false);
        };

        fetchResults();
    }, [query, location, category, subcats.join(','), maxPrice, supabase]);

    const applyFilters = () => {
        const params = new URLSearchParams();
        if (mobileQuery) params.set('q', mobileQuery);
        if (mobileLocation) params.set('location', mobileLocation);
        if (mobileCategory) params.set('category', mobileCategory);
        if (mobileMaxPrice) params.set('max_price', mobileMaxPrice);
        router.push(`/search?${params.toString()}`);
    };

    const handleMobileSearch = (e) => {
        e.preventDefault();
        applyFilters();
    };

    // Auto-apply filter when dropdowns change
    useEffect(() => {
        if (mobileCategory !== category || mobileMaxPrice !== maxPrice) {
            const params = new URLSearchParams();
            if (mobileQuery || query) params.set('q', mobileQuery || query);
            if (mobileLocation || location) params.set('location', mobileLocation || location);
            if (mobileCategory) params.set('category', mobileCategory);
            if (mobileMaxPrice) params.set('max_price', mobileMaxPrice);
            router.push(`/search?${params.toString()}`);
        }
    }, [mobileCategory, mobileMaxPrice]);

    return (
        <div className="search-page">
            <div className="container search-layout">
                {/* Mobile Search & Filters */}
                <div className="mobile-controls">
                    <form onSubmit={handleMobileSearch} className="mobile-search-row">
                        <input
                            type="text"
                            placeholder="Search gear..."
                            value={mobileQuery}
                            onChange={(e) => setMobileQuery(e.target.value)}
                            className="mobile-search-input"
                        />
                        <button type="submit" className="mobile-search-btn">🔍</button>
                    </form>

                    <div className="mobile-filter-row">
                        <select
                            value={mobileCategory}
                            onChange={(e) => setMobileCategory(e.target.value)}
                            className="filter-dropdown"
                        >
                            {categories.map(cat => (
                                <option key={cat.value} value={cat.value}>{cat.label}</option>
                            ))}
                        </select>

                        <select
                            value={mobileMaxPrice}
                            onChange={(e) => setMobileMaxPrice(e.target.value)}
                            className="filter-dropdown"
                        >
                            {priceRanges.map(range => (
                                <option key={range.value} value={range.value}>{range.label}</option>
                            ))}
                        </select>
                    </div>
                </div>

                {/* Desktop Sidebar */}
                <div className="sidebar-area">
                    <SearchSidebar />
                </div>

                {/* Results Area */}
                <div className="results-area">
                    <header className="search-header">
                        <h1>Search Results</h1>
                        <p>
                            {loading ? 'Searching...' : `Found ${items.length} items`}
                            {query && <span> for "<strong>{query}</strong>"</span>}
                        </p>
                    </header>

                    {loading ? (
                        <div className="loading-state">
                            <div className="spinner"></div>
                            <p>Finding the best gear...</p>
                        </div>
                    ) : items.length > 0 ? (
                        <div className="search-grid">
                            {items.map(item => (
                                <ListingCard key={item.id} item={item} />
                            ))}
                        </div>
                    ) : (
                        <div className="no-results">
                            <h3>No matches found</h3>
                            <p>Try adjusting your search terms or filters.</p>
                            <div className="categories-mini">
                                <Link href="/offroad" className="pill">Offroad</Link>
                                <Link href="/water" className="pill">Watersports</Link>
                                <Link href="/trailers" className="pill">Trailers</Link>
                                <Link href="/housing" className="pill">Tools</Link>
                            </div>
                        </div>
                    )}
                </div>
            </div>

            <style jsx>{`
        .search-page {
            padding: 8rem 0 4rem;
            min-height: 100vh;
            background: #f8fafc;
        }

        .search-layout {
            display: grid;
            grid-template-columns: 300px 1fr;
            gap: 3rem;
        }

        .mobile-controls {
            display: none;
        }

        @media (max-width: 900px) {
            .search-page {
                padding: 6rem 0 4rem;
            }

            .search-layout {
                grid-template-columns: 1fr;
                gap: 1rem;
            }

            .sidebar-area {
                display: none;
            }

            .mobile-controls {
                display: flex;
                flex-direction: column;
                gap: 0.75rem;
                margin-bottom: 1rem;
            }

            .mobile-search-row {
                display: flex;
                gap: 0.5rem;
            }

            .mobile-search-input {
                flex: 1;
                padding: 0.75rem 1rem;
                border: 1px solid var(--border-color);
                border-radius: 8px;
                font-size: 1rem;
            }

            .mobile-search-btn {
                padding: 0.75rem 1rem;
                background: var(--accent-color);
                color: white;
                border: none;
                border-radius: 8px;
                font-size: 1.1rem;
                cursor: pointer;
            }

            .mobile-filter-row {
                display: flex;
                gap: 0.5rem;
            }

            .filter-dropdown {
                flex: 1;
                padding: 0.6rem 0.75rem;
                border: 1px solid var(--border-color);
                border-radius: 8px;
                font-size: 0.9rem;
                background: white;
                cursor: pointer;
                appearance: none;
                background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 12 12'%3E%3Cpath fill='%23666' d='M6 8L1 3h10z'/%3E%3C/svg%3E");
                background-repeat: no-repeat;
                background-position: right 10px center;
                padding-right: 30px;
            }
        }

        .search-header {
            margin-bottom: 2rem;
        }
        .search-header h1 {
            font-size: 2rem;
            margin-bottom: 0.5rem;
        }
        .search-header p {
            color: var(--text-secondary);
        }

        .search-grid {
            display: grid;
            grid-template-columns: repeat(auto-fill, minmax(260px, 1fr));
            gap: 1.5rem;
        }

        .loading-state {
            text-align: center;
            padding: 4rem;
            color: var(--text-secondary);
        }

        .no-results {
            text-align: center;
            padding: 4rem;
            background: white;
            border-radius: 12px;
            border: 1px solid #eee;
        }
        
        .categories-mini {
            display: flex;
            gap: 1rem;
            justify-content: center;
            margin-top: 1.5rem;
            flex-wrap: wrap;
        }
        .pill {
            background: #f0f0f0;
            padding: 0.5rem 1rem;
            border-radius: 20px;
            text-decoration: none;
            color: var(--text-primary);
            font-size: 0.9rem;
            transition: background 0.2s;
        }
        .pill:hover {
            background: #e0e0e0;
        }
      `}</style>
        </div>
    );
}

export default function SearchPage() {
    return (
        <Suspense fallback={<div style={{ padding: '8rem' }}>Loading Search...</div>}>
            <SearchContent />
        </Suspense>
    );
}
