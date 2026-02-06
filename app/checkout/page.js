"use client";

import { useSearchParams } from 'next/navigation';
import { loadStripe } from '@stripe/stripe-js';
import { useState, useEffect } from 'react';
import { createClient } from '@/utils/supabase/client';
import WaiverModal from '@/components/WaiverModal';

// Initialize Stripe with the Publishable Key
const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY);

// Mock database (for legacy support)
const ITEMS_DB = {};

export default function CheckoutPage() {
    const searchParams = useSearchParams();
    const itemId = searchParams.get('itemId');
    const rentalId = searchParams.get('rentalId');
    const startParam = searchParams.get('start');
    const endParam = searchParams.get('end');
    // Detect type: either passed explicit 'type' or infer from format? 
    // ItemClient sends type=hourly.
    const rentalType = searchParams.get('type') || 'daily';

    const supabase = createClient();

    const [item, setItem] = useState(ITEMS_DB[itemId] || null);
    const [fetching, setFetching] = useState(!ITEMS_DB[itemId] && !!itemId);
    const [loading, setLoading] = useState(false);
    const [protectionPlan, setProtectionPlan] = useState('standard'); // Default to Standard
    const [showWaiver, setShowWaiver] = useState(false);
    const [signature, setSignature] = useState(null);

    useEffect(() => {
        if (!itemId || ITEMS_DB[itemId]) return;

        const fetchItem = async () => {
            const { data } = await supabase
                .from('items')
                .select('name, price, hourly_rate, price_type, instant_book')
                .eq('id', itemId)
                .single();

            if (data) setItem(data);
            setFetching(false);
        };
        fetchItem();
    }, [itemId, supabase]);

    if (fetching) {
        return <div className="checkout-page"><div className="container"><h1>Loading...</h1></div></div>;
    }

    if (!item && itemId) {
        return <div className="checkout-page"><div className="container"><h1>Item not found</h1></div></div>;
    }

    const itemPrice = item ? Number(item.price) : 0;
    const itemHourlyRate = item ? Number(item.hourly_rate || 0) : 0;
    const itemName = item ? item.name : "Unknown Item";
    const serviceFee = 1;

    // Calculate duration
    let durationDisplay = "";
    let dateRangeDisplay = "";
    let calculatedRentalPrice = 0;

    if (startParam && endParam) {
        if (rentalType === 'hourly') {
            const start = new Date(startParam);
            const end = new Date(endParam);
            const diffMs = end - start;
            const hours = diffMs / (1000 * 60 * 60);

            // Round to 2 decimals for display if needed, but price calc should use exact or rounded hours?
            // Usually we treat partial hours? Let's assume standard float hours.
            const hoursDisplay = hours > 0 ? hours.toFixed(1) : 0;

            durationDisplay = `${hoursDisplay} Hours`;
            dateRangeDisplay = `${start.toLocaleDateString()} ${start.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} - ${end.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`;

            calculatedRentalPrice = hours * itemHourlyRate;
        } else {
            // Daily
            const start = new Date(startParam);
            const end = new Date(endParam);
            const diffTime = Math.abs(end - start); // Naive daily diff
            let days = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
            if (days === 0) days = 1;

            durationDisplay = `${days} Day${days > 1 ? 's' : ''}`;
            const options = { month: 'short', day: 'numeric' };
            dateRangeDisplay = `${start.toLocaleDateString('en-US', options)} - ${end.toLocaleDateString('en-US', options)}`;

            calculatedRentalPrice = itemPrice * days;
        }
    }

    const rentalTotal = Math.round(calculatedRentalPrice * 100) / 100; // Round to 2 decimals

    // Calculate Protection Fee
    let protectionFee = 0;
    if (protectionPlan === 'standard') protectionFee = 20;
    if (protectionPlan === 'premier') protectionFee = 59;

    const total = rentalTotal + serviceFee + protectionFee;

    const handleWaiverSigned = (signedData) => {
        setSignature(signedData);
        setShowWaiver(false);
        // Continue checkout automatically
        initiateCheckout(signedData);
    };

    const handleCheckout = () => {
        // If we have an existing rentalId, we are completing a payment, not submitting a new request
        if (!item.instant_book && !rentalId) {
            submitRequestOnly();
            return;
        }

        if ((item.instant_book || rentalId) && !signature) {
            setShowWaiver(true);
            return;
        }
        initiateCheckout(signature);
    };

    const submitRequestOnly = async () => {
        setLoading(true);
        try {
            const response = await fetch('/api/checkout', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    itemId,
                    price: rentalTotal,
                    name: `${itemName} (${durationDisplay})`,
                    protectionPlan,
                    protectionFee,
                    startDate: startParam,
                    endDate: endParam,
                    rentalId: null, // New rental
                    waiverSignature: signature || null,
                    requestOnly: true // Key flag
                }),
            });

            const { success, rentalId, error: apiError } = await response.json();

            if (apiError) {
                console.error(apiError);
                alert("Request submission failed: " + apiError);
                setLoading(false);
                return;
            }

            if (success) {
                window.location.href = `/success?type=request&rental_id=${rentalId}`;
            } else {
                throw new Error("Failed to submit request");
            }
        } catch (err) {
            console.error(err);
            setLoading(false);
        }
    }

    const initiateCheckout = async (waiverData) => {
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
                    price: rentalTotal,
                    name: `${itemName} (${durationDisplay})`,
                    protectionPlan,
                    protectionFee,
                    startDate: startParam,
                    endDate: endParam,
                    rentalId: rentalId || null, // Use existing rentalId if present
                    waiverSignature: waiverData || null
                }),
            });

            const { url, error: apiError } = await response.json();

            if (apiError) {
                console.error(apiError);
                alert("Payment initiation failed: " + apiError);
                setLoading(false);
                return;
            }

            if (url) {
                window.location.href = url;
            } else {
                throw new Error("No checkout ULR returned");
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
                            <span>{dateRangeDisplay}</span>
                        </div>
                        <div className="summary-item">
                            <span>Duration</span>
                            <span>{durationDisplay}</span>
                        </div>

                        <hr />

                        <div className="summary-row">
                            <span>Rate ({rentalType === 'hourly' ? `$${itemHourlyRate}/hr` : `$${itemPrice}/day`})</span>
                            <span>${rentalTotal.toFixed(2)}</span>
                        </div>
                        <div className="summary-row">
                            <span>Service Fee</span>
                            <span>${serviceFee}</span>
                        </div>

                        <div className="protection-section" style={{ margin: '1.5rem 0', padding: '1.5rem', background: '#f8fafc', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
                            <h3 style={{ fontSize: '1.1rem', marginBottom: '1rem' }}>AdventureAssure Protection</h3>

                            {/* Basic Option */}
                            <label className={`plan-option ${protectionPlan === 'basic' ? 'selected' : ''}`}>
                                <div className="plan-header">
                                    <input
                                        type="radio"
                                        name="protection"
                                        checked={protectionPlan === 'basic'}
                                        onChange={() => setProtectionPlan('basic')}
                                    />
                                    <strong>Basic</strong>
                                </div>
                                <div className="plan-price">$0</div>
                                <p className="plan-desc">Waive damage liability protection. You assume full responsibility for all repair costs.</p>
                            </label>

                            {/* Standard Option */}
                            <label className={`plan-option ${protectionPlan === 'standard' ? 'selected' : ''}`}>
                                <div className="plan-header">
                                    <input
                                        type="radio"
                                        name="protection"
                                        checked={protectionPlan === 'standard'}
                                        onChange={() => setProtectionPlan('standard')}
                                    />
                                    <strong>Standard</strong>
                                </div>
                                <div className="plan-price">$20</div>
                                <p className="plan-desc">Solid protection. Covers accidental damage up to $3,000. $1,500 liability cap.</p>
                            </label>

                            {/* Premier Option */}
                            <label className={`plan-option ${protectionPlan === 'premier' ? 'selected' : ''}`}>
                                <div className="plan-header">
                                    <input
                                        type="radio"
                                        name="protection"
                                        checked={protectionPlan === 'premier'}
                                        onChange={() => setProtectionPlan('premier')}
                                    />
                                    <strong>Premier</strong>
                                    <span className="badge">Most Popular</span>
                                </div>
                                <div className="plan-price">$59</div>
                                <p className="plan-desc">$0 Damage Deposit. $1,500 max out-of-pocket. Includes all Standard benefits.</p>
                            </label>
                        </div>

                        {protectionFee > 0 && (
                            <div className="summary-row">
                                <span>Protection Plan ({protectionPlan})</span>
                                <span>${protectionFee}</span>
                            </div>
                        )}
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
                            {loading ? 'Processing...' : (item.instant_book || rentalId ? 'Proceed to Payment' : 'Submit Rental Request')}
                        </button>
                    </div>

                    <div className="info-section glass">
                        <h3>{item.instant_book ? 'Safe & Secure' : 'How it Works'}</h3>
                        <p style={{ color: 'var(--text-secondary)', lineHeight: '1.6' }}>
                            {item.instant_book
                                ? 'Payments are processed securely by Stripe. We do not store your card details. You will be redirected to a secure payment page to complete your booking.'
                                : 'For this item, your request will be sent to the owner for approval. Once approved, you will be notified to come back and complete the payment to secure your dates.'
                            }
                        </p>
                    </div>
                </div>
            </div>

            <WaiverModal
                isOpen={showWaiver}
                onClose={() => setShowWaiver(false)}
                onSign={handleWaiverSigned}
                waiverUrl="/terms"
            />

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
        .plan-option {
            display: block;
            border: 2px solid transparent;
            border-radius: 8px;
            padding: 1rem;
            margin-bottom: 0.75rem;
            cursor: pointer;
            background: white;
            transition: all 0.2s;
        }

        .plan-option:hover {
            border-color: #cbd5e1;
        }

        .plan-option.selected {
            border-color: #3b82f6;
            background: #eff6ff;
        }

        .plan-header {
            display: flex;
            align-items: center;
            gap: 0.75rem;
            margin-bottom: 0.25rem;
        }

        .plan-price {
            font-weight: 700;
            color: #1e293b;
            margin-left: 1.8rem;
        }

        .plan-desc {
            font-size: 0.85rem;
            color: #64748b;
            margin-left: 1.8rem;
            line-height: 1.4;
        }

        .badge {
            background: #ffedd5;
            color: #c2410c;
            font-size: 0.7rem;
            padding: 2px 6px;
            border-radius: 4px;
            font-weight: 600;
            margin-left: auto;
        }
      `}</style>
        </div >
    );
}
