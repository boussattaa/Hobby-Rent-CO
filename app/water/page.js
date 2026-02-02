"use client";

import Link from 'next/link';
import Image from 'next/image';

const WATER_ITEMS = [
    { id: 'w1', name: 'Sea-Doo GTX', price: 250, image: '/images/water-hero.png', location: 'Miami, FL' },
    { id: 'w2', name: 'MasterCraft NXT', price: 800, image: '/images/water-hero.png', location: 'Lake Powell, AZ' },
    { id: 'w3', name: 'Inflatable Paddleboard', price: 40, image: '/images/water-hero.png', location: 'Austin, TX' },
    { id: 'w4', name: 'Yamaha Waverunner', price: 220, image: '/images/water-hero.png', location: 'San Diego, CA' },
];

export default function WaterPage() {
    return (
        <div className="category-page">
            <header className="page-header">
                <div className="container">
                    <h1>Watersports Collection</h1>
                    <p>Make waves with the best water sports gear.</p>
                </div>
            </header>

            <div className="container main-content">
                <div className="filters">
                    <h3>Filters</h3>
                    <div className="filter-group">
                        <label>Type</label>
                        <select>
                            <option>All</option>
                            <option>Jet Ski</option>
                            <option>Boat</option>
                            <option>Paddleboard</option>
                        </select>
                    </div>
                    <div className="filter-group">
                        <label>Price Range</label>
                        <input type="range" min="0" max="1000" />
                    </div>
                </div>

                <div className="item-grid">
                    {WATER_ITEMS.map((item) => (
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
                                <button className="btn btn-primary full-width">Rent Now</button>
                            </div>
                        </Link>
                    ))}
                </div>
            </div>

            <style jsx>{`
        .page-header {
          background-color: var(--water-secondary);
          padding: 4rem 0 3rem;
          margin-bottom: 3rem;
        }
        .page-header h1 {
          color: var(--water-primary);
        }
        /* Reuse styles from Dirt Page via global if preferred, or scoped here */
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
        .filter-group { margin-top: 1.5rem; }
        .filter-group label { display: block; margin-bottom: 0.5rem; font-weight: 600; }
        .filter-group select, .filter-group input { width: 100%; padding: 0.5rem; border-radius: 6px; border: 1px solid var(--border-color); }

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
        .item-card:hover { transform: translateY(-4px); box-shadow: 0 12px 24px rgba(0,0,0,0.08); }
        .card-image { position: relative; height: 200px; background: #eee; }
        .card-details { padding: 1.5rem; }
        .card-header { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 0.5rem; }
        .card-header h3 { font-size: 1.1rem; margin: 0; }
        .price { font-weight: 700; font-size: 1.1rem; }
        .unit { font-size: 0.8rem; color: var(--text-secondary); font-weight: 400; }
        .location { color: var(--text-secondary); font-size: 0.9rem; margin-bottom: 1.5rem; }
        .full-width { width: 100%; }

        @media (max-width: 768px) {
          .main-content { grid-template-columns: 1fr; }
          .filters { display: none; }
        }
      `}</style>
        </div>
    );
}
