export default function TermsPage() {
    return (
        <div className="container" style={{ padding: '8rem 2rem 4rem' }}>
            <h1>Terms of Service</h1>
            <p style={{ color: '#666', marginBottom: '2rem' }}>Last Updated: {new Date().toLocaleDateString()}</p>

            <div className="content" style={{ maxWidth: '800px', lineHeight: '1.6' }}>
                <h3>1. Acceptance of Terms</h3>
                <p>By accessing and using HobbyRent, you accept and agree to be bound by the terms and provision of this agreement.</p>

                <h3>2. User Responsibilities</h3>
                <p>Users are responsible for maintaining the confidentiality of their account information and for all activities that occur under their account.</p>

                <h3>3. Rental Rules</h3>
                <p>Renters must return items in the same condition as received. Owners must ensure items are safe and as described.</p>

                <h3>4. Liability</h3>
                <p>HobbyRent is a platform connecting owners and renters. We do not own the items listed and are not liable for any damages or disputes arising from rentals.</p>

                <h3>5. Termination</h3>
                <p>We reserve the right to terminate your access to the site at any time without notice.</p>
            </div>
        </div>
    );
}
