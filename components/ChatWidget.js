'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';

export default function ChatWidget() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([
    {
      role: 'assistant',
      content: "👋 Hi there! I'm **GearBuddy**, your HobbyRent AI assistant. Ask me anything!\n\nI can help you:\n- 🔍 Search for trailer, water, tools, or offroad rentals\n- 💰 Estimate how much you can earn listing your own gear\n- 🛡️ Understand our verification and security process"
    }
  ]);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showNotification, setShowNotification] = useState(false);
  
  const messagesEndRef = useRef(null);

  // Suggestions for user
  const suggestions = [
    { text: 'Search for dump trailers', query: 'Search for dump trailers' },
    { text: 'How much can I earn renting my Jet Ski?', query: 'How much can I earn renting out my Jet Ski?' },
    { text: 'How does verification work?', query: 'How does verification work?' },
    { text: 'Contact support', query: 'I would like to contact support/submit a lead' }
  ];

  // Load chat history from sessionStorage
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const savedMessages = sessionStorage.getItem('gearbuddy_chat_history');
      const savedOpenState = sessionStorage.getItem('gearbuddy_chat_open');
      const hasSeenWelcome = localStorage.getItem('gearbuddy_seen_welcome');

      if (savedMessages) {
        setMessages(JSON.parse(savedMessages));
      }
      if (savedOpenState === 'true') {
        setIsOpen(true);
      } else if (!hasSeenWelcome) {
        // Show notification dot/pulse if they have never opened it
        setShowNotification(true);
      }
    }
  }, []);

  // Save messages to sessionStorage
  useEffect(() => {
    if (typeof window !== 'undefined') {
      sessionStorage.setItem('gearbuddy_chat_history', JSON.stringify(messages));
    }
  }, [messages]);

  // Scroll to bottom
  useEffect(() => {
    if (isOpen) {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, isOpen, isLoading]);

  const handleToggle = () => {
    const nextState = !isOpen;
    setIsOpen(nextState);
    if (typeof window !== 'undefined') {
      sessionStorage.setItem('gearbuddy_chat_open', String(nextState));
    }
    if (nextState) {
      setShowNotification(false);
      localStorage.setItem('gearbuddy_seen_welcome', 'true');
    }
  };

  const handleSend = async (textToSend) => {
    const text = textToSend || inputValue;
    if (!text.trim() || isLoading) return;

    const userMessage = { role: 'user', content: text };
    setMessages((prev) => [...prev, userMessage]);
    setInputValue('');
    setIsLoading(true);

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: [...messages, userMessage].map(m => ({ role: m.role, content: m.content }))
        })
      });

      if (!response.ok) {
        throw new Error('Failed to communicate with GearBuddy');
      }

      const data = await response.json();
      if (data.error) {
        throw new Error(data.error);
      }

      if (data.message) {
        setMessages((prev) => [...prev, data.message]);
      } else {
        setMessages((prev) => [
          ...prev,
          { role: 'assistant', content: "I'm sorry, I couldn't process that response. Please try again." }
        ]);
      }
    } catch (error) {
      console.error('Chat error:', error);
      setMessages((prev) => [
        ...prev,
        {
          role: 'assistant',
          content: `❌ **Error**: ${error.message || 'Something went wrong. Please make sure your server is running and configured correctly.'}`
        }
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') {
      handleSend();
    }
  };

  // Helper to safely convert simple Markdown tags to styled HTML
  const renderMessageContent = (content) => {
    if (!content) return '';

    // Escape HTML to prevent XSS
    let formatted = content
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;');

    // Format Bold (**text**)
    formatted = formatted.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');

    // Format Links ([text](url))
    formatted = formatted.replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2" class="chat-link">$1</a>');

    // Format Lists (lines starting with - or *)
    const lines = formatted.split('\n');
    let insideList = false;
    const processedLines = lines.map((line) => {
      const trimmed = line.trim();
      if (trimmed.startsWith('- ') || trimmed.startsWith('* ')) {
        const itemContent = trimmed.substring(2);
        if (!insideList) {
          insideList = true;
          return `<ul class="chat-list"><li class="chat-list-item">${itemContent}</li>`;
        }
        return `<li class="chat-list-item">${itemContent}</li>`;
      } else {
        if (insideList) {
          insideList = false;
          return `</ul>\n${line}`;
        }
        return line;
      }
    });

    if (insideList) {
      processedLines.push('</ul>');
    }

    formatted = processedLines.join('\n');

    // Convert newlines to breaks
    formatted = formatted.replace(/\n/g, '<br />');

    return (
      <div
        className="chat-markdown"
        dangerouslySetInnerHTML={{ __html: formatted }}
      />
    );
  };

  return (
    <div className="gearbuddy-container">
      {/* Floating Toggle Button */}
      <button
        onClick={handleToggle}
        className={`gearbuddy-toggle ${isOpen ? 'active' : ''}`}
        aria-label="Toggle GearBuddy Chat"
      >
        {isOpen ? (
          <span className="close-icon">✕</span>
        ) : (
          <span className="chat-icon">💬</span>
        )}
        {showNotification && !isOpen && <span className="notification-dot"></span>}
      </button>

      {/* Chat Window Panel */}
      <div className={`gearbuddy-panel ${isOpen ? 'open' : ''}`}>
        <div className="panel-header">
          <div className="header-info">
            <span className="avatar">🤖</span>
            <div>
              <h3>GearBuddy</h3>
              <p>HobbyRent AI Assistant</p>
            </div>
          </div>
          <button onClick={handleToggle} className="header-close-btn" aria-label="Close Chat">
            ✕
          </button>
        </div>

        <div className="panel-messages">
          {messages.map((msg, index) => (
            <div key={index} className={`message-row ${msg.role}`}>
              {msg.role === 'assistant' && <span className="msg-avatar">🤖</span>}
              <div className="msg-bubble">
                {renderMessageContent(msg.content)}
              </div>
            </div>
          ))}

          {isLoading && (
            <div className="message-row assistant">
              <span className="msg-avatar">🤖</span>
              <div className="msg-bubble loading-bubble">
                <span className="dot"></span>
                <span className="dot"></span>
                <span className="dot"></span>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Suggestion Chips */}
        {messages.length === 1 && !isLoading && (
          <div className="panel-suggestions">
            <p className="suggestion-label">Suggested Questions:</p>
            <div className="chips-container">
              {suggestions.map((sug, i) => (
                <button
                  key={i}
                  onClick={() => handleSend(sug.query)}
                  className="suggestion-chip"
                >
                  {sug.text}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Input Form */}
        <div className="panel-input-container">
          <input
            type="text"
            placeholder="Ask GearBuddy a question..."
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyDown={handleKeyDown}
            className="chat-input"
            disabled={isLoading}
          />
          <button
            onClick={() => handleSend()}
            disabled={!inputValue.trim() || isLoading}
            className="chat-send-btn"
            aria-label="Send Message"
          >
            ➔
          </button>
        </div>
      </div>

      <style jsx global>{`
        .gearbuddy-container {
          position: fixed;
          bottom: 24px;
          right: 24px;
          z-index: 9999;
          font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif;
        }

        .gearbuddy-toggle {
          width: 56px;
          height: 56px;
          border-radius: 28px;
          background: #1a1a1a;
          border: 1px solid #3b82f6;
          box-shadow: 0 4px 16px rgba(59, 130, 246, 0.3);
          color: #ffffff;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          transition: transform 0.2s ease, background-color 0.2s ease;
          position: relative;
        }

        .gearbuddy-toggle:hover {
          transform: scale(1.05);
          background: #262626;
        }

        .gearbuddy-toggle:active {
          transform: scale(0.95);
        }

        .chat-icon {
          font-size: 24px;
        }

        .close-icon {
          font-size: 20px;
          font-weight: bold;
        }

        .notification-dot {
          position: absolute;
          top: 0;
          right: 0;
          width: 14px;
          height: 14px;
          border-radius: 7px;
          background: #3b82f6;
          border: 2px solid #1a1a1a;
          animation: pulse 2.0s infinite;
        }

        @keyframes pulse {
          0% {
            transform: scale(0.95);
            box-shadow: 0 0 0 0 rgba(59, 130, 246, 0.7);
          }
          70% {
            transform: scale(1);
            box-shadow: 0 0 0 8px rgba(59, 130, 246, 0);
          }
          100% {
            transform: scale(0.95);
            box-shadow: 0 0 0 0 rgba(59, 130, 246, 0);
          }
        }

        .gearbuddy-panel {
          position: absolute;
          bottom: 72px;
          right: 0;
          width: 380px;
          height: 560px;
          background: #1a1a1a;
          border: 1px solid #262626;
          border-radius: 16px;
          box-shadow: 0 12px 36px rgba(0, 0, 0, 0.5);
          display: flex;
          flex-direction: column;
          overflow: hidden;
          opacity: 0;
          transform: translateY(20px) scale(0.95);
          pointer-events: none;
          transition: opacity 0.25s cubic-bezier(0.4, 0, 0.2, 1),
                      transform 0.25s cubic-bezier(0.4, 0, 0.2, 1);
        }

        .gearbuddy-panel.open {
          opacity: 1;
          transform: translateY(0) scale(1);
          pointer-events: all;
        }

        .panel-header {
          background: #121212;
          border-bottom: 1px solid #262626;
          padding: 14px 18px;
          display: flex;
          justify-content: space-between;
          align-items: center;
        }

        .header-info {
          display: flex;
          align-items: center;
          gap: 12px;
        }

        .avatar {
          width: 36px;
          height: 36px;
          border-radius: 18px;
          background: #262626;
          border: 1px solid #3b82f6;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 18px;
        }

        .header-info h3 {
          margin: 0;
          font-size: 15px;
          font-weight: 600;
          color: #ffffff;
        }

        .header-info p {
          margin: 0;
          font-size: 11px;
          color: #888888;
        }

        .header-close-btn {
          background: transparent;
          border: none;
          color: #888888;
          cursor: pointer;
          font-size: 16px;
          transition: color 0.15s ease;
        }

        .header-close-btn:hover {
          color: #ffffff;
        }

        .panel-messages {
          flex: 1;
          padding: 16px;
          overflow-y: auto;
          display: flex;
          flex-direction: column;
          gap: 16px;
          background: #151515;
        }

        .message-row {
          display: flex;
          gap: 8px;
          max-width: 85%;
        }

        .message-row.assistant {
          align-self: flex-start;
        }

        .message-row.user {
          align-self: flex-end;
          flex-direction: row-reverse;
          max-width: 80%;
        }

        .msg-avatar {
          width: 28px;
          height: 28px;
          border-radius: 14px;
          background: #262626;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 12px;
          flex-shrink: 0;
          margin-top: 4px;
        }

        .msg-bubble {
          padding: 10px 14px;
          border-radius: 12px;
          font-size: 14px;
          line-height: 1.45;
          color: #e5e5e5;
        }

        .message-row.assistant .msg-bubble {
          background: #222222;
          border-top-left-radius: 2px;
          border: 1px solid #2d2d2d;
        }

        .message-row.user .msg-bubble {
          background: #3b82f6;
          color: #ffffff;
          border-top-right-radius: 2px;
        }

        .chat-markdown p {
          margin: 0 0 8px 0;
        }

        .chat-markdown p:last-child {
          margin-bottom: 0;
        }

        .chat-link {
          color: #3b82f6;
          text-decoration: underline;
          font-weight: 500;
        }

        .message-row.user .chat-link {
          color: #ffffff;
        }

        .chat-list {
          margin: 6px 0;
          padding-left: 18px;
        }

        .chat-list-item {
          margin-bottom: 4px;
        }

        .chat-list-item:last-child {
          margin-bottom: 0;
        }

        .loading-bubble {
          display: flex;
          align-items: center;
          gap: 4px;
          padding: 12px 16px;
        }

        .loading-bubble .dot {
          width: 6px;
          height: 6px;
          background: #888888;
          border-radius: 3px;
          animation: dot-pulse 1.4s infinite ease-in-out both;
        }

        .loading-bubble .dot:nth-child(1) {
          animation-delay: -0.32s;
        }

        .loading-bubble .dot:nth-child(2) {
          animation-delay: -0.16s;
        }

        @keyframes dot-pulse {
          0%, 80%, 100% {
            transform: scale(0);
          }
          40% {
            transform: scale(1);
          }
        }

        .panel-suggestions {
          padding: 8px 16px 12px;
          border-top: 1px solid #262626;
          background: #151515;
        }

        .suggestion-label {
          margin: 0 0 6px 0;
          font-size: 11px;
          color: #666;
          font-weight: 500;
        }

        .chips-container {
          display: flex;
          flex-wrap: wrap;
          gap: 6px;
        }

        .suggestion-chip {
          background: #222;
          border: 1px solid #333;
          color: #ccc;
          padding: 6px 10px;
          border-radius: 12px;
          font-size: 12px;
          cursor: pointer;
          transition: all 0.15s ease;
          text-align: left;
        }

        .suggestion-chip:hover {
          background: #333;
          border-color: #3b82f6;
          color: #ffffff;
        }

        .panel-input-container {
          padding: 14px 16px;
          background: #121212;
          border-top: 1px solid #262626;
          display: flex;
          gap: 8px;
        }

        .chat-input {
          flex: 1;
          background: #222222;
          border: 1px solid #333;
          border-radius: 20px;
          padding: 8px 16px;
          color: #ffffff;
          font-size: 14px;
          outline: none;
          transition: border-color 0.15s ease;
        }

        .chat-input:focus {
          border-color: #3b82f6;
        }

        .chat-input:disabled {
          opacity: 0.6;
        }

        .chat-send-btn {
          width: 36px;
          height: 36px;
          border-radius: 18px;
          background: #3b82f6;
          border: none;
          color: #ffffff;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 14px;
          transition: background-color 0.15s ease;
        }

        .chat-send-btn:hover {
          background: #2563eb;
        }

        .chat-send-btn:disabled {
          background: #222222;
          color: #555555;
          cursor: default;
          border: 1px solid #333;
        }

        @media (max-width: 480px) {
          .gearbuddy-container {
            bottom: 16px;
            right: 16px;
          }

          .gearbuddy-panel {
            width: calc(100vw - 32px);
            height: calc(100vh - 100px);
            max-height: 600px;
            bottom: 64px;
          }
        }
      `}</style>
    </div>
  );
}
