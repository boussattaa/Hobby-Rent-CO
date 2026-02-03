"use client";

import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import Image from 'next/image';
import { useState, useEffect } from 'react';
import { createClient } from '@/utils/supabase/client';
import { getDistanceFromLatLonInMiles } from '@/utils/distance';
import SearchFilter from '@/components/SearchFilter';

const TRAILER_ITEMS = [
  { id: 't1', name: '20\' Car Hauler', price: 85, image: '/images/trailer-hero.png', location: 'Salt Lake City, UT', type: 'Car Trailer', lat: 40.7608, lng: -111.8910 },
  { id: 't2', name: '14\' Dump Trailer', price: 120, image: '/images/trailer-hero.png', location: 'Orem, UT', type: 'Dump Trailer', lat: 40.2969, lng: -111.6946 },
  { id: 't3', name: '15 Yard Dumpster', price: 250, image: '/images/trailer-hero.png', location: 'Provo, UT', type: 'Dumpster Bin', lat: 40.2338, lng: -111.6585 },
  { id: 't4', name: 'Enclosed Cargo 6x12', price: 60, image: '/images/trailer-hero.png', location: 'Lehi, UT', type: 'Utility Trailer', lat: 40.3916, lng: -111.8491 },
  { id: 't5', name: 'Heavy Duty Flatbed', price: 100, image: '/images/trailer-hero.png', location: 'Draper, UT', type: 'Flatbed', lat: 40.5247, lng: -111.8638 },
];

export default function TrailersPage() {
  const [items, setItems] = useState(TRAILER_ITEMS);
  const searchParams = useSearchParams();
  const supabase = createClient();

  // Search Params
  const searchLat = parseFloat(searchParams.get('lat'));
  const searchLng = parseFloat(searchParams.get('lng'));
  const searchRadius = parseFloat(searchParams.get('radius')) || 50;

  const filteredItems = items.filter(item => {
    if (!searchLat || !searchLng) return true;
    if (!item.lat || !item.lng) return false;
    const distance = getDistanceFromLatLonInMiles(searchLat, searchLng, item.lat, item.lng);
    return distance <= searchRadius;
  });

  useEffect(() => {
    const fetchItems = async () => {
      const { data, error } = await supabase
        .from('items')
        .select('*')
        .eq('category', 'trailers');

      if (data) {
        const formattedItems = data.map(item => ({
          ...item,
          image: item.image_url || '/images/trailer-hero.png',
          price: Number(item.price)
        }));
        setItems(prev => [...TRAILER_ITEMS, ...formattedItems]);
      }
    };
    fetchItems();
  }, [supabase]);

  return (
    <div className="category-page">
      <header className="page-header">
        <div className="container">
          <h1>Trailer Rentals</h1>
          <p>Haul it all. From cars to debris, we have the trailer for you.</p>
        </div>
      </header>

      <div className="container main-content">
        <aside className="filters">
          <h3>Filters</h3>
          <div className="filter-group">
            <label>Category</label>
            <select>
              <option>All</option>
              <optgroup label="Hauling">
                <option>Car Haulers</option>
                <option>Utility</option>
                <option>Dump</option>
                <option>Enclosed</option>
              </optgroup>
              <optgroup label="Recreational">
                <option>Toy Haulers</option>
                <option>Travel Trailers</option>
                <option>Teardrop</option>
                <option>Boat Trailers</option>
              </optgroup>
              <optgroup label="Specialty">
                <option>Livestock</option>
                <option>Tow Dollies</option>
              </optgroup>
            </select>
          </div>
          <div className="filter-group">
            <label>Price Range</label>
            <input type="range" min="0" max="500" />
          </div>
        </aside>

        <div className="content-area">
          <SearchFilter />

          <div className="results-info">
            {searchLat ? (
              <p>Showing {filteredItems.length} results within {searchRadius} miles</p>
            ) : (
              <p>Showing all {filteredItems.length} listings</p>
            )}
          </div>

          <div className="item-grid">
            {filteredItems.map((item) => (
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
                  <div className="badge">{item.type || item.subcategory}</div>
                  <button className="btn btn-primary full-width" style={{ marginTop: '1rem' }}>Rent Now</button>
                </div>
              </Link>
            ))}
          </div>
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
        
        .content-area { width: 100%; }
        .results-info { margin-bottom: 1rem; color: var(--text-secondary); font-weight: 500; }

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

        @media (max-width: 900px) {
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
