"use client";

import Link from 'next/link';
import Image from 'next/image';

const TRAILER_ITEMS = [
    { id: 't1', name: '20\' Car Hauler', price: 85, image: '/images/trailer-hero.png', location: 'Salt Lake City, UT', type: 'Car Trailer' },
    { id: 't2', name: '14\' Dump Trailer', price: 120, image: '/images/trailer-hero.png', location: 'Orem, UT', type: 'Dump Trailer' },
    { id: 't3', name: '15 Yard Dumpster', price: 250, image: '/images/trailer-hero.png', location: 'Provo, UT', type: 'Dumpster Bin' },
    { id: 't4', name: 'Enclosed Cargo 6x12', price: 60, image: '/images/trailer-hero.png', location: 'Lehi, UT', type: 'Utility Trailer' },
    { id: 't5', name: 'Heavy Duty Flatbed', price: 100, image: '/images/trailer-hero.png', location: 'Draper, UT', type: 'Flatbed' },
];

export default function TrailersPage() {
    return (
        <div className="category-page">
            <header className="page-header">
                <div className="container">
                    <h1>Trailer Rentals</h1>
                    <p>Haul it all. From cars to debris, we have the trailer for you.</p>
                </div>
            </header>

            <div className="container main-content">
                <div className="filters">
                    <h3>Filters</h3>
                    <div className="filter-group">
                        <label>Type</label>
                        <select>
                            <option>All</option>
                            <option>Car Trailer</option>
                            <option>Dump Trailer</option>
                            <option>Dumpster Bin</option>
                            <option>Utility Trailer</option>
                            <option>Horse Trailer</option>
                        </select>
                    </div>
                    <div className="filter-group">
                        <label>Price Range</label>
                        <input type="range" min="0" max="500" />
                    </div>
                </div>

                <div className="item-grid">
                    {TRAILER_ITEMS.map((item) => (
                        <Link key={item.id} href={`/item/${item.id}`} className="item-card">
                            <div className="card-image">
                                <Image src={item.image} alt={item.name} fill style={{ objectFit: 'cover' }} />
                            </div>
                            <div className="card-details">
                                <div className="card-header">
                                    <h3>{item.name}</h3>
                                    <span className="price">${item.price}<span className="unit">/day</span></span>
                                </div>
                                <p className="location">📍 {item.location}</p>
                                <div className="badge">{item.type}</div>
                                <button className="btn btn-primary full-width" style={{ marginTop: '1rem' }}>Rent Now</button>
                            </div>
                        </Link>
                    ))}
                </div>
            </div>

            <style jsx>{`
        .page-header {
          background-color: var(--trailers-secondary);
          padding: 4rem 0 3rem;
          margin-bottom: 3rem;
        }
        .page-header h1 {
          color: var(--trailers-primary);
        }
        
        .main-content {
          display: grid;
          grid-template-columns: 250px 1fr;
          gap: 3rem;
          padding-bottom: 4rem;
        }

        .filters {
          background: white;
          padding: 1.5rem;
          border-radius: 12px;
          border: 1px solid var(--border-color);
          height: fit-content;
        }

        .filter-group {
          margin-top: 1.5rem;
        }
        .filter-group label {
          display: block;
          margin-bottom: 0.5rem;
          font-weight: 600;
        }
        .filter-group select, .filter-group input {
          width: 100%;
          padding: 0.5rem;
          border-radius: 6px;
          border: 1px solid var(--border-color);
        }

        .item-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
          gap: 2rem;
        }

        .item-card {
          background: white;
          border: 1px solid var(--border-color);
          border-radius: 16px;
          overflow: hidden;
          text-decoration: none;
          color: var(--text-primary);
          transition: transform 0.2s, box-shadow 0.2s;
        }
        .item-card:hover {
          transform: translateY(-4px);
          box-shadow: 0 12px 24px rgba(0,0,0,0.08);
        }

        .card-image {
          position: relative;
          height: 200px;
          background: #eee;
        }

        .card-details {
          padding: 1.5rem;
        }

        .card-header {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          margin-bottom: 0.5rem;
        }

        .card-header h3 {
          font-size: 1.1rem;
          margin: 0;
        }

        .price {
          font-weight: 700;
          font-size: 1.1rem;
        }
        .unit {
          font-size: 0.8rem;
          color: var(--text-secondary);
          font-weight: 400;
        }

        .location {
          color: var(--text-secondary);
          font-size: 0.9rem;
          margin-bottom: 0.5rem;
        }
        
        .badge {
            display: inline-block;
            padding: 0.25rem 0.75rem;
            background: var(--trailers-secondary);
            color: var(--trailers-primary);
            border-radius: 999px;
            font-size: 0.8rem;
            font-weight: 600;
        }

        .full-width {
          width: 100%;
        }

        @media (max-width: 768px) {
          .main-content {
            grid-template-columns: 1fr;
          }
          .filters {
            display: none; /* Hide filters on mobile for now */
          }
        }
      `}</style>
        </div>
    );
}
