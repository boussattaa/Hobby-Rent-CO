
"use client";

import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { useState, useEffect } from 'react';
import { createClient } from '@/utils/supabase/client';
import ListingCard from '@/components/ListingCard';
import ListingCardSkeleton from '@/components/ListingCard'; // Reusing for now or just loading state

export default function SearchPage() {
    const searchParams = useSearchParams();
    const query = searchParams.get('q') || '';
    const location = searchParams.get('location') || '';

    const [items, setItems] = useState([]);
    const [loading, setLoading] = useState(true);
    const supabase = createClient();

    useEffect(() => {
        const fetchResults = async () => {
            setLoading(true);

            let queryBuilder = supabase.from('items').select('*');

            // Basic text search on name or description
            // Note: For production, you'd want Full Text Search (FTS) in Postgres
            // logic: name.ilike.%query% OR description.ilike.%query%
            if (query) {
                // Supabase basic OR syntax for a single level
                queryBuilder = queryBuilder.or(`name.ilike.%${query}%,description.ilike.%${query}%`);
            }

            // Location Filter (Basic string match for now, ideally geocoding)
            if (location) {
                // If it's a number (Zip), strict match or partial
                // If city, ilike
                // For MVP, checking if 'location' string from DB contains this text
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
    }, [query, location, supabase]);

    return (
        <div className="search-page">
            <div className="container">
                <header className="search-header">
                    <h1>Search Results</h1>
                    <p>
                        {query && <span>For "<strong>{query}</strong>" </span>}
                        {location && <span>in <strong>{location}</strong></span>}
                        {!query && !location && "Showing all items"}
                    </p>
                </header>

                {loading ? (
                    <div className="loading">Loading...</div>
                ) : items.length > 0 ? (
                    <div className="search-grid">
                        {items.map(item => (
                            <ListingCard key={item.id} item={item} />
                        ))}
                    </div>
                ) : (
                    <div className="no-results">
                        <h3>No matches found</h3>
                        <p>Try adjusting your search terms or browsing our categories.</p>
                        <div className="categories-mini">
                            <Link href="/offroad" className="pill">Offroad</Link>
                            <Link href="/water" className="pill">Watersports</Link>
                            <Link href="/trailers" className="pill">Trailers</Link>
                            <Link href="/housing" className="pill">Tools</Link>
                        </div>
                    </div>
                )}
            </div>

            <style jsx>{`
        .search-page {
            padding: 8rem 0 4rem; /* Top padding to clear fixed navbar */
            min-height: 80vh;
            background: #fcfcfc;
        }

        .search-header {
            margin-bottom: 3rem;
        }
        .search-header h1 {
            font-size: 2.5rem;
            margin-bottom: 0.5rem;
        }
        .search-header p {
            color: var(--text-secondary);
            font-size: 1.1rem;
        }

        .search-grid {
            display: grid;
            grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
            gap: 2rem;
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
