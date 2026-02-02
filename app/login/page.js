import Link from 'next/link'
import { login, signup } from './actions'
import { SubmitButton } from '@/components/submit-button'

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
              <label htmlFor="password">Password</label>
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
              <SubmitButton
                formAction={signup}
                className="btn btn-secondary full-width"
                pendingText="Signing up..."
              >
                Sign up
              </SubmitButton>
            </div>

            {searchParams?.message && (
              <p className="message">{searchParams.message}</p>
            )}
          </form>
        </div>
      </div>
    </div>
  )
}
