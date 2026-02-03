'use client';

import { useState } from 'react';
import { loadStripe } from '@stripe/stripe-js';

// Initialize Stripe outside component
// Use Publishable Key for client-side
const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY);

export default function VerifyPage() {
    const [loading, setLoading] = useState(false);
    const [status, setStatus] = useState('idle'); // idle, processing, success, error
    const [errorMessage, setErrorMessage] = useState('');

    const handleVerify = async () => {
        setLoading(true);
        setErrorMessage('');
        try {
            // 1. Get Client Secret from our backend
            const response = await fetch('/api/verify-identity', { method: 'POST' });
            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error?.message || 'Failed to create verification session');
            }

            const { clientSecret } = data;

            // 2. Open Stripe Verification Modal
            const stripe = await stripePromise;
            const { error: stripeError } = await stripe.verifyIdentity(clientSecret);

            if (stripeError) {
                console.error(stripeError);
                throw new Error(stripeError.message);
            } else {
                setStatus('success');
            }
        } catch (err) {
            console.error('Verification flow error:', err);
            setErrorMessage(err.message);
            setStatus('error');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="verify-page">
            <div className="container">
                <div className="verify-card glass">
                    <div className="icon-wrapper">
                        🛡️
                    </div>
                    <h1>Verify Your Identity</h1>
                    <p>
                        To ensure safety and trust in the HobbyRent community, we ask all members to verify their identity.
                        This helps us protect your gear and keeps everyone safe.
                    </p>

                    {status === 'success' ? (
                        <div className="success-message">
                            <h3>✅ Verification Submitted</h3>
                            <p>Thank you! We are reviewing your documents. You can now close this page.</p>
                        </div>
                    ) : (
                        <div className="action-area">
                            <button
                                onClick={handleVerify}
                                disabled={loading}
                                className="btn btn-primary btn-lg full-width"
                            >
                                {loading ? 'Loading...' : 'Start Verification'}
                            </button>
                            <p className="secure-badge">
                                <span className="lock-icon">🔒</span> Securely powered by Stripe Identity
                            </p>
                        </div>
                    )}

                    {status === 'error' && (
                        <div className="error-message">
                            <p>⚠️ {errorMessage || "Something went wrong. Please try again."}</p>
                        </div>
                    )}
                </div>
            </div>

            <style jsx>{`
        .verify-page {
          min-height: 80vh; /* Adjust for footer overlap */
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 2rem;
          background-image: radial-gradient(at center, #f8fafc 0%, #e2e8f0 100%);
        }

        .verify-card {
          background: white;
          padding: 3rem;
          border-radius: 24px;
          border: 1px solid var(--border-color);
          max-width: 500px;
          width: 100%;
          text-align: center;
          box-shadow: 0 20px 40px rgba(0,0,0,0.05);
        }

        .icon-wrapper {
          font-size: 4rem;
          margin-bottom: 1.5rem;
        }

        h1 { margin-bottom: 1rem; }
        
        p { 
          color: var(--text-secondary); 
          margin-bottom: 2rem;
          line-height: 1.6;
        }

        .btn-lg {
          padding: 1rem 2rem;
          font-size: 1.1rem;
        }

        .secure-badge {
          margin-top: 1.5rem;
          font-size: 0.9rem;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 0.5rem;
          color: #64748b;
        }

        .success-message {
          padding: 2rem;
          background: #f0fdf4;
          border-radius: 12px;
          color: #166534;
        }

        .error-message {
            color: #ef4444;
            margin-top: 1rem;
        }
      `}</style>
        </div>
    );
}
