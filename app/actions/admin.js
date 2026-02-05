'use server';

import { createClient } from '@/utils/supabase/server';
import { revalidatePath } from 'next/cache';

export async function verifyUser(userId) {
    const supabase = await createClient();

    const { error } = await supabase
        .from('profiles')
        .update({
            id_verified_status: 'verified',
            is_verified: true
        })
        .eq('id', userId);

    if (error) throw new Error(error.message);

    revalidatePath('/admin');
    return { success: true };
}

export async function rejectUser(userId) {
    const supabase = await createClient();

    const { error } = await supabase
        .from('profiles')
        .update({
            id_verified_status: 'rejected',
            is_verified: false
        })
        .eq('id', userId);

    if (error) throw new Error(error.message);

    revalidatePath('/admin');
    return { success: true };
}
