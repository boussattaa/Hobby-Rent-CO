import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

export async function sendEmail({ to, subject, html }) {
    try {
        const { data, error } = await resend.emails.send({
            from: 'HobbyRent <noreply@hobbyrent.com>',
            to,
            subject,
            html
        });

        if (error) {
            console.error('Resend error:', error);
            return { success: false, error };
        }

        return { success: true, data };
    } catch (error) {
        console.error('Email send error:', error);
        return { success: false, error };
    }
}

// Email Templates
export function welcomeEmailHtml(firstName) {
    return `
    <!DOCTYPE html>
    <html>
    <head>
        <style>
            body { font-family: 'Helvetica Neue', Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { text-align: center; padding: 20px 0; }
            .logo { font-size: 24px; font-weight: bold; color: #1a1a1a; }
            .content { background: #f8fafc; padding: 30px; border-radius: 12px; }
            .button { display: inline-block; background: #1a1a1a; color: white !important; padding: 12px 24px; border-radius: 25px; text-decoration: none; margin: 20px 0; }
            .footer { text-align: center; padding: 20px; color: #64748b; font-size: 12px; }
        </style>
    </head>
    <body>
        <div class="container">
            <div class="header">
                <div class="logo">🏔️ HobbyRent</div>
            </div>
            <div class="content">
                <h1>Welcome to HobbyRent${firstName ? ', ' + firstName : ''}! 🎉</h1>
                <p>We're excited to have you join our community of outdoor enthusiasts.</p>
                <p>With HobbyRent, you can:</p>
                <ul>
                    <li>🚤 Rent amazing gear from local owners</li>
                    <li>💰 List your own equipment and earn money</li>
                    <li>🏕️ Explore new adventures without buying</li>
                </ul>
                <p><strong>Next step:</strong> Get verified to start listing your gear!</p>
                <center>
                    <a href="https://hobbyrent.com/verify" class="button">Verify Your Account →</a>
                </center>
            </div>
            <div class="footer">
                <p>Rent the Adventure. Earn from your Gear.</p>
                <p>© 2024 HobbyRent. All rights reserved.</p>
            </div>
        </div>
    </body>
    </html>
    `;
}

export function messageNotificationHtml(senderName, itemName, messagePreview) {
    return `
    <!DOCTYPE html>
    <html>
    <head>
        <style>
            body { font-family: 'Helvetica Neue', Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { text-align: center; padding: 20px 0; }
            .logo { font-size: 24px; font-weight: bold; color: #1a1a1a; }
            .content { background: #f8fafc; padding: 30px; border-radius: 12px; }
            .message-box { background: white; padding: 15px; border-radius: 8px; border-left: 4px solid #3b82f6; margin: 15px 0; }
            .button { display: inline-block; background: #3b82f6; color: white !important; padding: 12px 24px; border-radius: 25px; text-decoration: none; margin: 20px 0; }
            .footer { text-align: center; padding: 20px; color: #64748b; font-size: 12px; }
        </style>
    </head>
    <body>
        <div class="container">
            <div class="header">
                <div class="logo">🏔️ HobbyRent</div>
            </div>
            <div class="content">
                <h2>New Message 💬</h2>
                <p>You have a new message from <strong>${senderName}</strong>${itemName ? ' about "' + itemName + '"' : ''}:</p>
                <div class="message-box">
                    "${messagePreview}"
                </div>
                <center>
                    <a href="https://hobbyrent.com/messages" class="button">View Message →</a>
                </center>
            </div>
            <div class="footer">
                <p>© 2024 HobbyRent. All rights reserved.</p>
            </div>
        </div>
    </body>
    </html>
    `;
}
