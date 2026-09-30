'use client';

import Link from 'next/link';

export default function CancellationPolicyPage() {
    return (
        <div className="container policy-container">
            <header className="policy-header">
                <h1>Cancellation & Refund Policy</h1>
                <p className="subtitle">Clear, fair guidelines for Renters and Equipment Owners</p>
                <p className="updated">Last Updated: {new Date().toLocaleDateString()}</p>
            </header>

            <div className="policy-content">
                <section>
                    <h2>1. Overview</h2>
                    <p>
                        At HobbyRent, we understand that travel plans, weather, and project timelines change.
                        This Cancellation and Refund Policy balances flexibility for Renters with protection
                        for Owners who commit high-value equipment and reserve booking dates.
                    </p>
                </section>

                <section>
                    <h2>2. Standard Cancellation Windows</h2>
                    <p>
                        Unless an Owner listing specifies a custom policy, the following standard cancellation rules apply:
                    </p>

                    <div className="tier-card">
                        <h3>🟢 Full Refund Window (More than 48 Hours Before Pickup)</h3>
                        <p>
                            Renters receive a <strong>100% full refund</strong> of all rental fees and taxes if cancelled at least
                            48 hours prior to the scheduled pickup time. Any processing fees charged by third-party payment networks
                            may be deducted where legally permissible.
                        </p>
                    </div>

                    <div className="tier-card">
                        <h3>🟡 Partial Refund Window (24 to 48 Hours Before Pickup)</h3>
                        <p>
                            Renters receive a <strong>50% refund</strong> of the rental rate if cancelled between 24 and 48 hours prior
                            to the scheduled pickup time. The remaining 50% is credited to the Owner to compensate for reserved equipment downtime.
                        </p>
                    </div>

                    <div className="tier-card">
                        <h3>🔴 Non-Refundable Window (Less than 24 Hours or No-Show)</h3>
                        <p>
                            Cancellations requested less than 24 hours prior to the scheduled pickup time, or instances where the Renter fails
                            to arrive for pickup without prior written notice, are <strong>non-refundable</strong>. The Owner receives full payout
                            minus platform service fees.
                        </p>
                    </div>
                </section>

                <section>
                    <h2>3. Severe Weather & Safety Cancellations</h2>
                    <p>
                        Safety is paramount when operating watercraft, powersports, and heavy equipment.
                        If hazardous weather conditions (e.g., severe thunderstorms, gale warnings, heavy snowfall, flash flood warnings)
                        or official government advisories make equipment operation unsafe:
                    </p>
                    <ul>
                        <li>Both Renter and Owner may mutually agree to reschedule the reservation at no extra charge.</li>
                        <li>If rescheduling is not possible, HobbyRent Support will verify weather telemetry and issue a <strong>100% refund</strong> to the Renter without penalizing the Owner.</li>
                    </ul>
                </section>

                <section>
                    <h2>4. Owner Cancellations</h2>
                    <p>
                        Owners are expected to honor all confirmed reservations. In the rare event that an Owner must cancel due to unexpected mechanical breakdown or emergency:
                    </p>
                    <ul>
                        <li>The Renter receives an immediate 100% full refund.</li>
                        <li>HobbyRent Support will assist the Renter in finding a comparable alternative listing.</li>
                        <li>Frequent or unexcused Owner cancellations may result in search penalty rankings or account suspension.</li>
                    </ul>
                </section>

                <section>
                    <h2>5. Security Deposit Refunds</h2>
                    <p>
                        Security deposits are pre-authorized holds placed on the Renter's payment method. If the equipment is returned on time,
                        clean, with matching fuel levels, and with no reported damage, the security deposit pre-authorization is
                        automatically released within <strong>48 hours</strong> of completed return inspection.
                    </p>
                </section>

                <section>
                    <h2>6. Dispute Resolution</h2>
                    <p>
                        If you believe a cancellation fee was assessed in error or experienced extenuating circumstances, contact our 24/7 team at{' '}
                        <a href="mailto:support@hobbyrent.com">support@hobbyrent.com</a> or open a ticket through our{' '}
                        <Link href="/support">Support Center</Link>.
                    </p>
                </section>
            </div>

            <style jsx>{`
                .policy-container {
                    padding: 8rem 2rem 5rem;
                    max-width: 860px;
                }
                .policy-header {
                    margin-bottom: 3rem;
                    border-bottom: 1px solid var(--border-color, #e2e8f0);
                    padding-bottom: 2rem;
                }
                .policy-header h1 {
                    font-size: 2.25rem;
                    color: var(--text-primary, #0f172a);
                    margin-bottom: 0.5rem;
                }
                .subtitle {
                    font-size: 1.1rem;
                    color: var(--text-secondary, #64748b);
                    margin-bottom: 0.5rem;
                }
                .updated {
                    font-size: 0.85rem;
                    color: #94a3b8;
                }
                .policy-content section {
                    margin-bottom: 2.5rem;
                }
                .policy-content h2 {
                    font-size: 1.4rem;
                    color: #1e293b;
                    margin-bottom: 1rem;
                }
                .policy-content p, .policy-content li {
                    color: #475569;
                    line-height: 1.7;
                    font-size: 1rem;
                }
                .policy-content ul {
                    padding-left: 1.5rem;
                    margin-top: 0.5rem;
                }
                .policy-content li {
                    margin-bottom: 0.5rem;
                }
                .tier-card {
                    background: #f8fafc;
                    border: 1px solid #e2e8f0;
                    border-radius: 12px;
                    padding: 1.25rem 1.5rem;
                    margin-bottom: 1rem;
                }
                .tier-card h3 {
                    font-size: 1.1rem;
                    margin-bottom: 0.5rem;
                    color: #0f172a;
                }
                a {
                    color: #2563eb;
                    text-decoration: underline;
                }
            `}</style>
        </div>
    );
}
