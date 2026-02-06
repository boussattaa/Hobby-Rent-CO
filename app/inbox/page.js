import { createClient } from '@/utils/supabase/server';
import { redirect } from 'next/navigation';
import InboxClient from './InboxClient';

export default async function InboxPage() {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
        redirect('/login');
    }

    // Fetch conversations (unique sender/receiver pairs)
    // This is tricky in SQL. A simpler way for MVP:
    // Fetch all messages where user is sender OR receiver
    // Then client-side group by the "other" person.

    const { data: rawMessages } = await supabase
        .from('messages')
        .select('*')
        .or(`sender_id.eq.${user.id},receiver_id.eq.${user.id}`)
        .order('created_at', { ascending: false });

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
        const userIds = new Set();
        validMessages.forEach(msg => {
            userIds.add(msg.sender_id);
            userIds.add(msg.receiver_id);
        });

        const { data: profiles } = await supabase
            .from('profiles')
            .select('id, email, first_name')
            .in('id', [...userIds]);

        const profileMap = new Map(profiles?.map(p => [p.id, p]) || []);

        messages = validMessages.map(msg => ({
            ...msg,
            sender: profileMap.get(msg.sender_id) || { email: 'Unknown', first_name: 'User' },
            receiver: profileMap.get(msg.receiver_id) || { email: 'Unknown', first_name: 'User' }
        }));
    }

    return (
        <div className="container" style={{ padding: '8rem 2rem 4rem' }}>
            <h1>Inbox</h1>
            <InboxClient currentUser={user} messages={messages || []} />
        </div>
    );
}
