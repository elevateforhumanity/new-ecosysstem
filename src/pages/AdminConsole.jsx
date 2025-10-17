import React, { useState, useEffect } from 'react';

export function AdminConsole() {
  const [view, setView] = useState('dashboard');
  const [users, setUsers] = useState([]);
  const [stats, setStats] = useState({
    totalUsers: 0,
    activeUsers: 0,
    storage: 0,
    revenue: 0
  });

  useEffect(() => {
    loadStats();
    loadUsers();
  }, []);

  const loadStats = () => {
    setStats({
      totalUsers: 1247,
      activeUsers: 892,
      storage: 2.4,
      revenue: 15420
    });
  };

  const loadUsers = () => {
    setUsers([
      { id: 1, name: 'John Doe', email: 'john@school.edu', role: 'teacher', status: 'active', joined: '2024-01-15' },
      { id: 2, name: 'Jane Smith', email: 'jane@school.edu', role: 'student', status: 'active', joined: '2024-02-20' },
      { id: 3, name: 'Bob Wilson', email: 'bob@school.edu', role: 'admin', status: 'active', joined: '2023-12-01' }
    ]);
  };

  const StatCard = ({ title, value, icon, color }) => (
    <div style={{ backgroundColor: '#fff', padding: '1.5rem', borderRadius: '0.5rem', boxShadow: '0 2px 4px rgba(0,0,0,0.1)' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <p style={{ color: 'var(--brand-text-muted)', fontSize: '0.875rem', marginBottom: '0.5rem' }}>{title}</p>
          <p style={{ fontSize: '2rem', fontWeight: '700', color }}>{value}</p>
        </div>
        <div style={{ fontSize: '3rem' }}>{icon}</div>
      </div>
    </div>
  );

  return (
    <div style={{ display: 'flex', height: '100vh', backgroundColor: 'var(--brand-surface)' }}>
      <div style={{ width: '250px', backgroundColor: 'var(--brand-text)', color: '#fff', padding: '1rem' }}>
        <h2 style={{ marginBottom: '2rem', fontSize: '1.25rem', fontWeight: '700' }}>⚙️ Admin Console</h2>
        
        <nav>
          <button onClick={() => setView('dashboard')} style={{ width: '100%', padding: '0.75rem', marginBottom: '0.5rem', backgroundColor: view === 'dashboard' ? 'var(--brand-info)' : 'transparent', color: '#fff', border: 'none', borderRadius: '0.375rem', cursor: 'pointer', textAlign: 'left', fontSize: '0.95rem' }}>
            📊 Dashboard
          </button>
          <button onClick={() => setView('users')} style={{ width: '100%', padding: '0.75rem', marginBottom: '0.5rem', backgroundColor: view === 'users' ? 'var(--brand-info)' : 'transparent', color: '#fff', border: 'none', borderRadius: '0.375rem', cursor: 'pointer', textAlign: 'left', fontSize: '0.95rem' }}>
            👥 Users
          </button>
          <button onClick={() => setView('schools')} style={{ width: '100%', padding: '0.75rem', marginBottom: '0.5rem', backgroundColor: view === 'schools' ? 'var(--brand-info)' : 'transparent', color: '#fff', border: 'none', borderRadius: '0.375rem', cursor: 'pointer', textAlign: 'left', fontSize: '0.95rem' }}>
            🏫 Schools
          </button>
          <button onClick={() => setView('billing')} style={{ width: '100%', padding: '0.75rem', marginBottom: '0.5rem', backgroundColor: view === 'billing' ? 'var(--brand-info)' : 'transparent', color: '#fff', border: 'none', borderRadius: '0.375rem', cursor: 'pointer', textAlign: 'left', fontSize: '0.95rem' }}>
            💳 Billing
          </button>
          <button onClick={() => setView('storage')} style={{ width: '100%', padding: '0.75rem', marginBottom: '0.5rem', backgroundColor: view === 'storage' ? 'var(--brand-info)' : 'transparent', color: '#fff', border: 'none', borderRadius: '0.375rem', cursor: 'pointer', textAlign: 'left', fontSize: '0.95rem' }}>
            💾 Storage
          </button>
          <button onClick={() => setView('security')} style={{ width: '100%', padding: '0.75rem', marginBottom: '0.5rem', backgroundColor: view === 'security' ? 'var(--brand-info)' : 'transparent', color: '#fff', border: 'none', borderRadius: '0.375rem', cursor: 'pointer', textAlign: 'left', fontSize: '0.95rem' }}>
            🔒 Security
          </button>
          <button onClick={() => setView('compliance')} style={{ width: '100%', padding: '0.75rem', marginBottom: '0.5rem', backgroundColor: view === 'compliance' ? 'var(--brand-info)' : 'transparent', color: '#fff', border: 'none', borderRadius: '0.375rem', cursor: 'pointer', textAlign: 'left', fontSize: '0.95rem' }}>
            ✅ Compliance
          </button>
          <button onClick={() => setView('logs')} style={{ width: '100%', padding: '0.75rem', marginBottom: '0.5rem', backgroundColor: view === 'logs' ? 'var(--brand-info)' : 'transparent', color: '#fff', border: 'none', borderRadius: '0.375rem', cursor: 'pointer', textAlign: 'left', fontSize: '0.95rem' }}>
            📋 Audit Logs
          </button>
          <button onClick={() => setView('settings')} style={{ width: '100%', padding: '0.75rem', backgroundColor: view === 'settings' ? 'var(--brand-info)' : 'transparent', color: '#fff', border: 'none', borderRadius: '0.375rem', cursor: 'pointer', textAlign: 'left', fontSize: '0.95rem' }}>
            ⚙️ Settings
          </button>
        </nav>
      </div>

      <div style={{ flex: 1, overflowY: 'auto', padding: '2rem' }}>
        {view === 'dashboard' && (
          <div>
            <h1 style={{ fontSize: '2rem', fontWeight: '700', marginBottom: '2rem' }}>Dashboard</h1>
            
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '1.5rem', marginBottom: '2rem' }}>
              <StatCard title="Total Users" value={stats.totalUsers.toLocaleString()} icon="👥" color="var(--brand-info)" />
              <StatCard title="Active Users" value={stats.activeUsers.toLocaleString()} icon="✅" color="var(--brand-success)" />
              <StatCard title="Storage (TB)" value={stats.storage} icon="💾" color="var(--brand-warning)" />
              <StatCard title="Revenue ($)" value={`$${stats.revenue.toLocaleString()}`} icon="💰" color="var(--brand-secondary)" />
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '1.5rem' }}>
              <div style={{ backgroundColor: '#fff', padding: '1.5rem', borderRadius: '0.5rem', boxShadow: '0 2px 4px rgba(0,0,0,0.1)' }}>
                <h2 style={{ fontSize: '1.25rem', fontWeight: '600', marginBottom: '1rem' }}>Recent Activity</h2>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                  {[
                    { user: 'John Doe', action: 'Created new class', time: '5 min ago' },
                    { user: 'Jane Smith', action: 'Uploaded document', time: '12 min ago' },
                    { user: 'Bob Wilson', action: 'Modified permissions', time: '1 hour ago' }
                  ].map((activity, i) => (
                    <div key={i} style={{ padding: '1rem', backgroundColor: 'var(--brand-surface)', borderRadius: '0.375rem' }}>
                      <p style={{ fontWeight: '600', marginBottom: '0.25rem' }}>{activity.user}</p>
                      <p style={{ fontSize: '0.875rem', color: 'var(--brand-text-muted)' }}>{activity.action} • {activity.time}</p>
                    </div>
                  ))}
                </div>
              </div>

              <div style={{ backgroundColor: '#fff', padding: '1.5rem', borderRadius: '0.5rem', boxShadow: '0 2px 4px rgba(0,0,0,0.1)' }}>
                <h2 style={{ fontSize: '1.25rem', fontWeight: '600', marginBottom: '1rem' }}>Quick Actions</h2>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                  <button style={{ padding: '0.75rem', backgroundColor: 'var(--brand-info)', color: '#fff', border: 'none', borderRadius: '0.375rem', cursor: 'pointer', fontWeight: '600' }}>
                    + Add User
                  </button>
                  <button style={{ padding: '0.75rem', backgroundColor: 'var(--brand-success)', color: '#fff', border: 'none', borderRadius: '0.375rem', cursor: 'pointer', fontWeight: '600' }}>
                    + Add School
                  </button>
                  <button style={{ padding: '0.75rem', backgroundColor: 'var(--brand-warning)', color: '#fff', border: 'none', borderRadius: '0.375rem', cursor: 'pointer', fontWeight: '600' }}>
                    📊 Export Report
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {view === 'users' && (
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
              <h1 style={{ fontSize: '2rem', fontWeight: '700' }}>User Management</h1>
              <button style={{ padding: '0.75rem 1.5rem', backgroundColor: 'var(--brand-info)', color: '#fff', border: 'none', borderRadius: '0.5rem', cursor: 'pointer', fontWeight: '600' }}>
                + Add User
              </button>
            </div>

            <div style={{ backgroundColor: '#fff', borderRadius: '0.5rem', boxShadow: '0 2px 4px rgba(0,0,0,0.1)', overflow: 'hidden' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead style={{ backgroundColor: 'var(--brand-surface)' }}>
                  <tr>
                    <th style={{ padding: '1rem', textAlign: 'left', fontWeight: '600', color: 'var(--brand-text-muted)' }}>Name</th>
                    <th style={{ padding: '1rem', textAlign: 'left', fontWeight: '600', color: 'var(--brand-text-muted)' }}>Email</th>
                    <th style={{ padding: '1rem', textAlign: 'left', fontWeight: '600', color: 'var(--brand-text-muted)' }}>Role</th>
                    <th style={{ padding: '1rem', textAlign: 'left', fontWeight: '600', color: 'var(--brand-text-muted)' }}>Status</th>
                    <th style={{ padding: '1rem', textAlign: 'left', fontWeight: '600', color: 'var(--brand-text-muted)' }}>Joined</th>
                    <th style={{ padding: '1rem', textAlign: 'left', fontWeight: '600', color: 'var(--brand-text-muted)' }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {users.map(user => (
                    <tr key={user.id} style={{ borderTop: '1px solid var(--brand-border)' }}>
                      <td style={{ padding: '1rem' }}>{user.name}</td>
                      <td style={{ padding: '1rem', color: 'var(--brand-text-muted)' }}>{user.email}</td>
                      <td style={{ padding: '1rem' }}>
                        <span style={{ padding: '0.25rem 0.75rem', backgroundColor: user.role === 'admin' ? '#fef3c7' : user.role === 'teacher' ? '#dbeafe' : '#f3e8ff', color: user.role === 'admin' ? '#92400e' : user.role === 'teacher' ? 'var(--brand-info)' : '#6b21a8', borderRadius: '9999px', fontSize: '0.875rem', fontWeight: '600' }}>
                          {user.role}
                        </span>
                      </td>
                      <td style={{ padding: '1rem' }}>
                        <span style={{ padding: '0.25rem 0.75rem', backgroundColor: '#d1fae5', color: '#065f46', borderRadius: '9999px', fontSize: '0.875rem', fontWeight: '600' }}>
                          {user.status}
                        </span>
                      </td>
                      <td style={{ padding: '1rem', color: 'var(--brand-text-muted)' }}>{user.joined}</td>
                      <td style={{ padding: '1rem' }}>
                        <button style={{ padding: '0.5rem 1rem', backgroundColor: 'var(--brand-info)', color: '#fff', border: 'none', borderRadius: '0.375rem', cursor: 'pointer', marginRight: '0.5rem', fontSize: '0.875rem' }}>
                          Edit
                        </button>
                        <button style={{ padding: '0.5rem 1rem', backgroundColor: 'var(--brand-danger)', color: '#fff', border: 'none', borderRadius: '0.375rem', cursor: 'pointer', fontSize: '0.875rem' }}>
                          Delete
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {view === 'compliance' && (
          <div>
            <h1 style={{ fontSize: '2rem', fontWeight: '700', marginBottom: '2rem' }}>Compliance Dashboard</h1>
            
            <div style={{ display: 'grid', gap: '1.5rem' }}>
              {[
                { name: 'FERPA', status: 'compliant', lastAudit: '2024-01-15', icon: '✅' },
                { name: 'COPPA', status: 'compliant', lastAudit: '2024-01-20', icon: '✅' },
                { name: 'GDPR', status: 'compliant', lastAudit: '2024-01-10', icon: '✅' },
                { name: 'CCPA', status: 'compliant', lastAudit: '2024-01-25', icon: '✅' }
              ].map((item, i) => (
                <div key={i} style={{ backgroundColor: '#fff', padding: '1.5rem', borderRadius: '0.5rem', boxShadow: '0 2px 4px rgba(0,0,0,0.1)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div>
                    <h3 style={{ fontSize: '1.25rem', fontWeight: '600', marginBottom: '0.5rem' }}>{item.icon} {item.name}</h3>
                    <p style={{ color: 'var(--brand-text-muted)', fontSize: '0.875rem' }}>Last audit: {item.lastAudit}</p>
                  </div>
                  <span style={{ padding: '0.5rem 1rem', backgroundColor: '#d1fae5', color: '#065f46', borderRadius: '9999px', fontWeight: '600' }}>
                    {item.status}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {(view === 'schools' || view === 'billing' || view === 'storage' || view === 'security' || view === 'logs' || view === 'settings') && (
          <div style={{ textAlign: 'center', padding: '4rem', color: 'var(--brand-text-muted)' }}>
            <div style={{ fontSize: '4rem', marginBottom: '1rem' }}>⚙️</div>
            <h2 style={{ fontSize: '1.5rem', marginBottom: '0.5rem' }}>{view.charAt(0).toUpperCase() + view.slice(1)}</h2>
            <p>This section is ready for implementation</p>
          </div>
        )}
      </div>
    </div>
  );
}

export default AdminConsole;
