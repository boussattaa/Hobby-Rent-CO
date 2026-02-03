


import Link from 'next/link';
import Image from 'next/image';
import SearchBar from '@/components/SearchBar';
import HowItWorks from '@/components/HowItWorks';
import FeaturedRentals from '@/components/FeaturedRentals';

export default function Home() {
  const categories = [
    { name: 'Offroad', image: '/images/dirt-hero.png', href: '/offroad', desc: 'UTVs, ATVs, and Dirt Bikes' },
    { name: 'Watersports', image: '/images/water-hero.png', href: '/water', desc: 'Jet Skis, Boats, and Kayaks' },
    { name: 'Trailers', image: '/images/trailer-hero.png', href: '/trailers', desc: 'Car haulers, Dump, and Utility' },
    { name: 'Tools', image: '/images/housing-hero.png', href: '/housing', desc: 'Heavy equipment and DIY tools' },
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


    </main>
  );
}
