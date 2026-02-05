'use client';

import { useState, useEffect } from 'react';
import { createClient } from '@/utils/supabase/client';
import ChatWindow from '@/components/ChatWindow';

export default function InboxClient({ currentUser, messages: initialMessages }) {
    const [messages, setMessages] = useState(initialMessages);
    const [selectedChat, setSelectedChat] = useState(null);
    const supabase = createClient();

    useEffect(() => {
        setMessages(initialMessages);
    }, [initialMessages]);

    useEffect(() => {
        const channel = supabase
            .channel('inbox_realtime')
            .on('postgres_changes', {
                event: 'INSERT',
                schema: 'public',
                table: 'messages',
                filter: `receiver_id=eq.${currentUser.id}`
            }, async (payload) => {
                // Fetch full message
                const { data: message, error } = await supabase
                    .from('messages')
                    .select('*')
                    .eq('id', payload.new.id)
                    .single();

                if (message) {
                    // Fetch sender/receiver manually
                    const { data: sender } = await supabase.from('profiles').select('email, first_name').eq('id', message.sender_id).single();
                    const { data: receiver } = await supabase.from('profiles').select('email, first_name').eq('id', message.receiver_id).single();

                    const enrichedMessage = {
                        ...message,
                        sender: sender || { email: 'Unknown' },
                        receiver: receiver || { email: 'Unknown' }
                    };

                    setMessages(prev => [enrichedMessage, ...prev]);
                }
            })
            .subscribe();

        return () => {
            supabase.removeChannel(channel);
        };
    }, [currentUser.id, supabase]);

    // Group messages by the "other" person
    const conversations = {};
    messages.forEach(msg => {
        const otherId = msg.sender_id === currentUser.id ? msg.receiver_id : msg.sender_id;
        const otherEmail = msg.sender_id === currentUser.id ? msg.receiver?.email : msg.sender?.email;

        if (!conversations[otherId]) {
            conversations[otherId] = {
                userId: otherId,
                email: otherEmail || 'Unknown User',
                lastMessage: msg,
                unreadCount: 0
            };
        }
        // Since messages are ordered by date desc, the first one we see is the latest
        // (if the query was ordered correct, which it was)

        // Count unread (only if I am receiver)
        if (msg.receiver_id === currentUser.id && !msg.is_read) {
            conversations[otherId].unreadCount++;
        }
    });

    const conversationList = Object.values(conversations).sort((a, b) =>
        new Date(b.lastMessage.created_at) - new Date(a.lastMessage.created_at)
    );

    return (
        <div className="inbox-container">
            {conversationList.length === 0 ? (
                <div className="empty-state">
                    <p>No messages yet.</p>
                </div>
            ) : (
                <div className="conversation-list">
                    {conversationList.map(convo => (
                        <div key={convo.userId} className="convo-card" onClick={() => setSelectedChat(convo)}>
                            <div className="avatar">{convo.email[0].toUpperCase()}</div>
                            <div className="convo-details">
                                <div className="convo-header">
                                    <h3>{convo.email}</h3>
                                    <span className="date">{new Date(convo.lastMessage.created_at).toLocaleDateString()}</span>
                                </div>
                                <p className="last-message">
                                    {convo.lastMessage.sender_id === currentUser.id && 'You: '}
                                    {convo.lastMessage.content}
                                </p>
                            </div>
                            {convo.unreadCount > 0 && <span className="unread-badge">{convo.unreadCount}</span>}
                        </div>
                    ))}
                </div>
            )}

            <ChatWindow
                currentUser={currentUser}
                receiverId={selectedChat?.userId}
                receiverName={selectedChat?.email}
                receiverEmail={selectedChat?.email}
                isOpen={!!selectedChat}
                onClose={() => setSelectedChat(null)}
            />

            <style jsx>{`
                .inbox-container {
                    max-width: 800px;
                    margin: 0 auto;
                }
                .convo-card {
                    background: white;
                    padding: 1rem;
                    border-radius: 12px;
                    display: flex;
                    align-items: center;
                    gap: 1rem;
                    border: 1px solid var(--border-color);
                    margin-bottom: 1rem;
                    cursor: pointer;
                    transition: transform 0.2s;
                }
                .convo-card:hover {
                    transform: translateY(-2px);
                    box-shadow: 0 4px 12px rgba(0,0,0,0.05);
                }
                .avatar {
                    width: 48px;
                    height: 48px;
                    background: var(--primary-color);
                    color: white;
                    border-radius: 50%;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    font-size: 1.25rem;
                    font-weight: 600;
                    flex-shrink: 0;
                }
                .convo-details {
                    flex: 1;
                    min-width: 0;
                }
                .convo-header {
                    display: flex;
                    justify-content: space-between;
                    margin-bottom: 0.25rem;
                }
                .convo-header h3 {
                    font-size: 1rem;
                    margin: 0;
                }
                .date {
                    font-size: 0.8rem;
                    color: var(--text-secondary);
                }
                .last-message {
                    color: var(--text-secondary);
                    font-size: 0.9rem;
                    white-space: nowrap;
                    overflow: hidden;
                    text-overflow: ellipsis;
                }
                .unread-badge {
                    background: var(--accent-color);
                    color: white;
                    padding: 0.25rem 0.5rem;
                    border-radius: 99px;
                    font-size: 0.75rem;
                    font-weight: 600;
                }
                .empty-state {
                    text-align: center;
                    color: var(--text-secondary);
                    padding: 4rem;
                }
            `}</style>
        </div>
    );
}
