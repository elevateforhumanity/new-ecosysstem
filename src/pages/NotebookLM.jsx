import React, { useState, useEffect } from 'react';

export function NotebookLM() {
  const [notebooks, setNotebooks] = useState([]);
  const [currentNotebook, setCurrentNotebook] = useState(null);
  const [sources, setSources] = useState([]);
  const [notes, setNotes] = useState([]);
  const [question, setQuestion] = useState('');
  const [answer, setAnswer] = useState(null);
  const [loading, setLoading] = useState(false);
  const [view, setView] = useState('sources'); // sources, notes, chat, graph

  useEffect(() => {
    loadNotebooks();
  }, []);

  const loadNotebooks = async () => {
    const mockNotebooks = [
      { id: 'nb1', title: 'Research Project', description: 'AI and Education', sources: [], notes: [] }
    ];
    setNotebooks(mockNotebooks);
    if (mockNotebooks.length > 0) {
      setCurrentNotebook(mockNotebooks[0]);
    }
  };

  const addSource = async (type) => {
    const title = prompt(`Enter ${type} title:`);
    if (!title) return;

    let url = '';
    if (type === 'url') {
      url = prompt('Enter URL:');
    }

    const newSource = {
      id: `src_${Date.now()}`,
      type,
      title,
      url,
      content: `Sample content for ${title}`,
      addedAt: new Date()
    };

    setSources([...sources, newSource]);
  };

  const askQuestion = async () => {
    if (!question.trim()) return;
    setLoading(true);

    try {
      await new Promise((resolve) => {
        setTimeout(() => {
          setAnswer({
            question,
            answer: `Based on your sources, here's what I found:\n\n${question} is an important topic. According to Source 1, there are several key considerations...\n\nKey points:\n1. First important point\n2. Second important point\n3. Third important point\n\nWould you like me to elaborate on any of these points?`,
            sources: sources.slice(0, 3).map(s => ({ title: s.title, citation: `${s.title}, p.1` })),
            timestamp: new Date()
          });
          resolve();
        }, 1500);
      });
    } catch (error) {
      console.error('Question processing error:', error);
      setAnswer({
        question,
        answer: 'Failed to process your question. Please try again.',
        sources: [],
        timestamp: new Date()
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ display: 'flex', height: '100vh', backgroundColor: '#f9fafb' }}>
      <div style={{ width: '250px', backgroundColor: '#fff', borderRight: '1px solid #e5e7eb', padding: '1rem' }}>
        <h2 style={{ marginBottom: '1rem', fontSize: '1.25rem' }}>📓 NotebookLM</h2>
        
        <div style={{ marginBottom: '1.5rem' }}>
          <select value={currentNotebook?.id || ''} onChange={(e) => setCurrentNotebook(notebooks.find(n => n.id === e.target.value))} style={{ width: '100%', padding: '0.5rem', border: '1px solid #d1d5db', borderRadius: '0.375rem', marginBottom: '0.5rem' }}>
            {notebooks.map(nb => (
              <option key={nb.id} value={nb.id}>{nb.title}</option>
            ))}
          </select>
          <button onClick={() => {
            const title = prompt('Notebook title:');
            if (title) setNotebooks([...notebooks, { id: `nb_${Date.now()}`, title, sources: [], notes: [] }]);
          }} style={{ width: '100%', padding: '0.5rem', backgroundColor: '#3b82f6', color: '#fff', border: 'none', borderRadius: '0.375rem', cursor: 'pointer', fontSize: '0.875rem' }}>
            + New Notebook
          </button>
        </div>

        <div style={{ marginBottom: '1.5rem' }}>
          <button onClick={() => setView('sources')} style={{ width: '100%', padding: '0.75rem', marginBottom: '0.5rem', backgroundColor: view === 'sources' ? '#3b82f6' : '#fff', color: view === 'sources' ? '#fff' : '#000', border: '1px solid #d1d5db', borderRadius: '0.375rem', cursor: 'pointer', textAlign: 'left' }}>
            📚 Sources ({sources.length})
          </button>
          <button onClick={() => setView('chat')} style={{ width: '100%', padding: '0.75rem', marginBottom: '0.5rem', backgroundColor: view === 'chat' ? '#3b82f6' : '#fff', color: view === 'chat' ? '#fff' : '#000', border: '1px solid #d1d5db', borderRadius: '0.375rem', cursor: 'pointer', textAlign: 'left' }}>
            💬 Ask Questions
          </button>
          <button onClick={() => setView('notes')} style={{ width: '100%', padding: '0.75rem', marginBottom: '0.5rem', backgroundColor: view === 'notes' ? '#3b82f6' : '#fff', color: view === 'notes' ? '#fff' : '#000', border: '1px solid #d1d5db', borderRadius: '0.375rem', cursor: 'pointer', textAlign: 'left' }}>
            📝 Notes ({notes.length})
          </button>
          <button onClick={() => setView('graph')} style={{ width: '100%', padding: '0.75rem', backgroundColor: view === 'graph' ? '#3b82f6' : '#fff', color: view === 'graph' ? '#fff' : '#000', border: '1px solid #d1d5db', borderRadius: '0.375rem', cursor: 'pointer', textAlign: 'left' }}>
            🕸️ Knowledge Graph
          </button>
        </div>
      </div>

      <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
        <div style={{ backgroundColor: '#fff', borderBottom: '1px solid #e5e7eb', padding: '1rem 2rem' }}>
          <h1 style={{ fontSize: '1.5rem', fontWeight: '600' }}>
            {currentNotebook?.title || 'NotebookLM'}
          </h1>
          <p style={{ color: '#6b7280', fontSize: '0.875rem' }}>
            {currentNotebook?.description || 'AI-powered research assistant'}
          </p>
        </div>

        <div style={{ flex: 1, overflowY: 'auto', padding: '2rem' }}>
          {view === 'sources' && (
            <div>
              <div style={{ display: 'flex', gap: '1rem', marginBottom: '2rem' }}>
                <button onClick={() => addSource('pdf')} style={{ padding: '0.75rem 1.5rem', backgroundColor: '#3b82f6', color: '#fff', border: 'none', borderRadius: '0.5rem', cursor: 'pointer' }}>
                  📄 Add PDF
                </button>
                <button onClick={() => addSource('url')} style={{ padding: '0.75rem 1.5rem', backgroundColor: '#3b82f6', color: '#fff', border: 'none', borderRadius: '0.5rem', cursor: 'pointer' }}>
                  🔗 Add URL
                </button>
                <button onClick={() => addSource('text')} style={{ padding: '0.75rem 1.5rem', backgroundColor: '#3b82f6', color: '#fff', border: 'none', borderRadius: '0.5rem', cursor: 'pointer' }}>
                  📝 Add Text
                </button>
              </div>

              {sources.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '4rem', color: '#6b7280' }}>
                  <div style={{ fontSize: '4rem', marginBottom: '1rem' }}>📚</div>
                  <h2 style={{ fontSize: '1.5rem', marginBottom: '0.5rem' }}>No sources yet</h2>
                  <p>Add PDFs, URLs, or text to start researching</p>
                </div>
              ) : (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '1rem' }}>
                  {sources.map(source => (
                    <div key={source.id} style={{ backgroundColor: '#fff', padding: '1.5rem', borderRadius: '0.5rem', boxShadow: '0 2px 4px rgba(0,0,0,0.1)' }}>
                      <div style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>
                        {source.type === 'pdf' ? '📄' : source.type === 'url' ? '🔗' : '📝'}
                      </div>
                      <h3 style={{ fontSize: '1.125rem', fontWeight: '600', marginBottom: '0.5rem' }}>{source.title}</h3>
                      <p style={{ color: '#6b7280', fontSize: '0.875rem', marginBottom: '1rem' }}>
                        Added {new Date(source.addedAt).toLocaleDateString()}
                      </p>
                      <button style={{ padding: '0.5rem 1rem', backgroundColor: '#ef4444', color: '#fff', border: 'none', borderRadius: '0.375rem', cursor: 'pointer', fontSize: '0.875rem' }}>
                        Delete
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {view === 'chat' && (
            <div>
              <div style={{ backgroundColor: '#fff', padding: '2rem', borderRadius: '0.5rem', boxShadow: '0 2px 4px rgba(0,0,0,0.1)', marginBottom: '2rem' }}>
                <h2 style={{ fontSize: '1.25rem', fontWeight: '600', marginBottom: '1rem' }}>Ask a Question</h2>
                <div style={{ display: 'flex', gap: '1rem' }}>
                  <input
                    type="text"
                    value={question}
                    onChange={(e) => setQuestion(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && askQuestion()}
                    placeholder="What would you like to know?"
                    style={{ flex: 1, padding: '0.75rem', border: '1px solid #d1d5db', borderRadius: '0.5rem', fontSize: '1rem' }}
                  />
                  <button onClick={askQuestion} disabled={loading} style={{ padding: '0.75rem 2rem', backgroundColor: '#3b82f6', color: '#fff', border: 'none', borderRadius: '0.5rem', cursor: 'pointer', fontWeight: '600' }}>
                    {loading ? 'Thinking...' : 'Ask'}
                  </button>
                </div>
              </div>

              {answer && (
                <div style={{ backgroundColor: '#fff', padding: '2rem', borderRadius: '0.5rem', boxShadow: '0 2px 4px rgba(0,0,0,0.1)' }}>
                  <h3 style={{ fontSize: '1.125rem', fontWeight: '600', marginBottom: '1rem', color: '#3b82f6' }}>
                    Q: {answer.question}
                  </h3>
                  <div style={{ whiteSpace: 'pre-wrap', lineHeight: '1.6', marginBottom: '1.5rem' }}>
                    {answer.answer}
                  </div>
                  <div style={{ borderTop: '1px solid #e5e7eb', paddingTop: '1rem' }}>
                    <h4 style={{ fontSize: '0.875rem', fontWeight: '600', marginBottom: '0.5rem', color: '#6b7280' }}>Sources:</h4>
                    {answer.sources.map((src, i) => (
                      <div key={i} style={{ fontSize: '0.875rem', color: '#6b7280', marginBottom: '0.25rem' }}>
                        • {src.citation}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {view === 'notes' && (
            <div style={{ textAlign: 'center', padding: '4rem', color: '#6b7280' }}>
              <div style={{ fontSize: '4rem', marginBottom: '1rem' }}>📝</div>
              <h2 style={{ fontSize: '1.5rem', marginBottom: '0.5rem' }}>Notes</h2>
              <p>AI-generated notes will appear here</p>
            </div>
          )}

          {view === 'graph' && (
            <div style={{ textAlign: 'center', padding: '4rem', color: '#6b7280' }}>
              <div style={{ fontSize: '4rem', marginBottom: '1rem' }}>🕸️</div>
              <h2 style={{ fontSize: '1.5rem', marginBottom: '0.5rem' }}>Knowledge Graph</h2>
              <p>Visual connections between your sources</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default NotebookLM;
