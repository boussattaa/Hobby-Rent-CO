"use client";

import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import Image from 'next/image';
import { useState, useEffect } from 'react';
import { createClient } from '@/utils/supabase/client';
import { getDistanceFromLatLonInMiles } from '@/utils/distance';
import SearchFilter from '@/components/SearchFilter';

const DIRT_ITEMS = [];

export default function OffroadPage() {
  const [items, setItems] = useState([]);
  const searchParams = useSearchParams();
  const supabase = createClient();

  // Search Params
  const searchLat = parseFloat(searchParams.get('lat'));
  const searchLng = parseFloat(searchParams.get('lng'));
  const searchRadius = parseFloat(searchParams.get('radius')) || 50;

  const filteredItems = items.filter(item => {
    // If no search, show all
    if (!searchLat || !searchLng) return true;

    // Strict geo-filter
    if (!item.lat || !item.lng) return false;

    const distance = getDistanceFromLatLonInMiles(searchLat, searchLng, item.lat, item.lng);
    return distance <= searchRadius;
  });

  useEffect(() => {
    const fetchItems = async () => {
      const { data, error } = await supabase
        .from('items')
        .select('*')
        .eq('category', 'offroad');

      if (data) {
        // Map DB fields to UI fields if necessary (DB has image_url, UI uses image)
        const formattedItems = data.map(item => ({
          ...item,
          image: item.image_url || '/images/dirt-hero.png',
          price: Number(item.price)
        }));
        setItems(formattedItems);
      }
    };
    fetchItems();
  }, [supabase]);

  return (
    <div className="category-page">
      <header className="page-header">
        <div className="container">
          <h1>Offroad Collection</h1>
          <p>Tear up the trails with our premium off-road selection.</p>
        </div>
      </header>

      <div className="container main-content">
        {/* Restored Sidebar */}
        <aside className="filters">
          <h3>Filters</h3>
          <div className="filter-group">
            <label>Category</label>
            <select>
              <option>All</option>
              <optgroup label="UTVs / Side-by-Sides">
                <option>2-Seaters</option>
                <option>4-Seaters</option>
                <option>Utility</option>
              </optgroup>
              <optgroup label="ATVs / Quads">
                <option>Sport Quads</option>
                <option>Utility ATVs</option>
                <option>Youth</option>
              </optgroup>
              <optgroup label="Two Wheels">
                <option>Dirt Bikes</option>
                <option>Motocross</option>
                <option>Dual-Sport</option>
                <option>Electric</option>
              </optgroup>
              <optgroup label="Seasonal">
                <option>Snowmobiles</option>
                <option>Snow Bikes</option>
              </optgroup>
            </select>
          </div>
          <div className="filter-group">
            <label>Price Range</label>
            <input type="range" min="0" max="1000" />
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
                  <button className="btn btn-primary full-width">Rent Now</button>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </div>

      <style jsx>{`
        .page-header {
          background-color: var(--dirt-secondary);
          padding: 4rem 0 3rem;
          margin-bottom: 3rem;
        }
        .page-header h1 {
          color: var(--dirt-primary);
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

        .results-info {
            margin-bottom: 1rem;
            color: var(--text-secondary);
            font-weight: 500;
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
          margin-bottom: 1.5rem;
        }

        .full-width {
          width: 100%;
        }

        @media (max-width: 900px) {
          .main-content {
             grid-template-columns: 1fr;
          }
          .filters {
             display: none;
          }
        }
      `}</style>
    </div >
  );
}
