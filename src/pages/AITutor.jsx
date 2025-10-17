import React, { useState, useEffect, useRef } from 'react';

export function AITutor() {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [conversationId, setConversationId] = useState(null);
  const [mode, setMode] = useState('chat'); // chat, essay, study-guide
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(scrollToBottom, [messages]);

  const sendMessage = async () => {
    if (!input.trim() || loading) return;

    const userMessage = { role: 'user', content: input, timestamp: new Date() };
    setMessages([...messages, userMessage]);
    setInput('');
    setLoading(true);

    try {
      const response = await fetch('/api/ai-tutor/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: input,
          conversationId,
          context: { courseId: 'general' },
        }),
      });

      const data = await response.json();
      setConversationId(data.conversationId);

      const aiMessage = {
        role: 'assistant',
        content: data.response,
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, aiMessage]);
    } catch (error) {
      const errorMessage = {
        role: 'assistant',
        content: 'Sorry, I encountered an error. Please try again.',
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setLoading(false);
    }
  };

  const gradeEssay = async (essayText, rubric) => {
    setLoading(true);
    try {
      const response = await fetch('/api/ai-tutor/grade-essay', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ essayText, rubric }),
      });
      const data = await response.json();
      setMessages([
        ...messages,
        {
          role: 'assistant',
          content: `Grade: ${data.grade}/100\n\n${data.feedback}`,
          timestamp: new Date(),
        },
      ]);
    } catch (error) {
      console.error('Essay grading error:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      style={{
        display: 'flex',
        height: '100vh',
        backgroundColor: 'var(--brand-surface)',
      }}
    >
      <div
        style={{
          width: '250px',
          backgroundColor: '#fff',
          borderRight: '1px solid var(--brand-border)',
          padding: '1rem',
        }}
      >
        <h2 style={{ marginBottom: '1rem', fontSize: '1.25rem' }}>AI Tutor</h2>

        <div style={{ marginBottom: '1.5rem' }}>
          <button
            onClick={() => setMode('chat')}
            style={{
              width: '100%',
              padding: '0.75rem',
              marginBottom: '0.5rem',
              backgroundColor: mode === 'chat' ? 'var(--brand-info)' : '#fff',
              color: mode === 'chat' ? '#fff' : '#000',
              border: '1px solid var(--brand-border-dark)',
              borderRadius: '0.375rem',
              cursor: 'pointer',
              textAlign: 'left',
            }}
          >
            💬 Chat Tutor
          </button>
          <button
            onClick={() => setMode('essay')}
            style={{
              width: '100%',
              padding: '0.75rem',
              marginBottom: '0.5rem',
              backgroundColor: mode === 'essay' ? 'var(--brand-info)' : '#fff',
              color: mode === 'essay' ? '#fff' : '#000',
              border: '1px solid var(--brand-border-dark)',
              borderRadius: '0.375rem',
              cursor: 'pointer',
              textAlign: 'left',
            }}
          >
            📝 Grade Essay
          </button>
          <button
            onClick={() => setMode('study-guide')}
            style={{
              width: '100%',
              padding: '0.75rem',
              backgroundColor:
                mode === 'study-guide' ? 'var(--brand-info)' : '#fff',
              color: mode === 'study-guide' ? '#fff' : '#000',
              border: '1px solid var(--brand-border-dark)',
              borderRadius: '0.375rem',
              cursor: 'pointer',
              textAlign: 'left',
            }}
          >
            📚 Study Guide
          </button>
        </div>

        <button
          onClick={() => {
            setMessages([]);
            setConversationId(null);
          }}
          style={{
            width: '100%',
            padding: '0.75rem',
            backgroundColor: 'var(--brand-danger)',
            color: '#fff',
            border: 'none',
            borderRadius: '0.375rem',
            cursor: 'pointer',
          }}
        >
          🗑️ Clear Chat
        </button>
      </div>

      <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
        <div
          style={{
            backgroundColor: '#fff',
            borderBottom: '1px solid var(--brand-border)',
            padding: '1rem 2rem',
          }}
        >
          <h1 style={{ fontSize: '1.5rem', fontWeight: '600' }}>
            {mode === 'chat'
              ? '💬 AI Tutor Chat'
              : mode === 'essay'
                ? '📝 Essay Grading'
                : '📚 Study Guide Generator'}
          </h1>
          <p style={{ color: 'var(--brand-text-muted)', fontSize: '0.875rem' }}>
            {mode === 'chat'
              ? 'Ask me anything about your coursework'
              : mode === 'essay'
                ? 'Get instant feedback on your essays'
                : 'Generate comprehensive study guides'}
          </p>
        </div>

        <div style={{ flex: 1, overflowY: 'auto', padding: '2rem' }}>
          {messages.length === 0 && (
            <div
              style={{
                textAlign: 'center',
                padding: '4rem 2rem',
                color: 'var(--brand-text-muted)',
              }}
            >
              <div style={{ fontSize: '4rem', marginBottom: '1rem' }}>🤖</div>
              <h2 style={{ fontSize: '1.5rem', marginBottom: '0.5rem' }}>
                Welcome to AI Tutor!
              </h2>
              <p>Ask me anything and I'll help you learn.</p>
            </div>
          )}

          {messages.map((msg, i) => (
            <div
              key={i}
              style={{
                marginBottom: '1.5rem',
                display: 'flex',
                justifyContent: msg.role === 'user' ? 'flex-end' : 'flex-start',
              }}
            >
              <div
                style={{
                  maxWidth: '70%',
                  padding: '1rem',
                  backgroundColor:
                    msg.role === 'user' ? 'var(--brand-info)' : '#fff',
                  color: msg.role === 'user' ? '#fff' : '#000',
                  borderRadius: '0.75rem',
                  boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
                }}
              >
                <div style={{ whiteSpace: 'pre-wrap' }}>{msg.content}</div>
                <div
                  style={{
                    fontSize: '0.75rem',
                    marginTop: '0.5rem',
                    opacity: 0.7,
                  }}
                >
                  {new Date(msg.timestamp).toLocaleTimeString()}
                </div>
              </div>
            </div>
          ))}

          {loading && (
            <div
              style={{
                display: 'flex',
                justifyContent: 'flex-start',
                marginBottom: '1.5rem',
              }}
            >
              <div
                style={{
                  padding: '1rem',
                  backgroundColor: '#fff',
                  borderRadius: '0.75rem',
                  boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
                }}
              >
                <div style={{ display: 'flex', gap: '0.5rem' }}>
                  <div
                    style={{
                      width: '8px',
                      height: '8px',
                      backgroundColor: 'var(--brand-info)',
                      borderRadius: '50%',
                      animation: 'bounce 1s infinite',
                    }}
                  />
                  <div
                    style={{
                      width: '8px',
                      height: '8px',
                      backgroundColor: 'var(--brand-info)',
                      borderRadius: '50%',
                      animation: 'bounce 1s infinite 0.2s',
                    }}
                  />
                  <div
                    style={{
                      width: '8px',
                      height: '8px',
                      backgroundColor: 'var(--brand-info)',
                      borderRadius: '50%',
                      animation: 'bounce 1s infinite 0.4s',
                    }}
                  />
                </div>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        <div
          style={{
            backgroundColor: '#fff',
            borderTop: '1px solid var(--brand-border)',
            padding: '1rem 2rem',
          }}
        >
          <div style={{ display: 'flex', gap: '1rem' }}>
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
              placeholder="Ask me anything..."
              style={{
                flex: 1,
                padding: '0.75rem',
                border: '1px solid var(--brand-border-dark)',
                borderRadius: '0.5rem',
                fontSize: '1rem',
              }}
              disabled={loading}
            />
            <button
              onClick={sendMessage}
              disabled={loading || !input.trim()}
              style={{
                padding: '0.75rem 2rem',
                backgroundColor: 'var(--brand-info)',
                color: '#fff',
                border: 'none',
                borderRadius: '0.5rem',
                cursor: 'pointer',
                fontWeight: '600',
                opacity: loading || !input.trim() ? 0.5 : 1,
              }}
            >
              Send
            </button>
          </div>
        </div>
      </div>

      <style>{`
        @keyframes bounce {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-10px); }
        }
      `}</style>
    </div>
  );
}

export default AITutor;
