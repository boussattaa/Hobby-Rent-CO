


import Link from 'next/link';
import Image from 'next/image';
import SearchBar from '@/components/SearchBar';
import HowItWorks from '@/components/HowItWorks';
import FeaturedRentals from '@/components/FeaturedRentals';

export default function Home() {
  const categories = [
    { name: 'Offroad', image: '/images/offroad-card.jpg', href: '/offroad', desc: 'UTVs, ATVs, and Dirt Bikes' },
    { name: 'Watersports', image: '/images/water-card.jpg', href: '/water', desc: 'Jet Skis, Boats, and Kayaks' },
    { name: 'Trailers', image: '/images/trailer-card.jpg', href: '/trailers', desc: 'Car haulers, Dump, and Utility' },
    { name: 'Tools', image: '/images/tool-card.jpg', href: '/housing', desc: 'Heavy equipment and DIY tools' },
  ];

  return (
    <main>
      {/* Hero Section */}
      <section className="hero">
        <div className="hero-overlay"></div>
        <div className="container hero-content">
          <h1>
            Rent the Adventure.<br />
            Earn from your Gear.
          </h1>
          <p className="subtitle">
            The premium marketplace for outdoor enthusiasts and DIY masters.
            <br />Rent what you need, list what you have.
          </p>

          <div className="hero-search-wrapper">
            <SearchBar />
          </div>

          <div className="hero-actions">
            <Link href="/list-your-gear" className="btn btn-primary" style={{ fontWeight: 'bold' }}>
              List Your Gear
            </Link>
          </div>
        </div>
      </section>

      {/* Featured Rentals */}
      <FeaturedRentals />

      {/* How It Works */}
      <HowItWorks />

      {/* Categories Section */}
      <section className="categories-section">
        <div className="container">
          <h2 className="section-title">Explore Categories</h2>
          <div className="category-grid">
            {categories.map((cat) => (
              <Link key={cat.name} href={cat.href} className="category-card">
                <div className="card-image">
                  <Image
                    src={cat.image}
                    alt={cat.name}
                    fill
                    style={{ objectFit: 'cover' }}
                    sizes="(max-width: 768px) 100vw, 25vw"
                  />
                  <div className="card-overlay">
                    <h3>{cat.name}</h3>
                    <p>{cat.desc}</p>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Trust Badge Section */}
      <section className="trust-section">
        <div className="container trust-grid">
          <div className="trust-item">
            <span className="trust-icon">🛡️</span>
            <h3>Verified Users</h3>
            <p>Identity checks via Stripe for safe rentals.</p>
          </div>
          <div className="trust-item">
            <span className="trust-icon">💬</span>
            <h3>Direct Chat</h3>
            <p>Coordinate pickups easily with owners.</p>
          </div>
          <div className="trust-item">
            <span className="trust-icon">⭐</span>
            <h3>Rated & Reviewed</h3>
            <p>Community-driven trust and quality.</p>
          </div>
        </div>
      </section>

      <style jsx>{`
        /* Hero */
        .hero {
          position: relative;
          height: 85vh;
          width: 100%;
          background-image: url('/images/hero-bg.jpg');
          background-size: cover;
          background-position: center;
          display: flex;
          align-items: center;
          justify-content: center;
          text-align: center;
          color: white;
          margin-top: -80px; /* Pull behind navbar */
          padding-top: 80px;
        }

        .hero-overlay {
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: rgba(0, 0, 0, 0.5); /* Darker overlay for text pop */
          z-index: 1;
        }

        .hero-content {
          position: relative;
          z-index: 2;
          width: 100%;
          max-width: 900px;
        }

        h1 {
          font-size: 3.5rem;
          line-height: 1.1;
          margin-bottom: 1.5rem;
          font-weight: 800;
          text-shadow: 0 4px 10px rgba(0,0,0,0.3);
        }

        .subtitle {
          font-size: 1.25rem;
          margin-bottom: 2.5rem;
          opacity: 0.95;
          max-width: 600px;
          margin-left: auto;
          margin-right: auto;
        }

        .hero-search-wrapper {
            margin-bottom: 2rem;
            padding: 0 1rem;
        }

        .hero-actions {
            margin-top: 1rem;
        }

        /* Categories */
        .categories-section {
            padding: 4rem 0 6rem;
            background: white;
        }
        .section-title {
            text-align: center;
            font-size: 2rem;
            margin-bottom: 3rem;
            color: var(--text-primary);
        }

        .category-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
          gap: 1.5rem;
        }

        .category-card {
          position: relative;
          height: 350px;
          border-radius: 16px;
          overflow: hidden;
          text-decoration: none;
          transition: transform 0.3s;
        }
        .category-card:hover {
            transform: scale(1.02);
        }
        
        .card-image {
            position: relative;
            width: 100%;
            height: 100%;
        }

        .card-overlay {
            position: absolute;
            bottom: 0;
            left: 0;
            right: 0;
            background: linear-gradient(to top, rgba(0,0,0,0.8), transparent);
            padding: 2rem 1.5rem 1.5rem;
            color: white;
        }
        .card-overlay h3 {
            margin: 0;
            font-size: 1.5rem;
            margin-bottom: 0.25rem;
        }
        .card-overlay p {
            margin: 0;
            font-size: 0.9rem;
            opacity: 0.9;
        }

        /* Trust Section */
        .trust-section {
            padding: 4rem 0;
            background: white;
            border-top: 1px solid #f0f0f0;
        }
        .trust-grid {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
            gap: 2rem;
            text-align: center;
        }
        .trust-icon {
            font-size: 2.5rem;
            display: block;
            margin-bottom: 1rem;
        }
        .trust-item h3 {
            margin-bottom: 0.5rem;
            color: var(--text-primary);
        }
        .trust-item p {
            color: var(--text-secondary);
        }

        @media (max-width: 768px) {
          h1 { font-size: 2.5rem; }
          .hero { height: 75vh; }
        }
      `}</style>
    </main>
  );
}
