"use client";

import { useState, useEffect } from 'react';
import { createClient } from '@/utils/supabase/client';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function AccountPage() {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [message, setMessage] = useState({ type: '', text: '' });
    const supabase = createClient();
    const router = useRouter();

    // Verification states
    const [emailVerified, setEmailVerified] = useState(false);
    const [phoneVerified, setPhoneVerified] = useState(false);
    const [sendingEmailCode, setSendingEmailCode] = useState(false);
    const [sendingPhoneCode, setSendingPhoneCode] = useState(false);
    const [phoneOtpSent, setPhoneOtpSent] = useState(false);
    const [phoneOtp, setPhoneOtp] = useState('');
    const [verifyingPhone, setVerifyingPhone] = useState(false);

    // Form state
    const [profile, setProfile] = useState({
        first_name: '',
        last_name: '',
        email: '',
        phone: '',
        notification_email: true,
        notification_sms: false,
        is_verified: false,
        phone_verified: false,
    });

    useEffect(() => {
        const loadProfile = async () => {
            const { data: { user } } = await supabase.auth.getUser();

            if (!user) {
                router.push('/login');
                return;
            }

            setUser(user);
            setEmailVerified(!!user.email_confirmed_at);

            // Fetch profile data
            const { data: profileData } = await supabase
                .from('profiles')
                .select('*')
                .eq('id', user.id)
                .single();

            if (profileData) {
                setProfile({
                    first_name: profileData.first_name || '',
                    last_name: profileData.last_name || '',
                    email: user.email || '',
                    phone: profileData.phone || '',
                    notification_email: profileData.notification_email ?? true,
                    notification_sms: profileData.notification_sms ?? false,
                    is_verified: profileData.is_verified || false,
                    phone_verified: profileData.phone_verified || false,
                });
                setPhoneVerified(profileData.phone_verified || false);
            } else {
                setProfile(prev => ({ ...prev, email: user.email || '' }));
            }

            setLoading(false);
        };

        loadProfile();
    }, [router, supabase]);

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        setProfile(prev => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : value
        }));
        // Reset phone verification if phone number changes
        if (name === 'phone') {
            setPhoneOtpSent(false);
            setPhoneOtp('');
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSaving(true);
        setMessage({ type: '', text: '' });

        try {
            const { error } = await supabase
                .from('profiles')
                .upsert({
                    id: user.id,
                    first_name: profile.first_name,
                    last_name: profile.last_name,
                    phone: profile.phone,
                    notification_email: profile.notification_email,
                    notification_sms: profile.notification_sms,
                    updated_at: new Date().toISOString(),
                });

            if (error) throw error;

            setMessage({ type: 'success', text: 'Profile updated successfully!' });
        } catch (error) {
            console.error('Error updating profile:', error);
            setMessage({ type: 'error', text: 'Failed to update profile. Please try again.' });
        } finally {
            setSaving(false);
        }
    };

    // Resend email verification
    const handleResendEmailVerification = async () => {
        setSendingEmailCode(true);
        try {
            const { error } = await supabase.auth.resend({
                type: 'signup',
                email: profile.email,
            });
            if (error) throw error;
            setMessage({ type: 'success', text: 'Verification email sent! Check your inbox.' });
        } catch (error) {
            console.error('Error sending verification email:', error);
            setMessage({ type: 'error', text: 'Failed to send verification email.' });
        } finally {
            setSendingEmailCode(false);
        }
    };

    // Send phone OTP
    const handleSendPhoneOtp = async () => {
        if (!profile.phone || profile.phone.length < 10) {
            setMessage({ type: 'error', text: 'Please enter a valid phone number first.' });
            return;
        }

        setSendingPhoneCode(true);
        try {
            // Store the OTP request - in production, this would send an SMS via Twilio
            const response = await fetch('/api/send-phone-otp', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ phone: profile.phone, userId: user.id }),
            });

            const data = await response.json();

            if (!response.ok) throw new Error(data.error || 'Failed to send code');

            setPhoneOtpSent(true);
            setMessage({ type: 'success', text: 'Verification code sent to your phone!' });
        } catch (error) {
            console.error('Error sending phone OTP:', error);
            setMessage({ type: 'error', text: error.message || 'Failed to send verification code.' });
        } finally {
            setSendingPhoneCode(false);
        }
    };

    // Verify phone OTP
    const handleVerifyPhoneOtp = async () => {
        if (phoneOtp.length !== 6) {
            setMessage({ type: 'error', text: 'Please enter the 6-digit code.' });
            return;
        }

        setVerifyingPhone(true);
        try {
            const response = await fetch('/api/verify-phone-otp', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ phone: profile.phone, otp: phoneOtp, userId: user.id }),
            });

            const data = await response.json();

            if (!response.ok) throw new Error(data.error || 'Invalid code');

            setPhoneVerified(true);
            setPhoneOtpSent(false);
            setProfile(prev => ({ ...prev, phone_verified: true }));
            setMessage({ type: 'success', text: 'Phone number verified successfully!' });
        } catch (error) {
            console.error('Error verifying phone OTP:', error);
            setMessage({ type: 'error', text: error.message || 'Invalid verification code.' });
        } finally {
            setVerifyingPhone(false);
        }
    };

    if (loading) {
        return (
            <div className="account-page">
                <div className="container">
                    <div className="loading">Loading...</div>
                </div>
            </div>
        );
    }

    return (
        <div className="account-page">
            <div className="container">
                <header className="page-header">
                    <h1>Account Settings</h1>
                    <p className="subtitle">Manage your profile and preferences</p>
                </header>

                <div className="account-grid">
                    {/* Main Form */}
                    <div className="account-card">
                        <form onSubmit={handleSubmit}>
                            <h2>Personal Information</h2>

                            {message.text && (
                                <div className={`message ${message.type}`}>
                                    {message.text}
                                </div>
                            )}

                            <div className="form-row">
                                <div className="form-group">
                                    <label htmlFor="first_name">First Name</label>
                                    <input
                                        type="text"
                                        id="first_name"
                                        name="first_name"
                                        value={profile.first_name}
                                        onChange={handleChange}
                                        placeholder="Enter your first name"
                                    />
                                </div>
                                <div className="form-group">
                                    <label htmlFor="last_name">Last Name</label>
                                    <input
                                        type="text"
                                        id="last_name"
                                        name="last_name"
                                        value={profile.last_name}
                                        onChange={handleChange}
                                        placeholder="Enter your last name"
                                    />
                                </div>
                            </div>

                            {/* Email with Verification */}
                            <div className="form-group">
                                <label htmlFor="email">
                                    Email Address
                                    {emailVerified ? (
                                        <span className="verified-inline">✓ Verified</span>
                                    ) : (
                                        <span className="unverified-inline">⚠ Not Verified</span>
                                    )}
                                </label>
                                <div className="input-with-action">
                                    <input
                                        type="email"
                                        id="email"
                                        name="email"
                                        value={profile.email}
                                        disabled
                                        className="disabled"
                                    />
                                    {!emailVerified && (
                                        <button
                                            type="button"
                                            className="verify-action-btn"
                                            onClick={handleResendEmailVerification}
                                            disabled={sendingEmailCode}
                                        >
                                            {sendingEmailCode ? 'Sending...' : 'Resend Verification'}
                                        </button>
                                    )}
                                </div>
                            </div>

                            {/* Phone */}
                            <div className="form-group">
                                <label htmlFor="phone">Phone Number</label>
                                <input
                                    type="tel"
                                    id="phone"
                                    name="phone"
                                    value={profile.phone}
                                    onChange={handleChange}
                                    placeholder="(555) 123-4567"
                                />
                            </div>

                            <h3>Notification Preferences</h3>

                            <div className="checkbox-group">
                                <label className="checkbox-label">
                                    <input
                                        type="checkbox"
                                        name="notification_email"
                                        checked={profile.notification_email}
                                        onChange={handleChange}
                                    />
                                    <div className="checkbox-content">
                                        <span className="checkbox-title">Email Notifications</span>
                                        <span className="checkbox-desc">Receive booking updates and messages via email</span>
                                    </div>
                                </label>
                            </div>

                            <div className="checkbox-group">
                                <label className="checkbox-label">
                                    <input
                                        type="checkbox"
                                        name="notification_sms"
                                        checked={profile.notification_sms}
                                        onChange={handleChange}
                                        disabled={!phoneVerified}
                                    />
                                    <div className="checkbox-content">
                                        <span className="checkbox-title">SMS Notifications</span>
                                        <span className="checkbox-desc">
                                            {phoneVerified
                                                ? 'Get text alerts for urgent booking updates'
                                                : 'Verify your phone number to enable SMS notifications'}
                                        </span>
                                    </div>
                                </label>
                            </div>

                            <button type="submit" className="btn btn-primary save-btn" disabled={saving}>
                                {saving ? 'Saving...' : 'Save Changes'}
                            </button>
                        </form>
                    </div>

                    {/* Sidebar */}
                    <div className="sidebar">
                        <div className="status-card">
                            <h3>Verification Status</h3>
                            <div className="status-item">
                                <span className="status-label">🛡️ Identity</span>
                                {profile.is_verified ? (
                                    <span className="status-badge verified">✓ Verified</span>
                                ) : (
                                    <Link href="/verify" className="status-badge unverified">
                                        Verify →
                                    </Link>
                                )}
                            </div>
                            <div className="status-item">
                                <span className="status-label">📧 Email</span>
                                {emailVerified ? (
                                    <span className="status-badge verified">✓ Verified</span>
                                ) : (
                                    <span className="status-badge pending">Pending</span>
                                )}
                            </div>
                            <div className="status-item">
                                <span className="status-label">📱 Phone</span>
                                {phoneVerified ? (
                                    <span className="status-badge verified">✓ Verified</span>
                                ) : profile.phone ? (
                                    <span className="status-badge pending">Pending</span>
                                ) : (
                                    <span className="status-badge none">Not Added</span>
                                )}
                            </div>
                            <div className="status-item">
                                <span className="status-label">📅 Member Since</span>
                                <span className="status-value">
                                    {user?.created_at ? new Date(user.created_at).toLocaleDateString('en-US', { month: 'short', year: 'numeric' }) : 'N/A'}
                                </span>
                            </div>
                        </div>

                        <div className="quick-links">
                            <h3>Quick Links</h3>
                            <Link href="/my-listings" className="quick-link">
                                📦 My Listings
                            </Link>
                            <Link href="/earnings" className="quick-link">
                                💰 Earnings Dashboard
                            </Link>
                            <Link href="/list-your-gear" className="quick-link">
                                ➕ List New Gear
                            </Link>
                        </div>
                    </div>
                </div>
            </div>

            <style jsx>{`
                .account-page {
                    padding: 8rem 0 4rem;
                    min-height: 100vh;
                    background: linear-gradient(180deg, #f8fafc 0%, #e2e8f0 100%);
                }

                .page-header { margin-bottom: 2rem; }
                .page-header h1 { font-size: 2.5rem; margin-bottom: 0.5rem; }
                .subtitle { color: var(--text-secondary); font-size: 1.1rem; }

                .account-grid {
                    display: grid;
                    grid-template-columns: 1fr 320px;
                    gap: 2rem;
                }

                .account-card {
                    background: white;
                    border-radius: 16px;
                    padding: 2rem;
                    border: 1px solid var(--border-color);
                }

                .account-card h2 { font-size: 1.5rem; margin-bottom: 1.5rem; }
                .account-card h3 { font-size: 1.1rem; margin: 2rem 0 1rem; }

                .message { padding: 1rem; border-radius: 8px; margin-bottom: 1.5rem; }
                .message.success { background: #d1fae5; color: #065f46; }
                .message.error { background: #fee2e2; color: #991b1b; }

                .form-row { display: grid; grid-template-columns: 1fr 1fr; gap: 1rem; }
                .form-group { margin-bottom: 1.5rem; }
                .form-group label { display: flex; align-items: center; gap: 0.5rem; font-weight: 600; margin-bottom: 0.5rem; font-size: 0.95rem; }

                .verified-inline {
                    font-size: 0.75rem;
                    background: #d1fae5;
                    color: #065f46;
                    padding: 0.15rem 0.5rem;
                    border-radius: 50px;
                    font-weight: 600;
                }

                .unverified-inline {
                    font-size: 0.75rem;
                    background: #fef3c7;
                    color: #92400e;
                    padding: 0.15rem 0.5rem;
                    border-radius: 50px;
                    font-weight: 600;
                }

                .input-with-action {
                    display: flex;
                    gap: 0.5rem;
                }

                .input-with-action input {
                    flex: 1;
                }

                .verify-action-btn {
                    padding: 0.75rem 1rem;
                    background: linear-gradient(135deg, #3b82f6, #1d4ed8);
                    color: white;
                    border: none;
                    border-radius: 8px;
                    font-weight: 600;
                    font-size: 0.85rem;
                    cursor: pointer;
                    white-space: nowrap;
                    transition: all 0.2s;
                }

                .verify-action-btn:hover:not(:disabled) {
                    transform: translateY(-1px);
                    box-shadow: 0 4px 12px rgba(59, 130, 246, 0.3);
                }

                .verify-action-btn:disabled {
                    opacity: 0.7;
                    cursor: not-allowed;
                }

                .form-group input {
                    width: 100%;
                    padding: 0.75rem 1rem;
                    border: 1px solid var(--border-color);
                    border-radius: 8px;
                    font-size: 1rem;
                    transition: border-color 0.2s;
                }

                .form-group input:focus { outline: none; border-color: var(--accent-color); }
                .form-group input.disabled { background: #f8fafc; color: var(--text-secondary); cursor: not-allowed; }

                .otp-section {
                    margin-top: 1rem;
                    padding: 1rem;
                    background: #f0f9ff;
                    border-radius: 8px;
                    border: 1px solid #bae6fd;
                }

                .otp-instruction {
                    font-size: 0.9rem;
                    color: var(--text-secondary);
                    margin-bottom: 0.75rem;
                }

                .otp-input-row {
                    display: flex;
                    gap: 0.5rem;
                }

                .otp-input {
                    flex: 1;
                    text-align: center;
                    font-size: 1.5rem !important;
                    letter-spacing: 0.5rem;
                    font-weight: 700;
                }

                .resend-link {
                    background: none;
                    border: none;
                    color: var(--accent-color);
                    font-size: 0.85rem;
                    cursor: pointer;
                    margin-top: 0.5rem;
                    text-decoration: underline;
                }

                .checkbox-group { margin-bottom: 1rem; }
                .checkbox-label {
                    display: flex;
                    align-items: flex-start;
                    gap: 0.75rem;
                    cursor: pointer;
                    padding: 1rem;
                    background: #f8fafc;
                    border-radius: 8px;
                    transition: background 0.2s;
                }
                .checkbox-label:hover { background: #f1f5f9; }
                .checkbox-label input { width: 20px; height: 20px; accent-color: var(--accent-color); margin-top: 2px; }
                .checkbox-content { display: flex; flex-direction: column; }
                .checkbox-title { font-weight: 600; font-size: 0.95rem; }
                .checkbox-desc { font-size: 0.85rem; color: var(--text-secondary); }

                .save-btn { width: 100%; padding: 1rem; font-size: 1rem; margin-top: 1rem; }

                .sidebar { display: flex; flex-direction: column; gap: 1.5rem; }
                .status-card, .quick-links { background: white; border-radius: 16px; padding: 1.5rem; border: 1px solid var(--border-color); }
                .status-card h3, .quick-links h3 { font-size: 1rem; margin-bottom: 1rem; }

                .status-item {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    padding: 0.75rem 0;
                    border-bottom: 1px solid #f1f5f9;
                }
                .status-item:last-child { border-bottom: none; }
                .status-label { color: var(--text-secondary); font-size: 0.9rem; }

                .status-badge {
                    padding: 0.25rem 0.75rem;
                    border-radius: 50px;
                    font-size: 0.8rem;
                    font-weight: 600;
                    text-decoration: none;
                }
                .status-badge.verified { background: #d1fae5; color: #065f46; }
                .status-badge.unverified { background: linear-gradient(135deg, #3b82f6, #1d4ed8); color: white; }
                .status-badge.pending { background: #fef3c7; color: #92400e; }
                .status-badge.none { background: #f1f5f9; color: #64748b; }
                .status-value { font-weight: 500; font-size: 0.9rem; }

                .quick-link {
                    display: block;
                    padding: 0.75rem;
                    text-decoration: none;
                    color: var(--text-primary);
                    border-radius: 8px;
                    transition: background 0.2s;
                    font-size: 0.95rem;
                }
                .quick-link:hover { background: #f8fafc; }

                .loading { text-align: center; padding: 4rem; color: var(--text-secondary); }

                @media (max-width: 900px) {
                    .account-grid { grid-template-columns: 1fr; }
                    .form-row { grid-template-columns: 1fr; }
                    .input-with-action { flex-direction: column; }
                }
            `}</style>
        </div>
    );
}
