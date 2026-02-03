"use client";

import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import Image from 'next/image';
import { useState, useEffect, Suspense } from 'react';
import { createClient } from '@/utils/supabase/client';
import { getDistanceFromLatLonInMiles } from '@/utils/distance';
import SearchFilter from '@/components/SearchFilter';
import FilterSidebar from '@/components/FilterSidebar';
import MobileFilterBar from '@/components/MobileFilterBar';

const HOUSING_SUBCATEGORIES = [
    'Excavators',
    'Skid Steers',
    'Tractors',
    'Lawn & Garden',
    'Power Tools',
    'Generators',
    'Compressors',
    'Scaffolding'
];

function HousingPageContent() {
    const [items, setItems] = useState([]);
    const [loading, setLoading] = useState(true);
    const searchParams = useSearchParams();
    const router = useRouter();
    const supabase = createClient();

    // 1. Get Filters from URL
    const searchLat = parseFloat(searchParams.get('lat'));
    const searchLng = parseFloat(searchParams.get('lng'));
    const searchRadius = parseFloat(searchParams.get('radius')) || 50;
    const subcatFilter = searchParams.get('subcat')?.split(',') || [];
    const maxPrice = parseFloat(searchParams.get('max_price')) || 1000;
    const sortOption = searchParams.get('sort') || 'newest';

    useEffect(() => {
        const fetchItems = async () => {
            setLoading(true);
            let query = supabase
                .from('items')
                .select('*')
                .eq('category', 'housing')
                .lte('price', maxPrice);

            if (subcatFilter.length > 0) {
                query = query.in('subcategory', subcatFilter);
            }

            if (sortOption === 'price_asc') {
                query = query.order('price', { ascending: true });
            } else if (sortOption === 'price_desc') {
                query = query.order('price', { ascending: false });
            } else {
                query = query.order('created_at', { ascending: false });
            }

            const { data, error } = await query;

            if (data) {
                let finalItems = data.map(item => ({
                    ...item,
                    image: item.image_url || '/images/housing-hero.png',
                    price: Number(item.price)
                }));

                if (searchLat && searchLng) {
                    finalItems = finalItems.filter(item => {
                        if (!item.lat || !item.lng) return false;
                        const distance = getDistanceFromLatLonInMiles(searchLat, searchLng, item.lat, item.lng);
                        return distance <= searchRadius;
                    });
                }

                setItems(finalItems);
            } else if (error) {
                console.error("Error fetching housing items:", error);
            }
            setLoading(false);
        };

        fetchItems();
    }, [supabase, searchLat, searchLng, searchRadius, searchParams.toString()]);

    return (
        <div className="category-page">
            <header className="page-header">
                <div className="container">
                    <h1>Tools Collection</h1>
                    <p>Get the job done with professional grade tools.</p>
                </div>
            </header>

            <div className="container main-content">
                <FilterSidebar
                    categories={HOUSING_SUBCATEGORIES}
                    priceMax={1000}
                />

                <div className="content-area">
                    <MobileFilterBar categories={HOUSING_SUBCATEGORIES} />

                    <div className="controls-row">
                        <SearchFilter />

                        <div className="sort-wrapper">
                            <select
                                value={sortOption}
                                onChange={(e) => {
                                    const params = new URLSearchParams(searchParams.toString());
                                    params.set('sort', e.target.value);
                                    router.push(`?${params.toString()}`, { scroll: false });
                                }}
                                className="sort-select"
                            >
                                <option value="newest">Newest Listed</option>
                                <option value="price_asc">Price: Low to High</option>
                                <option value="price_desc">Price: High to Low</option>
                            </select>
                        </div>
                    </div>

                    <div className="results-info">
                        {loading ? (
                            <span>Loading listings...</span>
                        ) : searchLat ? (
                            <p>Found {items.length} results within {searchRadius} miles</p>
                        ) : (
                            <p>Showing {items.length} listings</p>
                        )}
                    </div>

                    <div className="item-grid">
                        {items.length > 0 ? (
                            items.map((item) => (
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
                                        <div className="card-footer">
                                            <span className="badge">{item.subcategory || 'Tool'}</span>
                                        </div>
                                    </div>
                                </Link>
                            ))
                        ) : (
                            !loading && <div className="empty-state">No items found matching your filters.</div>
                        )}
                    </div>
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
          grid-template-columns: 280px 1fr;
          gap: 3rem;
          padding-bottom: 4rem;
        }
        
        .content-area { width: 100%; }
        
        .controls-row {
            display: flex;
            justify-content: space-between;
            align-items: center;
            margin-bottom: 1.5rem;
            gap: 1rem;
            flex-wrap: wrap;
        }

        .sort-select {
            padding: 0.75rem 1rem;
            border-radius: 8px;
            border: 1px solid var(--border-color);
            background: white;
            cursor: pointer;
            font-size: 0.95rem;
        }

        .results-info { margin-bottom: 1.5rem; color: var(--text-secondary); font-weight: 500; }

        .item-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
          gap: 2rem;
        }
        
        .empty-state {
            grid-column: 1 / -1;
            text-align: center;
            padding: 3rem;
            background: #f9fafb;
            border-radius: 12px;
            color: var(--text-secondary);
        }

        .item-card {
          background: white;
          border: 1px solid var(--border-color);
          border-radius: 16px;
          overflow: hidden;
          text-decoration: none;
          color: var(--text-primary);
          transition: transform 0.2s, box-shadow 0.2s;
          display: flex;
          flex-direction: column;
          height: 100%;
        }
        .item-card:hover { transform: translateY(-4px); box-shadow: 0 12px 24px rgba(0,0,0,0.08); }
        .card-image { position: relative; height: 200px; background: #eee; }
        .card-details { padding: 1.5rem; display: flex; flex-direction: column; flex-grow: 1; }
        .card-header { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 0.5rem; }
        .card-header h3 { font-size: 1.1rem; margin: 0; }
        .price { font-weight: 700; font-size: 1.1rem; }
        .unit { font-size: 0.8rem; color: var(--text-secondary); font-weight: 400; }
        .location { color: var(--text-secondary); font-size: 0.9rem; margin-bottom: 1rem; }
        .card-footer { margin-top: auto; }
        .badge { background: #eef2ff; padding: 4px 10px; border-radius: 20px; font-size: 0.8rem; color: var(--housing-primary); font-weight: 600; }

        @media (max-width: 900px) {
          .main-content { grid-template-columns: 1fr; }
          .controls-row { display: none; }
        }
      `}</style>
        </div>
    );
}

export default function HousingPage() {
    return (
        <Suspense fallback={<div className="container" style={{ padding: '5rem' }}>Loading...</div>}>
            <HousingPageContent />
        </Suspense>
    );
}
