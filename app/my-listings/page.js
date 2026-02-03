import { createClient } from '@/utils/supabase/server';
import { redirect } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import DeleteButton from '@/components/DeleteButton';

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
                            <div key={item.id} className="item-card">
                                <div className="card-image">
                                    <Image
                                        src={item.image_url || '/images/dirt-hero.png'}
                                        alt={item.name}
                                        fill
                                        style={{ objectFit: 'cover' }}
                                    />
                                    <span className="badge-overlay">{item.category}</span>
                                </div>
                                <div className="card-details">
                                    <div className="card-header">
                                        <h3>{item.name}</h3>
                                        <span className="price">${item.price}<span className="unit">/day</span></span>
                                    </div>
                                    <p className="location">📍 {item.location}</p>

                                    <div className="manage-actions">
                                        <Link href={`/item/${item.id}`} className="btn btn-secondary btn-sm">
                                            View
                                        </Link>
                                        <Link href={`/edit-listing/${item.id}`} className="btn btn-secondary btn-sm">
                                            Edit
                                        </Link>
                                        <DeleteButton itemId={item.id} />
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            <style jsx global>{`
              .item-card {
                background: white;
                border: 1px solid var(--border-color);
                border-radius: 16px;
                overflow: hidden;
                transition: transform 0.2s;
              }
              .item-card:hover {
                transform: translateY(-4px);
                box-shadow: 0 12px 24px rgba(0,0,0,0.08); /* Re-adding hover effect */
              }
              .card-image {
                 position: relative;
                 height: 200px;
                 background: #eee;
              }
              .badge-overlay {
                 position: absolute;
                 top: 10px;
                 left: 10px;
                 background: rgba(0,0,0,0.6);
                 color: white;
                 padding: 4px 8px;
                 border-radius: 4px;
                 font-size: 0.8rem;
                 text-transform: capitalize;
              }
              .card-details {
                 padding: 1.5rem;
              }
              .manage-actions {
                 display: flex;
                 gap: 0.5rem;
                 margin-top: 1rem;
                 padding-top: 1rem;
                 border-top: 1px solid #eee;
              }
              .btn-secondary {
                 background: #f1f5f9;
                 color: #334155;
                 border: 1px solid #cbd5e1;
                 text-align: center;
                 text-decoration: none;
                 border-radius: 6px;
                 padding: 0.5rem 1rem;
                 font-size: 0.9rem;
                 font-weight: 600;
                 flex: 1;
              }
              .btn-secondary:hover {
                 background: #e2e8f0;
              }
            `}</style>
        </div>
    );
}
