'use client';

import { useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { geocode } from '@/app/search/actions';

export default function SearchFilter() {
    const router = useRouter();
    const searchParams = useSearchParams();

    // Initial state from URL
    const [location, setLocation] = useState(searchParams.get('loc') || '');
    const [radius, setRadius] = useState(searchParams.get('radius') || 50);
    const [loading, setLoading] = useState(false);

    const handleSearch = async (e) => {
        e.preventDefault();
        setLoading(true);

        // If location is cleared, remove params
        if (!location.trim()) {
            const params = new URLSearchParams(searchParams);
            params.delete('lat');
            params.delete('lng');
            params.delete('radius');
            params.delete('loc');
            router.push(`?${params.toString()}`);
            setLoading(false);
            return;
        }

        // Geocode the input
        const coords = await geocode(location);

        if (coords) {
            const params = new URLSearchParams(searchParams);
            params.set('lat', coords.lat);
            params.set('lng', coords.lng);
            params.set('radius', radius);
            params.set('loc', location); // Keep the text for the input
            router.push(`?${params.toString()}`);
        } else {
            alert('Location not found. Please try a valid Zip Code or City.');
        }

        setLoading(false);
    };

    return (
        <div className="search-filter glass">
            <form onSubmit={handleSearch} className="filter-form">
                <div className="input-group">
                    <label>📍 Location (Zip or City)</label>
                    <input
                        type="text"
                        value={location}
                        onChange={(e) => setLocation(e.target.value)}
                        placeholder="e.g. 83702 or Boise"
                    />
                </div>

                <div className="input-group">
                    <label>📏 Radius: {radius} miles</label>
                    <input
                        type="range"
                        min="10"
                        max="500"
                        step="10"
                        value={radius}
                        onChange={(e) => setRadius(e.target.value)}
                    />
                </div>

                <button type="submit" className="btn btn-primary" disabled={loading}>
                    {loading ? 'Searching...' : 'Filter'}
                </button>
            </form>

            <style jsx>{`
                .search-filter {
                    margin-bottom: 2rem;
                    padding: 1.5rem;
                    border-radius: 16px;
                    background: white;
                    border: 1px solid var(--border-color);
                }
                .filter-form {
                    display: flex;
                    gap: 1.5rem;
                    align-items: flex-end;
                    flex-wrap: wrap;
                }
                .input-group {
                    display: flex;
                    flex-direction: column;
                    gap: 0.5rem;
                    flex: 1;
                    min-width: 200px;
                }
                .input-group label {
                    font-size: 0.9rem;
                    font-weight: 600;
                    color: var(--text-secondary);
                }
                .input-group input[type="text"] {
                    padding: 0.75rem;
                    border: 1px solid var(--border-color);
                    border-radius: 8px;
                    font-size: 1rem;
                }
                .input-group input[type="range"] {
                    width: 100%;
                    cursor: pointer;
                }
                button {
                    height: 46px; /* Match input height roughly */
                    min-width: 120px;
                }
            `}</style>
        </div>
    );
}
