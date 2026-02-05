
'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { createClient } from '@/utils/supabase/server'

export async function login(formData) {
    const supabase = await createClient()

    const data = {
        email: formData.get('email'),
        password: formData.get('password'),
    }

    const { error } = await supabase.auth.signInWithPassword(data)

    if (error) {
        console.error('Login Error:', error)
        redirect(`/login?message=${encodeURIComponent(error.message)}`)
    }

    revalidatePath('/', 'layout')
    redirect('/')
}

export async function signup(formData) {
    const supabase = await createClient()

    const email = formData.get('email')
    const password = formData.get('password')
    const firstName = formData.get('first_name')
    const lastName = formData.get('last_name')

    // 1. Redundant Email Uniqueness Check for clearer error messages
    const { data: existingUser } = await supabase
        .from('profiles')
        .select('id')
        .eq('email', email)
        .maybeSingle()

    if (existingUser) {
        redirect(`/signup?message=${encodeURIComponent('An account with this email already exists.')}`)
    }

    const data = {
        email,
        password,
        options: {
            data: {
                first_name: firstName,
                last_name: lastName,
                email: email // Store in metadata too for easy lookup
            },
        },
    }

    const { error } = await supabase.auth.signUp(data)

    if (error) {
        console.error('Signup Error:', error)
        redirect(`/signup?message=${encodeURIComponent(error.message)}`)
    }

    revalidatePath('/', 'layout')
    redirect(`/signup/confirmation`)
}

export async function resetPasswordRequest(formData) {
    const supabase = await createClient()
    const email = formData.get('email')

    const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'}/reset-password`,
    })

    if (error) {
        console.error('Reset Request Error:', error)
        redirect(`/forgot-password?message=${encodeURIComponent(error.message)}`)
    }

    redirect(`/forgot-password?success=${encodeURIComponent('Check your email for the reset link.')}`)
}

export async function updatePassword(formData) {
    const supabase = await createClient()
    const password = formData.get('password')
    const confirmPassword = formData.get('confirmPassword')

    if (password !== confirmPassword) {
        redirect(`/reset-password?message=${encodeURIComponent('Passwords do not match.')}`)
    }

    const { error } = await supabase.auth.updateUser({
        password: password
    })

    if (error) {
        console.error('Update Password Error:', error)
        redirect(`/reset-password?message=${encodeURIComponent(error.message)}`)
    }

    redirect(`/login?message=${encodeURIComponent('Password updated successfully. Please log in.')}`)
}

