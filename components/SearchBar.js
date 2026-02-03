
"use client";

import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function SearchBar() {
    const router = useRouter();
    const [query, setQuery] = useState('');
    const [location, setLocation] = useState('');

    const handleSearch = (e) => {
        e.preventDefault();
        if (!query && !location) return;

        const params = new URLSearchParams();
        if (query) params.set('q', query);
        if (location) params.set('location', location);

        router.push(`/search?${params.toString()}`);
    };

    return (
        <form onSubmit={handleSearch} className="search-bar">
            <div className="input-group">
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="icon"><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line></svg>
                <input
                    type="text"
                    placeholder="What are you looking for?"
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                />
            </div>
            <div className="divider"></div>
            <div className="input-group">
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="icon"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path><circle cx="12" cy="10" r="3"></circle></svg>
                <input
                    type="text"
                    placeholder="Zip Code or City"
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                />
            </div>
            <button type="submit" className="search-btn">
                Search
            </button>

            <style jsx>{`
        .search-bar {
          display: flex;
          align-items: center;
          background: white;
          padding: 0.5rem;
          border-radius: 50px;
          box-shadow: 0 4px 20px rgba(0,0,0,0.15);
          width: 100%;
          max-width: 700px;
          margin: 0 auto;
        }

        .input-group {
          display: flex;
          align-items: center;
          flex: 1;
          padding: 0 1rem;
        }

        .input-group input {
          border: none;
          outline: none;
          width: 100%;
          padding: 0.8rem;
          font-size: 1rem;
          color: var(--text-primary);
        }

        .input-group input::placeholder {
           color: #999;
        }

        .icon {
          color: var(--text-secondary);
        }

        .divider {
          width: 1px;
          height: 30px;
          background: #e0e0e0;
        }

        .search-btn {
          background: var(--accent-color);
          color: black;
          border: none;
          padding: 0.8rem 2rem;
          border-radius: 30px;
          font-weight: 700;
          font-size: 1rem;
          cursor: pointer;
          transition: transform 0.2s, background 0.2s;
        }

        .search-btn:hover {
          transform: scale(1.05);
          background: #ffdb4d; /* Slightly lighter yellow */
        }

        @media (max-width: 600px) {
            .search-bar {
                flex-direction: column;
                border-radius: 20px;
                gap: 0.5rem;
                padding: 1rem;
            }
            .divider {
                display: none;
            }
            .input-group {
                width: 100%;
                border-bottom: 1px solid #eee;
            }
            .search-btn {
                width: 100%;
            }
        }
      `}</style>
        </form>
    );
}
