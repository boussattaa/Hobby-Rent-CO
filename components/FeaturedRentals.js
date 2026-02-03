
import { createClient } from '@/utils/supabase/server';
import ListingCard from './ListingCard';
import Link from 'next/link';

export default async function FeaturedRentals() {
    const supabase = await createClient();

    // Fetch curated featured listings:
    // 1 most expensive offroad, 2 most expensive watersports, 1 trailer
    const [offroadRes, waterRes, trailerRes] = await Promise.all([
        supabase
            .from('items')
            .select('*')
            .eq('category', 'offroad')
            .order('price', { ascending: false })
            .limit(1),
        supabase
            .from('items')
            .select('*')
            .eq('category', 'water')
            .order('price', { ascending: false })
            .limit(2),
        supabase
            .from('items')
            .select('*')
            .eq('category', 'trailers')
            .order('price', { ascending: false })
            .limit(1),
    ]);

    const items = [
        ...(offroadRes.data || []),
        ...(waterRes.data || []),
        ...(trailerRes.data || []),
    ];

    if (items.length === 0) return null;

    return (
        <section className="featured-section">
            <div className="container">
                <div className="featured-header">
                    <h2>Featured Listings</h2>
                    <Link href="/search" className="view-all-link">View all listings →</Link>
                </div>

                {/* Horizontal scrolling container for mobile */}
                <div className="featured-scroll">
                    {items.map(item => (
                        <div key={item.id} className="featured-card-wrapper">
                            <ListingCard item={item} />
                        </div>
                    ))}
                </div>

                {/* Scroll indicator for mobile */}
                <div className="scroll-indicator">
                    <span className="scroll-hint">← Swipe for more →</span>
                </div>
            </div>
        </section>
    );
}
