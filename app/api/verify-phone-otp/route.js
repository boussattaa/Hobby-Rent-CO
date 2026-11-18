import crypto from 'node:crypto';
import { createClient } from '@supabase/supabase-js';
import { createClient as createServerClient } from '@/utils/supabase/server';
import { NextResponse } from 'next/server';

function safeEqual(a, b) {
    const bufA = Buffer.from(String(a));
    const bufB = Buffer.from(String(b));
    if (bufA.length !== bufB.length) return false;
    return crypto.timingSafeEqual(bufA, bufB);
}

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
        const otp = typeof body?.otp === 'string' ? body.otp.trim() : '';
        const userId = typeof body?.userId === 'string' ? body.userId.trim() : user.id;

        if (!phone || !otp) {
            return NextResponse.json({ error: 'Phone and OTP are required' }, { status: 400 });
        }

        if (userId !== user.id) {
            return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
        }

        const supabase = createClient(
            process.env.NEXT_PUBLIC_SUPABASE_URL,
            process.env.SUPABASE_SERVICE_ROLE_KEY
        );

        const { data: otpRecord, error: fetchError } = await supabase
            .from('phone_otps')
            .select('*')
            .eq('user_id', user.id)
            .eq('phone', phone)
            .single();

        if (fetchError || !otpRecord) {
            return NextResponse.json({ error: 'No verification code found. Please request a new one.' }, { status: 400 });
        }

        if (new Date(otpRecord.expires_at) < new Date()) {
            return NextResponse.json({ error: 'Verification code has expired. Please request a new one.' }, { status: 400 });
        }

        if (!safeEqual(otpRecord.otp, otp)) {
            return NextResponse.json({ error: 'Invalid verification code. Please try again.' }, { status: 400 });
        }

        await supabase
            .from('phone_otps')
            .update({ verified: true })
            .eq('user_id', user.id);

        const { error: profileError } = await supabase
            .from('profiles')
            .update({
                phone_verified: true,
                phone,
                updated_at: new Date().toISOString(),
            })
            .eq('id', user.id);

        if (profileError) {
            console.error('Profile update error:', profileError);
            return NextResponse.json({ error: 'Failed to update profile' }, { status: 500 });
        }

        return NextResponse.json({
            success: true,
            message: 'Phone number verified successfully',
        });
    } catch (error) {
        console.error('Error verifying OTP:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
