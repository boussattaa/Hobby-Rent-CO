"use client";

import { useSearchParams } from 'next/navigation';
import { loadStripe } from '@stripe/stripe-js';
import { useState, useEffect } from 'react';
import { createClient } from '@/utils/supabase/client';

// Initialize Stripe with the Publishable Key
const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY);

// Mock database (for legacy support)
const ITEMS_DB = {
    'd1': { name: 'KTM 450 SX-F', price: 150 },
    'd2': { name: 'Polaris RZR XP', price: 350 },
    'd3': { name: 'Honda CRF250R', price: 120 },
    'd4': { name: 'Can-Am Maverick', price: 400 },
    'w1': { name: 'Sea-Doo GTX', price: 250 },
    'w2': { name: 'MasterCraft NXT', price: 800 },
    'w3': { name: 'Inflatable Paddleboard', price: 40 },
    'w4': { name: 'Yamaha Waverunner', price: 220 },
    'h1': { name: 'DeWalt 20V Drill Set', price: 25 },
    'h2': { name: 'Industrial Carpet Cleaner', price: 60 },
    'h3': { name: 'Pressure Washer 3000PSI', price: 45 },
    'h4': { name: 'Tile Saw', price: 35 },
};

export default function CheckoutPage() {
    const searchParams = useSearchParams();
    const itemId = searchParams.get('itemId');
    const startParam = searchParams.get('start');
    const endParam = searchParams.get('end');
    const supabase = createClient();

    const [item, setItem] = useState(ITEMS_DB[itemId] || null);
    const [loading, setLoading] = useState(!ITEMS_DB[itemId] && !!itemId);

    useEffect(() => {
        if (!itemId || ITEMS_DB[itemId]) return;

        const fetchItem = async () => {
            const { data } = await supabase
                .from('items')
                .select('name, price')
                .eq('id', itemId)
                .single();

            if (data) setItem(data);
            setLoading(false);
        };
        fetchItem();
    }, [itemId, supabase]);

    if (loading) {
        return <div className="checkout-page"><div className="container"><h1>Loading...</h1></div></div>;
    }

    if (!item && itemId) {
        return <div className="checkout-page"><div className="container"><h1>Item not found</h1></div></div>;
    }

    const itemPrice = item ? Number(item.price) : 0;
    const itemName = item ? item.name : "Unknown Item";
    const serviceFee = 15;

    // Calculate duration
    let days = 1;
    let dateDisplay = "Select dates";

    if (startParam && endParam) {
        const start = new Date(startParam);
        const end = new Date(endParam);
        const diffTime = Math.abs(end - start);
        days = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        if (days === 0) days = 1; // Min 1 day

        // Format dates safely
        const options = { month: 'short', day: 'numeric' };
        dateDisplay = `${start.toLocaleDateString('en-US', options)} - ${end.toLocaleDateString('en-US', options)}`;
        // Fix JS date off-by-one due to timezone by verifying string parsing? 
        // Actually, input type="date" gives YYYY-MM-DD. new Date(str) uses UTC. 
        // Displaying with locale might shift it. 
        // Better to use simple string parsing for display if we want to be exact, but localestring is fine for MVP.
    }

    const rentalTotal = itemPrice * days;
    const total = rentalTotal + serviceFee;

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
                    price: rentalTotal, // Send total rental price (days * daily)
                    name: `${itemName} (${days} days)`,
                }),
            });

            const { url, error: apiError } = await response.json();

            if (apiError) {
                console.error(apiError);
                alert("Payment initiation failed.");
                setLoading(false);
                return;
            }

            if (url) {
                window.location.href = url;
            } else {
                throw new Error("No checkout URL returned");
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
                            <span>{dateDisplay}</span>
                        </div>
                        <div className="summary-item">
                            <span>Duration</span>
                            <span>{days} Day{days > 1 ? 's' : ''}</span>
                        </div>

                        <hr />

                        <div className="summary-row">
                            <span>Rental Price (${itemPrice}/day)</span>
                            <span>${rentalTotal}</span>
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
