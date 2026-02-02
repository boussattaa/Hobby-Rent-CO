import { createClient } from '@/utils/supabase/server';
import { redirect } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';

export default async function MyListingsPage() {
    const supabase = await createClient();

    // 1. Check Auth
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
        redirect('/login?message=Please log in to view your listings');
    }

    // 2. Fetch User's Items
    const { data: items, error } = await supabase
        .from('items')
        .select('*')
        .eq('owner_id', user.id);

    if (error) {
        console.error('Error fetching my listings:', error);
    }

    return (
        <div className="my-listings-page">
            <header className="page-header">
                <div className="container">
                    <h1>My Listings</h1>
                    <p>Manage your rental inventory.</p>
                </div>
            </header>

            <div className="container main-content">
                {(!items || items.length === 0) ? (
                    <div className="empty-state">
                        <h2>You haven't listed any gear yet.</h2>
                        <p>Start earning money by renting out your equipment.</p>
                        <Link href="/list-your-gear" className="btn btn-primary">
                            List Your First Item
                        </Link>
                    </div>
                ) : (
                    <div className="item-grid">
                        {items.map((item) => (
                            <Link key={item.id} href={`/item/${item.id}`} className="item-card">
                                <div className="card-image">
                                    <Image
                                        src={item.image_url || '/images/dirt-hero.png'}
                                        alt={item.name}
                                        fill
                                        style={{ objectFit: 'cover' }}
                                    />
                                </div>
                                <div className="card-details">
                                    <div className="card-header">
                                        <h3>{item.name}</h3>
                                        <span className="price">${item.price}<span className="unit">/day</span></span>
                                    </div>
                                    <p className="location">📍 {item.location}</p>
                                    <div className="badge">{item.category}</div>
                                </div>
                            </Link>
                        ))}
                    </div>
                )}
            </div>

            <style jsx>{`
        .page-header {
          background-color: var(--primary-color);
          padding: 8rem 0 4rem; /* Matching other pages but using primary color */
          margin-bottom: 3rem;
          color: white;
        }
        
        .main-content {
          min-height: 50vh;
        }

        .empty-state {
          text-align: center;
          padding: 4rem 2rem;
          background: white;
          border-radius: 12px;
          border: 1px dashed var(--border-color);
        }
        .empty-state h2 { margin-bottom: 1rem; }
        .empty-state p { color: var(--text-secondary); margin-bottom: 2rem; }

        .item-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
          gap: 2rem;
          padding-bottom: 4rem;
        }

        .item-card {
          background: white;
          border: 1px solid var(--border-color);
          border-radius: 16px;
          overflow: hidden;
          text-decoration: none;
          color: var(--text-primary);
          transition: transform 0.2s, box-shadow 0.2s;
        }
        .item-card:hover {
          transform: translateY(-4px);
          box-shadow: 0 12px 24px rgba(0,0,0,0.08);
        }

        .card-image {
          position: relative;
          height: 200px;
          background: #eee;
        }

        .card-details {
          padding: 1.5rem;
        }

        .card-header {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          margin-bottom: 0.5rem;
        }

        .card-header h3 {
          font-size: 1.1rem;
          margin: 0;
        }

        .price {
          font-weight: 700;
          font-size: 1.1rem;
        }
        .unit {
          font-size: 0.8rem;
          color: var(--text-secondary);
          font-weight: 400;
        }

        .location {
          color: var(--text-secondary);
          font-size: 0.9rem;
          margin-bottom: 0.5rem;
        }
        
        .badge {
            display: inline-block;
            padding: 0.25rem 0.75rem;
            background: #f1f5f9;
            color: var(--text-secondary);
            border-radius: 999px;
            font-size: 0.8rem;
            font-weight: 600;
            text-transform: capitalize;
        }
      `}</style>
        </div>
    );
}
