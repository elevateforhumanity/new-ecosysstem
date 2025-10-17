import React, { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { resendEmail } from '../../../google-classroom-autopilot/src/email-resend';

interface EmailEvent {
  id: string;
  recipient: string;
  subject: string;
  email_type: string;
  provider: string;
  provider_message_id: string;
  status: string;
  created_at: string;
  sent_at: string | null;
  delivered_at: string | null;
  opened_at: string | null;
  error_message: string | null;
  student_name: string | null;
  student_email: string | null;
  task_id: string | null;
  sync_run_id: string | null;
  content_id: string | null;
  correlation_id: string | null;
  blocked_by_dnc: boolean | null;
  resend_count: number | null;
  last_resend_at: string | null;
}

interface EmailStats {
  provider: string;
  email_type: string;
  total_sent: number;
  delivered: number;
  opened: number;
  clicked: number;
  bounced: number;
  complained: number;
  failed: number;
  delivery_rate: number;
  open_rate: number;
  click_rate: number;
}

export default function EmailEventsPanel() {
  const [events, setEvents] = useState<EmailEvent[]>([]);
  const [stats, setStats] = useState<EmailStats[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [resendingIds, setResendingIds] = useState<Set<string>>(new Set());
  const [alertMessage, setAlertMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    checkAdminStatus();
    loadData();

    // Subscribe to real-time updates
    const subscription = supabase
      .channel('email_events')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'email_events' }, () => {
        loadData();
      })
      .subscribe();

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const checkAdminStatus = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      setIsAdmin(false);
      return;
    }

    const { data, error } = await supabase.rpc('is_admin', { p_user_id: user.id });
    if (!error && data === true) {
      setIsAdmin(true);
    }
  };

  const loadData = async () => {
    setLoading(true);

    // Load recent events
    const { data: eventsData } = await supabase
      .from('v_recent_email_events')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(100);

    setEvents(eventsData || []);

    // Load stats
    const { data: statsData } = await supabase.rpc('get_email_stats', {
      p_start_date: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      p_end_date: new Date().toISOString().split('T')[0],
    });

    setStats(statsData || []);

    setLoading(false);
  };

  const handleResend = async (eventId: string) => {
    setResendingIds(prev => new Set(prev).add(eventId));
    setAlertMessage(null);

    try {
      // Get current user ID
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        setAlertMessage({ type: 'error', text: 'You must be logged in to resend emails' });
        return;
      }

      const result = await resendEmail(eventId, user.id);
      
      if (result.success) {
        setAlertMessage({ type: 'success', text: `Email resent successfully to ${result.recipient}` });
        // Reload data to show new event
        await loadData();
      } else if (result.skipped) {
        setAlertMessage({ type: 'error', text: result.reason || 'Email cannot be resent' });
      } else {
        setAlertMessage({ type: 'error', text: result.error || result.message || 'Failed to resend email' });
      }
    } catch (error: any) {
      setAlertMessage({ type: 'error', text: error.message || 'An unexpected error occurred while resending' });
    } finally {
      setResendingIds(prev => {
        const newSet = new Set(prev);
        newSet.delete(eventId);
        return newSet;
      });
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'delivered':
        return 'bg-brand-surface text-brand-success';
      case 'opened':
        return 'bg-brand-surface text-brand-info';
      case 'clicked':
        return 'bg-brand-surface text-brand-secondary';
      case 'bounced':
        return 'bg-brand-surface text-red-800';
      case 'complained':
        return 'bg-brand-surface text-brand-warning';
      case 'failed':
        return 'bg-brand-surface text-red-800';
      case 'sent':
        return 'bg-yellow-100 text-yellow-800';
      default:
        return 'bg-brand-surface-dark text-brand-text';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'delivered':
        return '✅';
      case 'opened':
        return '👁️';
      case 'clicked':
        return '🖱️';
      case 'bounced':
        return '⚠️';
      case 'complained':
        return '🚫';
      case 'failed':
        return '❌';
      case 'sent':
        return '📤';
      default:
        return '⏳';
    }
  };



  const filteredEvents = events.filter(event => {
    if (filter !== 'all' && event.status !== filter) return false;
    if (searchTerm && !event.recipient.toLowerCase().includes(searchTerm.toLowerCase()) && !event.subject.toLowerCase().includes(searchTerm.toLowerCase())) return false;
    return true;
  });

  return (
    <div className="max-w-7xl mx-auto p-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Email Events Dashboard</h1>
        <p className="text-brand-text-muted">Monitor email delivery, opens, and engagement</p>
      </div>

      {/* Alert Message */}
      {alertMessage && (
        <div className={`mb-6 p-4 rounded-lg ${alertMessage.type === 'success' ? 'bg-green-50 border border-green-200' : 'bg-red-50 border border-red-200'}`}>
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <span className="text-lg mr-2">{alertMessage.type === 'success' ? '✅' : '❌'}</span>
              <p className={`text-sm font-medium ${alertMessage.type === 'success' ? 'text-brand-success' : 'text-red-800'}`}>
                {alertMessage.text}
              </p>
            </div>
            <button
              onClick={() => setAlertMessage(null)}
              className={`text-sm font-medium ${alertMessage.type === 'success' ? 'text-brand-success hover:text-brand-success' : 'text-red-600 hover:text-red-800'}`}
            >
              Dismiss
            </button>
          </div>
        </div>
      )}

      {/* Stats Cards */}
      {stats.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          {stats.map((stat, index) => (
            <div key={index} className="bg-white rounded-lg shadow p-6">
              <div className="text-sm text-brand-text-muted mb-1">
                {stat.provider} - {stat.email_type}
              </div>
              <div className="text-3xl font-bold mb-2">{stat.total_sent}</div>
              <div className="text-sm text-brand-text-muted">Total Sent</div>
              <div className="mt-4 space-y-1 text-sm">
                <div className="flex justify-between">
                  <span>Delivered:</span>
                  <span className="font-semibold">{stat.delivery_rate}%</span>
                </div>
                <div className="flex justify-between">
                  <span>Opened:</span>
                  <span className="font-semibold">{stat.open_rate}%</span>
                </div>
                <div className="flex justify-between">
                  <span>Clicked:</span>
                  <span className="font-semibold">{stat.click_rate}%</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Filters */}
      <div className="bg-white rounded-lg shadow p-6 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-brand-text mb-2">Filter by Status</label>
            <select
              value={filter}
              onChange={e => setFilter(e.target.value)}
              className="w-full px-4 py-2 border border-brand-border-dark rounded-lg focus:ring-2 focus:ring-brand-focus focus:border-transparent"
            >
              <option value="all">All Statuses</option>
              <option value="queued">Queued</option>
              <option value="sent">Sent</option>
              <option value="delivered">Delivered</option>
              <option value="opened">Opened</option>
              <option value="clicked">Clicked</option>
              <option value="bounced">Bounced</option>
              <option value="complained">Complained</option>
              <option value="failed">Failed</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-brand-text mb-2">Search</label>
            <input
              type="text"
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              placeholder="Search by recipient or subject..."
              className="w-full px-4 py-2 border border-brand-border-dark rounded-lg focus:ring-2 focus:ring-brand-focus focus:border-transparent"
            />
          </div>
        </div>
      </div>

      {/* Events Table */}
      {loading ? (
        <div className="text-center py-12">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          <p className="mt-4 text-brand-text-muted">Loading email events...</p>
        </div>
      ) : (
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <div className="p-6 border-b border-brand-border">
            <h2 className="text-xl font-semibold">
              Recent Email Events ({filteredEvents.length})
            </h2>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-brand-surface">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-brand-text-light uppercase tracking-wider">
                    Recipient
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-brand-text-light uppercase tracking-wider">
                    Subject
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-brand-text-light uppercase tracking-wider">
                    Type
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-brand-text-light uppercase tracking-wider">
                    Provider
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-brand-text-light uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-brand-text-light uppercase tracking-wider">
                    Sent
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-brand-text-light uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredEvents.map(event => (
                  <tr key={event.id} className="hover:bg-brand-surface">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-medium text-brand-text">{event.recipient}</span>
                          {event.blocked_by_dnc && (
                            <span className="px-2 py-0.5 text-xs font-semibold rounded-full bg-brand-surface text-red-800" title="On Do Not Contact list">
                              🚫 DNC
                            </span>
                          )}
                        </div>
                        {event.student_name && (
                          <div className="text-sm text-brand-text-light">{event.student_name}</div>
                        )}
                        {event.resend_count && event.resend_count > 0 && (
                          <div className="text-xs text-orange-600 mt-1">
                            Resent {event.resend_count}x
                            {event.last_resend_at && ` (last: ${new Date(event.last_resend_at).toLocaleDateString()})`}
                          </div>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm text-brand-text">{event.subject}</div>
                      {event.provider_message_id && (
                        <div className="text-xs text-brand-text-light mt-1">
                          ID: {event.provider_message_id.substring(0, 20)}...
                        </div>
                      )}
                      {event.correlation_id && (
                        <div className="text-xs text-brand-info mt-1">
                          📎 {event.correlation_id.substring(0, 30)}...
                        </div>
                      )}
                      {event.task_id && (
                        <div className="text-xs text-purple-600 mt-1">
                          🔗 Task: {event.task_id.substring(0, 8)}...
                        </div>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-brand-text-light">
                      {event.email_type}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-brand-text-light">
                      {event.provider}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span
                        className={`px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(
                          event.status
                        )}`}
                      >
                        {getStatusIcon(event.status)} {event.status.toUpperCase()}
                      </span>
                      {event.error_message && (
                        <div className="text-xs text-red-600 mt-1">{event.error_message}</div>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-brand-text-light">
                      {event.sent_at ? new Date(event.sent_at).toLocaleString() : '-'}
                      {event.delivered_at && (
                        <div className="text-xs text-brand-success">
                          Delivered: {new Date(event.delivered_at).toLocaleString()}
                        </div>
                      )}
                      {event.opened_at && (
                        <div className="text-xs text-brand-info">
                          Opened: {new Date(event.opened_at).toLocaleString()}
                        </div>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      {(event.status === 'failed' || event.status === 'bounced') && (
                        <>
                          {!isAdmin ? (
                            <span className="text-xs text-brand-text-light" title="Admin access required">
                              Admin only
                            </span>
                          ) : event.blocked_by_dnc ? (
                            <span className="text-xs text-red-600" title="Cannot resend - on Do Not Contact list">
                              Blocked (DNC)
                            </span>
                          ) : event.resend_count && event.resend_count >= 3 ? (
                            <span className="text-xs text-brand-text-light" title="Maximum resend attempts reached">
                              Max attempts
                            </span>
                          ) : (
                            <button
                              onClick={() => handleResend(event.id)}
                              disabled={resendingIds.has(event.id)}
                              className="inline-flex items-center px-3 py-1 border border-transparent text-sm font-medium rounded-md text-white bg-brand-info hover:bg-brand-info-hover focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-brand-focus disabled:opacity-50 disabled:cursor-not-allowed"
                              title={event.resend_count ? `Resent ${event.resend_count} time(s)` : 'Resend this email'}
                            >
                              {resendingIds.has(event.id) ? 'Resending...' : 'Resend'}
                            </button>
                          )}
                        </>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {filteredEvents.length === 0 && (
            <div className="text-center py-12">
              <p className="text-brand-text-muted">No email events found</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
