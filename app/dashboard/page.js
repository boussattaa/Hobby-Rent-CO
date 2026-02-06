
import { createClient } from '@/utils/supabase/server';
import { redirect } from 'next/navigation';
import DashboardClient from './DashboardClient';

export const dynamic = 'force-dynamic';

export default async function DashboardPage() {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
        redirect('/login?message=Please log in to view your dashboard');
    }

    // 1. Fetch Rentals first
    const { data: rentalsData, error: rentalsError } = await supabase
        .from('rentals')
        .select('*')
        .eq('owner_id', user.id)
        .order('created_at', { ascending: false });

    if (rentalsError) {
        console.error("Error fetching rentals:", JSON.stringify(rentalsError, null, 2));
        return <div className="container">Error loading rentals</div>;
    }

    // 2. Manual Join if rentals exist
    let enrichedRentals = [];
    if (rentalsData && rentalsData.length > 0) {
        // Fetch Items
        const itemIds = [...new Set(rentalsData.map(r => r.item_id))];
        const { data: items } = await supabase.from('items').select('id, name, image_url, instant_book').in('id', itemIds);
        const itemsMap = new Map(items?.map(i => [i.id, i]) || []);

        // Fetch Renters
        const renterIds = [...new Set(rentalsData.map(r => r.renter_id))];
        const { data: renters } = await supabase.from('profiles').select('id, first_name, email, is_verified').in('id', renterIds);
        const rentersMap = new Map(renters?.map(u => [u.id, u]) || []);

        enrichedRentals = rentalsData.map(r => ({
            ...r,
            items: itemsMap.get(r.item_id),
            renter: rentersMap.get(r.renter_id)
        }));
    }

    // 3. Fetch Messages where user is participant
    const { data: rawMessages, error: messagesError } = await supabase
        .from('messages')
        .select(`
            *,
            rentals(
                id,
                items(id, name, image_url)
            )
        `)
        .or(`sender_id.eq.${user.id},receiver_id.eq.${user.id}`)
        .order('created_at', { ascending: false });

    if (messagesError) {
        console.error("Dashboard Messages Error:", messagesError);
    }

    // Filter out deleted messages
    const validMessages = rawMessages?.filter(msg => {
        const isSender = msg.sender_id === user.id;
        const isReceiver = msg.receiver_id === user.id;
        if (isSender && msg.deleted_by_sender) return false;
        if (isReceiver && msg.deleted_by_receiver) return false;
        return true;
    }) || [];

    let messages = [];
    if (validMessages.length > 0) {
        // Manual join for Senders/Receivers (Profiles)
        const userIds = [...new Set([
            ...validMessages.map(m => m.sender_id),
            ...validMessages.map(m => m.receiver_id)
        ])];

        const { data: profiles } = await supabase
            .from('profiles')
            .select('id, email, first_name')
            .in('id', userIds);

        const profileMap = new Map(profiles?.map(s => [s.id, s]) || []);

        messages = validMessages.map(msg => ({
            ...msg,
            sender: profileMap.get(msg.sender_id) || { email: 'Unknown', first_name: 'User' },
            receiver: profileMap.get(msg.receiver_id) || { email: 'Unknown', first_name: 'User' }
        }));
    }

    return (
        <DashboardClient
            rentals={enrichedRentals}
            messages={messages || []}
            user={user}
        />
    );
}
