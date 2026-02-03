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
  const router = useRouter();
  const supabase = createClient();
  const initialItem = ITEMS_DB[params.id] || null;
  const [item, setItem] = useState(initialItem);
  const [itemsOwnerId, setItemsOwnerId] = useState(null);
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(!initialItem);

  // Photo gallery state
  const [selectedImage, setSelectedImage] = useState(0);
  const [lightboxOpen, setLightboxOpen] = useState(false);

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

  // Get all images (main + additional)
  const getImages = () => {
    if (!item) return [];
    const mainImage = item.image || item.image_url || '/images/dirt-hero.png';
    // If item has additional_images array, include them
    if (item.additional_images && Array.isArray(item.additional_images)) {
      return [mainImage, ...item.additional_images];
    }
    // Fallback: create array with just the main image (duplicated for demo)
    return [mainImage];
  };

  const images = getImages();

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
      {/* Photo Gallery */}
      <div className="gallery-section">
        <div className="main-image-container" onClick={() => setLightboxOpen(true)}>
          <Image
            src={images[selectedImage]}
            alt={item.name}
            fill
            style={{ objectFit: 'cover' }}
            priority
          />
          <div className="image-zoom-hint">
            <span>🔍 Tap to enlarge</span>
          </div>
        </div>

        {/* Thumbnail Strip */}
        {images.length > 1 && (
          <div className="thumbnail-strip">
            {images.map((img, index) => (
              <button
                key={index}
                className={`thumbnail ${selectedImage === index ? 'active' : ''}`}
                onClick={() => setSelectedImage(index)}
              >
                <Image src={img} alt={`${item.name} ${index + 1}`} fill style={{ objectFit: 'cover' }} />
              </button>
            ))}
          </div>
        )}

        {/* Image Counter */}
        <div className="image-counter">
          {selectedImage + 1} / {images.length}
        </div>
      </div>

      {/* Lightbox Modal */}
      {lightboxOpen && (
        <div className="lightbox" onClick={() => setLightboxOpen(false)}>
          <button className="lightbox-close" onClick={() => setLightboxOpen(false)}>✕</button>
          <div className="lightbox-content" onClick={(e) => e.stopPropagation()}>
            <Image
              src={images[selectedImage]}
              alt={item.name}
              fill
              style={{ objectFit: 'contain' }}
            />
          </div>
          {images.length > 1 && (
            <>
              <button
                className="lightbox-prev"
                onClick={(e) => { e.stopPropagation(); setSelectedImage(prev => prev === 0 ? images.length - 1 : prev - 1); }}
              >
                ‹
              </button>
              <button
                className="lightbox-next"
                onClick={(e) => { e.stopPropagation(); setSelectedImage(prev => prev === images.length - 1 ? 0 : prev + 1); }}
              >
                ›
              </button>
            </>
          )}
        </div>
      )}

      <div className="container item-content">
        <div className="content-wrapper">
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
          padding-top: 80px;
        }

        /* Gallery Section */
        .gallery-section {
          position: relative;
          background: #000;
        }

        .main-image-container {
          position: relative;
          height: 50vh;
          min-height: 300px;
          max-height: 500px;
          cursor: zoom-in;
        }

        .image-zoom-hint {
          position: absolute;
          bottom: 1rem;
          left: 50%;
          transform: translateX(-50%);
          background: rgba(0,0,0,0.7);
          color: white;
          padding: 0.5rem 1rem;
          border-radius: 50px;
          font-size: 0.85rem;
          opacity: 0.8;
        }

        .thumbnail-strip {
          display: flex;
          gap: 0.5rem;
          padding: 1rem;
          overflow-x: auto;
          background: #111;
        }

        .thumbnail {
          position: relative;
          width: 60px;
          height: 60px;
          border: 2px solid transparent;
          border-radius: 8px;
          overflow: hidden;
          cursor: pointer;
          flex-shrink: 0;
          padding: 0;
          background: none;
        }

        .thumbnail.active {
          border-color: var(--accent-color);
        }

        .image-counter {
          position: absolute;
          top: 1rem;
          right: 1rem;
          background: rgba(0,0,0,0.7);
          color: white;
          padding: 0.25rem 0.75rem;
          border-radius: 50px;
          font-size: 0.85rem;
          font-weight: 600;
        }

        /* Lightbox */
        .lightbox {
          position: fixed;
          inset: 0;
          background: rgba(0,0,0,0.95);
          z-index: 9999;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .lightbox-content {
          position: relative;
          width: 90vw;
          height: 80vh;
        }

        .lightbox-close {
          position: absolute;
          top: 1rem;
          right: 1rem;
          background: rgba(255,255,255,0.2);
          border: none;
          color: white;
          font-size: 1.5rem;
          width: 44px;
          height: 44px;
          border-radius: 50%;
          cursor: pointer;
          z-index: 10001;
        }

        .lightbox-prev,
        .lightbox-next {
          position: absolute;
          top: 50%;
          transform: translateY(-50%);
          background: rgba(255,255,255,0.2);
          border: none;
          color: white;
          font-size: 2.5rem;
          width: 60px;
          height: 60px;
          border-radius: 50%;
          cursor: pointer;
          z-index: 10001;
        }

        .lightbox-prev { left: 1rem; }
        .lightbox-next { right: 1rem; }

        .lightbox-prev:hover,
        .lightbox-next:hover,
        .lightbox-close:hover {
          background: rgba(255,255,255,0.3);
        }

        /* Content Section */
        .item-content {
          padding: 2rem 0 4rem;
        }

        .content-wrapper {
          padding: 2rem;
          border-radius: 16px;
          background: white;
          box-shadow: 0 4px 20px rgba(0,0,0,0.08);
        }

        .item-header {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          border-bottom: 1px solid var(--border-color);
          padding-bottom: 1.5rem;
          margin-bottom: 1.5rem;
          flex-wrap: wrap;
          gap: 1rem;
        }

        .item-header h1 {
          font-size: 1.75rem;
          margin-bottom: 0.25rem;
        }

        .location {
          color: var(--text-secondary);
          font-size: 1rem;
        }

        .price-tag {
          text-align: right;
        }
        .currency { font-size: 1.25rem; vertical-align: top; font-weight: 600; }
        .amount { font-size: 2.5rem; font-weight: 800; line-height: 1; letter-spacing: -2px; }
        .per { color: var(--text-secondary); font-size: 1rem; margin-left: 4px; }

        .grid-layout {
          display: grid;
          grid-template-columns: 1fr 350px;
          gap: 2rem;
        }

        .description {
          font-size: 1rem;
          line-height: 1.7;
          color: var(--text-secondary);
          margin-bottom: 1.5rem;
        }

        .features {
          display: flex;
          gap: 0.75rem;
          flex-wrap: wrap;
        }

        .feature-item {
          background: #f0f9ff;
          color: #0369a1;
          padding: 0.5rem 1rem;
          border-radius: 8px;
          font-weight: 600;
          font-size: 0.85rem;
        }
        
        .admin-controls {
            margin-top: 2rem;
            padding-top: 1.5rem;
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
          background: #f8fafc;
          padding: 1.5rem;
          border-radius: 16px;
          border: 1px solid var(--border-color);
          position: sticky;
          top: 100px;
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
          
          .main-image-container {
            height: 40vh;
            min-height: 250px;
          }

          .booking-card {
            position: static;
          }

          .item-header h1 {
            font-size: 1.5rem;
          }

          .amount {
            font-size: 2rem;
          }

          .lightbox-prev,
          .lightbox-next {
            width: 44px;
            height: 44px;
            font-size: 1.5rem;
          }
        }
      `}</style>
    </div>
  );
}
