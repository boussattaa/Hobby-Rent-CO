
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

    const gridStyle = {
        display: 'grid',
        gridTemplateColumns: 'repeat(4, 1fr)',
        gap: '1.5rem',
    };

    const headerStyle = {
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: '1.5rem',
    };

    return (
        <section className="featured-section" style={{ padding: '4rem 0', background: '#f8fafc' }}>
            <div className="container">
                <div style={headerStyle}>
                    <h2 style={{ margin: 0 }}>Featured Listings</h2>
                    <Link href="/search" style={{ color: 'var(--accent-color)', textDecoration: 'none', fontWeight: 600 }}>View all listings →</Link>
                </div>

                <div style={gridStyle}>
                    {items.map(item => (
                        <ListingCard key={item.id} item={item} />
                    ))}
                </div>
            </div>


        </section>
    );
}
