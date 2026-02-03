
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

    const locationStr = formData.get('location'); // Now likely a zip code
    const coords = await geocodeLocation(locationStr);

    const publicSpecs = {};
    if (formData.get('specs')) {
        try {
            const rawSpecs = JSON.parse(formData.get('specs'));
            Object.assign(publicSpecs, rawSpecs);
        } catch (e) {
            console.error("Failed to parse specs", e);
        }
    }

    const year = formData.get('year');
    const make = formData.get('make');
    const model = formData.get('model');
    // Auto-generate name
    const generatedName = `${year} ${make} ${model}`.trim();

    const itemData = {
        owner_id: user.id,
        name: generatedName, // Using generated name
        category: formData.get('category'),
        subcategory: formData.get('subcategory'),
        price: parseFloat(formData.get('price')),
        weekend_price: formData.get('weekend_price') ? parseFloat(formData.get('weekend_price')) : null,
        location: locationStr,
        lat: coords ? coords.lat : null,
        lng: coords ? coords.lng : null,
        description: formData.get('description'),
        image_url: formData.get('image_url') || '/images/dirt-hero.png',
        additional_images: JSON.parse(formData.get('additional_images') || '[]'),
        video_url: formData.get('video_url'),
        // New SEO Fields
        year: year ? parseInt(year) : null,
        make: make,
        model: model,
        rules: formData.get('rules'),
        features: formData.get('features') ? formData.get('features').split(',').map(s => s.trim()).filter(Boolean) : [],
        specs: publicSpecs,
    }

    console.log('Attempting to create listing:', itemData)

    const { data: insertedItem, error } = await supabase.from('items').insert(itemData).select().single()

    if (error) {
        console.error('Error creating listing:', error)
        return { message: error.message }
    }

    // Insert Private Details if item creation succeeded
    if (insertedItem) {
        const privateData = {
            item_id: insertedItem.id,
            vin: formData.get('vin'),
            license_plate: formData.get('license_plate'),
            maintenance_notes: formData.get('maintenance_notes'),
            // Removed purchase info as requested
            insurance_policy: formData.get('insurance_policy'),
            storage_address: formData.get('storage_address'),
            emergency_contact: formData.get('emergency_contact')
        };

        const { error: privateError } = await supabase.from('item_private_details').insert(privateData);
        if (privateError) {
            console.error('Error saving private details:', privateError);
            // We generally don't fail the whole listing if private details fail, 
            // but we should probably log it or alert user. 
            // For now, allow flow to continue as the item is live.
        }
    }

    revalidatePath('/')
    revalidatePath(`/${itemData.category}`)
    redirect(`/${itemData.category}`)
}
