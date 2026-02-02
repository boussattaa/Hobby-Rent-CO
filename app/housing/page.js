"use client";

import Link from 'next/link';
import Image from 'next/image';

const HOUSING_ITEMS = [
    { id: 'h1', name: 'DeWalt 20V Drill Set', price: 25, image: '/images/housing-hero.png', location: 'Seattle, WA' },
    { id: 'h2', name: 'Industrial Carpet Cleaner', price: 60, image: '/images/housing-hero.png', location: 'Portland, OR' },
    { id: 'h3', name: 'Pressure Washer 3000PSI', price: 45, image: '/images/housing-hero.png', location: 'Vancouver, BC' },
    { id: 'h4', name: 'Tile Saw', price: 35, image: '/images/housing-hero.png', location: 'Surrey, BC' },
];

export default function HousingPage() {
    return (
        <div className="category-page">
            <header className="page-header">
                <div className="container">
                    <h1>Tools Collection</h1>
                    <p>Get the job done with professional grade tools.</p>
                </div>
            </header>

            <div className="container main-content">
                <div className="filters">
                    <h3>Filters</h3>
                    <div className="filter-group">
                        <label>Category</label>
                        <select>
                            <option>All</option>
                            <optgroup label="Heavy Equipment">
                                <option>Excavators</option>
                                <option>Skid Steers</option>
                                <option>Tractors</option>
                            </optgroup>
                            <optgroup label="Lawn & Garden">
                                <option>Tillers</option>
                                <option>Chippers</option>
                                <option>Mowers</option>
                            </optgroup>
                            <optgroup label="Construction">
                                <option>Generators</option>
                                <option>Compressors</option>
                                <option>Scaffolding</option>
                            </optgroup>
                            <optgroup label="Power Tools">
                                <option>Drills</option>
                                <option>Saws</option>
                                <option>Sanders</option>
                            </optgroup>
                        </select>
                    </div>
                    <div className="filter-group">
                        <label>Price Range</label>
                        <input type="range" min="0" max="100" />
                    </div>
                </div>

                <div className="item-grid">
                    {HOUSING_ITEMS.map((item) => (
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
          background-color: var(--housing-secondary);
          padding: 4rem 0 3rem;
          margin-bottom: 3rem;
        }
        .page-header h1 {
          color: var(--housing-primary);
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
