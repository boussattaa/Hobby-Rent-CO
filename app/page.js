"use client";

import Image from "next/image";
import Link from "next/link";

export default function Home() {
  const categories = [
    {
      id: 'dirt',
      name: 'Dirt',
      description: 'Conquer the terrain. Bikes, ATVs, and more.',
      image: '/images/dirt-hero.png',
      href: '/dirt',
      accent: 'var(--dirt-primary)'
    },
    {
      id: 'water',
      name: 'Water',
      description: 'Make a splash. Jet skis, boats, and boards.',
      image: '/images/water-hero.png',
      href: '/water',
      accent: 'var(--water-primary)'
    },
    {
      id: 'housing',
      name: 'Tools',
      description: 'Build your dream. Quality tools for every job.',
      image: '/images/housing-hero.png',
      href: '/housing',
      accent: 'var(--housing-primary)'
    }
  ];

  return (
    <div className="landing-page">
      {/* Hero Section */}
      {/* Hero Section */}
      <section className="hero">
        <div className="hero-content">
          <h1>
            Rent the <span className="highlight">Adventure</span>.
            <br />
            Earn from the <span className="highlight">Gear</span>.
          </h1>
          <p className="hero-subtitle">
            The premium marketplace for outdoor enthusiasts and DYI masters.
            Rent what you need, list what you have.
          </p>
          <div className="hero-actions">
            <Link href="/list-your-gear" className="btn btn-primary btn-lg">
              Start Earning
            </Link>
            <Link href="#categories" className="btn btn-secondary btn-lg">
              Explore Rentals
            </Link>
          </div>
        </div>
        <div className="hero-background-wrapper">
          <Image
            src="/images/hero-bg-final.png"
            alt="Hero Background"
            fill
            style={{ objectFit: 'cover' }}
            priority
          />
          <div className="gradient-overlay" />
        </div>
      </section>

      {/* Categories Section */}
      <section id="categories" className="categories container">
        <div className="section-header">
          <h2>Find Your Category</h2>
          <p>Explore our premium selection of rentals</p>
        </div>

        <div className="category-grid">
          {categories.map((cat) => (
            <Link key={cat.id} href={cat.href} className="category-card">
              <div className="image-wrapper">
                <Image
                  src={cat.image}
                  alt={cat.name}
                  fill
                  className="category-image"
                  style={{ objectFit: 'cover' }}
                />
                <div className="overlay" />
              </div>
              <div className="card-content">
                <h3 style={{ color: cat.accent }}>{cat.name}</h3>
                <p>{cat.description}</p>
                <span className="arrow">→</span>
              </div>
            </Link>
          ))}
        </div>
      </section>

      <style jsx>{`
        .landing-page {
          padding-bottom: 4rem;
        }

        .hero {
          position: relative;
          height: 80vh;
          min-height: 600px;
          display: flex;
          align-items: center;
          justify-content: center;
          text-align: center;
          overflow: hidden;
          margin-top: -80px; /* Offset header */
          padding-top: 80px;
        }

        .hero-background-wrapper {
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          z-index: -1;
        }
        
        .gradient-overlay {
           position: absolute;
           inset: 0;
           z-index: 1; /* Above image */
           background: linear-gradient(to bottom, rgba(0,0,0,0.3), rgba(0,0,0,0.6));
        }

        .hero h1 {
          font-size: 4.5rem;
          margin-bottom: 1.5rem;
          line-height: 1.1;
          color: white;
          text-shadow: 0 2px 4px rgba(0,0,0,0.3);
        }

        .hero-content {
          position: relative;
          z-index: 2; /* Content above overlay */
        }

        .highlight {
          background: linear-gradient(120deg, #fbbf24, #f59e0b);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          text-shadow: none; /* Remove shadow from gradient text if needed, or keep it */
        }

        .hero-subtitle {
          font-size: 1.25rem;
          color: rgba(255,255,255,0.9);
          max-width: 600px;
          margin: 0 auto 2.5rem;
          text-shadow: 0 1px 2px rgba(0,0,0,0.3);
        }

        .hero-actions {
          display: flex;
          gap: 1rem;
          justify-content: center;
        }

        .btn-lg {
          padding: 1rem 2.5rem;
          font-size: 1.125rem;
        }

        .categories {
          padding: 4rem 2rem;
        }

        .section-header {
          text-align: center;
          margin-bottom: 3rem;
        }

        .section-header p {
          color: var(--text-secondary);
          margin-top: 0.5rem;
        }

        .category-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
          gap: 2rem;
        }

        .category-card {
          position: relative;
          height: 400px;
          border-radius: 20px;
          overflow: hidden;
          text-decoration: none;
          color: white;
          transition: transform var(--transition-smooth);
          box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
        }

        .category-card:hover {
          transform: translateY(-8px);
          box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04);
        }

        .image-wrapper {
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
        }

        .overlay {
          position: absolute;
          inset: 0;
          background: linear-gradient(to top, rgba(0,0,0,0.8) 0%, rgba(0,0,0,0) 60%);
        }

        .card-content {
          position: relative;
          height: 100%;
          display: flex;
          flex-direction: column;
          justify-content: flex-end;
          padding: 2rem;
          z-index: 10;
        }

        .card-content h3 {
          font-size: 2rem;
          margin-bottom: 0.5rem;
        }

        .card-content p {
          color: rgba(255, 255, 255, 0.9);
          margin-bottom: 1rem;
        }

        .arrow {
          font-size: 1.5rem;
          opacity: 0;
          transform: translateX(-10px);
          transition: all 0.3s;
        }

        .category-card:hover .arrow {
          opacity: 1;
          transform: translateX(0);
        }
      `}</style>
    </div>
  );
}
