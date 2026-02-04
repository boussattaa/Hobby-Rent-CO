
import { createClient } from '@/utils/supabase/server'
import { NextResponse } from 'next/server'

export async function GET(request) {
    const requestUrl = new URL(request.url)
    const code = requestUrl.searchParams.get('code')
    const next = requestUrl.searchParams.get('next') ?? '/'

    if (code) {
        const supabase = await createClient()
        const { error, data } = await supabase.auth.exchangeCodeForSession(code)
        if (!error && data?.user) {
            // Check if this is a new user (no profile exists yet or profile was just created)
            const { data: profile } = await supabase
                .from('profiles')
                .select('email, first_name')
                .eq('id', data.user.id)
                .single();

            // If profile doesn't exist, create it and send welcome email
            if (!profile) {
                const newProfile = {
                    id: data.user.id,
                    email: data.user.email,
                    first_name: data.user.user_metadata?.first_name || null,
                    last_name: data.user.user_metadata?.last_name || null,
                    is_verified: false // explictly set defaults
                };

                const { error: upsertError } = await supabase.from('profiles').upsert(newProfile);

                if (upsertError) {
                    console.error('Profile creation failed:', upsertError);
                } else {
                    console.log('Profile created successfully for:', data.user.email);

                    // Send welcome email (non-blocking) within success block
                    fetch(`${requestUrl.origin}/api/email/welcome`, {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({
                            email: data.user.email,
                            firstName: data.user.user_metadata?.first_name
                        })
                    }).catch(err => console.error('Welcome email failed:', err));
                }
            }

            return NextResponse.redirect(`${requestUrl.origin}${next}`)
        }
    }

    // return the user to an error page with instructions
    return NextResponse.redirect(`${requestUrl.origin}/error`)
}

