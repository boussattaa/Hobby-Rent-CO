import Link from 'next/link'
import { login, signup } from './actions'
import { SubmitButton } from '@/components/submit-button'
import { OAuthButton } from '@/components/OAuthButton'

export default async function LoginPage(props) {
  const searchParams = await props.searchParams;
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
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                <label htmlFor="password" style={{ marginBottom: 0 }}>Password</label>
                <Link href="/forgot-password" style={{ fontSize: '0.8rem', color: '#64748b', textDecoration: 'none' }}>Forgot Password?</Link>
              </div>
              <input id="password" name="password" type="password" required placeholder="••••••••" />
            </div>

            <div className="actions">
              <SubmitButton
                formAction={login}
                className="btn btn-primary full-width"
                pendingText="Logging in..."
              >
                Log in
              </SubmitButton>
            </div>

            <div className="oauth-divider">
              <span>Or continue with</span>
            </div>

            <div className="oauth-actions">
              <OAuthButton />
            </div>

            <p className="auth-footer">
              Don't have an account? <Link href="/signup">Sign up</Link>
            </p>

            {searchParams?.message && (
              <p className="form-message error">{searchParams.message}</p>
            )}
          </form>
        </div>
      </div>

    </div>
  )
}
