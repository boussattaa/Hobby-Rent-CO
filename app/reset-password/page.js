import { updatePassword } from '@/app/login/actions'
import { SubmitButton } from '@/components/submit-button'

export default async function ResetPasswordPage(props) {
    const searchParams = await props.searchParams;

    return (
        <div className="login-page">
            <div className="container">
                <div className="login-card glass">
                    <h1>New Password</h1>
                    <p className="subtitle">Please enter your new password below.</p>

                    <form className="auth-form">
                        <div className="form-group">
                            <label htmlFor="password">New Password</label>
                            <input
                                id="password"
                                name="password"
                                type="password"
                                required
                                placeholder="••••••••"
                                minLength={6}
                            />
                        </div>

                        <div className="form-group">
                            <label htmlFor="confirmPassword">Confirm New Password</label>
                            <input
                                id="confirmPassword"
                                name="confirmPassword"
                                type="password"
                                required
                                placeholder="••••••••"
                                minLength={6}
                            />
                        </div>

                        <div className="actions">
                            <SubmitButton
                                formAction={updatePassword}
                                className="btn btn-primary full-width"
                                pendingText="Updating Password..."
                            >
                                Update Password
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
