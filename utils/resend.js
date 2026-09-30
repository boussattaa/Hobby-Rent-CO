import { Resend } from 'resend';

// Lazy initialization to avoid build-time errors when API key isn't set
let resendInstance = null;

export function getResend() {
    if (!resendInstance && process.env.RESEND_API_KEY) {
        resendInstance = new Resend(process.env.RESEND_API_KEY);
    }
    return resendInstance;
}

// Legacy export for backwards compatibility
export const resend = {
    emails: {
        send: async (...args) => {
            const client = getResend();
            if (!client) {
                console.warn('Resend API key not configured, skipping email');
                return { data: null, error: { message: 'API key not configured' } };
            }
            return client.emails.send(...args);
        }
    }
};

export async function sendEmail({ to, subject, html, replyTo = 'support@hobbyrent.com' }) {
    const client = getResend();

    if (!client) {
        console.warn('Resend API key not configured, skipping email');
        return { success: false, error: { message: 'API key not configured' } };
    }

    try {
        const fromEmail = process.env.EMAIL_FROM || 'HobbyRent <notifications@hobbyrent.com>';
        const replyToEmail = replyTo || process.env.EMAIL_REPLY_TO || 'support@hobbyrent.com';

        const { data, error } = await client.emails.send({
            from: fromEmail,
            reply_to: replyToEmail,
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
                <p>© ${new Date().getFullYear()} HobbyRent. All rights reserved.</p>
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
                <p>© ${new Date().getFullYear()} HobbyRent. All rights reserved.</p>
            </div>
        </div>
    </body>
    </html>
    `;
}

export function rentalReminderRenterHtml(renterName, itemName, startDate, address) {
    return `
    <!DOCTYPE html>
    <html>
    <head>
        <style>
            body { font-family: 'Helvetica Neue', Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { text-align: center; padding: 20px 0; }
            .logo { font-size: 24px; font-weight: bold; color: #1a1a1a; text-decoration: none; }
            .content { background: #f8fafc; padding: 30px; border-radius: 12px; }
            .info-box { background: white; padding: 20px; border-radius: 8px; border-left: 4px solid #10b981; margin: 20px 0; }
            .button { display: inline-block; background: #1a1a1a; color: white !important; padding: 12px 24px; border-radius: 25px; text-decoration: none; margin: 20px 0; }
            .footer { text-align: center; padding: 20px; color: #64748b; font-size: 12px; }
            .address { font-weight: bold; font-size: 1.1em; color: #1a1a1a; }
        </style>
    </head>
    <body>
        <div class="container">
            <div class="header">
                <div class="logo">🏔️ HobbyRent</div>
            </div>
            <div class="content">
                <h1>Get ready for your rental! 🎒</h1>
                <p>Hi ${renterName},</p>
                <p>Your rental for <strong>${itemName}</strong> starts tomorrow, <strong>${startDate}</strong>.</p>
                
                <div class="info-box">
                    <h3>📍 Pickup Location</h3>
                    <p class="address">${address}</p>
                    <p style="font-size: 0.9em; color: #666; margin-top: 5px;">This is the private address provided by the owner.</p>
                </div>

                <p>Please make sure to arrive on time and bring a valid ID.</p>
                
                <center>
                    <a href="https://www.hobbyrent.com/rentals" class="button">View Booking Details →</a>
                </center>
            </div>
            <div class="footer">
                <p>Need help? Reply to this email or message the owner.</p>
                <p>© ${new Date().getFullYear()} HobbyRent. All rights reserved.</p>
            </div>
        </div>
    </body>
    </html>
    `;
}

export function rentalReminderOwnerHtml(ownerName, itemName, startDate, renterName) {
    return `
    <!DOCTYPE html>
    <html>
    <head>
        <style>
            body { font-family: 'Helvetica Neue', Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { text-align: center; padding: 20px 0; }
            .logo { font-size: 24px; font-weight: bold; color: #1a1a1a; text-decoration: none; }
            .content { background: #f8fafc; padding: 30px; border-radius: 12px; }
            .info-box { background: white; padding: 20px; border-radius: 8px; border-left: 4px solid #3b82f6; margin: 20px 0; }
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
                <h1>Rental Reminder 🔔</h1>
                <p>Hi ${ownerName},</p>
                <p>This is a reminder that your item <strong>${itemName}</strong> is scheduled for pickup tomorrow, <strong>${startDate}</strong>.</p>
                
                <div class="info-box">
                    <h3>👤 Renter</h3>
                    <p><strong>${renterName || 'The renter'}</strong> will be picking up the item.</p>
                </div>

                <p>Please ensure the item is clean, charged/fueled, and ready for handover.</p>
                
                <center>
                    <a href="https://www.hobbyrent.com/dashboard" class="button">Manage Rental →</a>
                </center>
            </div>
            <div class="footer">
                <p>Please message the renter if there are any last-minute updates.</p>
                <p>© ${new Date().getFullYear()} HobbyRent. All rights reserved.</p>
            </div>
        </div>
    </body>
    </html>
    `;
}

export function bookingConfirmationHtml(renterName, itemName, startDate, endDate, totalPrice, bookingId) {
    return `
    <!DOCTYPE html>
    <html>
    <head>
        <style>
            body { font-family: 'Helvetica Neue', Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { text-align: center; padding: 20px 0; }
            .logo { font-size: 24px; font-weight: bold; color: #1a1a1a; text-decoration: none; }
            .content { background: #f8fafc; padding: 30px; border-radius: 12px; }
            .summary-box { background: white; padding: 20px; border-radius: 8px; border-left: 4px solid #10b981; margin: 20px 0; }
            .button { display: inline-block; background: #2563eb; color: white !important; padding: 12px 24px; border-radius: 25px; text-decoration: none; margin: 20px 0; }
            .footer { text-align: center; padding: 20px; color: #64748b; font-size: 12px; }
        </style>
    </head>
    <body>
        <div class="container">
            <div class="header">
                <div class="logo">🏔️ HobbyRent</div>
            </div>
            <div class="content">
                <h1>Booking Confirmed! 🎉</h1>
                <p>Hi ${renterName || 'there'},</p>
                <p>Your rental reservation has been successfully confirmed. You're all set to pick up your gear.</p>
                
                <div class="summary-box">
                    <h3>📦 Reservation Summary</h3>
                    <p><strong>Item:</strong> ${itemName}</p>
                    <p><strong>Dates:</strong> ${startDate} – ${endDate}</p>
                    <p><strong>Total Paid:</strong> $${totalPrice}</p>
                    ${bookingId ? `<p style="font-size: 0.85em; color: #888;">Booking Reference: ${bookingId}</p>` : ''}
                </div>

                <p>Remember to complete your pre-rental inspection photos at pickup to ensure coverage under the <a href="https://www.hobbyrent.com/protection-plan" style="color: #2563eb;">HobbyRent Protection Plan</a>.</p>
                
                <center>
                    <a href="https://www.hobbyrent.com/rentals" class="button">View Reservation Details →</a>
                </center>
            </div>
            <div class="footer">
                <p>Need support? Contact us at support@hobbyrent.com.</p>
                <p>© ${new Date().getFullYear()} HobbyRent. All rights reserved.</p>
            </div>
        </div>
    </body>
    </html>
    `;
}

export function bookingRequestOwnerHtml(ownerName, renterName, itemName, startDate, endDate, payoutAmount, bookingId) {
    return `
    <!DOCTYPE html>
    <html>
    <head>
        <style>
            body { font-family: 'Helvetica Neue', Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { text-align: center; padding: 20px 0; }
            .logo { font-size: 24px; font-weight: bold; color: #1a1a1a; text-decoration: none; }
            .content { background: #f8fafc; padding: 30px; border-radius: 12px; }
            .alert-box { background: white; padding: 20px; border-radius: 8px; border-left: 4px solid #3b82f6; margin: 20px 0; }
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
                <h1>New Booking Alert! 🚀</h1>
                <p>Hi ${ownerName || 'Host'},</p>
                <p>You have a new reservation for your equipment on HobbyRent.</p>
                
                <div class="alert-box">
                    <h3>⚡ Booking Details</h3>
                    <p><strong>Item:</strong> ${itemName}</p>
                    <p><strong>Renter:</strong> ${renterName || 'Verified Renter'}</p>
                    <p><strong>Rental Dates:</strong> ${startDate} – ${endDate}</p>
                    <p><strong>Estimated Payout:</strong> $${payoutAmount}</p>
                </div>

                <p>Please review and prepare your item for handover.</p>
                
                <center>
                    <a href="https://www.hobbyrent.com/dashboard" class="button">Go to Dashboard →</a>
                </center>
            </div>
            <div class="footer">
                <p>© ${new Date().getFullYear()} HobbyRent. All rights reserved.</p>
            </div>
        </div>
    </body>
    </html>
    `;
}

export function listingPublishedHtml(ownerName, itemName, itemPrice, itemId) {
    return `
    <!DOCTYPE html>
    <html>
    <head>
        <style>
            body { font-family: 'Helvetica Neue', Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { text-align: center; padding: 20px 0; }
            .logo { font-size: 24px; font-weight: bold; color: #1a1a1a; text-decoration: none; }
            .content { background: #f8fafc; padding: 30px; border-radius: 12px; }
            .card { background: white; padding: 20px; border-radius: 8px; border-left: 4px solid #10b981; margin: 20px 0; }
            .button { display: inline-block; background: #2563eb; color: white !important; padding: 12px 24px; border-radius: 25px; text-decoration: none; margin: 20px 0; }
            .footer { text-align: center; padding: 20px; color: #64748b; font-size: 12px; }
        </style>
    </head>
    <body>
        <div class="container">
            <div class="header">
                <div class="logo">🏔️ HobbyRent</div>
            </div>
            <div class="content">
                <h1>Your Listing is Live! 🌟</h1>
                <p>Hi ${ownerName || 'Host'},</p>
                <p>Great news! Your listing <strong>${itemName}</strong> is now officially published on HobbyRent and visible to thousands of renters searching for gear.</p>
                
                <div class="card">
                    <h3>${itemName}</h3>
                    <p><strong>Rate:</strong> $${itemPrice}/day</p>
                    <p style="color: #10b981; font-weight: bold;">Status: Active & Searchable</p>
                </div>

                <p>Tips for higher booking rates: keep your calendar up to date and respond promptly to renter inquiries.</p>
                
                <center>
                    <a href="https://www.hobbyrent.com/item/${itemId}" class="button">View Your Listing →</a>
                </center>
            </div>
            <div class="footer">
                <p>© ${new Date().getFullYear()} HobbyRent. All rights reserved.</p>
            </div>
        </div>
    </body>
    </html>
    `;
}
