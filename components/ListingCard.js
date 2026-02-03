
import Link from 'next/link';
import Image from 'next/image';

export default function ListingCard({ item }) {
    // Ensure numeric price
    const price = Number(item.price);

    // Fallback image if missing
    const imageUrl = item.image_url || item.image || '/images/hero-bg.jpg';

    return (
        <Link href={`/item/${item.id}`} className="listing-card">
            <div className="card-image-wrapper">
                <Image
                    src={imageUrl}
                    alt={item.name}
                    fill
                    sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                    style={{ objectFit: 'cover' }}
                />
            </div>
            <div className="card-details">
                <div className="card-header">
                    <h3 className="card-title">{item.name}</h3>
                    <span className="price">${price}<span className="unit">/day</span></span>
                </div>
                <p className="location">📍 {item.location || 'Meridian, ID'}</p>
                <div className="card-footer">
                    <button className="btn btn-primary full-width">Rent Now</button>
                </div>
            </div>

            <style jsx>{`
                .listing-card {
                    background: white;
                    border: 1px solid var(--border-color);
                    border-radius: 16px;
                    overflow: hidden;
                    text-decoration: none;
                    color: var(--text-primary);
                    transition: transform 0.2s, box-shadow 0.2s;
                    display: flex;
                    flex-direction: column;
                    height: 100%;
                }
                .listing-card:hover {
                    transform: translateY(-4px);
                    box-shadow: 0 12px 24px rgba(0,0,0,0.08);
                }

                .card-image-wrapper {
                    position: relative;
                    height: 200px;
                    background: #f0f0f0;
                }

                .card-details {
                    padding: 1.25rem;
                    display: flex;
                    flex-direction: column;
                    flex-grow: 1;
                }

                .card-header {
                    display: flex;
                    justify-content: space-between;
                    align-items: flex-start;
                    margin-bottom: 0.5rem;
                }

                .card-title {
                    font-size: 1.1rem;
                    margin: 0;
                    font-weight: 700;
                    line-height: 1.4;
                    padding-right: 0.5rem;
                }

                .price {
                    font-weight: 800;
                    font-size: 1.1rem;
                    white-space: nowrap;
                }
                .unit {
                    font-size: 0.8rem;
                    color: var(--text-secondary);
                    font-weight: 500;
                }

                .location {
                    color: var(--text-secondary);
                    font-size: 0.9rem;
                    margin-bottom: 1.5rem;
                }

                .card-footer {
                    margin-top: auto;
                }

                .full-width {
                    width: 100%;
                }
            `}</style>
        </Link>
    );
}
