import React, { useState, useRef, useEffect } from 'react';
import { MessageSquare, Send, Sparkles, X, Bot, User, Minimize2, Maximize2 } from 'lucide-react';
import { chatChefVerse } from '../api';

const INDIAN_QUICK_PROMPTS = [
  'How to make poha fluffy & non-mushy?',
  'How to cook paneer curry with less oil?',
  'Jain substitute for onion-garlic gravies?',
  'FSSAI rule on frying oil reuse (TPC limit)?',
  'Best vegetarian Indian protein sources?'
];

export default function ChefVerseChat() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([
    {
      id: 1,
      sender: 'bot',
      text: 'Namaste! I am Food Verse AI, your multimodal Indian culinary and food safety copilot. Ask me about authentic Indian recipes, tadka timings, Jain or vegan swaps, FSSAI hygiene rules, or Indian portion nutrition!',
      time: 'Just now'
    }
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    if (isOpen) {
      scrollToBottom();
    }
  }, [messages, isOpen]);

  const handleSend = async (textToSend = input) => {
    const trimmed = textToSend.trim();
    if (!trimmed || loading) return;

    const userMsg = {
      id: Date.now(),
      sender: 'user',
      text: trimmed,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setMessages((prev) => [...prev, userMsg]);
    setInput('');
    setLoading(true);

    try {
      const data = await chatChefVerse(trimmed);
      const botMsg = {
        id: Date.now() + 1,
        sender: 'bot',
        text: data.reply,
        time: data.timestamp || new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };
      setMessages((prev) => [...prev, botMsg]);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      {/* Floating Toggle Button */}
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          style={{
            position: 'fixed',
            bottom: '2rem',
            right: '2rem',
            width: '62px',
            height: '62px',
            borderRadius: '50%',
            background: 'linear-gradient(135deg, #f97316 0%, #facc15 100%)',
            border: 'none',
            boxShadow: '0 8px 30px rgba(249, 115, 22, 0.42)',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 999,
            transition: 'transform 0.2s cubic-bezier(0.16, 1, 0.3, 1)'
          }}
          onMouseEnter={(e) => e.currentTarget.style.transform = 'scale(1.08)'}
          onMouseLeave={(e) => e.currentTarget.style.transform = 'scale(1)'}
          title="Open Desi ChefVerse Assistant"
        >
          <Sparkles size={26} color="#ffffff" />
        </button>
      )}

      {/* Chat Dialog Window */}
      {isOpen && (
        <div style={{
          position: 'fixed',
          bottom: '2rem',
          right: '2rem',
          width: '390px',
          maxWidth: 'calc(100vw - 2rem)',
          height: '530px',
          maxHeight: 'calc(100vh - 4rem)',
          borderRadius: 'var(--radius-lg)',
          background: 'rgba(255, 251, 245, 0.97)',
          backdropFilter: 'blur(24px)',
          border: '1.5px solid rgba(249, 115, 22, 0.22)',
          boxShadow: '0 20px 60px rgba(180, 80, 10, 0.22)',
          display: 'flex',
          flexDirection: 'column',
          zIndex: 1000,
          overflow: 'hidden'
        }}>
          {/* Header */}
          <div style={{
            padding: '1rem',
            background: 'linear-gradient(135deg, rgba(249, 115, 22, 0.12) 0%, rgba(234, 179, 8, 0.12) 100%)',
            borderBottom: '1.5px solid rgba(249, 115, 22, 0.15)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
              <div style={{
                width: '36px',
                height: '36px',
                borderRadius: '10px',
                background: 'linear-gradient(135deg, #f97316, #facc15)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: '0 2px 10px rgba(249, 115, 22, 0.35)'
              }}>
                <Bot size={20} color="#ffffff" />
              </div>
              <div>
                <h4 style={{ margin: 0, fontSize: '0.95rem', fontWeight: 800, color: '#2d1a00' }}>Desi ChefVerse AI</h4>
                <span style={{ fontSize: '0.72rem', color: '#ea580c', fontWeight: 600 }}>● Indian Culinary & FSSAI Copilot</span>
              </div>
            </div>

            <button
              onClick={() => setIsOpen(false)}
              style={{
                background: 'rgba(249,115,22,0.08)',
                border: '1px solid rgba(249,115,22,0.18)',
                color: '#7c5832',
                cursor: 'pointer',
                padding: '5px',
                borderRadius: '50%',
                display: 'flex', alignItems: 'center', justifyContent: 'center'
              }}
            >
              <X size={16} />
            </button>
          </div>

          {/* Messages Body */}
          <div style={{
            flex: 1,
            overflowY: 'auto',
            padding: '1rem',
            display: 'flex',
            flexDirection: 'column',
            gap: '0.75rem',
            background: '#fffbf5'
          }}>
            {messages.map((m) => {
              const isUser = m.sender === 'user';
              return (
                <div
                  key={m.id}
                  style={{
                    alignSelf: isUser ? 'flex-end' : 'flex-start',
                    maxWidth: '84%',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: isUser ? 'flex-end' : 'flex-start'
                  }}
                >
                  <div style={{
                    padding: '0.75rem 0.95rem',
                    borderRadius: isUser ? '16px 16px 2px 16px' : '16px 16px 16px 2px',
                    background: isUser
                      ? 'linear-gradient(135deg, #f97316, #ea580c)'
                      : '#ffffff',
                    border: isUser ? 'none' : '1px solid rgba(220, 140, 40, 0.18)',
                    color: isUser ? '#ffffff' : '#2d1a00',
                    fontSize: '0.86rem',
                    lineHeight: 1.45,
                    boxShadow: isUser ? 'none' : '0 1px 6px rgba(180,80,10,0.08)'
                  }}>
                    {m.text}
                  </div>
                  <span style={{ fontSize: '0.68rem', color: '#a87c52', marginTop: '2px', padding: '0 4px' }}>
                    {m.time}
                  </span>
                </div>
              );
            })}
            {loading && (
              <div style={{ alignSelf: 'flex-start', color: '#ea580c', fontSize: '0.8rem', fontStyle: 'italic', padding: '0.25rem 0.6rem', background: 'rgba(249,115,22,0.07)', borderRadius: '12px' }}>
                🍛 ChefVerse thinking...
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Quick Desi Prompts */}
          <div style={{
            padding: '0.4rem 0.75rem',
            display: 'flex',
            gap: '0.4rem',
            overflowX: 'auto',
            scrollbarWidth: 'none',
            borderTop: '1px solid rgba(249,115,22,0.12)',
            background: '#fff8ee'
          }}>
            {INDIAN_QUICK_PROMPTS.map((prompt, i) => (
              <button
                key={i}
                onClick={() => handleSend(prompt)}
                style={{
                  background: 'rgba(249, 115, 22, 0.07)',
                  border: '1px solid rgba(249, 115, 22, 0.22)',
                  borderRadius: 'var(--radius-full)',
                  padding: '0.25rem 0.65rem',
                  color: '#9a3412',
                  fontSize: '0.72rem',
                  whiteSpace: 'nowrap',
                  cursor: 'pointer',
                  fontWeight: 600
                }}
              >
                {prompt}
              </button>
            ))}
          </div>

          {/* Input Footer */}
          <div style={{
            padding: '0.75rem',
            background: '#ffffff',
            borderTop: '1.5px solid rgba(249,115,22,0.12)',
            display: 'flex',
            gap: '0.5rem'
          }}>
            <input
              type="text"
              placeholder="Ask about poha, tadka, FSSAI rules, protein..."
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSend()}
              className="input-field"
              style={{ padding: '0.55rem 0.85rem', fontSize: '0.85rem' }}
            />
            <button
              onClick={() => handleSend()}
              disabled={loading || !input.trim()}
              className="btn btn-primary"
              style={{ padding: '0 0.85rem', borderRadius: 'var(--radius-md)' }}
            >
              <Send size={15} />
            </button>
          </div>
        </div>
      )}
    </>
  );
}
