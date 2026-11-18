import { NextResponse } from 'next/server';
import { Resend } from 'resend';
import { createClient } from '@supabase/supabase-js';

function escapeHtml(value) {
    return String(value ?? '')
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#39;');
}

export async function POST(request) {
    try {
        if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY) {
            return NextResponse.json({ error: 'Server configuration error' }, { status: 500 });
        }

        const resendKey = process.env.RESEND_API_KEY;
        if (!resendKey) {
            return NextResponse.json({ error: 'Email service is not configured' }, { status: 500 });
        }

        const resend = new Resend(resendKey);
        const supabaseAdmin = createClient(
            process.env.NEXT_PUBLIC_SUPABASE_URL,
            process.env.SUPABASE_SERVICE_ROLE_KEY,
            {
                auth: {
                    autoRefreshToken: false,
                    persistSession: false,
                },
            }
        );

        const body = await request.json().catch(() => null);
        const type = body?.type;
        const bookingId = body?.bookingId;

        if (!bookingId || !type) {
            return NextResponse.json({ error: 'Missing type or bookingId' }, { status: 400 });
        }

        const { data: booking, error: bookingError } = await supabaseAdmin
            .from('bookings')
            .select(`
        *,
        items (
          title,
          price,
          price_type
        )
      `)
            .eq('id', bookingId)
            .single();

        if (bookingError || !booking) {
            return NextResponse.json({ error: 'Booking not found' }, { status: 404 });
        }

        const safeTitle = escapeHtml(booking.items?.title || 'Gear Rental');
        const safeStatus = escapeHtml(booking.status || 'updated');
        const baseUrl =
            process.env.NEXT_PUBLIC_BASE_URL ||
            process.env.NEXT_PUBLIC_SITE_URL ||
            'https://hobby-rent-co.vercel.app';

        let recipientId;
        let subject;
        let htmlContent;

        if (type === 'new_request') {
            recipientId = booking.owner_id;
            subject = `New Booking Request: ${booking.items?.title || 'Gear Rental'}`;
            htmlContent = `
        <h1>New Booking Request!</h1>
        <p>You have received a request to rent <strong>${safeTitle}</strong>.</p>
        <p><strong>Total:</strong> $${Number(booking.total_price || 0).toFixed(2)}</p>
        <p><strong>Dates:</strong> ${new Date(booking.start_date).toLocaleDateString()} - ${new Date(booking.end_date).toLocaleDateString()}</p>
        <br/>
        <a href="${baseUrl}/dashboard" style="background-color: #000; color: #fff; padding: 10px 20px; text-decoration: none; border-radius: 5px;">View Request</a>
      `;
        } else if (type === 'status_change') {
            recipientId = booking.user_id;
            subject = `Booking Update: ${String(booking.status || '').toUpperCase()}`;
            htmlContent = `
        <h1>Booking Update</h1>
        <p>Your booking for <strong>${safeTitle}</strong> is now <strong>${safeStatus}</strong>.</p>
        <br/>
        <a href="${baseUrl}/rentals" style="background-color: #000; color: #fff; padding: 10px 20px; text-decoration: none; border-radius: 5px;">View Booking</a>
      `;
        } else if (type === 'new_booking_confirmed') {
            recipientId = booking.owner_id;
            subject = `New Booking Confirmed: ${booking.items?.title || 'Gear Rental'}`;
            htmlContent = `
        <h1>New Booking Confirmed!</h1>
        <p>Great news! You have a new confirmed booking for <strong>${safeTitle}</strong>.</p>
        <p><strong>Total Payout:</strong> $${(Number(booking.total_price || 0) * 0.9).toFixed(2)}</p>
        <p><strong>Dates:</strong> ${new Date(booking.start_date).toLocaleDateString()} - ${new Date(booking.end_date).toLocaleDateString()}</p>
        <br/>
        <a href="${baseUrl}/dashboard" style="background-color: #000; color: #fff; padding: 10px 20px; text-decoration: none; border-radius: 5px;">View Booking</a>
      `;
        } else {
            return NextResponse.json({ error: 'Invalid email type' }, { status: 400 });
        }

        const { data: userData, error: userError } =
            await supabaseAdmin.auth.admin.getUserById(recipientId);

        if (userError || !userData.user?.email) {
            return NextResponse.json({ error: 'Recipient user not found' }, { status: 404 });
        }

        const fromEmail = process.env.EMAIL_FROM || 'HobbyRent <notifications@hobbyrent.com>';
        const replyToEmail = process.env.EMAIL_REPLY_TO || 'support@hobbyrent.com';

        const { data: emailData, error: emailError } = await resend.emails.send({
            from: fromEmail,
            reply_to: replyToEmail,
            to: userData.user.email,
            subject,
            html: htmlContent,
            headers: {
                'Idempotency-Key': `hobbyrent-${type}-${bookingId}-${booking.status || 'na'}`,
            },
        });

        if (emailError) {
            console.error('Resend Error:', emailError);
            return NextResponse.json(
                { error: 'Failed to send email notification' },
                { status: 500 }
            );
        }

        return NextResponse.json({ success: true, emailId: emailData?.id });
    } catch (err) {
        console.error('API Error:', err);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
