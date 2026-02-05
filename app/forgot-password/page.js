import Link from 'next/link'
import { resetPasswordRequest } from '@/app/login/actions'
import { SubmitButton } from '@/components/submit-button'

export default async function ForgotPasswordPage(props) {
    const searchParams = await props.searchParams;

    return (
        <div className="login-page">
            <div className="container">
                <div className="login-card glass">
                    <h1>Reset Password</h1>
                    <p className="subtitle">Enter your email and we'll send you a link to reset your password.</p>

                    <form className="auth-form">
                        <div className="form-group">
                            <label htmlFor="email">Email</label>
                            <input id="email" name="email" type="email" required placeholder="you@example.com" />
                        </div>

                        <div className="actions">
                            <SubmitButton
                                formAction={resetPasswordRequest}
                                className="btn btn-primary full-width"
                                pendingText="Sending Link..."
                            >
                                Send Reset Link
                            </SubmitButton>
                        </div>

                        <p className="auth-footer">
                            Remember your password? <Link href="/login">Log in</Link>
                        </p>

                        {searchParams?.message && (
                            <p className="form-message error">{searchParams.message}</p>
                        )}
                        {searchParams?.success && (
                            <p className="form-message success">
                                {searchParams.success}
                            </p>
                        )}
                    </form>
                </div>
            </div>
        </div>
    )
}
