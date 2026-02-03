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


        </div>
    );
}
