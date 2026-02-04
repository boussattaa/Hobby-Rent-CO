import Link from 'next/link';

export default function SignupConfirmationPage() {
    return (
        <div className="confirmation-page">
            <div className="container">
                <div className="confirmation-card glass">
                    <div className="icon">✉️</div>
                    <h1>Check Your Email</h1>
                    <p className="subtitle">
                        We've sent a verification link to your email address.
                    </p>
                    <p className="description">
                        Please click the link in the email to verify your account. Once verified, you will be able to log in.
                    </p>
                    <div className="actions">
                        <Link href="/login" className="btn btn-primary full-width">
                            Return to Login
                        </Link>
                    </div>
                </div>
            </div>

        </div>
    );
}
