"use client";

import Link from 'next/link';
import Image from 'next/image';
import { usePathname, useRouter } from 'next/navigation';
import { createClient } from '@/utils/supabase/client';
import { useState, useEffect, useRef } from 'react';

export default function Navbar({ user }) {
  const pathname = usePathname();
  const router = useRouter();
  const supabase = createClient();
  const [isVerified, setIsVerified] = useState(false);
  const [firstName, setFirstName] = useState('');
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);

  // Notification State
  const [notifications, setNotifications] = useState([]);
  const [showNotifications, setShowNotifications] = useState(false);
  const notifRef = useRef(null);

  useEffect(() => {
    if (user) {
      const fetchProfile = async () => {
        const { data } = await supabase.from('profiles').select('is_verified, first_name').eq('id', user.id).single();
        if (data?.is_verified) setIsVerified(true);
        if (data?.first_name) setFirstName(data.first_name);
      };
      fetchProfile();
    }
  }, [user]);

  // Fetch Notifications
  useEffect(() => {
    if (user) {
      const fetchNotifs = async () => {
        const { data } = await supabase
          .from('notifications')
          .select('*')
          .eq('is_read', false)
          .order('created_at', { ascending: false });
        if (data) setNotifications(data);
      };
      fetchNotifs();
      // Poll every 30s
      const interval = setInterval(fetchNotifs, 30000);
      return () => clearInterval(interval);
    }
  }, [user]);

  const handleNotificationClick = async (notif) => {
    // Optimistic update
    setNotifications(prev => prev.filter(n => n.id !== notif.id));
    setShowNotifications(false);

    // Mark read in DB
    await supabase.from('notifications').update({ is_read: true }).eq('id', notif.id);

    if (notif.link) {
      window.location.href = notif.link;
    }
  };

  // Close notif dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (notifRef.current && !notifRef.current.contains(event.target)) {
        setShowNotifications(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    setDropdownOpen(false);
    router.refresh();
  };

  const navLinks = [
    { name: 'Offroad', href: '/offroad' },
    { name: 'Watersports', href: '/water' },
    { name: 'Trailers', href: '/trailers' },
    { name: 'Tools', href: '/housing' },
  ];

  const isActive = (path) => pathname === path;

  return (
    <nav className="navbar glass">
      <div className="container navbar-content">
        <Link href="/" className="logo">
          <Image
            src="/images/logo-banner.png"
            alt="HobbyRent Logo"
            width={512}
            height={273}
            style={{
              width: '60px',
              height: '60px',
              borderRadius: '50%',
              objectFit: 'cover',
              objectPosition: 'center'
            }}
            priority
          />
        </Link>

        <div className="nav-links">
          {navLinks.map((link) => (
            <Link
              key={link.name}
              href={link.href}
              className={`nav-item ${isActive(link.href) ? 'active' : ''}`}
            >
              {link.name}
            </Link>
          ))}
        </div>

        <div className="nav-actions" style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          {user ? (
            <div className="user-actions">
              {/* Show List Gear for verified users, Verify Now for unverified */}
              {isVerified ? (
                <Link href="/list-your-gear" className="list-gear-btn">
                  ➕ List Gear
                </Link>
              ) : (
                <Link href="/verify" className="verify-btn">
                  🛡️ Verify Now
                </Link>
              )}



              {/* Notification Bell */}
              <div className="notif-wrapper" ref={notifRef}>
                <button
                  className="notif-btn"
                  onClick={() => setShowNotifications(!showNotifications)}
                >
                  <span className="bell-icon">🔔</span>
                  {notifications.length > 0 && (
                    <span className="notif-badge">{notifications.length}</span>
                  )}
                </button>

                {showNotifications && (
                  <div className="notif-dropdown">
                    <div className="dropdown-header">
                      <span className="notif-title">Notifications</span>
                    </div>
                    <div className="dropdown-divider" />
                    <div className="notif-list">
                      {notifications.length === 0 ? (
                        <div className="empty-notif">No new notifications</div>
                      ) : (
                        notifications.map(notif => (
                          <div
                            key={notif.id}
                            className="notif-item"
                            onClick={() => handleNotificationClick(notif)}
                          >
                            <div className="notif-icon">
                              {notif.type === 'new_request' ? '📩' : 'ℹ️'}
                            </div>
                            <div className="notif-content">
                              <p className="notif-msg-title">{notif.title}</p>
                              <p className="notif-msg">{notif.message}</p>
                              <span className="notif-time">
                                {new Date(notif.created_at).toLocaleDateString()}
                              </span>
                            </div>
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                )}
              </div>

              <div className="account-wrapper" ref={dropdownRef}>
                <button
                  className="account-btn"
                  onClick={() => setDropdownOpen(!dropdownOpen)}
                >
                  <span className="account-avatar">
                    {user.email?.charAt(0).toUpperCase()}
                  </span>
                  <span className="account-label">
                    {/* Use profile first name, or extract from email */}
                    {firstName || (user.email?.split('@')[0]?.split('.')[0]?.charAt(0).toUpperCase() +
                      user.email?.split('@')[0]?.split('.')[0]?.slice(1)) || 'Account'}
                    {isVerified && <span className="verified-check" title="Verified">✓</span>}
                  </span>
                  <span className={`chevron ${dropdownOpen ? 'open' : ''}`}>▼</span>
                </button>

                {dropdownOpen && (
                  <div className="dropdown-menu">
                    <div className="dropdown-header">
                      <span className="user-email">{user.email}</span>
                      {isVerified && <span className="verified-badge" title="Verified">✓</span>}
                    </div>

                    <div className="dropdown-divider" />

                    <Link href="/dashboard" className="dropdown-item" onClick={() => setDropdownOpen(false)}>
                      <span className="item-icon">📊</span>
                      Owner Dashboard
                    </Link>

                    <Link href="/rentals" className="dropdown-item" onClick={() => setDropdownOpen(false)}>
                      <span className="item-icon">🔑</span>
                      My Trips (Renter)
                    </Link>

                    <Link href="/inbox" className="dropdown-item" onClick={() => setDropdownOpen(false)}>
                      <span className="item-icon">💬</span>
                      Messages
                    </Link>

                    <Link href="/my-listings" className="dropdown-item" onClick={() => setDropdownOpen(false)}>
                      <span className="item-icon">📦</span>
                      My Listings
                    </Link>
                    <Link href="/list-your-gear" className="dropdown-item" onClick={() => setDropdownOpen(false)}>
                      <span className="item-icon">➕</span>
                      List Gear
                    </Link>

                    <Link href="/account" className="dropdown-item" onClick={() => setDropdownOpen(false)}>
                      <span className="item-icon">⚙️</span>
                      Account Settings
                    </Link>

                    <div className="dropdown-divider" />

                    <button onClick={handleSignOut} className="dropdown-item signout">
                      <span className="item-icon">🚪</span>
                      Sign Out
                    </button>
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div style={{ display: 'flex', gap: '1rem' }}>
              <Link href="/login" className="btn btn-secondary">
                Log In
              </Link>
              <Link href="/login" className="btn btn-primary">
                Sign Up
              </Link>
            </div>
          )}
        </div>
      </div>

      <style jsx>{`
        .navbar {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          height: var(--header-height);
          z-index: 1000;
          display: flex;
          align-items: center;
          border-bottom: 1px solid rgba(255, 255, 255, 0.1);
        }

        .navbar-content {
          display: flex;
          justify-content: space-between;
          align-items: center;
          width: 100%;
        }

        .logo {
          text-decoration: none;
          display: flex;
          align-items: center;
          /* Remove fixed height on container to let image drive it */
        }

        /* Use global selector to target the img tag inside Next/Image */
        .logo :global(img) {
          width: 45px !important;
          height: 45px !important;
          border-radius: 50% !important;
          object-fit: cover !important;
          object-position: center !important;
        }

        @media (min-width: 768px) {
          .logo :global(img) {
            width: 70px !important;
            height: 70px !important;
          }
        }

        .nav-links {
          display: flex;
          gap: 2rem;
        }

        .nav-item {
          text-decoration: none;
          color: var(--text-secondary);
          font-weight: 500;
          transition: color 0.2s;
        }

        .nav-item:hover, .nav-item.active {
          color: var(--text-primary);
        }

        /* Account Dropdown Styles */
        .user-actions {
          display: flex;
          align-items: center;
          gap: 1rem;
        }

        .verify-btn {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          padding: 0.5rem 1rem;
          background: linear-gradient(135deg, #3b82f6, #1d4ed8);
          color: white;
          border-radius: 50px;
          font-weight: 600;
          font-size: 0.9rem;
          text-decoration: none;
          transition: all 0.2s;
          box-shadow: 0 2px 8px rgba(59, 130, 246, 0.3);
        }

        .verify-btn:hover {
          transform: translateY(-2px);
          box-shadow: 0 4px 12px rgba(59, 130, 246, 0.4);
        }

        .list-gear-btn {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          padding: 0.5rem 1rem;
          background: linear-gradient(135deg, #10b981, #059669);
          color: white;
          border-radius: 50px;
          font-weight: 600;
          font-size: 0.9rem;
          text-decoration: none;
          transition: all 0.2s;
          box-shadow: 0 2px 8px rgba(16, 185, 129, 0.3);
        }

        .list-gear-btn:hover {
          transform: translateY(-2px);
          box-shadow: 0 4px 12px rgba(16, 185, 129, 0.4);
        }

        .verified-check {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          width: 16px;
          height: 16px;
          background: #10b981;
          color: white;
          border-radius: 50%;
          font-size: 0.65rem;
          margin-left: 0.35rem;
        }

        .account-wrapper {
          position: relative;
        }

        .account-btn {
          display: flex;
          align-items: center;
          gap: 0.75rem;
          padding: 0.5rem 1rem;
          background: white;
          border: 1px solid var(--border-color);
          border-radius: 50px;
          cursor: pointer;
          transition: all 0.2s;
        }

        .account-btn:hover {
          border-color: var(--text-secondary);
          box-shadow: 0 2px 8px rgba(0,0,0,0.08);
        }

        .notif-wrapper { position: relative; }
        .notif-btn { 
            background: white; 
            border: 1px solid var(--border-color); 
            width: 40px; 
            height: 40px; 
            border-radius: 50%; 
            display: flex; 
            align-items: center; 
            justify-content: center; 
            cursor: pointer; 
            position: relative;
            transition: all 0.2s;
        }
        .notif-btn:hover { background: #f8fafc; }
        .bell-icon { font-size: 1.2rem; }
        .notif-badge {
            position: absolute;
            top: -2px;
            right: -2px;
            background: #ef4444;
            color: white;
            font-size: 0.7rem;
            font-weight: 700;
            min-width: 18px;
            height: 18px;
            border-radius: 50%;
            display: flex;
            align-items: center;
            justify-content: center;
            border: 2px solid white;
        }

        .notif-dropdown {
            position: absolute;
            top: calc(100% + 8px);
            right: -60px;
            width: 320px;
            background: white;
            border: 1px solid var(--border-color);
            border-radius: 12px;
            box-shadow: 0 10px 40px rgba(0,0,0,0.12);
            z-index: 1001;
            overflow: hidden;
            animation: slideDown 0.2s ease;
        }
        .notif-title { font-weight: 600; font-size: 0.95rem; }
        .notif-list { max-height: 300px; overflow-y: auto; }
        .empty-notif { padding: 2rem; text-align: center; color: var(--text-secondary); font-size: 0.9rem; }
        
        .notif-item {
            padding: 1rem;
            display: flex;
            gap: 1rem;
            cursor: pointer;
            transition: background 0.15s;
            border-bottom: 1px solid #f1f5f9;
        }
        .notif-item:last-child { border-bottom: none; }
        .notif-item:hover { background: #f8fafc; }
        
        .notif-icon { font-size: 1.2rem; margin-top: 0.2rem; }
        .notif-content { flex: 1; }
        .notif-msg-title { font-weight: 600; font-size: 0.9rem; margin-bottom: 0.2rem; }
        .notif-msg { font-size: 0.85rem; color: var(--text-secondary); line-height: 1.4; margin-bottom: 0.4rem; }
        .notif-time { font-size: 0.75rem; color: #94a3b8; }

        .account-avatar {
          width: 32px;
          height: 32px;
          background: linear-gradient(135deg, var(--accent-color), #1e40af);
          color: white;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          font-weight: 700;
          font-size: 0.9rem;
        }

        .account-label {
          font-weight: 600;
          font-size: 0.95rem;
          color: var(--text-primary);
        }

        .chevron {
          font-size: 0.6rem;
          color: var(--text-secondary);
          transition: transform 0.2s;
        }

        .chevron.open {
          transform: rotate(180deg);
        }

        .dropdown-menu {
          position: absolute;
          top: calc(100% + 8px);
          right: 0;
          min-width: 220px;
          background: white;
          border: 1px solid var(--border-color);
          border-radius: 12px;
          box-shadow: 0 10px 40px rgba(0,0,0,0.12);
          overflow: hidden;
          animation: slideDown 0.2s ease;
          display: flex;
          flex-direction: column;
        }

        @keyframes slideDown {
          from { opacity: 0; transform: translateY(-8px); }
          to { opacity: 1; transform: translateY(0); }
        }

        .dropdown-header {
          padding: 1rem;
          display: flex;
          align-items: center;
          gap: 0.5rem;
        }

        .user-email {
          font-size: 0.85rem;
          color: var(--text-secondary);
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
        }

        .verified-badge {
          background: #10b981;
          color: white;
          width: 18px;
          height: 18px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 0.7rem;
          flex-shrink: 0;
        }

        .dropdown-divider {
          height: 1px;
          background: var(--border-color);
        }

        .dropdown-item {
          display: flex;
          align-items: center;
          gap: 0.75rem;
          padding: 0.85rem 1rem;
          text-decoration: none;
          color: var(--text-primary);
          font-size: 0.95rem;
          transition: background 0.15s;
          cursor: pointer;
          border: none;
          background: none;
          width: 100%;
          text-align: left;
        }

        .dropdown-item:hover {
          background: #f8fafc;
        }

        .dropdown-item.highlight {
          color: var(--accent-color);
          font-weight: 600;
        }

        .dropdown-item.signout {
          color: #dc2626;
        }

        .item-icon {
          font-size: 1rem;
        }

        @media (max-width: 768px) {
          .nav-links {
            display: none;
          }
          .account-label {
            display: none;
          }
        }
      `}</style>
    </nav>
  );
}
