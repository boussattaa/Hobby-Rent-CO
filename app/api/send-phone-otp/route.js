import { createClient } from '@supabase/supabase-js';
import { NextResponse } from 'next/server';

const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY
);

export async function POST(request) {
    try {
        const { phone, userId } = await request.json();

        if (!phone || !userId) {
            return NextResponse.json({ error: 'Phone and userId are required' }, { status: 400 });
        }

        // Generate a 6-digit OTP
        const otp = Math.floor(100000 + Math.random() * 900000).toString();

        // Store OTP in database with expiration (5 minutes)
        const expiresAt = new Date(Date.now() + 5 * 60 * 1000).toISOString();

        // Upsert the OTP record
        const { error: dbError } = await supabase
            .from('phone_otps')
            .upsert({
                user_id: userId,
                phone: phone,
                otp: otp,
                expires_at: expiresAt,
                verified: false,
            }, { onConflict: 'user_id' });

        if (dbError) {
            console.error('Database error:', dbError);
            return NextResponse.json({ error: 'Failed to store OTP' }, { status: 500 });
        }

        // In production, send OTP via Twilio or similar SMS service
        // For development, we'll log it and return success
        console.log(`📱 OTP for ${phone}: ${otp}`);

        // TODO: Integrate Twilio SMS sending
        // const twilioClient = require('twilio')(TWILIO_SID, TWILIO_AUTH_TOKEN);
        // await twilioClient.messages.create({
        //     body: `Your HobbyRent verification code is: ${otp}`,
        //     from: TWILIO_PHONE_NUMBER,
        //     to: phone
        // });

        return NextResponse.json({
            success: true,
            message: 'OTP sent successfully',
            // Remove this in production - only for development testing
            devOtp: process.env.NODE_ENV === 'development' ? otp : undefined
        });
    } catch (error) {
        console.error('Error sending OTP:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
