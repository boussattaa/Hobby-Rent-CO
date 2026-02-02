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
      id: 'watersports', // Updated ID for consistency, though 'water' would work if href matches. Keeping existing logic.
      name: 'Watersports',
      description: 'Make a splash. Jet skis, boats, and boards.',
      image: '/images/water-hero.png',
      href: '/water',
      accent: 'var(--water-primary)'
    },
    {
      id: 'trailers',
      name: 'Trailers',
      description: 'Haul it all. Car trailers, dumpers, and more.',
      image: '/images/trailer-hero.png',
      href: '/trailers',
      accent: 'var(--trailers-primary)'
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
            src="/images/hero-bg-final.jpg"
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


    </div>
  );
}
