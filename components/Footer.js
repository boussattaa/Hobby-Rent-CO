"use client";

import Link from 'next/link';

export default function Footer() {
  return (
    <footer className="footer">
      <div className="container footer-content">
        <div className="footer-brand">
          <h4>HobbyRent</h4>
          <p>© {new Date().getFullYear()} HobbyRent Inc.</p>
        </div>

        <div className="footer-column">
          <h5>Water Sports</h5>
          <Link href="/destinations/miami-boat-rentals">Miami Boat Rentals</Link>
          <Link href="/destinations/destin-boat-rentals">Destin Pontoons</Link>
          <Link href="/destinations/lake-havasu-boat-rentals">Lake Havasu Boats</Link>
          <Link href="/destinations/lake-tahoe-boat-rentals">Lake Tahoe Rentals</Link>
          <Link href="/destinations/key-west-boat-rentals">Key West Jet Skis</Link>
        </div>

        <div className="footer-column">
          <h5>Off-Road &amp; Trail</h5>
          <Link href="/destinations/moab-utv-rentals">Moab UTV &amp; RZR</Link>
          <Link href="/destinations/las-vegas-atv-rentals">Las Vegas ATVs</Link>
          <Link href="/destinations/jackson-hole-snowmobile-rentals">Jackson Hole Sleds</Link>
          <Link href="/destinations/owyhee-dirt-bike-rentals">Owyhee Dirt Bikes</Link>
        </div>

        <div className="footer-column">
          <h5>Company</h5>
          <Link href="/protection-plan">Protection Plan</Link>
          <Link href="/cancellation-policy">Cancellation Policy</Link>
          <Link href="/terms">Terms</Link>
          <Link href="/privacy">Privacy</Link>
          <Link href="/support">Support</Link>
        </div>
      </div>

      <style jsx>{`
        .footer {
          border-top: 1px solid var(--border-color);
          padding: 3rem 0;
          margin-top: auto;
          background: white;
        }
        .footer-content {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          flex-wrap: wrap;
          gap: 2rem;
        }
        .footer-brand {
          flex: 1;
        }
        .footer-brand h4 {
          margin-bottom: 0.5rem;
        }
        .footer-brand p {
          color: var(--text-secondary);
          font-size: 0.9rem;
        }
        
        .footer-column {
            display: flex;
            flex-direction: column;
            gap: 0.5rem;
            margin-right: 3rem;
        }
        .footer-column h5 {
            margin-bottom: 0.5rem;
            font-size: 0.9rem;
            text-transform: uppercase;
            color: var(--text-secondary);
        }
        .footer-column a {
            font-size: 0.9rem;
            text-decoration: none;
            color: var(--text-primary);
        }
        .footer-column a:hover {
            color: var(--accent-color);
        }

        .footer-links {
          display: flex;
          gap: 2rem;
        }
        .footer-links a {
          color: var(--text-secondary);
          text-decoration: none;
          font-size: 0.9rem;
        }
        .footer-links a:hover {
          color: var(--text-primary);
        }

        @media (max-width: 600px) {
            .footer-content {
                flex-direction: column;
                align-items: flex-start;
                gap: 2rem;
            }
        }
      `}</style>
    </footer>
  )
}
