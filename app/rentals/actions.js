'use server';

import { createClient } from '@/utils/supabase/server';
import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';

export async function submitInspection(formData) {
    const supabase = await createClient();

    const rentalId = formData.get('rentalId');
    const type = formData.get('type'); // 'pickup' or 'dropoff'
    const notes = formData.get('notes');

    // In a real app, photos would be uploaded to storage first, and URLs passed here.
    // For this prototype, we'll assume the client uploads them and passes URLs as hidden fields
    // OR we handle file upload here if we want to complicate the action.
    // Let's rely on client-side upload (like we did for items) and passing URLs.

    // However, handling array of strings from FormData can be tricky if multiple inputs have same name.
    const photos = formData.getAll('photos');

    const updateData = {};
    if (type === 'pickup') {
        updateData.pickup_notes = notes;
        updateData.pickup_photos = photos;
        updateData.pickup_at = new Date().toISOString();
        updateData.status = 'active'; // Move to active on pickup
    } else {
        updateData.dropoff_notes = notes;
        updateData.dropoff_photos = photos;
        updateData.dropoff_at = new Date().toISOString();
        updateData.status = 'completed'; // Move to completed on dropoff
    }

    const { error } = await supabase
        .from('rentals')
        .update(updateData)
        .eq('id', rentalId);

    if (error) {
        return { message: error.message };
    }

    revalidatePath('/rentals');
    redirect('/rentals');
}
