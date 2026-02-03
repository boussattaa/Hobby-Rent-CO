"use client";

import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import Image from 'next/image';
import { useState, useEffect } from 'react';
import { createClient } from '@/utils/supabase/client';
import { getDistanceFromLatLonInMiles } from '@/utils/distance';
import SearchFilter from '@/components/SearchFilter';

const DIRT_ITEMS = [
  { id: 'd1', name: 'KTM 450 SX-F', price: 150, image: '/images/dirt-hero.png', location: 'Moab, UT' },
  { id: 'd2', name: 'Polaris RZR XP', price: 350, image: '/images/dirt-hero.png', location: 'Sand Hollow, UT' },
  { id: 'd3', name: 'Honda CRF250R', price: 120, image: '/images/dirt-hero.png', location: 'St. George, UT' },
  { id: 'd4', name: 'Can-Am Maverick', price: 400, image: '/images/dirt-hero.png', location: 'Dumont Dunes, CA' },
];

export default function OffroadPage() {
  const [items, setItems] = useState(DIRT_ITEMS);
  const searchParams = useSearchParams();
  const supabase = createClient();

  // Search Params
  const searchLat = parseFloat(searchParams.get('lat'));
  const searchLng = parseFloat(searchParams.get('lng'));
  const searchRadius = parseFloat(searchParams.get('radius')) || 50;

  const filteredItems = items.filter(item => {
    // If no search, show all
    if (!searchLat || !searchLng) return true;

    // If item has no location logic yet, maybe hide or show? 
    // For now, if item has no coords, we can't filter it accurately.
    // But we can fallback to showing it if we want, or hiding.
    // Let's hide items without coords if a geo-filter is active to be strict.
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
        // Merge with mock items
        // Map DB fields to UI fields if necessary (DB has image_url, UI uses image)
        const formattedItems = data.map(item => ({
          ...item,
          image: item.image_url || '/images/dirt-hero.png',
          price: Number(item.price)
        }));
        setItems(prev => [...DIRT_ITEMS, ...formattedItems]);
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
          display: block;
          padding-bottom: 4rem;
        }
        
        .content-area {
            width: 100%;
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

        @media (max-width: 768px) {
          .main-content {
            grid-template-columns: 1fr;
          }
          .filters {
            display: none; /* Hide filters on mobile for now */
          }
        }
      `}</style>
    </div >
  );
}
