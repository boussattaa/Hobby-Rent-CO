"use client";

import { useState, useEffect } from 'react';
import ChatWindow from '@/components/ChatWindow';
import { createClient } from '@/utils/supabase/client';
import { useRouter } from 'next/navigation';

export default function SupportClient({ supportAgent }) {
    const [isChatOpen, setIsChatOpen] = useState(false);
    const [currentUser, setCurrentUser] = useState(null);
    const router = useRouter();
    const supabase = createClient();

    useEffect(() => {
        const checkAuth = async () => {
            const { data: { user } } = await supabase.auth.getUser();
            setCurrentUser(user);
        };
        checkAuth();
    }, [supabase]);

    const handleContactSupport = (e) => {
        e.preventDefault();
        if (!currentUser) {
            // Encode the current URL to redirect back after login
            const returnUrl = encodeURIComponent('/support');
            router.push(`/login?redirect=${returnUrl}`);
            return;
        }
        setIsChatOpen(true);
    };

    return (
        <div className="container" style={{ padding: '8rem 2rem 4rem', textAlign: 'center' }}>
            <h1>Support Center</h1>
            <p className="subtitle" style={{ fontSize: '1.2rem', color: '#666', marginBottom: '3rem' }}>
                We're here to help. Contact us with any questions or issues.
            </p>

            <div className="support-card glass" style={{ maxWidth: '600px', margin: '0 auto', padding: '3rem' }}>
                <h2 style={{ marginBottom: '1rem' }}>Contact Us</h2>
                <p style={{ marginBottom: '2rem' }}>
                    For assistance with rentals, payments, or account issues, please start a chat with our support team.
                </p>

                {supportAgent ? (
                    <button onClick={handleContactSupport} className="btn btn-primary">
                        Chat with Support
                    </button>
                ) : (
                    <a href="mailto:support@hobbyrent.com" className="btn btn-primary">
                        Email Support
                    </a>
                )}

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

            {supportAgent && (
                <ChatWindow
                    currentUser={currentUser}
                    receiverId={supportAgent.id}
                    receiverName={supportAgent.first_name || 'Support'}
                    receiverEmail={supportAgent.email}
                    rentalId={null} // Support chat is not tied to a specific rental
                    isOpen={isChatOpen}
                    onClose={() => setIsChatOpen(false)}
                />
            )}
        </div>
    );
}
