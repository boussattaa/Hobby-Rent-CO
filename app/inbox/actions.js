'use server';

import { createClient } from '@/utils/supabase/server';
import { revalidatePath } from 'next/cache';

export async function deleteConversation(otherUserId) {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) return { success: false, message: 'Not authenticated' };

    try {
        // Soft delete messages where I am the sender
        await supabase
            .from('messages')
            .update({ deleted_by_sender: true })
            .eq('sender_id', user.id)
            .eq('receiver_id', otherUserId);

        // Soft delete messages where I am the receiver
        await supabase
            .from('messages')
            .update({ deleted_by_receiver: true })
            .eq('receiver_id', user.id)
            .eq('sender_id', otherUserId);

        revalidatePath('/inbox');
        return { success: true };
    } catch (error) {
        console.error('Error deleting conversation:', error);
        return { success: false, message: error.message };
    }
}
