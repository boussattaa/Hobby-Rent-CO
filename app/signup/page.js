import Link from 'next/link'
import { signup } from '@/app/login/actions'
import { SubmitButton } from '@/components/submit-button'
import { OAuthButton } from '@/components/OAuthButton'

export default async function SignupPage(props) {
    const searchParams = await props.searchParams;
    return (
        <div className="login-page">
            <div className="container">
                <div className="login-card glass">
                    <h1>Create Account</h1>
                    <p className="subtitle">Join HobbyRent today</p>

                    <form className="auth-form">
                        <div className="form-group-row">
                            <div className="form-group">
                                <label htmlFor="first_name">First Name</label>
                                <input id="first_name" name="first_name" type="text" required placeholder="John" />
                            </div>
                            <div className="form-group">
                                <label htmlFor="last_name">Last Name</label>
                                <input id="last_name" name="last_name" type="text" required placeholder="Doe" />
                            </div>
                        </div>

                        <div className="form-group">
                            <label htmlFor="email">Email</label>
                            <input id="email" name="email" type="email" required placeholder="you@example.com" />
                        </div>

                        <div className="form-group">
                            <label htmlFor="password">Password</label>
                            <input id="password" name="password" type="password" required placeholder="••••••••" minLength={6} />
                        </div>

                        <div className="actions">
                            <SubmitButton
                                formAction={signup}
                                className="btn btn-primary full-width"
                                pendingText="Creating Account..."
                            >
                                Sign up
                            </SubmitButton>
                        </div>

                        <div className="oauth-divider">
                            <span>Or continue with</span>
                        </div>

                        <div className="oauth-actions">
                            <OAuthButton />
                        </div>

                        <p className="auth-footer">
                            Already have an account? <Link href="/login">Log in</Link>
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
