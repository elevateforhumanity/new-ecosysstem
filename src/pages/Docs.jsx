import React, { useState } from 'react';

export function Docs() {
  const [documents, setDocuments] = useState([
    {
      id: 1,
      title: 'Project Proposal',
      lastModified: '2 hours ago',
      owner: 'You',
      shared: 3,
    },
    {
      id: 2,
      title: 'Meeting Notes',
      lastModified: 'Yesterday',
      owner: 'You',
      shared: 5,
    },
    {
      id: 3,
      title: 'Research Paper',
      lastModified: 'Jan 15',
      owner: 'John Doe',
      shared: 2,
    },
  ]);
  const [currentDoc, setCurrentDoc] = useState(null);
  const [content, setContent] = useState('');
  const [title, setTitle] = useState('Untitled Document');

  const createNewDoc = () => {
    const newDoc = {
      id: Date.now(),
      title: 'Untitled Document',
      lastModified: 'Just now',
      owner: 'You',
      shared: 0,
    };
    setDocuments([newDoc, ...documents]);
    setCurrentDoc(newDoc);
    setTitle('Untitled Document');
    setContent('');
  };

  const openDoc = (doc) => {
    setCurrentDoc(doc);
    setTitle(doc.title);
    setContent(`This is the content of "${doc.title}". Start editing...`);
  };

  return (
    <div
      style={{
        height: '100vh',
        display: 'flex',
        flexDirection: 'column',
        backgroundColor: 'var(--brand-surface)',
      }}
    >
      {/* Header */}
      <div
        style={{
          backgroundColor: '#fff',
          borderBottom: '1px solid var(--brand-border)',
          padding: '1rem 2rem',
        }}
      >
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <h1 style={{ fontSize: '1.5rem', fontWeight: '600' }}>
              📝 Documents
            </h1>
            {currentDoc && (
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                style={{
                  fontSize: '1.25rem',
                  padding: '0.5rem',
                  border: '1px solid var(--brand-border-dark)',
                  borderRadius: '0.375rem',
                  width: '300px',
                }}
              />
            )}
          </div>
          <div style={{ display: 'flex', gap: '1rem' }}>
            {currentDoc && (
              <>
                <button
                  style={{
                    padding: '0.5rem 1rem',
                    backgroundColor: '#f3f4f6',
                    border: 'none',
                    borderRadius: '0.375rem',
                    cursor: 'pointer',
                  }}
                >
                  Share
                </button>
                <button
                  onClick={() => setCurrentDoc(null)}
                  style={{
                    padding: '0.5rem 1rem',
                    backgroundColor: '#f3f4f6',
                    border: 'none',
                    borderRadius: '0.375rem',
                    cursor: 'pointer',
                  }}
                >
                  Close
                </button>
              </>
            )}
            <button
              onClick={createNewDoc}
              style={{
                padding: '0.5rem 1.5rem',
                backgroundColor: 'var(--brand-info)',
                color: '#fff',
                border: 'none',
                borderRadius: '0.375rem',
                cursor: 'pointer',
                fontWeight: '600',
              }}
            >
              + New Document
            </button>
          </div>
        </div>
      </div>

      {/* Document List */}
      {!currentDoc && (
        <div style={{ flex: 1, padding: '2rem', overflowY: 'auto' }}>
          <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
            <h2
              style={{
                fontSize: '1.25rem',
                fontWeight: '600',
                marginBottom: '1rem',
              }}
            >
              Recent Documents
            </h2>
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))',
                gap: '1rem',
              }}
            >
              {documents.map((doc) => (
                <div
                  key={doc.id}
                  onClick={() => openDoc(doc)}
                  style={{
                    backgroundColor: '#fff',
                    padding: '1.5rem',
                    borderRadius: '0.5rem',
                    boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
                    cursor: 'pointer',
                    transition: 'transform 0.2s',
                  }}
                >
                  <div style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>
                    📄
                  </div>
                  <h3
                    style={{
                      fontSize: '1.125rem',
                      fontWeight: '600',
                      marginBottom: '0.5rem',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      whiteSpace: 'nowrap',
                    }}
                  >
                    {doc.title}
                  </h3>
                  <div
                    style={{
                      fontSize: '0.875rem',
                      color: 'var(--brand-text-muted)',
                      marginBottom: '0.25rem',
                    }}
                  >
                    Modified {doc.lastModified}
                  </div>
                  <div
                    style={{
                      fontSize: '0.875rem',
                      color: 'var(--brand-text-muted)',
                    }}
                  >
                    Owner: {doc.owner}
                  </div>
                  {doc.shared > 0 && (
                    <div
                      style={{
                        fontSize: '0.875rem',
                        color: 'var(--brand-info)',
                        marginTop: '0.5rem',
                      }}
                    >
                      👥 Shared with {doc.shared} people
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Document Editor */}
      {currentDoc && (
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
          {/* Toolbar */}
          <div
            style={{
              backgroundColor: '#fff',
              borderBottom: '1px solid var(--brand-border)',
              padding: '0.5rem 2rem',
              display: 'flex',
              gap: '0.5rem',
            }}
          >
            <button
              style={{
                padding: '0.5rem 1rem',
                backgroundColor: '#f3f4f6',
                border: 'none',
                borderRadius: '0.375rem',
                cursor: 'pointer',
                fontWeight: '600',
              }}
            >
              B
            </button>
            <button
              style={{
                padding: '0.5rem 1rem',
                backgroundColor: '#f3f4f6',
                border: 'none',
                borderRadius: '0.375rem',
                cursor: 'pointer',
                fontStyle: 'italic',
              }}
            >
              I
            </button>
            <button
              style={{
                padding: '0.5rem 1rem',
                backgroundColor: '#f3f4f6',
                border: 'none',
                borderRadius: '0.375rem',
                cursor: 'pointer',
                textDecoration: 'underline',
              }}
            >
              U
            </button>
            <div
              style={{
                width: '1px',
                backgroundColor: 'var(--brand-border)',
                margin: '0 0.5rem',
              }}
            ></div>
            <select
              style={{
                padding: '0.5rem',
                border: '1px solid var(--brand-border-dark)',
                borderRadius: '0.375rem',
                cursor: 'pointer',
              }}
            >
              <option>Normal text</option>
              <option>Heading 1</option>
              <option>Heading 2</option>
              <option>Heading 3</option>
            </select>
            <select
              style={{
                padding: '0.5rem',
                border: '1px solid var(--brand-border-dark)',
                borderRadius: '0.375rem',
                cursor: 'pointer',
              }}
            >
              <option>Arial</option>
              <option>Times New Roman</option>
              <option>Courier</option>
            </select>
            <select
              style={{
                padding: '0.5rem',
                border: '1px solid var(--brand-border-dark)',
                borderRadius: '0.375rem',
                cursor: 'pointer',
              }}
            >
              <option>12</option>
              <option>14</option>
              <option>16</option>
              <option>18</option>
            </select>
          </div>

          {/* Editor */}
          <div
            style={{
              flex: 1,
              padding: '2rem',
              overflowY: 'auto',
              backgroundColor: 'var(--brand-surface)',
            }}
          >
            <div
              style={{
                maxWidth: '800px',
                margin: '0 auto',
                backgroundColor: '#fff',
                padding: '3rem',
                minHeight: '100%',
                boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
              }}
            >
              <textarea
                value={content}
                onChange={(e) => setContent(e.target.value)}
                placeholder="Start typing..."
                style={{
                  width: '100%',
                  minHeight: '600px',
                  border: 'none',
                  outline: 'none',
                  fontSize: '1rem',
                  lineHeight: '1.6',
                  resize: 'none',
                  fontFamily: 'inherit',
                }}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default Docs;
