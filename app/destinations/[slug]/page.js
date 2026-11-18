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

    // Filter dynamically by category and location keyword
    let query = supabase.from('items').select('*').eq('category', data.filter.category);
    if (data.filter.location) {
        query = query.ilike('location', `%${data.filter.location}%`);
    }
    const { data: items } = await query.limit(8);

    // Dynamic JSON-LD for Destination Collection
    const jsonLd = {
        '@context': 'https://schema.org',
        '@type': 'CollectionPage',
        name: data.heading,
        description: data.description,
        url: `https://hobbyrent-eta.vercel.app/destinations/${params.slug}`,
        about: {
            '@type': 'Place',
            name: data.filter.location,
            description: data.subheading
        }
    };

    return (
        <div className="destination-page">
            <script
                type="application/ld+json"
                dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
            />
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


        </div>
    );
}
