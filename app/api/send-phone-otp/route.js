import crypto from 'node:crypto';
import { createClient } from '@supabase/supabase-js';
import { createClient as createServerClient } from '@/utils/supabase/server';
import { NextResponse } from 'next/server';

export async function POST(request) {
    if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY) {
        return NextResponse.json({ error: 'Server configuration error' }, { status: 500 });
    }

    try {
        const serverSupabase = await createServerClient();
        const { data: { user } } = await serverSupabase.auth.getUser();
        if (!user) {
            return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
        }

        const body = await request.json().catch(() => null);
        const phone = typeof body?.phone === 'string' ? body.phone.trim() : '';
        const userId = typeof body?.userId === 'string' ? body.userId.trim() : user.id;

        if (!phone || phone.replace(/\D/g, '').length < 10) {
            return NextResponse.json({ error: 'A valid phone number is required' }, { status: 400 });
        }

        if (userId !== user.id) {
            return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
        }

        const supabase = createClient(
            process.env.NEXT_PUBLIC_SUPABASE_URL,
            process.env.SUPABASE_SERVICE_ROLE_KEY
        );

        const otp = crypto.randomInt(100000, 1000000).toString();
        const expiresAt = new Date(Date.now() + 5 * 60 * 1000).toISOString();

        const { error: dbError } = await supabase
            .from('phone_otps')
            .upsert({
                user_id: user.id,
                phone,
                otp,
                expires_at: expiresAt,
                verified: false,
            }, { onConflict: 'user_id' });

        if (dbError) {
            console.error('Database error:', dbError);
            return NextResponse.json({ error: 'Failed to store OTP' }, { status: 500 });
        }

        return NextResponse.json({
            success: true,
            message: 'OTP sent successfully',
            devOtp: process.env.NODE_ENV === 'development' ? otp : undefined,
        });
    } catch (error) {
        console.error('Error sending OTP:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
