"use client";

import { useSearchParams } from 'next/navigation';
import { loadStripe } from '@stripe/stripe-js';
import { useState } from 'react';

// Initialize Stripe with the Publishable Key
const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY);

export default function CheckoutPage() {
    const searchParams = useSearchParams();
    const itemId = searchParams.get('itemId');

    // Mock looking up item details based on ID (in real app would fetch from DB)
    const itemPrice = 150;
    const itemName = "KTM 450 SX-F";
    const serviceFee = 15;
    const total = itemPrice + serviceFee;

    const [loading, setLoading] = useState(false);

    const handleCheckout = async () => {
        setLoading(true);
        try {
            const stripe = await stripePromise;

            // Call the backend to create the Checkout Session
            const response = await fetch('/api/checkout', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    itemId,
                    price: itemPrice,
                    name: itemName,
                }),
            });

            const { sessionId, error: apiError } = await response.json();

            if (apiError) {
                console.error(apiError);
                alert("Payment initiation failed.");
                setLoading(false);
                return;
            }

            // Redirect to Stripe Checkout
            const { error } = await stripe.redirectToCheckout({
                sessionId,
            });

            if (error) {
                console.error(error);
                setLoading(false);
            }
        } catch (err) {
            console.error(err);
            setLoading(false);
        }
    };

    return (
        <div className="checkout-page">
            <div className="container">
                <h1>Checkout</h1>

                <div className="checkout-grid">
                    <div className="summary-section glass">
                        <h2>Order Summary</h2>
                        <div className="summary-item">
                            <span>Rental Item</span>
                            <span>{itemName}</span>
                        </div>
                        <div className="summary-item">
                            <span>Dates</span>
                            <span>Oct 12 - Oct 13</span>
                        </div>

                        <hr />

                        <div className="summary-row">
                            <span>Rental Price</span>
                            <span>${itemPrice}</span>
                        </div>
                        <div className="summary-row">
                            <span>Service Fee</span>
                            <span>${serviceFee}</span>
                        </div>
                        <div className="summary-row total">
                            <span>Total</span>
                            <span>${total}</span>
                        </div>

                        <button
                            onClick={handleCheckout}
                            disabled={loading}
                            className="btn btn-primary full-width"
                            style={{ marginTop: '2rem' }}
                        >
                            {loading ? 'Processing...' : 'Proceed to Payment'}
                        </button>
                    </div>

                    <div className="info-section glass">
                        <h3>Safe & Secure</h3>
                        <p style={{ color: 'var(--text-secondary)', lineHeight: '1.6' }}>
                            Payments are processed securely by Stripe. We do not store your card details.
                            You will be redirected to a secure payment page to complete your booking.
                        </p>
                    </div>
                </div>
            </div>

            <style jsx>{`
        .checkout-page {
          padding: 4rem 0;
          min-height: 100vh;
        }

        h1 { margin-bottom: 2rem; }

        .checkout-grid {
          display: grid;
          grid-template-columns: 1.5fr 1fr;
          gap: 2rem;
        }

        .glass {
          background: white;
          padding: 2rem;
          border-radius: 16px;
          border: 1px solid var(--border-color);
        }

        .summary-item { display: flex; justify-content: space-between; margin-bottom: 1rem; font-weight: 500; }
        .summary-row { display: flex; justify-content: space-between; margin-bottom: 0.5rem; color: var(--text-secondary); }
        .total { color: var(--text-primary); font-weight: 700; font-size: 1.25rem; margin-top: 1rem; border-top: 1px solid var(--border-color); padding-top: 1rem; }

        .info-section h3 { margin-bottom: 0.5rem; font-size: 1.2rem; }

        @media (max-width: 768px) {
          .checkout-grid { grid-template-columns: 1fr; }
        }
      `}</style>
        </div>
    );
}
