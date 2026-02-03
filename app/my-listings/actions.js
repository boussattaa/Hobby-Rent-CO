'use server';

import { createClient } from '@/utils/supabase/server';
import { revalidatePath } from 'next/cache';

export async function deleteItem(itemId) {
    const supabase = await createClient();

    // Check Auth
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
        return { error: 'Unauthorized' };
    }

    // Delete (RLS will ensure owner checks, but we can also double check if we fetch first, 
    // but relying on RLS is standard. We trust the policy I will provide to the user.)
    const { error } = await supabase
        .from('items')
        .delete()
        .eq('id', itemId);

    if (error) {
        console.error('Error deleting item:', error);
        return { error: error.message };
    }

    revalidatePath('/my-listings');
    revalidatePath('/offroad');
    revalidatePath('/trailers');
    revalidatePath('/water');
    revalidatePath('/housing');
    revalidatePath('/');

    return { success: true };
}
