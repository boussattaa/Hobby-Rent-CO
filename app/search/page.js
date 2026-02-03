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
    const query = searchParams.get('q') || '';

    // New Filters from URL
    const location = searchParams.get('location') || '';
    const category = searchParams.get('category');
    const subcats = searchParams.get('subcat')?.split(',') || [];
    const maxPrice = searchParams.get('max_price');

    const [items, setItems] = useState([]);
    const [loading, setLoading] = useState(true);
    const supabase = createClient();

    useEffect(() => {
        const fetchResults = async () => {
            setLoading(true);

            let queryBuilder = supabase.from('items').select('*');

            // 1. Text Search
            if (query) {
                queryBuilder = queryBuilder.or(`name.ilike.%${query}%,description.ilike.%${query}%`);
            }

            // 2. Category Filter
            if (category) {
                queryBuilder = queryBuilder.eq('category', category);
            }

            // 3. Subcategory Filter
            if (subcats.length > 0) {
                // If checking array column: .contains('subcategory', subcats) 
                // BUT current schema 'subcategory' is likely a single string. 
                // So we want items where subcategory IS IN the list.
                queryBuilder = queryBuilder.in('subcategory', subcats);
            }

            // 4. Price Filter
            if (maxPrice) {
                queryBuilder = queryBuilder.lte('price', maxPrice);
            }

            // 5. Location Filter (Simple String Match)
            if (location) {
                // Ideally this would be geospatial (lat/lng radius)
                // For now, simple text match
                queryBuilder = queryBuilder.ilike('location', `%${location}%`);
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

    return (
        <div className="search-page">
            <div className="container search-layout">
                {/* 1. Sidebar */}
                <div className="sidebar-area">
                    <SearchSidebar />
                </div>

                {/* 2. Results Area */}
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
            padding: 8rem 0 4rem; /* Top padding to clear fixed navbar */
            min-height: 100vh;
            background: #f8fafc;
        }

        .search-layout {
            display: grid;
            grid-template-columns: 300px 1fr;
            gap: 3rem;
        }

        @media (max-width: 900px) {
            .search-layout {
                grid-template-columns: 1fr;
            }
            .sidebar-area {
                display: none; /* For MVP hide sidebar on mobile or move to drawer */
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
