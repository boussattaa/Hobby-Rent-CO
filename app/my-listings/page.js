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
        </div>
    );
}
