
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

    const data = {
        email,
        password,
        options: {
            data: {
                first_name: firstName,
                last_name: lastName,
            },
        },
    }

    const { error } = await supabase.auth.signUp(data)

    if (error) {
        console.error('Signup Error:', error)
        redirect(`/signup?message=${encodeURIComponent(error.message)}`)
    }

    revalidatePath('/', 'layout')
    redirect(`/login?message=Check email to continue sign in process`)
}
