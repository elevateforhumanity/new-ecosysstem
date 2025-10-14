import React, { useState, useEffect } from 'react';

export function Email() {
  const [emails, setEmails] = useState([]);
  const [selectedEmail, setSelectedEmail] = useState(null);
  const [composing, setComposing] = useState(false);
  const [folder, setFolder] = useState('inbox');
  const [newEmail, setNewEmail] = useState({ to: '', subject: '', body: '' });

  useEffect(() => {
    loadEmails();
  }, [folder]);

  const loadEmails = () => {
    const mockEmails = [
      { id: 1, from: 'teacher@school.edu', subject: 'Assignment Due Tomorrow', preview: 'Please remember to submit...', date: '10:30 AM', read: false, starred: false },
      { id: 2, from: 'admin@school.edu', subject: 'School Event Next Week', preview: 'Join us for the annual...', date: 'Yesterday', read: true, starred: true },
      { id: 3, from: 'student@school.edu', subject: 'Group Project Question', preview: 'Hi, I had a question about...', date: 'Jan 15', read: true, starred: false }
    ];
    setEmails(mockEmails);
  };

  const sendEmail = () => {
    setComposing(false);
    setNewEmail({ to: '', subject: '', body: '' });
  };

  return (
    <div style={{ display: 'flex', height: '100vh', backgroundColor: '#f9fafb' }}>
      {/* Sidebar */}
      <div style={{ width: '250px', backgroundColor: '#fff', borderRight: '1px solid #e5e7eb', padding: '1rem' }}>
        <button onClick={() => setComposing(true)} style={{ width: '100%', padding: '0.75rem', backgroundColor: '#3b82f6', color: '#fff', border: 'none', borderRadius: '0.5rem', cursor: 'pointer', fontWeight: '600', marginBottom: '1.5rem' }}>
          ✉️ Compose
        </button>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
          <button onClick={() => setFolder('inbox')} style={{ padding: '0.75rem', textAlign: 'left', backgroundColor: folder === 'inbox' ? '#eff6ff' : 'transparent', color: folder === 'inbox' ? '#3b82f6' : '#000', border: 'none', borderRadius: '0.375rem', cursor: 'pointer' }}>
            📥 Inbox ({emails.filter(e => !e.read).length})
          </button>
          <button onClick={() => setFolder('starred')} style={{ padding: '0.75rem', textAlign: 'left', backgroundColor: folder === 'starred' ? '#eff6ff' : 'transparent', color: folder === 'starred' ? '#3b82f6' : '#000', border: 'none', borderRadius: '0.375rem', cursor: 'pointer' }}>
            ⭐ Starred
          </button>
          <button onClick={() => setFolder('sent')} style={{ padding: '0.75rem', textAlign: 'left', backgroundColor: folder === 'sent' ? '#eff6ff' : 'transparent', color: folder === 'sent' ? '#3b82f6' : '#000', border: 'none', borderRadius: '0.375rem', cursor: 'pointer' }}>
            📤 Sent
          </button>
          <button onClick={() => setFolder('drafts')} style={{ padding: '0.75rem', textAlign: 'left', backgroundColor: folder === 'drafts' ? '#eff6ff' : 'transparent', color: folder === 'drafts' ? '#3b82f6' : '#000', border: 'none', borderRadius: '0.375rem', cursor: 'pointer' }}>
            📝 Drafts
          </button>
          <button onClick={() => setFolder('trash')} style={{ padding: '0.75rem', textAlign: 'left', backgroundColor: folder === 'trash' ? '#eff6ff' : 'transparent', color: folder === 'trash' ? '#3b82f6' : '#000', border: 'none', borderRadius: '0.375rem', cursor: 'pointer' }}>
            🗑️ Trash
          </button>
        </div>
      </div>

      {/* Email List */}
      {!composing && !selectedEmail && (
        <div style={{ width: '400px', backgroundColor: '#fff', borderRight: '1px solid #e5e7eb', overflowY: 'auto' }}>
          <div style={{ padding: '1rem', borderBottom: '1px solid #e5e7eb' }}>
            <h2 style={{ fontSize: '1.5rem', fontWeight: '600', textTransform: 'capitalize' }}>{folder}</h2>
          </div>
          {emails.map(email => (
            <div key={email.id} onClick={() => setSelectedEmail(email)} style={{ padding: '1rem', borderBottom: '1px solid #e5e7eb', cursor: 'pointer', backgroundColor: email.read ? '#fff' : '#f0f9ff' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                <span style={{ fontWeight: email.read ? '400' : '600' }}>{email.from}</span>
                <span style={{ fontSize: '0.875rem', color: '#6b7280' }}>{email.date}</span>
              </div>
              <div style={{ fontWeight: email.read ? '400' : '600', marginBottom: '0.25rem' }}>{email.subject}</div>
              <div style={{ fontSize: '0.875rem', color: '#6b7280', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{email.preview}</div>
            </div>
          ))}
        </div>
      )}

      {/* Compose Email */}
      {composing && (
        <div style={{ flex: 1, padding: '2rem', overflowY: 'auto' }}>
          <div style={{ maxWidth: '800px', margin: '0 auto', backgroundColor: '#fff', padding: '2rem', borderRadius: '0.5rem', boxShadow: '0 2px 4px rgba(0,0,0,0.1)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1.5rem' }}>
              <h2 style={{ fontSize: '1.5rem', fontWeight: '600' }}>New Message</h2>
              <button onClick={() => setComposing(false)} style={{ padding: '0.5rem 1rem', backgroundColor: '#ef4444', color: '#fff', border: 'none', borderRadius: '0.375rem', cursor: 'pointer' }}>
                Cancel
              </button>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <input type="email" placeholder="To" value={newEmail.to} onChange={(e) => setNewEmail({...newEmail, to: e.target.value})} style={{ padding: '0.75rem', border: '1px solid #d1d5db', borderRadius: '0.375rem', fontSize: '1rem' }} />
              <input type="text" placeholder="Subject" value={newEmail.subject} onChange={(e) => setNewEmail({...newEmail, subject: e.target.value})} style={{ padding: '0.75rem', border: '1px solid #d1d5db', borderRadius: '0.375rem', fontSize: '1rem' }} />
              <textarea placeholder="Message" value={newEmail.body} onChange={(e) => setNewEmail({...newEmail, body: e.target.value})} rows={15} style={{ padding: '0.75rem', border: '1px solid #d1d5db', borderRadius: '0.375rem', fontSize: '1rem', resize: 'vertical' }} />
              <button onClick={sendEmail} style={{ padding: '0.75rem', backgroundColor: '#3b82f6', color: '#fff', border: 'none', borderRadius: '0.375rem', cursor: 'pointer', fontWeight: '600', fontSize: '1rem' }}>
                Send Email
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Email Detail */}
      {selectedEmail && !composing && (
        <div style={{ flex: 1, padding: '2rem', overflowY: 'auto' }}>
          <div style={{ maxWidth: '800px', margin: '0 auto' }}>
            <button onClick={() => setSelectedEmail(null)} style={{ padding: '0.5rem 1rem', backgroundColor: '#f3f4f6', border: 'none', borderRadius: '0.375rem', cursor: 'pointer', marginBottom: '1rem' }}>
              ← Back to {folder}
            </button>
            <div style={{ backgroundColor: '#fff', padding: '2rem', borderRadius: '0.5rem', boxShadow: '0 2px 4px rgba(0,0,0,0.1)' }}>
              <h1 style={{ fontSize: '1.875rem', fontWeight: '600', marginBottom: '1rem' }}>{selectedEmail.subject}</h1>
              <div style={{ display: 'flex', justifyContent: 'space-between', paddingBottom: '1rem', borderBottom: '1px solid #e5e7eb', marginBottom: '1.5rem' }}>
                <div>
                  <div style={{ fontWeight: '600' }}>{selectedEmail.from}</div>
                  <div style={{ fontSize: '0.875rem', color: '#6b7280' }}>to: me</div>
                </div>
                <div style={{ fontSize: '0.875rem', color: '#6b7280' }}>{selectedEmail.date}</div>
              </div>
              <div style={{ lineHeight: '1.6' }}>{selectedEmail.preview}</div>
              <div style={{ marginTop: '2rem', display: 'flex', gap: '1rem' }}>
                <button style={{ padding: '0.75rem 1.5rem', backgroundColor: '#3b82f6', color: '#fff', border: 'none', borderRadius: '0.375rem', cursor: 'pointer' }}>
                  Reply
                </button>
                <button style={{ padding: '0.75rem 1.5rem', backgroundColor: '#f3f4f6', border: 'none', borderRadius: '0.375rem', cursor: 'pointer' }}>
                  Forward
                </button>
                <button style={{ padding: '0.75rem 1.5rem', backgroundColor: '#ef4444', color: '#fff', border: 'none', borderRadius: '0.375rem', cursor: 'pointer' }}>
                  Delete
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Empty State */}
      {!composing && !selectedEmail && emails.length === 0 && (
        <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#6b7280' }}>
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: '4rem', marginBottom: '1rem' }}>📧</div>
            <h2 style={{ fontSize: '1.5rem', marginBottom: '0.5rem' }}>No emails in {folder}</h2>
            <p>Your {folder} is empty</p>
          </div>
        </div>
      )}
    </div>
  );
}

export default Email;
