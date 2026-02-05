'use client';

import { useState } from 'react';
import { loadStripe } from '@stripe/stripe-js';

// We need the publishable key. 
// Ideally this component should receive it or access env.
// Stripe Identity usually works by redirecting or opening a modal using the client secret.
// BUT, Stripe's specialized Identity SDK is different from Payments. 
// For web, we can use the strict redirect URL from the session or use the cleaner 'verify' flow.
// Actually, Stripe Identity for web is often just a redirected URL provided by the session 'url' field 
// OR passing the client_secret to the stripe.js 'verifyIdentity' method.

const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY);

export default function StripeVerification() {
    const [loading, setLoading] = useState(false);

    const handleVerify = async () => {
        setLoading(true);
        try {
            // 1. Create Session
            const res = await fetch('/api/verify-identity', { method: 'POST' });
            const { clientSecret, error } = await res.json();

            if (error) throw new Error(error);

            // 2. Redirect to Stripe Identity Verification
            const stripe = await stripePromise;
            const { error: stripeError } = await stripe.verifyIdentity(clientSecret);

            if (stripeError) {
                throw stripeError;
            } else {
                // Success happens via webhook, but user is redirected back.
                window.location.reload();
            }
        } catch (err) {
            console.error(err);
            alert('Verification failed to start.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="card stripe-card">
            <div className="icon">⚡</div>
            <h3>Instant Verification</h3>
            <p>Verify your identity instantly using your government ID and a selfie.</p>
            <button
                onClick={handleVerify}
                disabled={loading}
                className="btn-stripe"
            >
                {loading ? 'Starting...' : 'Verify with Stripe'}
            </button>

            <style jsx>{`
        .card {
            background: white;
            padding: 2rem;
            border-radius: 16px;
            border: 1px solid #e2e8f0;
            text-align: center;
            transition: all 0.2s;
            box-shadow: 0 4px 6px rgba(0,0,0,0.02);
            flex: 1;
        }
        .card:hover { transform: translateY(-4px); box-shadow: 0 12px 20px rgba(0,0,0,0.06); }
        .icon { font-size: 3rem; margin-bottom: 1rem; }
        h3 { margin-bottom: 0.5rem; color: #1e293b; }
        p { color: #64748b; margin-bottom: 1.5rem; font-size: 0.95rem; line-height: 1.5; }
        
        .btn-stripe {
            background: #635bff;
            color: white;
            border: none;
            padding: 0.8rem 1.5rem;
            border-radius: 50px;
            font-weight: 600;
            cursor: pointer;
            width: 100%;
            transition: background 0.2s;
        }
        .btn-stripe:hover { background: #4e46e5; }
        .btn-stripe:disabled { opacity: 0.7; cursor: wait; }
      `}</style>
        </div>
    );
}
