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

    const { data: messages } = await supabase
        .from('messages')
        .select('*, sender:sender_id(email), receiver:receiver_id(email)')
        .or(`sender_id.eq.${user.id},receiver_id.eq.${user.id}`)
        .order('created_at', { ascending: false });

    return (
        <div className="container" style={{ padding: '8rem 2rem 4rem' }}>
            <h1>Inbox</h1>
            <InboxClient currentUser={user} messages={messages || []} />
        </div>
    );
}
