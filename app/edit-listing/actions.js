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
        name: formData.get('name'),
        category: formData.get('category'),
        subcategory: formData.get('subcategory'),
        price: formData.get('price'),
        description: formData.get('description'),
        location: locationStr,
        lat: coords ? coords.lat : null,
        lng: coords ? coords.lng : null,
        image_url: formData.get('image_url'),
        // owner_id is not updated
    };

    // Validate owner (optional but good practice, RLS also handles this)
    // But we need to use RLS policy for UPDATE "Users can update their own items"

    const { error } = await supabase
        .from('items')
        .update(itemData)
        .eq('id', itemId)
        .eq('owner_id', user.id); // Double check ownership

    if (error) {
        console.error('Error updating listing:', error);
        return { message: 'Failed to update listing: ' + error.message };
    }

    revalidatePath(`/item/${itemId}`);
    revalidatePath('/my-listings');
    revalidatePath('/offroad');
    // Redirect back to My Listings or Item Page
    redirect('/my-listings');
}
