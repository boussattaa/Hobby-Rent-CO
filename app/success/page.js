'use client';

import Link from 'next/link';
import { useEffect, useState, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';

function SuccessContent() {
    const searchParams = useSearchParams();
    const sessionId = searchParams.get('session_id');
    const type = searchParams.get('type');
    const rentalId = searchParams.get('rental_id');

    // Default to 'verifying' if we have a session, otherwise 'request' if explicit, or error
    const [status, setStatus] = useState(type === 'request' ? 'request_sent' : 'verifying');

    useEffect(() => {
        if (type === 'request') return; // No verification needed for simple requests

        if (!sessionId) {
            setStatus('error');
            return;
        }

        const verifyPayment = async () => {
            try {
                const res = await fetch('/api/checkout/success', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ sessionId })
                });

                if (res.ok) {
                    setStatus('success');
                } else {
                    setStatus('error');
                }
            } catch (e) {
                console.error(e);
                setStatus('error');
            }
        };

        verifyPayment();
    }, [sessionId, type]);

    return (
        <div className="container" style={{ padding: '4rem 2rem', textAlign: 'center' }}>
            <div className="glass" style={{ padding: '3rem', borderRadius: '24px', maxWidth: '600px', margin: '0 auto' }}>
                {status === 'verifying' && (
                    <>
                        <h1 style={{ color: '#0ea5e9', marginBottom: '1rem' }}>Verifying Payment...</h1>
                        <p>Please wait while we confirm your booking.</p>
                    </>
                )}

                {status === 'success' && (
                    <>
                        <h1 style={{ color: '#16a34a', marginBottom: '1rem' }}>Payment Confirmed! 🎉</h1>
                        <p style={{ fontSize: '1.2rem', color: 'var(--text-secondary)', marginBottom: '2rem' }}>
                            Your rental is approved. You can now view pickup details.
                        </p>
                        <Link href="/rentals" className="btn btn-primary">
                            Go to My Trips
                        </Link>
                    </>
                )}

                {status === 'request_sent' && (
                    <>
                        <h1 style={{ color: '#0ea5e9', marginBottom: '1rem' }}>Request Sent! 📩</h1>
                        <p style={{ fontSize: '1.2rem', color: 'var(--text-secondary)', marginBottom: '2rem' }}>
                            We've sent your rental request to the owner. You'll be notified once they approve it so you can complete the payment.
                        </p>
                        <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center' }}>
                            <Link href="/rentals" className="btn btn-primary">
                                View My Trips
                            </Link>
                            <Link href="/" className="btn btn-secondary">
                                Return Home
                            </Link>
                        </div>
                    </>
                )}

                {status === 'error' && (
                    <>
                        <h1 style={{ color: '#dc2626', marginBottom: '1rem' }}>Something went wrong</h1>
                        <p style={{ marginBottom: '2rem' }}>We couldn't verify your payment. Please contact support if you were charged.</p>
                        <Link href="/" className="btn btn-secondary">
                            Return Home
                        </Link>
                    </>
                )}
            </div>
        </div>
    );
}

export default function SuccessPage() {
    return (
        <Suspense fallback={<div>Loading...</div>}>
            <SuccessContent />
        </Suspense>
    );
}
