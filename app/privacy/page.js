export default function PrivacyPage() {
    return (
        <div className="container" style={{ padding: '8rem 2rem 4rem' }}>
            <h1>Privacy Policy</h1>
            <p style={{ color: '#666', marginBottom: '2rem' }}>Last Updated: {new Date().toLocaleDateString()}</p>

            <div className="content" style={{ maxWidth: '800px', lineHeight: '1.6' }}>
                <h3>1. Introduction</h3>
                <p>Welcome to HobbyRent. We respect your privacy and are committed to protecting your personal data.</p>

                <h3>2. Data We Collect</h3>
                <p>We may collect, use, store and transfer different kinds of personal data about you, including:</p>
                <ul>
                    <li>Identity Data (Name, username)</li>
                    <li>Contact Data (Email, phone number, address)</li>
                    <li>Financial Data (Payment details via Stripe)</li>
                    <li>Transaction Data (Rental history)</li>
                </ul>

                <h3>3. How We Use Your Data</h3>
                <p>We use your data to facilitate rentals, process payments, and improve our platform.</p>

                <h3>4. Contact Us</h3>
                <p>If you have questions about this privacy policy, please contact us at support@hobbyrent.com.</p>
            </div>
        </div>
    );
}
