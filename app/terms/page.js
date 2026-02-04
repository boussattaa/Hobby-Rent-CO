export default function TermsPage() {
    return (
        <div className="container" style={{ padding: '8rem 2rem 4rem' }}>
            <h1>Terms of Service</h1>
            <p style={{ color: '#666', marginBottom: '2rem' }}>Last Updated: {new Date().toLocaleDateString()}</p>

            <div className="content" style={{ maxWidth: '800px', lineHeight: '1.6' }}>
                <h3>1. Acceptance of Terms</h3>
                <p>By accessing and using HobbyRent, you accept and agree to be bound by the terms and provision of this agreement.</p>

                <h3>2. Platform Disclaimer (Hold Harmless)</h3>
                <p style={{ fontWeight: 'bold' }}>
                    HobbyRent is a platform connecting owners and renters. HobbyRent is not a party to any rental agreement and is not liable for any injury, death, or property damage resulting from the use of rented equipment.
                </p>
                <p>
                    By using this service, you agree to hold HobbyRent harmless from any and all claims, demands, losses, causes of action, damage, lawsuits, judgments, including attorneys’ fees and costs, arising out of or relating to your use of the platform and any equipment rented through it.
                </p>

                <h3>3. Damage & Theft Policy</h3>
                <p>
                    Renters are responsible for returning equipment in the same condition it was received, normal wear and tear excepted.
                </p>
                <p style={{ background: '#fff1f2', padding: '1rem', borderLeft: '4px solid #e11d48', borderRadius: '4px' }}>
                    <strong>Authorization:</strong> Renters authorize HobbyRent to charge their payment method for any damages, theft, or late fees reported by the Owner and verified by our support team. This liability is 100% the responsibility of the Renter.
                </p>

                <h3>4. Payment Processing (Stripe Connected Account)</h3>
                <p>
                    Payment processing services for users on HobbyRent are provided by Stripe and are subject to the <a href="https://stripe.com/connect-account/legal" target="_blank" rel="noopener noreferrer">Stripe Connected Account Agreement</a>, which includes the Stripe Terms of Service (collectively, the “Stripe Services Agreement”).
                </p>
                <p>
                    By agreeing to these terms or continuing to operate as a account holder on HobbyRent, you agree to be bound by the Stripe Services Agreement, as the same may be modified by Stripe from time to time.
                </p>

                <h3>5. Prohibited Uses</h3>
                <p>Engagement in any of the following activities may result in immediate account termination, forfeiture of insurance coverage, and legal action:</p>
                <ul>
                    <li>Racing or competitive events of any kind.</li>
                    <li>Operation of equipment under the influence of alcohol or drugs.</li>
                    <li>Sub-leasing rented equipment to third parties.</li>
                    <li>Use of equipment for illegal activities.</li>
                    <li>Operation by unauthorized drivers/operators not listed on the booking.</li>
                </ul>

                <h3>6. Termination</h3>
                <p>We reserve the right to terminate your access to the site at any time without notice for violation of these terms.</p>
            </div>
        </div>
    );
}
