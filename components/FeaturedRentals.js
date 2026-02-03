
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
                    <h2>Featured Rentals</h2>
                    <Link href="/search" className="view-all-link">View all listings →</Link>
                </div>

                <div className="featured-grid">
                    {items.map(item => (
                        <ListingCard key={item.id} item={item} />
                    ))}
                </div>
            </div>

            <style jsx>{`
        .featured-section {
            padding: 5rem 0;
        }

        .header-row {
            display: flex;
            justify-content: space-between;
            align-items: center;
            margin-bottom: 2rem;
        }

        .header-row h2 {
            font-size: 2rem;
            margin: 0;
        }

        .view-all-link {
            text-decoration: none;
            color: var(--primary-color);
            font-weight: 600;
        }
        .view-all-link:hover {
            text-decoration: underline;
        }

        .featured-grid {
            display: grid;
            grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
            gap: 2rem;
        }
      `}</style>
        </section>
    );
}
