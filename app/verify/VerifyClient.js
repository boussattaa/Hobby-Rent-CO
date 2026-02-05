'use client';

import StripeVerification from './StripeVerification';
import ManualVerification from './ManualVerification';

export default function VerifyClient({ isVerified, status }) {
    return (
        <div className="verify-page">
            <div className="container">
                <header className="page-header">
                    <h1>Identity Verification</h1>
                    <p>Verify your identity to unlock Full Access on HobbyRent.</p>
                </header>

                {isVerified ? (
                    <div className="verified-state">
                        <div className="success-icon">✅</div>
                        <h2>You are Verified!</h2>
                        <p>You have full access to list items and book rentals.</p>
                    </div>
                ) : (
                    <div className="status-banner">
                        Current Status: <span className={`badge ${status}`}>{status.toUpperCase()}</span>
                    </div>
                )}

                {!isVerified && status !== 'pending' && (
                    <div className="options-grid">
                        <StripeVerification />
                        <div className="or-divider">OR</div>
                        <ManualVerification />
                    </div>
                )}

                {!isVerified && status === 'pending' && (
                    <div className="pending-state">
                        <div className="icon">⏳</div>
                        <h2>Verification Pending</h2>
                        <p>Your documents are currently under review. This usually takes 24-48 hours.</p>
                    </div>
                )}
            </div>

            <style jsx>{`
        .verify-page {
            min-height: 100vh;
            padding-top: 100px;
            padding-bottom: 4rem;
            background: #f8fafc;
        }
        .container { max-width: 900px; margin: 0 auto; padding: 0 1.5rem; }
        
        .page-header { text-align: center; margin-bottom: 3rem; }
        .page-header h1 { font-size: 2.5rem; margin-bottom: 0.5rem; color: #0f172a; }
        .page-header p { color: #64748b; font-size: 1.1rem; }

        .verified-state, .pending-state {
            text-align: center;
            background: white;
            padding: 3rem;
            border-radius: 20px;
            box-shadow: 0 4px 6px rgba(0,0,0,0.05);
            max-width: 600px;
            margin: 0 auto;
        }
        .success-icon { font-size: 4rem; margin-bottom: 1rem; }
        .icon { font-size: 4rem; margin-bottom: 1rem; }
        
        .status-banner {
            text-align: center;
            margin-bottom: 2rem;
            font-weight: 600;
        }
        
        .badge { padding: 0.3rem 0.8rem; border-radius: 50px; font-size: 0.85rem; margin-left: 0.5rem; color: white; }
        .badge.unverified { background: #94a3b8; }
        .badge.pending { background: #f59e0b; }
        .badge.rejected { background: #ef4444; }

        .options-grid {
            display: flex;
            gap: 2rem;
            align-items: stretch;
            position: relative;
        }
        
        .or-divider {
            display: flex;
            align-items: center;
            justify-content: center;
            font-weight: 700;
            color: #cbd5e1;
            font-size: 0.9rem;
        }
        
        @media (max-width: 768px) {
            .options-grid { flex-direction: column; }
            .or-divider { padding: 1rem 0; }
        }
      `}</style>
        </div>
    );
}
