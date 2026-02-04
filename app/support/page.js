export default function SupportPage() {
    return (
        <div className="container" style={{ padding: '8rem 2rem 4rem', textAlign: 'center' }}>
            <h1>Support Center</h1>
            <p className="subtitle" style={{ fontSize: '1.2rem', color: '#666', marginBottom: '3rem' }}>
                We're here to help. Contact us with any questions or issues.
            </p>

            <div className="support-card glass" style={{ maxWidth: '600px', margin: '0 auto', padding: '3rem' }}>
                <h2 style={{ marginBottom: '1rem' }}>Contact Us</h2>
                <p style={{ marginBottom: '2rem' }}>
                    For assistance with rentals, payments, or account issues, please email our support team directly.
                </p>

                <a href="mailto:support@hobbyrent.com" className="btn btn-primary">
                    Email Support
                </a>

                <div style={{ marginTop: '2rem', paddingTop: '2rem', borderTop: '1px solid #eee' }}>
                    <h3>Frequently Asked Questions</h3>
                    <ul style={{ textAlign: 'left', marginTop: '1rem', listStyle: 'none', padding: 0 }}>
                        <li style={{ marginBottom: '1rem' }}>
                            <strong>How do I get paid?</strong><br />
                            Payouts are processed securely via Stripe directly to your bank account.
                        </li>
                        <li style={{ marginBottom: '1rem' }}>
                            <strong>Is insurance included?</strong><br />
                            Basic coverage is included with every rental. See terms for details.
                        </li>
                    </ul>
                </div>
            </div>
        </div>
    );
}
