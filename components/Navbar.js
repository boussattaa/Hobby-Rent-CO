"use client";

import Link from 'next/link';
import Image from 'next/image';
import { usePathname, useRouter } from 'next/navigation';
import { createClient } from '@/utils/supabase/client';

export default function Navbar({ user }) {
  const pathname = usePathname();
  const router = useRouter();
  const supabase = createClient();

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    router.refresh();
  };

  const navLinks = [
    { name: 'Dirt', href: '/dirt' },
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
            src="/images/logo.png"
            alt="HobbyRent Logo"
            width={180}
            height={60}
            style={{ objectFit: 'contain', mixBlendMode: 'multiply' }}
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

        <div className="nav-actions">
          {user ? (
            <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
              <span style={{ fontSize: '0.9rem', color: 'var(--text-secondary)' }}>
                {user.email}
              </span>
              <Link href="/list-your-gear" className="btn btn-primary">
                List Gear
              </Link>
              <button onClick={handleSignOut} className="btn btn-secondary" style={{ padding: '0.5rem 1rem', fontSize: '0.9rem' }}>
                Sign Out
              </button>
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
          font-size: 1.5rem;
          font-weight: 800;
          text-decoration: none;
          color: var(--text-primary);
          letter-spacing: -0.03em;
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

        @media (max-width: 768px) {
          .nav-links {
            display: none;
          }
        }
      `}</style>
    </nav>
  );
}
