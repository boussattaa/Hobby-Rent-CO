'use client';

import { useState, useEffect, useRef } from 'react';
import { createClient } from '@/utils/supabase/client';

import { sendNewMessageEmail } from '@/app/actions/email';

export default function ChatWindow({ currentUser, receiverId, receiverName, receiverEmail, rentalId, isOpen, onClose }) {
    const [messages, setMessages] = useState([]);
    const [newMessage, setNewMessage] = useState('');
    const [loading, setLoading] = useState(true);
    const supabase = createClient();
    const messagesEndRef = useRef(null);

    useEffect(() => {
        if (!isOpen || !currentUser || !receiverId) return;

        const fetchMessages = async () => {
            setLoading(true);
            const { data, error } = await supabase
                .from('messages')
                .select('*')
                .or(`and(sender_id.eq.${currentUser.id},receiver_id.eq.${receiverId}),and(sender_id.eq.${receiverId},receiver_id.eq.${currentUser.id})`)
                .order('created_at', { ascending: true });

            if (error) console.error('Error fetching messages:', error);
            else setMessages(data || []);
            setLoading(false);
        };

        fetchMessages();

        // Subscribe to new messages
        const channel = supabase
            .channel('chat_room')
            .on('postgres_changes', {
                event: 'INSERT',
                schema: 'public',
                table: 'messages',
                filter: `receiver_id=eq.${currentUser.id}`
            }, (payload) => {
                if (payload.new.sender_id === receiverId) {
                    setMessages(prev => [...prev, payload.new]);
                }
            })
            .on('postgres_changes', {
                event: 'INSERT',
                schema: 'public',
                table: 'messages',
                filter: `sender_id=eq.${currentUser.id}`
            }, (payload) => {
                // Optimistically added already, but good to confirm or sync
                // Simplest is to just ignore own echos if we add them locally
            })
            .subscribe();

        return () => {
            supabase.removeChannel(channel);
        };
    }, [isOpen, currentUser, receiverId, supabase]);

    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages, isOpen]);

    const handleSend = async (e) => {
        e.preventDefault();
        if (!newMessage.trim() || !currentUser) return;

        // Logic to determine rental_id: Prop > Last Message Context > Null
        let effectiveRentalId = rentalId;
        if (!effectiveRentalId && messages.length > 0) {
            // Find the last message that had a rental_id
            const lastContextMsg = [...messages].reverse().find(m => m.rental_id);
            if (lastContextMsg) effectiveRentalId = lastContextMsg.rental_id;
        }

        const msg = {
            sender_id: currentUser.id,
            receiver_id: receiverId,
            rental_id: effectiveRentalId || null,
            content: newMessage.trim(),
        };

        // Optimistic UI update
        setMessages(prev => [...prev, { ...msg, created_at: new Date().toISOString(), id: 'temp-' + Date.now() }]);
        setNewMessage('');

        const { data, error } = await supabase.from('messages').insert(msg).select().single();

        if (error) {
            console.error('Error sending message:', error);
            // Remove failed message or show error (logic omitted for brevity)
        } else {
            // Replace temp message with real one if needed, or rely on fetch
            setMessages(prev => prev.map(m => m.id.startsWith('temp-') && m.content === msg.content ? data : m));

            // Send Email Notification
            if (receiverEmail) {
                sendNewMessageEmail({
                    to: receiverEmail,
                    senderName: currentUser.user_metadata?.first_name || currentUser.email,
                    messagePreview: newMessage.trim(),
                    link: `${window.location.origin}/inbox`
                });
            }
        }
    };

    if (!isOpen) return null;

    return (
        <div className="chat-window">
            <div className="chat-header">
                <div className="user-info">
                    <div className="avatar">{receiverName?.[0]?.toUpperCase() || 'U'}</div>
                    <span>{receiverName || 'Chat'}</span>
                </div>
                <button onClick={onClose} className="close-btn">✕</button>
            </div>

            <div className="messages-area">
                {loading ? (
                    <div className="loading-state">Loading history...</div>
                ) : messages.length === 0 ? (
                    <div className="empty-state">Say hello! 👋</div>
                ) : (
                    messages.map((msg, i) => {
                        const isMe = msg.sender_id === currentUser?.id;
                        return (
                            <div key={msg.id || i} className={`message-bubble ${isMe ? 'sent' : 'received'}`}>
                                {msg.content}
                            </div>
                        );
                    })
                )}
                <div ref={messagesEndRef} />
            </div>

            <form onSubmit={handleSend} className="input-area">
                <input
                    type="text"
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    placeholder="Type a message..."
                    autoFocus
                />
                <button type="submit" disabled={!newMessage.trim()}>Send</button>
            </form>

            <style jsx>{`
        .chat-window {
            position: fixed;
            bottom: 20px;
            right: 20px;
            width: 350px;
            height: 500px;
            background: white;
            border-radius: 12px;
            box-shadow: 0 5px 20px rgba(0,0,0,0.15);
            display: flex;
            flex-direction: column;
            overflow: hidden;
            z-index: 10000;
            border: 1px solid var(--border-color);
        }
        
        .chat-header {
            padding: 1rem;
            background: var(--primary-color);
            color: white;
            display: flex;
            justify-content: space-between;
            align-items: center;
        }
        
        .user-info { display: flex; align-items: center; gap: 0.5rem; font-weight: 600; }
        .avatar { width: 32px; height: 32px; background: rgba(255,255,255,0.2); border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 0.9rem; }
        .close-btn { background: none; border: none; color: white; cursor: pointer; font-size: 1.2rem; }
        
        .messages-area {
            flex: 1;
            padding: 1rem;
            overflow-y: auto;
            background: #f8fafc;
            display: flex;
            flex-direction: column;
            gap: 0.5rem;
        }
        
        .message-bubble {
            max-width: 80%;
            padding: 0.75rem 1rem;
            border-radius: 12px;
            font-size: 0.95rem;
            line-height: 1.4;
        }
        
        .message-bubble.sent {
            align-self: flex-end;
            background: var(--primary-color);
            color: white;
            border-bottom-right-radius: 2px;
        }
        
        .message-bubble.received {
            align-self: flex-start;
            background: white;
            border: 1px solid var(--border-color);
            color: var(--text-primary);
            border-bottom-left-radius: 2px;
        }
        
        .empty-state, .loading-state { text-align: center; color: var(--text-secondary); margin-top: 2rem; }
        
        .input-area {
            padding: 1rem;
            background: white;
            border-top: 1px solid var(--border-color);
            display: flex;
            gap: 0.5rem;
        }
        
        .input-area input {
            flex: 1;
            padding: 0.75rem;
            border: 1px solid var(--border-color);
            border-radius: 24px;
            outline: none;
        }
        .input-area input:focus { border-color: var(--primary-color); }
        
        .input-area button {
            background: var(--primary-color);
            color: white;
            border: none;
            padding: 0 1.25rem;
            border-radius: 24px;
            font-weight: 600;
            cursor: pointer;
        }
        .input-area button:disabled { opacity: 0.5; cursor: default; }

        @media(max-width: 600px) {
            .chat-window {
                top: 0; left: 0; right: 0; bottom: 0;
                width: 100%; height: 100%;
                border-radius: 0;
            }
        }
      `}</style>
        </div>
    );
}
