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
          <p style={{ color: '#6b7280', fontSize: '0.875rem', marginBottom: '0.5rem' }}>{title}</p>
          <p style={{ fontSize: '2rem', fontWeight: '700', color }}>{value}</p>
        </div>
        <div style={{ fontSize: '3rem' }}>{icon}</div>
      </div>
    </div>
  );

  return (
    <div style={{ display: 'flex', height: '100vh', backgroundColor: '#f9fafb' }}>
      <div style={{ width: '250px', backgroundColor: '#1f2937', color: '#fff', padding: '1rem' }}>
        <h2 style={{ marginBottom: '2rem', fontSize: '1.25rem', fontWeight: '700' }}>⚙️ Admin Console</h2>
        
        <nav>
          <button onClick={() => setView('dashboard')} style={{ width: '100%', padding: '0.75rem', marginBottom: '0.5rem', backgroundColor: view === 'dashboard' ? '#3b82f6' : 'transparent', color: '#fff', border: 'none', borderRadius: '0.375rem', cursor: 'pointer', textAlign: 'left', fontSize: '0.95rem' }}>
            📊 Dashboard
          </button>
          <button onClick={() => setView('users')} style={{ width: '100%', padding: '0.75rem', marginBottom: '0.5rem', backgroundColor: view === 'users' ? '#3b82f6' : 'transparent', color: '#fff', border: 'none', borderRadius: '0.375rem', cursor: 'pointer', textAlign: 'left', fontSize: '0.95rem' }}>
            👥 Users
          </button>
          <button onClick={() => setView('schools')} style={{ width: '100%', padding: '0.75rem', marginBottom: '0.5rem', backgroundColor: view === 'schools' ? '#3b82f6' : 'transparent', color: '#fff', border: 'none', borderRadius: '0.375rem', cursor: 'pointer', textAlign: 'left', fontSize: '0.95rem' }}>
            🏫 Schools
          </button>
          <button onClick={() => setView('billing')} style={{ width: '100%', padding: '0.75rem', marginBottom: '0.5rem', backgroundColor: view === 'billing' ? '#3b82f6' : 'transparent', color: '#fff', border: 'none', borderRadius: '0.375rem', cursor: 'pointer', textAlign: 'left', fontSize: '0.95rem' }}>
            💳 Billing
          </button>
          <button onClick={() => setView('storage')} style={{ width: '100%', padding: '0.75rem', marginBottom: '0.5rem', backgroundColor: view === 'storage' ? '#3b82f6' : 'transparent', color: '#fff', border: 'none', borderRadius: '0.375rem', cursor: 'pointer', textAlign: 'left', fontSize: '0.95rem' }}>
            💾 Storage
          </button>
          <button onClick={() => setView('security')} style={{ width: '100%', padding: '0.75rem', marginBottom: '0.5rem', backgroundColor: view === 'security' ? '#3b82f6' : 'transparent', color: '#fff', border: 'none', borderRadius: '0.375rem', cursor: 'pointer', textAlign: 'left', fontSize: '0.95rem' }}>
            🔒 Security
          </button>
          <button onClick={() => setView('compliance')} style={{ width: '100%', padding: '0.75rem', marginBottom: '0.5rem', backgroundColor: view === 'compliance' ? '#3b82f6' : 'transparent', color: '#fff', border: 'none', borderRadius: '0.375rem', cursor: 'pointer', textAlign: 'left', fontSize: '0.95rem' }}>
            ✅ Compliance
          </button>
          <button onClick={() => setView('logs')} style={{ width: '100%', padding: '0.75rem', marginBottom: '0.5rem', backgroundColor: view === 'logs' ? '#3b82f6' : 'transparent', color: '#fff', border: 'none', borderRadius: '0.375rem', cursor: 'pointer', textAlign: 'left', fontSize: '0.95rem' }}>
            📋 Audit Logs
          </button>
          <button onClick={() => setView('settings')} style={{ width: '100%', padding: '0.75rem', backgroundColor: view === 'settings' ? '#3b82f6' : 'transparent', color: '#fff', border: 'none', borderRadius: '0.375rem', cursor: 'pointer', textAlign: 'left', fontSize: '0.95rem' }}>
            ⚙️ Settings
          </button>
        </nav>
      </div>

      <div style={{ flex: 1, overflowY: 'auto', padding: '2rem' }}>
        {view === 'dashboard' && (
          <div>
            <h1 style={{ fontSize: '2rem', fontWeight: '700', marginBottom: '2rem' }}>Dashboard</h1>
            
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '1.5rem', marginBottom: '2rem' }}>
              <StatCard title="Total Users" value={stats.totalUsers.toLocaleString()} icon="👥" color="#3b82f6" />
              <StatCard title="Active Users" value={stats.activeUsers.toLocaleString()} icon="✅" color="#10b981" />
              <StatCard title="Storage (TB)" value={stats.storage} icon="💾" color="#f59e0b" />
              <StatCard title="Revenue ($)" value={`$${stats.revenue.toLocaleString()}`} icon="💰" color="#8b5cf6" />
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
                    <div key={i} style={{ padding: '1rem', backgroundColor: '#f9fafb', borderRadius: '0.375rem' }}>
                      <p style={{ fontWeight: '600', marginBottom: '0.25rem' }}>{activity.user}</p>
                      <p style={{ fontSize: '0.875rem', color: '#6b7280' }}>{activity.action} • {activity.time}</p>
                    </div>
                  ))}
                </div>
              </div>

              <div style={{ backgroundColor: '#fff', padding: '1.5rem', borderRadius: '0.5rem', boxShadow: '0 2px 4px rgba(0,0,0,0.1)' }}>
                <h2 style={{ fontSize: '1.25rem', fontWeight: '600', marginBottom: '1rem' }}>Quick Actions</h2>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                  <button style={{ padding: '0.75rem', backgroundColor: '#3b82f6', color: '#fff', border: 'none', borderRadius: '0.375rem', cursor: 'pointer', fontWeight: '600' }}>
                    + Add User
                  </button>
                  <button style={{ padding: '0.75rem', backgroundColor: '#10b981', color: '#fff', border: 'none', borderRadius: '0.375rem', cursor: 'pointer', fontWeight: '600' }}>
                    + Add School
                  </button>
                  <button style={{ padding: '0.75rem', backgroundColor: '#f59e0b', color: '#fff', border: 'none', borderRadius: '0.375rem', cursor: 'pointer', fontWeight: '600' }}>
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
              <button style={{ padding: '0.75rem 1.5rem', backgroundColor: '#3b82f6', color: '#fff', border: 'none', borderRadius: '0.5rem', cursor: 'pointer', fontWeight: '600' }}>
                + Add User
              </button>
            </div>

            <div style={{ backgroundColor: '#fff', borderRadius: '0.5rem', boxShadow: '0 2px 4px rgba(0,0,0,0.1)', overflow: 'hidden' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead style={{ backgroundColor: '#f9fafb' }}>
                  <tr>
                    <th style={{ padding: '1rem', textAlign: 'left', fontWeight: '600', color: '#6b7280' }}>Name</th>
                    <th style={{ padding: '1rem', textAlign: 'left', fontWeight: '600', color: '#6b7280' }}>Email</th>
                    <th style={{ padding: '1rem', textAlign: 'left', fontWeight: '600', color: '#6b7280' }}>Role</th>
                    <th style={{ padding: '1rem', textAlign: 'left', fontWeight: '600', color: '#6b7280' }}>Status</th>
                    <th style={{ padding: '1rem', textAlign: 'left', fontWeight: '600', color: '#6b7280' }}>Joined</th>
                    <th style={{ padding: '1rem', textAlign: 'left', fontWeight: '600', color: '#6b7280' }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {users.map(user => (
                    <tr key={user.id} style={{ borderTop: '1px solid #e5e7eb' }}>
                      <td style={{ padding: '1rem' }}>{user.name}</td>
                      <td style={{ padding: '1rem', color: '#6b7280' }}>{user.email}</td>
                      <td style={{ padding: '1rem' }}>
                        <span style={{ padding: '0.25rem 0.75rem', backgroundColor: user.role === 'admin' ? '#fef3c7' : user.role === 'teacher' ? '#dbeafe' : '#f3e8ff', color: user.role === 'admin' ? '#92400e' : user.role === 'teacher' ? '#1e40af' : '#6b21a8', borderRadius: '9999px', fontSize: '0.875rem', fontWeight: '600' }}>
                          {user.role}
                        </span>
                      </td>
                      <td style={{ padding: '1rem' }}>
                        <span style={{ padding: '0.25rem 0.75rem', backgroundColor: '#d1fae5', color: '#065f46', borderRadius: '9999px', fontSize: '0.875rem', fontWeight: '600' }}>
                          {user.status}
                        </span>
                      </td>
                      <td style={{ padding: '1rem', color: '#6b7280' }}>{user.joined}</td>
                      <td style={{ padding: '1rem' }}>
                        <button style={{ padding: '0.5rem 1rem', backgroundColor: '#3b82f6', color: '#fff', border: 'none', borderRadius: '0.375rem', cursor: 'pointer', marginRight: '0.5rem', fontSize: '0.875rem' }}>
                          Edit
                        </button>
                        <button style={{ padding: '0.5rem 1rem', backgroundColor: '#ef4444', color: '#fff', border: 'none', borderRadius: '0.375rem', cursor: 'pointer', fontSize: '0.875rem' }}>
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
                    <p style={{ color: '#6b7280', fontSize: '0.875rem' }}>Last audit: {item.lastAudit}</p>
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
          <div style={{ textAlign: 'center', padding: '4rem', color: '#6b7280' }}>
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
