/**
 * Auto-Unenroll Policy Editor
 * Configure automatic unenrollment rules
 */

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';

interface UnenrollPolicy {
  id: number;
  auto_unenroll: boolean;
  grace_period_days: number;
  protected_domains: string[];
  protected_emails: string[];
  dry_run_mode: boolean;
  updated_at: string;
}

interface UnenrollCandidate {
  lms_source: string;
  lms_course_id: string;
  google_email: string;
  days_inactive: number;
  is_protected: boolean;
}

export default function UnenrollPolicyPanel() {
  const [policy, setPolicy] = useState<UnenrollPolicy | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [candidates, setCandidates] = useState<UnenrollCandidate[]>([]);
  const [showCandidates, setShowCandidates] = useState(false);

  // Form state
  const [autoUnenroll, setAutoUnenroll] = useState(false);
  const [gracePeriodDays, setGracePeriodDays] = useState(7);
  const [protectedDomains, setProtectedDomains] = useState('');
  const [protectedEmails, setProtectedEmails] = useState('');
  const [dryRunMode, setDryRunMode] = useState(true);

  useEffect(() => {
    loadPolicy();
  }, []);

  const loadPolicy = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('lms_unenroll_policy')
        .select('*')
        .order('id', { ascending: false })
        .limit(1)
        .single();

      if (error) throw error;

      if (data) {
        setPolicy(data);
        setAutoUnenroll(data.auto_unenroll);
        setGracePeriodDays(data.grace_period_days);
        setProtectedDomains((data.protected_domains || []).join('\n'));
        setProtectedEmails((data.protected_emails || []).join('\n'));
        setDryRunMode(data.dry_run_mode);
      }
    } catch (error: any) {
      setMessage({ type: 'error', text: `Failed to load policy: ${error.message}` });
    } finally {
      setLoading(false);
    }
  };

  const loadCandidates = async () => {
    try {
      const { data, error } = await supabase
        .from('v_unenroll_candidates')
        .select('*')
        .limit(100);

      if (error) throw error;

      setCandidates(data || []);
      setShowCandidates(true);
    } catch (error: any) {
      setMessage({ type: 'error', text: `Failed to load candidates: ${error.message}` });
    }
  };

  const handleSave = async () => {
    if (!policy) return;

    setSaving(true);
    setMessage(null);

    try {
      const { error } = await supabase
        .from('lms_unenroll_policy')
        .update({
          auto_unenroll: autoUnenroll,
          grace_period_days: gracePeriodDays,
          protected_domains: protectedDomains.split('\n').filter(d => d.trim()),
          protected_emails: protectedEmails.split('\n').filter(e => e.trim()),
          dry_run_mode: dryRunMode,
          updated_at: new Date().toISOString(),
        })
        .eq('id', policy.id);

      if (error) throw error;

      setMessage({ type: 'success', text: '✅ Policy updated successfully' });
      await loadPolicy();
    } catch (error: any) {
      setMessage({ type: 'error', text: `❌ Save failed: ${error.message}` });
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <div style={{ padding: '2rem' }}>Loading policy...</div>;
  }

  return (
    <div className="unenroll-policy-panel" style={{ padding: '2rem' }}>
      <h2>Auto-Unenroll Policy</h2>
      <p style={{ color: '#666', marginBottom: '2rem' }}>
        Configure automatic unenrollment for inactive users
      </p>

      {/* Message */}
      {message && (
        <div
          style={{
            padding: '1rem',
            marginBottom: '1rem',
            background: message.type === 'success' ? '#d4edda' : '#f8d7da',
            border: `1px solid ${message.type === 'success' ? '#c3e6cb' : '#f5c6cb'}`,
            borderRadius: '4px',
            color: message.type === 'success' ? '#155724' : '#721c24',
          }}
        >
          {message.text}
        </div>
      )}

      {/* Policy Form */}
      <div style={{ marginBottom: '2rem', padding: '1.5rem', background: '#f5f5f5', borderRadius: '8px' }}>
        {/* Master Switch */}
        <div style={{ marginBottom: '1.5rem' }}>
          <label style={{ display: 'flex', alignItems: 'center', cursor: 'pointer' }}>
            <input
              type="checkbox"
              checked={autoUnenroll}
              onChange={(e) => setAutoUnenroll(e.target.checked)}
              style={{ marginRight: '0.5rem', width: '20px', height: '20px' }}
            />
            <span style={{ fontWeight: 'bold', fontSize: '1.1rem' }}>
              Enable Auto-Unenroll
            </span>
          </label>
          <p style={{ fontSize: '0.9rem', color: '#666', marginTop: '0.5rem', marginLeft: '28px' }}>
            Master switch to enable/disable automatic unenrollment
          </p>
        </div>

        {/* Dry Run Mode */}
        <div style={{ marginBottom: '1.5rem' }}>
          <label style={{ display: 'flex', alignItems: 'center', cursor: 'pointer' }}>
            <input
              type="checkbox"
              checked={dryRunMode}
              onChange={(e) => setDryRunMode(e.target.checked)}
              style={{ marginRight: '0.5rem', width: '20px', height: '20px' }}
            />
            <span style={{ fontWeight: 'bold' }}>
              Dry Run Mode
            </span>
          </label>
          <p style={{ fontSize: '0.9rem', color: '#666', marginTop: '0.5rem', marginLeft: '28px' }}>
            Log unenroll actions without executing them (recommended for testing)
          </p>
        </div>

        {/* Grace Period */}
        <div style={{ marginBottom: '1.5rem' }}>
          <label style={{ display: 'block', fontWeight: 'bold', marginBottom: '0.5rem' }}>
            Grace Period (days)
          </label>
          <input
            type="number"
            min="1"
            max="365"
            value={gracePeriodDays}
            onChange={(e) => setGracePeriodDays(parseInt(e.target.value))}
            style={{ padding: '0.5rem', width: '100px', border: '1px solid #ccc', borderRadius: '4px' }}
          />
          <p style={{ fontSize: '0.9rem', color: '#666', marginTop: '0.5rem' }}>
            Days of inactivity before unenrolling a user
          </p>
        </div>

        {/* Protected Domains */}
        <div style={{ marginBottom: '1.5rem' }}>
          <label style={{ display: 'block', fontWeight: 'bold', marginBottom: '0.5rem' }}>
            Protected Domains
          </label>
          <textarea
            value={protectedDomains}
            onChange={(e) => setProtectedDomains(e.target.value)}
            placeholder="example.com&#10;school.edu"
            rows={4}
            style={{
              width: '100%',
              padding: '0.5rem',
              border: '1px solid #ccc',
              borderRadius: '4px',
              fontFamily: 'monospace',
              fontSize: '0.9rem',
            }}
          />
          <p style={{ fontSize: '0.9rem', color: '#666', marginTop: '0.5rem' }}>
            Email domains that should never be auto-unenrolled (one per line)
          </p>
        </div>

        {/* Protected Emails */}
        <div style={{ marginBottom: '1.5rem' }}>
          <label style={{ display: 'block', fontWeight: 'bold', marginBottom: '0.5rem' }}>
            Protected Emails
          </label>
          <textarea
            value={protectedEmails}
            onChange={(e) => setProtectedEmails(e.target.value)}
            placeholder="admin@example.com&#10;teacher@school.edu"
            rows={4}
            style={{
              width: '100%',
              padding: '0.5rem',
              border: '1px solid #ccc',
              borderRadius: '4px',
              fontFamily: 'monospace',
              fontSize: '0.9rem',
            }}
          />
          <p style={{ fontSize: '0.9rem', color: '#666', marginTop: '0.5rem' }}>
            Specific emails that should never be auto-unenrolled (one per line)
          </p>
        </div>

        {/* Save Button */}
        <button
          onClick={handleSave}
          disabled={saving}
          style={{
            padding: '0.75rem 2rem',
            background: '#007bff',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer',
            fontWeight: 'bold',
            fontSize: '1rem',
          }}
        >
          {saving ? 'Saving...' : 'Save Policy'}
        </button>
      </div>

      {/* Preview Candidates */}
      <div style={{ marginBottom: '2rem' }}>
        <button
          onClick={loadCandidates}
          style={{
            padding: '0.75rem 1.5rem',
            background: 'var(--brand-secondary)',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer',
            marginBottom: '1rem',
          }}
        >
          Preview Unenroll Candidates
        </button>

        {showCandidates && (
          <div>
            <h3>Unenroll Candidates ({candidates.length})</h3>
            {candidates.length === 0 ? (
              <p style={{ color: '#666' }}>No users eligible for unenroll</p>
            ) : (
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                  <tr style={{ background: '#f0f0f0' }}>
                    <th style={{ padding: '0.75rem', textAlign: 'left' }}>Email</th>
                    <th style={{ padding: '0.75rem', textAlign: 'left' }}>LMS Source</th>
                    <th style={{ padding: '0.75rem', textAlign: 'left' }}>Course ID</th>
                    <th style={{ padding: '0.75rem', textAlign: 'right' }}>Days Inactive</th>
                    <th style={{ padding: '0.75rem', textAlign: 'center' }}>Protected</th>
                  </tr>
                </thead>
                <tbody>
                  {candidates.slice(0, 50).map((c, idx) => (
                    <tr key={idx} style={{ borderBottom: '1px solid #ddd' }}>
                      <td style={{ padding: '0.75rem' }}>{c.google_email}</td>
                      <td style={{ padding: '0.75rem' }}>{c.lms_source}</td>
                      <td style={{ padding: '0.75rem', fontFamily: 'monospace', fontSize: '0.85rem' }}>
                        {c.lms_course_id}
                      </td>
                      <td style={{ padding: '0.75rem', textAlign: 'right' }}>{c.days_inactive}</td>
                      <td style={{ padding: '0.75rem', textAlign: 'center' }}>
                        {c.is_protected ? '🛡️' : ''}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
            {candidates.length > 50 && (
              <p style={{ marginTop: '1rem', color: '#666', fontSize: '0.9rem' }}>
                Showing first 50 of {candidates.length} candidates
              </p>
            )}
          </div>
        )}
      </div>

      {/* Current Status */}
      {policy && (
        <div style={{ padding: '1rem', background: '#e7f3ff', borderRadius: '4px', border: '1px solid #b3d9ff' }}>
          <h4 style={{ marginTop: 0 }}>Current Status</h4>
          <ul style={{ marginBottom: 0 }}>
            <li>Auto-Unenroll: <strong>{policy.auto_unenroll ? 'Enabled' : 'Disabled'}</strong></li>
            <li>Mode: <strong>{policy.dry_run_mode ? 'Dry Run' : 'Live'}</strong></li>
            <li>Grace Period: <strong>{policy.grace_period_days} days</strong></li>
            <li>Protected Domains: <strong>{policy.protected_domains?.length || 0}</strong></li>
            <li>Protected Emails: <strong>{policy.protected_emails?.length || 0}</strong></li>
            <li>Last Updated: <strong>{new Date(policy.updated_at).toLocaleString()}</strong></li>
          </ul>
        </div>
      )}
    </div>
  );
}
