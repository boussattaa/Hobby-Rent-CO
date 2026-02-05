'use server';

import { createClient } from '@/utils/supabase/server';
import { revalidatePath } from 'next/cache';

export async function verifyUser(userId) {
    const supabase = await createClient();

    // Check if current user is admin (optional, for now assumed protected by route or middleware)

    const { error } = await supabase
        .from('profiles')
        .update({ id_verified_status: 'verified' })
        .eq('id', userId);

    if (error) throw new Error(error.message);

    // Send Notification (Optional enhancement for later: Notify user their ID is verified)

    revalidatePath('/admin');
    return { success: true };
}

export async function rejectUser(userId) {
    const supabase = await createClient();

    const { error } = await supabase
        .from('profiles')
        .update({ id_verified_status: 'rejected' })
        .eq('id', userId);

    if (error) throw new Error(error.message);

    revalidatePath('/admin');
    return { success: true };
}
