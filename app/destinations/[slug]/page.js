import { DESTINATIONS } from '../data';
import Link from 'next/link';
import Image from 'next/image';
import { createClient } from '@/utils/supabase/server';

export async function generateMetadata({ params }) {
    const data = DESTINATIONS[params.slug];
    if (!data) return { title: 'Destination Not Found' };
    return {
        title: data.title,
        description: data.description,
    };
}

export default async function DestinationPage({ params }) {
    const data = DESTINATIONS[params.slug];

    if (!data) {
        return (
            <div className="container" style={{ padding: '8rem 2rem', textAlign: 'center' }}>
                <h1>Destination Not Found</h1>
                <Link href="/" className="btn btn-primary">Return Home</Link>
            </div>
        );
    }

    const supabase = createClient();

    // Simple fetch based on category for now (mocking the location filter for simplicity unless we have real lat/long)
    // In a real app we'd query by distance from the destination's coordinates
    const { data: items } = await supabase
        .from('items')
        .select('*')
        .eq('category', data.filter.category)
        .limit(8);

    return (
        <div className="destination-page">
            <div className="hero-section">
                <Image
                    src={data.heroImage}
                    alt={data.heading}
                    fill
                    style={{ objectFit: 'cover' }}
                    priority
                />
                <div className="hero-overlay"></div>
                <div className="container hero-content">
                    <h1>{data.heading}</h1>
                    <p>{data.subheading}</p>
                </div>
            </div>

            <div className="container" style={{ padding: '4rem 0' }}>
                <h2 style={{ marginBottom: '2rem' }}>Available Rentals Nearby</h2>

                <div className="items-grid">
                    {items && items.length > 0 ? (
                        items.map(item => (
                            <Link key={item.id} href={`/item/${item.id}`} className="item-card">
                                <div className="image-wrapper">
                                    <Image
                                        src={item.image_url || item.image || '/images/dirt-hero.png'}
                                        alt={item.name}
                                        fill
                                        style={{ objectFit: 'cover' }}
                                    />
                                </div>
                                <div className="card-content">
                                    <h3>{item.name}</h3>
                                    <p className="price">${item.price}<span className="day">/day</span></p>
                                    <p className="location">📍 {item.location}</p>
                                </div>
                            </Link>
                        ))
                    ) : (
                        <p>No rentals found specifically for this area right now. <Link href="/search">Browse all</Link></p>
                    )}
                </div>
            </div>

            <style jsx>{`
        .hero-section {
            position: relative;
            height: 50vh;
            min-height: 400px;
            display: flex;
            align-items: center;
            justify-content: center;
            text-align: center;
            color: white;
            margin-top: -80px; /* Offset navbar */
        }
        .hero-overlay {
            position: absolute;
            inset: 0;
            background: rgba(0,0,0,0.5);
            z-index: 1;
        }
        .hero-content {
            position: relative;
            z-index: 2;
        }
        .hero-content h1 {
            font-size: 3rem;
            margin-bottom: 1rem;
            font-weight: 800;
        }
        .hero-content p {
            font-size: 1.25rem;
            opacity: 0.9;
        }

        .items-grid {
            display: grid;
            grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
            gap: 2rem;
        }

        .item-card {
            background: white;
            border-radius: 16px;
            overflow: hidden;
            box-shadow: 0 4px 12px rgba(0,0,0,0.08);
            transition: transform 0.2s;
            text-decoration: none;
            color: inherit;
            border: 1px solid var(--border-color);
        }
        .item-card:hover {
            transform: translateY(-4px);
        }
        .image-wrapper {
            position: relative;
            height: 200px;
        }
        .card-content {
           padding: 1.5rem;
        }
        .card-content h3 {
            margin-bottom: 0.5rem;
            font-size: 1.1rem;
        }
        .price {
            font-size: 1.25rem;
            font-weight: 700;
            margin-bottom: 0.5rem;
        }
        .day {
            font-size: 0.9rem;
            font-weight: 400;
            color: #64748b;
        }
        .location {
            color: #64748b;
            font-size: 0.9rem;
        }
      `}</style>
        </div>
    );
}
