"use client";

import Image from 'next/image';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import { useState, useEffect } from 'react';
import { createClient } from '@/utils/supabase/client';
import DeleteButton from '@/components/DeleteButton';

// Mock database (consolidated from categories)
const ITEMS_DB = {
  // Dirt
  'd1': { name: 'KTM 450 SX-F', price: 150, image: '/images/dirt-hero.png', location: 'Moab, UT', description: 'Championship winning motocross bike. Perfect for the dunes or the track. Well maintained and ready to rip.' },
  'd2': { name: 'Polaris RZR XP', price: 350, image: '/images/dirt-hero.png', location: 'Sand Hollow, UT', description: 'The ultimate side-by-side experience. 4 seats, turbo charged, plenty of suspension travel.' },
  'd3': { name: 'Honda CRF250R', price: 120, image: '/images/dirt-hero.png', location: 'St. George, UT', description: 'Reliable and fun. Great for intermediate riders looking to explore the trails.' },
  'd4': { name: 'Can-Am Maverick', price: 400, image: '/images/dirt-hero.png', location: 'Dumont Dunes, CA', description: 'High performance beast. Conquer any dune with this machine.' },
  // Water
  'w1': { name: 'Sea-Doo GTX', price: 250, image: '/images/water-hero.png', location: 'Miami, FL', description: 'Luxury personal watercraft. Stable, fast, and comfortable for 3 riders.' },
  'w2': { name: 'MasterCraft NXT', price: 800, image: '/images/water-hero.png', location: 'Lake Powell, AZ', description: 'Premium wakeboard boat. Create the perfect wave for surfing or boarding.' },
  'w3': { name: 'Inflatable Paddleboard', price: 40, image: '/images/water-hero.png', location: 'Austin, TX', description: 'Portable fun. easy to carry and inflate. Includes paddle and pump.' },
  'w4': { name: 'Yamaha Waverunner', price: 220, image: '/images/water-hero.png', location: 'San Diego, CA', description: 'Reliable jet ski for cruising the bay or jumping waves.' },
  // Housing
  'h1': { name: 'DeWalt 20V Drill Set', price: 25, image: '/images/housing-hero.png', location: 'Seattle, WA', description: 'Complete drill and impact driver set. Batteries included.' },
  'h2': { name: 'Industrial Carpet Cleaner', price: 60, image: '/images/housing-hero.png', location: 'Portland, OR', description: 'Deep clean your carpets like a pro. Removes tough stains and odors.' },
  'h3': { name: 'Pressure Washer 3000PSI', price: 45, image: '/images/housing-hero.png', location: 'Vancouver, BC', description: 'Blast away dirt and grime from driveways, decks, and siding.' },
  'h4': { name: 'Tile Saw', price: 35, image: '/images/housing-hero.png', location: 'Surrey, BC', description: 'Precision cutting for ceramic and stone tiles. Water cooled blade.' },
};

export default function ItemPage() {
  const params = useParams();
  const router = useRouter(); // Added for redirect after delete
  const supabase = createClient();
  const initialItem = ITEMS_DB[params.id] || null;
  const [item, setItem] = useState(initialItem);
  const [itemsOwnerId, setItemsOwnerId] = useState(null);
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(!initialItem);

  // Date state management
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  useEffect(() => {
    const checkAuth = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      setCurrentUser(user);
    };
    checkAuth();

    if (ITEMS_DB[params.id]) return;

    const fetchItem = async () => {
      const { data, error } = await supabase
        .from('items')
        .select('*')
        .eq('id', params.id)
        .single();

      if (data) {
        setItem({ ...data, price: Number(data.price) });
        setItemsOwnerId(data.owner_id);
      }
      if (error) console.error('Error fetching item:', error);
      setLoading(false);
    };

    fetchItem();
  }, [params.id, supabase]);

  // Get today's date string for min attribute
  const today = new Date().toISOString().split('T')[0];

  if (loading) {
    return (
      <div className="container" style={{ padding: '8rem 2rem', textAlign: 'center' }}>
        <h2>Loading gear...</h2>
      </div>
    );
  }

  if (!item) {
    return (
      <div className="container" style={{ padding: '8rem 2rem', textAlign: 'center' }}>
        <h1>Item not found</h1>
        <Link href="/" className="btn btn-primary" style={{ marginTop: '1rem' }}>Return Home</Link>
      </div>
    );
  }

  return (
    <div className="item-page">
      <div className="item-hero">
        <Image src={item.image || item.image_url || '/images/dirt-hero.png'} alt={item.name} fill style={{ objectFit: 'cover' }} priority />
        <div className="gradient-overlay" />
      </div>

      <div className="container item-content">
        <div className="content-wrapper glass">
          <div className="item-header">
            <div>
              <h1>{item.name}</h1>
              <p className="location">📍 {item.location}</p>
            </div>
            <div className="price-tag">
              <span className="currency">$</span>
              <span className="amount">{item.price}</span>
              <span className="per">/day</span>
            </div>
          </div>

          <div className="grid-layout">
            <div className="details-column">
              <h3>Description</h3>
              <p className="description">{item.description}</p>

              <div className="features">
                <div className="feature-item">🛡️ Insurance Included</div>
                <div className="feature-item">⭐ 4.9 Star Equipment</div>
                <div className="feature-item">✅ Verified Owner</div>
              </div>

              {/* Owner/Admin Controls */}
              {currentUser && (
                <div className="admin-controls">
                  <h4>Admin Controls</h4>
                  <div className="controls-row">
                    <Link href={`/edit-listing/${item.id}`} className="btn-edit">✏️ Edit</Link>
                    <DeleteButton itemId={item.id} />
                  </div>
                </div>
              )}
            </div>

            <div className="booking-column">
              <div className="booking-card">
                <h3>Book this Item</h3>
                <div className="date-picker-mock">
                  <div className="date-field">
                    <label>Start Date</label>
                    <input
                      type="date"
                      min={today}
                      value={startDate}
                      onChange={(e) => setStartDate(e.target.value)}
                    />
                  </div>
                  <div className="date-field">
                    <label>End Date</label>
                    <input
                      type="date"
                      min={startDate || today}
                      value={endDate}
                      onChange={(e) => setEndDate(e.target.value)}
                      disabled={!startDate}
                    />
                  </div>
                </div>

                <div className="summary-row">
                  <span>Service Fee</span>
                  <span>$15</span>
                </div>
                <div className="summary-row total">
                  <span>Total (est)</span>
                  <span>${item.price + 15}</span>
                </div>

                <Link
                  href={startDate && endDate ? `/checkout?itemId=${params.id}&start=${startDate}&end=${endDate}` : '#'}
                  className={`btn btn-primary full-width ${(!startDate || !endDate) ? 'disabled' : ''}`}
                  style={{
                    textAlign: 'center',
                    textDecoration: 'none',
                    opacity: (!startDate || !endDate) ? 0.5 : 1,
                    pointerEvents: (!startDate || !endDate) ? 'none' : 'auto'
                  }}
                >
                  Request to Rent
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>

      <style jsx>{`
        .item-page {
          min-height: 100vh;
        }

        .item-hero {
          position: relative;
          height: 60vh;
          width: 100%;
          margin-top: -80px; /* Under navbar */
        }
        
        .gradient-overlay {
          position: absolute;
          bottom: 0;
          left: 0;
          right: 0;
          height: 50%;
          background: linear-gradient(to top, var(--background), transparent);
        }

        .item-content {
          position: relative;
          margin-top: -100px;
          padding-bottom: 4rem;
        }

        .content-wrapper {
          padding: 2.5rem;
          border-radius: 24px;
          border: 1px solid white;
          background: rgba(255, 255, 255, 0.9);
          box-shadow: 0 20px 40px rgba(0,0,0,0.1);
        }

        .item-header {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          border-bottom: 1px solid var(--border-color);
          padding-bottom: 2rem;
          margin-bottom: 2rem;
        }

        .item-header h1 {
          font-size: 2.5rem;
          margin-bottom: 0.5rem;
        }

        .location {
          color: var(--text-secondary);
          font-size: 1.1rem;
        }

        .price-tag {
          text-align: right;
        }
        .currency { font-size: 1.5rem; vertical-align: top; font-weight: 600; }
        .amount { font-size: 3rem; font-weight: 800; line-height: 1; letter-spacing: -2px; }
        .per { color: var(--text-secondary); font-size: 1rem; margin-left: 4px; }

        .grid-layout {
          display: grid;
          grid-template-columns: 1fr 350px;
          gap: 3rem;
        }

        .description {
          font-size: 1.1rem;
          line-height: 1.7;
          color: var(--text-secondary);
          margin-bottom: 2rem;
        }

        .features {
          display: flex;
          gap: 1rem;
          flex-wrap: wrap;
        }

        .feature-item {
          background: var(--housing-secondary);
          color: var(--housing-primary);
          padding: 0.5rem 1rem;
          border-radius: 8px;
          font-weight: 600;
          font-size: 0.9rem;
        }
        
        .admin-controls {
            margin-top: 2rem;
            padding-top: 2rem;
            border-top: 1px solid var(--border-color);
        }
        .admin-controls h4 { margin-bottom: 1rem; font-size: 0.9rem; text-transform: uppercase; color: var(--text-secondary); }
        .controls-row { display: flex; gap: 1rem; }
        .btn-edit {
            padding: 0.5rem 1rem;
            border: 1px solid var(--border-color);
            border-radius: 6px;
            text-decoration: none;
            color: var(--text-primary);
            font-weight: 600;
            font-size: 0.9rem;
            flex: 1;
            text-align: center;
        }
        .btn-edit:hover { background: #f5f5f5; }

        .booking-card {
          background: var(--background);
          padding: 1.5rem;
          border-radius: 16px;
          border: 1px solid var(--border-color);
        }

        .booking-card h3 {
          margin-bottom: 1.5rem;
        }

        .date-picker-mock {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 1rem;
          margin-bottom: 1.5rem;
        }
        
        .date-field label { display: block; font-size: 0.8rem; margin-bottom: 4px; font-weight: 600; }
        .date-field input { width: 100%; padding: 0.5rem; border: 1px solid var(--border-color); border-radius: 6px; }

        .summary-row {
          display: flex;
          justify-content: space-between;
          margin-bottom: 0.75rem;
          color: var(--text-secondary);
        }
        .summary-row.total {
          color: var(--text-primary);
          font-weight: 700;
          border-top: 1px solid var(--border-color);
          padding-top: 1rem;
          margin-top: 1rem;
          margin-bottom: 1.5rem;
          font-size: 1.1rem;
        }

        .full-width { width: 100%; }

        @media (max-width: 900px) {
          .grid-layout { grid-template-columns: 1fr; }
          .item-hero { height: 40vh; }
        }
      `}</style>
    </div>
  );
}
