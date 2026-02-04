import { NextResponse } from 'next/server';
import { sendEmail, welcomeEmailHtml } from '@/utils/resend';

export async function POST(request) {
    try {
        const { email, firstName } = await request.json();

        if (!email) {
            return NextResponse.json({ error: 'Email required' }, { status: 400 });
        }

        const result = await sendEmail({
            to: email,
            subject: 'Welcome to HobbyRent! 🏔️',
            html: welcomeEmailHtml(firstName)
        });

        if (result.success) {
            return NextResponse.json({ success: true });
        } else {
            return NextResponse.json({ error: result.error }, { status: 500 });
        }
    } catch (error) {
        console.error('Welcome email error:', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
