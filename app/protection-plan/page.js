'use client';

import Link from 'next/link';

export default function ProtectionPlanPage() {
    return (
        <div className="container plan-container">
            <header className="plan-header">
                <span className="badge">Trust & Safety</span>
                <h1>HobbyRent Protection & Insurance Plan</h1>
                <p className="subtitle">Comprehensive equipment protection and peace of mind for every rental</p>
                <p className="updated">Last Updated: {new Date().toLocaleDateString()}</p>
            </header>

            <div className="plan-content">
                <section>
                    <h2>1. Protecting the Community</h2>
                    <p>
                        Peer-to-peer equipment and powersports rentals require uncompromising trust.
                        The HobbyRent Protection Plan is designed to protect both Equipment Owners and Renters
                        against accidental physical damage, theft, and third-party liabilities during active rental reservations.
                    </p>
                </section>

                <div className="features-grid">
                    <div className="feature-card">
                        <div className="feature-icon">🛡️</div>
                        <h3>Up to $1,000,000 Liability</h3>
                        <p>Third-party liability coverage protecting against bodily injury or third-party property damage during approved operations.</p>
                    </div>

                    <div className="feature-card">
                        <div className="feature-icon">🚜</div>
                        <h3>Physical Damage Protection</h3>
                        <p>Coverage for accidental collision, rollover, structural frame, or component damage to rented equipment up to actual cash value.</p>
                    </div>

                    <div className="feature-card">
                        <div className="feature-icon">🔒</div>
                        <h3>Security Deposit Escrow</h3>
                        <p>Standardized security deposit pre-authorization held in escrow and released automatically 48 hours after completed inspection.</p>
                    </div>

                    <div className="feature-card">
                        <div className="feature-icon">📱</div>
                        <h3>Digital Handover Inspection</h3>
                        <p>Mandatory timestamped photo/video pre-rental and post-rental inspection checklist inside the HobbyRent app.</p>
                    </div>
                </div>

                <section>
                    <h2>2. How Deductibles Work</h2>
                    <p>
                        In the event of accidental damage during a rental, the Renter is responsible only up to their chosen plan deductible:
                    </p>
                    <ul>
                        <li><strong>Standard Plan:</strong> $1,000 maximum deductible for approved equipment claims.</li>
                        <li><strong>Premium Protection:</strong> $500 reduced deductible for high-value powersports and machinery.</li>
                        <li><strong>Owner Payout Guarantee:</strong> For covered damages exceeding the Renter deductible, HobbyRent or our insurance underwriting partners reimburse the Owner up to the item's verified fair market value.</li>
                    </ul>
                </section>

                <section>
                    <h2>3. Pre-Rental & Post-Rental Inspection Requirement</h2>
                    <p>
                        To ensure prompt claim approval and protect both parties from false damage disputes:
                    </p>
                    <ol>
                        <li><strong>Pre-Handover Walkthrough:</strong> Before keys or equipment change hands, both parties must record a 360-degree video or at least 6 high-resolution photos showing all four corners, odometer/hour meter, tires/tracks, and any pre-existing scratches or dents.</li>
                        <li><strong>Digital Inspection Form:</strong> Complete the digital checklist at <Link href="/rentals">Rentals & Handover</Link>.</li>
                        <li><strong>Post-Return Verification:</strong> Upon return, repeat the 360-degree inspection. Any new damage must be reported within <strong>48 hours</strong> of the scheduled drop-off time.</li>
                    </ol>
                </section>

                <section>
                    <h2>4. Exclusions & Prohibited Uses</h2>
                    <p>
                        Protection Plan coverage is strictly voided if the equipment was used in violation of the <Link href="/terms">Terms of Service</Link>, including:
                    </p>
                    <ul>
                        <li>Operating under the influence of alcohol, narcotics, or intoxicating medication.</li>
                        <li>Organized racing, stunting, drifting, or competition.</li>
                        <li>Operation by unauthorized drivers/operators who have not verified their identity on HobbyRent.</li>
                        <li>Operating equipment outside permitted zones (e.g., non-street-legal ATVs on public interstate highways).</li>
                        <li>Gross negligence, intentional damage, or failure to perform basic fluid checks.</li>
                    </ul>
                </section>

                <section>
                    <h2>5. Filing a Damage Claim</h2>
                    <p>
                        If damage occurs, notify HobbyRent within 48 hours of return:
                    </p>
                    <div className="claim-steps">
                        <div className="step-item">
                            <span className="step-num">1</span>
                            <div>
                                <h4>Submit Claim in Dashboard</h4>
                                <p>Navigate to your rental details and click "Report Damage". Attach handover photos and a detailed incident description.</p>
                            </div>
                        </div>
                        <div className="step-item">
                            <span className="step-num">2</span>
                            <div>
                                <h4>Certified Repair Estimate</h4>
                                <p>Provide an itemized estimate or invoice from a licensed repair facility or certified OEM dealership.</p>
                            </div>
                        </div>
                        <div className="step-item">
                            <span className="step-num">3</span>
                            <div>
                                <h4>Prompt Reimbursement</h4>
                                <p>Our claims team reviews evidence within 3–5 business days and processes reimbursement directly through Stripe Connect.</p>
                            </div>
                        </div>
                    </div>
                </section>
            </div>

            <style jsx>{`
                .plan-container {
                    padding: 8rem 2rem 5rem;
                    max-width: 900px;
                }
                .plan-header {
                    margin-bottom: 3rem;
                    border-bottom: 1px solid var(--border-color, #e2e8f0);
                    padding-bottom: 2rem;
                }
                .badge {
                    display: inline-block;
                    background: #dbeafe;
                    color: #1e40af;
                    font-size: 0.8rem;
                    font-weight: 700;
                    padding: 0.35rem 0.75rem;
                    border-radius: 9999px;
                    margin-bottom: 0.75rem;
                }
                .plan-header h1 {
                    font-size: 2.25rem;
                    color: var(--text-primary, #0f172a);
                    margin-bottom: 0.5rem;
                }
                .subtitle {
                    font-size: 1.15rem;
                    color: var(--text-secondary, #64748b);
                    margin-bottom: 0.5rem;
                }
                .updated {
                    font-size: 0.85rem;
                    color: #94a3b8;
                }
                .features-grid {
                    display: grid;
                    grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
                    gap: 1.5rem;
                    margin: 2.5rem 0;
                }
                .feature-card {
                    background: #f8fafc;
                    border: 1px solid #e2e8f0;
                    border-radius: 12px;
                    padding: 1.5rem;
                }
                .feature-icon {
                    font-size: 2rem;
                    margin-bottom: 0.75rem;
                }
                .feature-card h3 {
                    font-size: 1.1rem;
                    color: #0f172a;
                    margin-bottom: 0.5rem;
                }
                .feature-card p {
                    font-size: 0.9rem;
                    color: #475569;
                    line-height: 1.5;
                }
                .plan-content section {
                    margin-bottom: 2.5rem;
                }
                .plan-content h2 {
                    font-size: 1.4rem;
                    color: #1e293b;
                    margin-bottom: 1rem;
                }
                .plan-content p, .plan-content li {
                    color: #475569;
                    line-height: 1.7;
                    font-size: 1rem;
                }
                .plan-content ul, .plan-content ol {
                    padding-left: 1.5rem;
                    margin-top: 0.5rem;
                }
                .plan-content li {
                    margin-bottom: 0.5rem;
                }
                .claim-steps {
                    display: flex;
                    flex-direction: column;
                    gap: 1.25rem;
                    margin-top: 1rem;
                }
                .step-item {
                    display: flex;
                    align-items: flex-start;
                    gap: 1rem;
                    background: #f8fafc;
                    padding: 1.25rem;
                    border-radius: 10px;
                    border: 1px solid #e2e8f0;
                }
                .step-num {
                    background: #2563eb;
                    color: white;
                    font-weight: 700;
                    width: 32px;
                    height: 32px;
                    border-radius: 50%;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    flex-shrink: 0;
                }
                .step-item h4 {
                    margin: 0 0 0.25rem;
                    font-size: 1rem;
                    color: #0f172a;
                }
                .step-item p {
                    margin: 0;
                    font-size: 0.9rem;
                }
                a {
                    color: #2563eb;
                    text-decoration: underline;
                }
            `}</style>
        </div>
    );
}
