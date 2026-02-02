
import Link from 'next/link'
import { login, signup } from './actions'

export default function LoginPage({ searchParams }) {
    return (
        <div className="login-page">
            <div className="container">
                <div className="login-card glass">
                    <h1>Welcome Back</h1>
                    <p className="subtitle">Sign in to your HobbyRent account</p>

                    <form className="auth-form">
                        <div className="form-group">
                            <label htmlFor="email">Email</label>
                            <input id="email" name="email" type="email" required placeholder="you@example.com" />
                        </div>

                        <div className="form-group">
                            <label htmlFor="password">Password</label>
                            <input id="password" name="password" type="password" required placeholder="••••••••" />
                        </div>

                        <div className="actions">
                            <button formAction={login} className="btn btn-primary full-width">Log in</button>
                            <button formAction={signup} className="btn btn-secondary full-width">Sign up</button>
                        </div>

                        {searchParams?.message && (
                            <p className="message">{searchParams.message}</p>
                        )}
                    </form>
                </div>
            </div>

            <style jsx>{`
        .login-page {
          min-height: 100vh;
          display: flex;
          align-items: center;
          justify-content: center;
          background-image: radial-gradient(at center, #f8fafc 0%, #e2e8f0 100%);
          margin-top: -80px; /* Offset for navbar */
          padding-top: 80px;
        }

        .login-card {
          background: white;
          padding: 3rem;
          border-radius: 24px;
          border: 1px solid var(--border-color);
          box-shadow: 0 20px 40px rgba(0,0,0,0.05);
          width: 100%;
          max-width: 480px;
          margin: 0 auto;
          text-align: center;
        }

        h1 { margin-bottom: 0.5rem; }
        .subtitle { color: var(--text-secondary); margin-bottom: 2rem; }

        .auth-form {
          text-align: left;
        }

        .form-group { margin-bottom: 1.5rem; }
        .form-group label { display: block; margin-bottom: 0.5rem; font-weight: 600; font-size: 0.9rem; }
        .form-group input { width: 100%; padding: 0.75rem; border: 1px solid var(--border-color); border-radius: 8px; font-size: 1rem; }

        .actions {
          display: flex;
          flex-direction: column;
          gap: 1rem;
          margin-top: 2rem;
        }

        .full-width { width: 100%; }

        .message {
          margin-top: 1.5rem;
          padding: 1rem;
          background: #fef2f2;
          color: #dc2626;
          border-radius: 8px;
          font-size: 0.9rem;
          text-align: center;
        }
      `}</style>
        </div>
    )
}
