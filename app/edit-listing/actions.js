'use server';

import { createClient } from '@/utils/supabase/server';
import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';

import { geocodeLocation } from '@/utils/geocoding';

export async function updateListing(formData) {
    const supabase = await createClient();

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
        return { message: 'You must be logged in to edit a listing.' };
    }

    const itemId = formData.get('itemId');
    const locationStr = formData.get('location');
    const coords = await geocodeLocation(locationStr);

    const itemData = {
        name: `${formData.get('year')} ${formData.get('make')} ${formData.get('model')}`.trim(), // Auto-generate name on update too
        category: formData.get('category'),
        subcategory: formData.get('subcategory'),
        price: formData.get('price'),
        weekend_price: formData.get('weekend_price') ? parseFloat(formData.get('weekend_price')) : null,
        description: formData.get('description'),
        location: locationStr, // Zip code
        lat: coords ? coords.lat : null,
        lng: coords ? coords.lng : null,
        image_url: formData.get('image_url'),
        video_url: formData.get('video_url'),
        // New SEO Fields
        year: formData.get('year') ? parseInt(formData.get('year')) : null,
        make: formData.get('make'),
        model: formData.get('model'),
        rules: formData.get('rules'),
        features: formData.get('features') ? formData.get('features').split(',').map(s => s.trim()).filter(Boolean) : [],
    };

    // Specs
    const publicSpecs = {};
    if (formData.get('specs')) {
        try {
            Object.assign(publicSpecs, JSON.parse(formData.get('specs')));
            itemData.specs = publicSpecs;
        } catch (e) {
            console.error("Failed to parse specs", e);
        }
    }

    const { error } = await supabase
        .from('items')
        .update(itemData)
        .eq('id', itemId)
        .eq('owner_id', user.id);

    if (error) {
        console.error('Error updating listing:', error);
        return { message: 'Failed to update listing: ' + error.message };
    }

    // Update Private Details
    // Upsert is best here since older items might not have a private details row yet.
    const privateData = {
        item_id: itemId,
        vin: formData.get('vin'),
        license_plate: formData.get('license_plate'),
        maintenance_notes: formData.get('maintenance_notes'),
        insurance_policy: formData.get('insurance_policy'),
        storage_address: formData.get('storage_address'),
        emergency_contact: formData.get('emergency_contact')
    };

    // We assume the user owns the item because of the check above (and RLS on private table checks owner_id of item via join, but upsert might be tricky if we don't have the id of the private row).
    // Actually, our RLS policy says "Owners can insert/update if they own the item".
    // So we can try to Upsert matching on item_id if we made item_id unique or just Insert if not exists?
    // The table definition: `id UUID DEFAULT gen_random_uuid() PRIMARY KEY, item_id UUID REFERENCES items(id)...`
    // We didn't make item_id UNIQUE in the migration (my bad, but usually 1:1). 
    // Let's first check if it exists, or just use update/insert logic.
    // Simpler: Delete old (if any) and Insert new? Or Select then Update/Insert.

    // Better: Try to update first.
    const { data: existingPrivate } = await supabase.from('item_private_details').select('id').eq('item_id', itemId).single();

    let privateError;
    if (existingPrivate) {
        const { error: updErr } = await supabase.from('item_private_details').update(privateData).eq('id', existingPrivate.id);
        privateError = updErr;
    } else {
        const { error: insErr } = await supabase.from('item_private_details').insert(privateData);
        privateError = insErr;
    }

    if (privateError) {
        console.error('Error updating private details:', privateError);
        // Don't block redirect, but log it.
    }

    revalidatePath(`/item/${itemId}`);
    revalidatePath('/my-listings');
    revalidatePath('/offroad');
    redirect('/my-listings');
}
