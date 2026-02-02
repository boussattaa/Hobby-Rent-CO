
import Link from 'next/link';

export default function SuccessPage() {
    return (
        <div className="container" style={{ padding: '4rem 2rem', textAlign: 'center' }}>
            <div className="glass" style={{ padding: '3rem', borderRadius: '24px', maxWidth: '600px', margin: '0 auto' }}>
                <h1 style={{ color: '#16a34a', marginBottom: '1rem' }}>Payment Successful!</h1>
                <p style={{ fontSize: '1.2rem', color: 'var(--text-secondary)', marginBottom: '2rem' }}>
                    Your rental has been confirmed. The owner will contact you shortly with pickup details.
                </p>
                <Link href="/" className="btn btn-primary">
                    Return Home
                </Link>
            </div>
        </div>
    );
}
