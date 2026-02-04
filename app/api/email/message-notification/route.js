import { NextResponse } from 'next/server';
import { sendEmail, messageNotificationHtml } from '@/utils/resend';
import { createClient } from '@/utils/supabase/server';

export async function POST(request) {
    try {
        const { recipientId, senderName, itemName, messagePreview } = await request.json();

        if (!recipientId) {
            return NextResponse.json({ error: 'Recipient ID required' }, { status: 400 });
        }

        const supabase = await createClient();

        // Get recipient's email
        const { data: recipient } = await supabase
            .from('profiles')
            .select('email')
            .eq('id', recipientId)
            .single();

        if (!recipient?.email) {
            return NextResponse.json({ error: 'Recipient not found' }, { status: 404 });
        }

        const result = await sendEmail({
            to: recipient.email,
            subject: `New message from ${senderName} on HobbyRent`,
            html: messageNotificationHtml(senderName, itemName, messagePreview)
        });

        if (result.success) {
            return NextResponse.json({ success: true });
        } else {
            return NextResponse.json({ error: result.error }, { status: 500 });
        }
    } catch (error) {
        console.error('Message notification error:', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
