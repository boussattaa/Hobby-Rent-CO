
"use client";

export default function HowItWorks() {
    return (
        <section className="how-it-works">
            <div className="container">
                <div className="section-header">
                    <h2>How HobbyRent Works</h2>
                    <p>The easiest way to rent outdoor gear or earn from your own.</p>
                </div>

                <div className="steps-grid">
                    {/* Renter Side */}
                    <div className="process-column">
                        <h3>For Renters</h3>
                        <div className="steps">
                            <div className="step">
                                <div className="step-number">1</div>
                                <div className="step-content">
                                    <h4>Find your Adventure</h4>
                                    <p>Browse listings for ATVs, jet skis, trailers, and more in your local area.</p>
                                </div>
                            </div>
                            <div className="step">
                                <div className="step-number">2</div>
                                <div className="step-content">
                                    <h4>Book Securely</h4>
                                    <p>Request dates and verify your ID instantly for a safe rental experience.</p>
                                </div>
                            </div>
                            <div className="step">
                                <div className="step-number">3</div>
                                <div className="step-content">
                                    <h4>Go Play</h4>
                                    <p>Pick up the gear, have a blast, and return it when you're done.</p>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="divider-vertical"></div>

                    {/* Owner Side */}
                    <div className="process-column">
                        <h3>For Owners</h3>
                        <div className="steps">
                            <div className="step">
                                <div className="step-number">1</div>
                                <div className="step-content">
                                    <h4>List for Free</h4>
                                    <p>Upload photos, set your price, and describe your gear in minutes.</p>
                                </div>
                            </div>
                            <div className="step">
                                <div className="step-number">2</div>
                                <div className="step-content">
                                    <h4>Vet Request</h4>
                                    <p>Review rental requests and check user verification status before accepting.</p>
                                </div>
                            </div>
                            <div className="step">
                                <div className="step-number">3</div>
                                <div className="step-content">
                                    <h4>Get Paid</h4>
                                    <p>Earn confirmed payouts directly to your bank account after every rental.</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <style jsx>{`
        .how-it-works {
            background-color: #f9fafb;
            padding: 5rem 0;
            border-top: 1px solid #eee;
            border-bottom: 1px solid #eee;
        }

        .section-header {
            text-align: center;
            margin-bottom: 4rem;
        }
        .section-header h2 {
            font-size: 2.5rem;
            margin-bottom: 1rem;
            color: var(--text-primary);
        }
        .section-header p {
            font-size: 1.2rem;
            color: var(--text-secondary);
        }

        .steps-grid {
            display: grid;
            grid-template-columns: 1fr auto 1fr;
            gap: 3rem;
            max-width: 1000px;
            margin: 0 auto;
        }

        .divider-vertical {
            width: 1px;
            background: #e5e7eb;
            height: 100%;
        }

        .process-column h3 {
            text-align: center;
            margin-bottom: 2rem;
            font-size: 1.5rem;
            color: var(--primary-color);
        }

        .step {
            display: flex;
            gap: 1.5rem;
            margin-bottom: 2rem;
        }

        .step-number {
            background: var(--text-primary);
            color: var(--accent-color);
            width: 32px;
            height: 32px;
            border-radius: 50%;
            display: flex;
            align-items: center;
            justify-content: center;
            font-weight: 700;
            flex-shrink: 0;
        }

        .step-content h4 {
            margin: 0 0 0.5rem 0;
            font-size: 1.1rem;
        }
        .step-content p {
            margin: 0;
            color: var(--text-secondary);
            font-size: 0.95rem;
            line-height: 1.5;
        }

        @media (max-width: 768px) {
            .steps-grid {
                grid-template-columns: 1fr;
                gap: 2rem;
            }
            .divider-vertical {
                display: none;
            }
        }
      `}</style>
        </section>
    );
}
