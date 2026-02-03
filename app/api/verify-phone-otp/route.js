import { createClient } from '@supabase/supabase-js';
import { NextResponse } from 'next/server';

const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY
);

export async function POST(request) {
    try {
        const { phone, otp, userId } = await request.json();

        if (!phone || !otp || !userId) {
            return NextResponse.json({ error: 'Phone, OTP, and userId are required' }, { status: 400 });
        }

        // Fetch the stored OTP
        const { data: otpRecord, error: fetchError } = await supabase
            .from('phone_otps')
            .select('*')
            .eq('user_id', userId)
            .eq('phone', phone)
            .single();

        if (fetchError || !otpRecord) {
            return NextResponse.json({ error: 'No verification code found. Please request a new one.' }, { status: 400 });
        }

        // Check if OTP has expired
        if (new Date(otpRecord.expires_at) < new Date()) {
            return NextResponse.json({ error: 'Verification code has expired. Please request a new one.' }, { status: 400 });
        }

        // Check if OTP matches
        if (otpRecord.otp !== otp) {
            return NextResponse.json({ error: 'Invalid verification code. Please try again.' }, { status: 400 });
        }

        // Mark OTP as verified
        await supabase
            .from('phone_otps')
            .update({ verified: true })
            .eq('user_id', userId);

        // Update user profile to mark phone as verified
        const { error: profileError } = await supabase
            .from('profiles')
            .update({
                phone_verified: true,
                phone: phone,
                updated_at: new Date().toISOString()
            })
            .eq('id', userId);

        if (profileError) {
            console.error('Profile update error:', profileError);
            return NextResponse.json({ error: 'Failed to update profile' }, { status: 500 });
        }

        return NextResponse.json({
            success: true,
            message: 'Phone number verified successfully'
        });
    } catch (error) {
        console.error('Error verifying OTP:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
