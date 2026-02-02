"use client";

export default function Footer() {
  return (
    <footer className="footer">
      <div className="container footer-content">
        <div className="footer-brand">
          <h4>HobbyRent</h4>
          <p>© {new Date().getFullYear()} HobbyRent Inc.</p>
        </div>
        <div className="footer-links">
          <a href="#">Privacy</a>
          <a href="#">Terms</a>
          <a href="#">Support</a>
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
          align-items: center;
        }
        .footer-brand h4 {
          margin-bottom: 0.5rem;
        }
        .footer-brand p {
          color: var(--text-secondary);
          font-size: 0.9rem;
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
      `}</style>
    </footer>
  )
}
