'use server';

import { createClient as createAdminClient } from '@supabase/supabase-js';
import { createClient } from '@/utils/supabase/server';
import { revalidatePath } from 'next/cache';

export async function deleteConversation(otherUserId) {
    const supabase = await createClient(); // For Auth only
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) return { success: false, message: 'Not authenticated' };

    // Use Admin Client to bypass RLS for "soft delete" updates on rows we don't own
    const supabaseAdmin = createAdminClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL,
        process.env.SUPABASE_SERVICE_ROLE_KEY
    );

    try {
        // Soft delete messages where I am the sender
        const { error: senderError } = await supabaseAdmin
            .from('messages')
            .update({ deleted_by_sender: true })
            .eq('sender_id', user.id)
            .eq('receiver_id', otherUserId);

        if (senderError) throw senderError;

        // Soft delete messages where I am the receiver
        const { error: receiverError } = await supabaseAdmin
            .from('messages')
            .update({ deleted_by_receiver: true })
            .eq('receiver_id', user.id)
            .eq('sender_id', otherUserId);

        if (receiverError) throw receiverError;

        revalidatePath('/inbox');
        return { success: true };
    } catch (error) {
        console.error('Error deleting conversation:', error);
        return { success: false, message: error.message };
    }
}

export async function markMessagesAsRead(senderId) {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) return;

    try {
        await supabase
            .from('messages')
            .update({ is_read: true })
            .eq('sender_id', senderId)
            .eq('receiver_id', user.id)
            .eq('is_read', false);

        revalidatePath('/inbox');
        revalidatePath('/dashboard');
    } catch (error) {
        console.error('Error marking messages as read:', error);
    }
}
