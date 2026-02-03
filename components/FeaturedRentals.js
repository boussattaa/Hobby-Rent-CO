
import { createClient } from '@/utils/supabase/server';
import ListingCard from './ListingCard';
import Link from 'next/link';

export default async function FeaturedRentals() {
    const supabase = await createClient();

    // Fetch 4 random items (using limits for now as random() is tricky in simple Supabase queries without RPC)
    // We'll just fetch a mix by taking the first 4. In a real app we'd use an rpc('get_random_items')
    const { data: items } = await supabase
        .from('items')
        .select('*')
        .limit(4);

    if (!items || items.length === 0) return null;

    return (
        <section className="featured-section">
            <div className="container">
                <div className="header-row">
                    <h2>Featured Listings</h2>
                    <Link href="/search" className="view-all-link">View all listings →</Link>
                </div>

                <div className="featured-grid">
                    {items.map(item => (
                        <ListingCard key={item.id} item={item} />
                    ))}
                </div>
            </div>


        </section>
    );
}
