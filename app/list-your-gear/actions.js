
'use server'

import { createClient } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'
import { revalidatePath } from 'next/cache'

import { geocodeLocation } from '@/utils/geocoding'

export async function createListing(formData) {
    const supabase = await createClient()

    // Get current user to attach as owner
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
        redirect('/login')
    }

    // Check verification status
    const { data: profile } = await supabase
        .from('profiles')
        .select('is_verified')
        .eq('id', user.id)
        .single()

    if (!profile?.is_verified) {
        redirect('/verify')
    }

    const locationStr = formData.get('location');
    const coords = await geocodeLocation(locationStr);

    const itemData = {
        owner_id: user.id,
        name: formData.get('name'),
        category: formData.get('category'),
        subcategory: formData.get('subcategory'), // Add subcategory
        price: parseFloat(formData.get('price')),
        weekend_price: formData.get('weekend_price') ? parseFloat(formData.get('weekend_price')) : null,
        location: locationStr,
        lat: coords ? coords.lat : null,
        lng: coords ? coords.lng : null,
        description: formData.get('description'),
        description: formData.get('description'),
        image_url: formData.get('image_url') || '/images/dirt-hero.png',
        additional_images: JSON.parse(formData.get('additional_images') || '[]'),
        video_url: formData.get('video_url')
    }

    console.log('Attempting to create listing:', itemData)

    const { error } = await supabase.from('items').insert(itemData)

    if (error) {
        console.error('Error creating listing:', error)
        return { message: error.message } // Standardize error return
    }

    revalidatePath('/')
    revalidatePath(`/${itemData.category}`)
    redirect(`/${itemData.category}`)
}
