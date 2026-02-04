'use server';

import { createClient } from '@/utils/supabase/server';
import { revalidatePath } from 'next/cache';

export async function approveRental(rentalId) {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) throw new Error('Unauthorized');

    // Verify ownership
    const { data: rental } = await supabase
        .from('rentals')
        .select('owner_id')
        .eq('id', rentalId)
        .single();

    if (!rental || rental.owner_id !== user.id) {
        throw new Error('Unauthorized');
    }

    const { error } = await supabase
        .from('rentals')
        .update({ status: 'awaiting_payment' })
        .eq('id', rentalId);

    if (error) throw error;
    revalidatePath('/dashboard');
    revalidatePath(`/rentals/${rentalId}`);
}

export async function rejectRental(rentalId) {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) throw new Error('Unauthorized');

    // Verify ownership
    const { data: rental } = await supabase
        .from('rentals')
        .select('owner_id')
        .eq('id', rentalId)
        .single();

    if (!rental || rental.owner_id !== user.id) {
        throw new Error('Unauthorized');
    }

    const { error } = await supabase
        .from('rentals')
        .update({ status: 'cancelled' })
        .eq('id', rentalId);

    if (error) throw error;
    revalidatePath('/dashboard');
    revalidatePath(`/rentals/${rentalId}`);
}
