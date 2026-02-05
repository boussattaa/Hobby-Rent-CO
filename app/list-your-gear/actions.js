
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

    const city = formData.get('city');
    const state = formData.get('state');
    const zip = formData.get('zip');
    let locationStr = formData.get('location'); // Old field backup

    // Geocoding Strategy:
    // 1. Use Private Storage Address if available (Highest Priority for Accuracy)
    // 2. Fallback to City/State/Zip
    const privateAddress = formData.get('storage_address');

    let publicLocationStr = "Unknown Location";
    if (city && state && zip) {
        publicLocationStr = `${city}, ${state} ${zip}`;
    } else if (zip) {
        publicLocationStr = zip;
    }

    // Geocode the best address we have
    // If we have a private address, use it for the pin source
    const geocodeTarget = privateAddress || publicLocationStr;
    const coords = await geocodeLocation(geocodeTarget);

    let itemsLat = null;
    let itemsLng = null;
    let storageLat = null;
    let storageLng = null;

    if (coords) {
        // Store EXACT coords for private record
        storageLat = coords.lat;
        storageLng = coords.lng;

        // Calculate Jittered coords for public record
        // Random offset ~3-5 miles
        const jitter = () => (Math.random() - 0.5) * 0.12;
        itemsLat = coords.lat + jitter();
        itemsLng = coords.lng + jitter();
    }

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


    // Core fields
    const itemData = {
        owner_id: user.id,
        name: generatedName,
        category: formData.get('category'),
        subcategory: formData.get('subcategory'),
        // Pricing
        price_type: formData.get('price_type') || 'daily',
        price: formData.get('price') ? parseFloat(formData.get('price')) : null,
        weekend_price: formData.get('weekend_price') ? parseFloat(formData.get('weekend_price')) : null,
        hourly_rate: formData.get('hourly_rate') ? parseFloat(formData.get('hourly_rate')) : null,
        min_duration: formData.get('min_duration') ? parseInt(formData.get('min_duration')) : 4,

        location: publicLocationStr, // Public generic text
        lat: itemsLat,               // Randomly offset pin
        lng: itemsLng,               // Randomly offset pin
        description: formData.get('description'),
        image_url: formData.get('image_url') || '/images/dirt-hero.png',
        video_url: formData.get('video_url'),
        instant_book: formData.get('instant_book') === 'on',
    }

    // Fix for price NOT NULL constraint if Hourly
    if (itemData.price_type === 'hourly' && !itemData.price) {
        itemData.price = 0; // Placeholder
    }

    // Safely add new schema fields ONLY if they are populated
    // This prevents "column not found" errors if the DB migration hasn't run yet

    // TEMPORARY FIX: Commented out to unblock listing while DB migration is fixed
    // Additional Images
    const additionalImgs = JSON.parse(formData.get('additional_images') || '[]');
    if (additionalImgs.length > 0) itemData.additional_images = additionalImgs;

    // SEO / Enhanced Details
    if (year) itemData.year = parseInt(year);
    if (make) itemData.make = make;
    if (model) itemData.model = model;
    if (formData.get('rules')) itemData.rules = formData.get('rules');

    const featuresList = formData.get('features') ? formData.get('features').split(',').map(s => s.trim()).filter(Boolean) : [];
    if (featuresList.length > 0) itemData.features = featuresList;

    if (Object.keys(publicSpecs).length > 0) itemData.specs = publicSpecs;

    // Remove video_url if empty string to be safe (though it was likely in core schema before?)
    // Checking earlier migration: 20240523_add_video_url.sql exists. Assuming it might be missing too.
    if (!itemData.video_url) delete itemData.video_url;

    console.log('Attempting to create listing with data:', itemData)

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
            // Save Exact Coordinates here
            storage_lat: storageLat,
            storage_lng: storageLng,
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
