import React, { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';

interface TimelineEvent {
  id: string;
  timestamp: string;
  type: 'task' | 'email' | 'audit' | 'status';
  action: string;
  details: string;
  status?: string;
  metadata?: Record<string, any>;
}

interface TimelineViewProps {
  entityType: 'task' | 'content' | 'sync_run';
  entityId: string;
}

export default function TimelineView({ entityType, entityId }: TimelineViewProps) {
  const [events, setEvents] = useState<TimelineEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<string>('all');

  useEffect(() => {
    loadTimeline();
  }, [entityType, entityId]);

  const loadTimeline = async () => {
    setLoading(true);
    const allEvents: TimelineEvent[] = [];

    try {
      // Load task events
      if (entityType === 'task') {
        const { data: task } = await supabase
          .from('tasks')
          .select('*')
          .eq('id', entityId)
          .single();

        if (task) {
          allEvents.push({
            id: `task-created-${task.id}`,
            timestamp: task.created_at,
            type: 'task',
            action: 'Task Created',
            details: `Task ${task.kind} created with priority ${task.priority}`,
            status: task.status,
            metadata: task.payload,
          });

          if (task.started_at) {
            allEvents.push({
              id: `task-started-${task.id}`,
              timestamp: task.started_at,
              type: 'task',
              action: 'Task Started',
              details: `Task execution began`,
              status: 'running',
            });
          }

          if (task.completed_at) {
            allEvents.push({
              id: `task-completed-${task.id}`,
              timestamp: task.completed_at,
              type: 'task',
              action: task.status === 'completed' ? 'Task Completed' : 'Task Failed',
              details: task.error_message || 'Task completed successfully',
              status: task.status,
            });
          }
        }

        // Load audit logs for task
        const { data: auditLogs } = await supabase
          .from('audit_logs')
          .select('*')
          .eq('task_id', entityId)
          .order('created_at', { ascending: false });

        if (auditLogs) {
          auditLogs.forEach(log => {
            allEvents.push({
              id: `audit-${log.id}`,
              timestamp: log.created_at,
              type: 'audit',
              action: log.action,
              details: JSON.stringify(log.details),
              metadata: log.details,
            });
          });
        }

        // Load emails for task
        const { data: emails } = await supabase
          .from('email_events')
          .select('*')
          .eq('task_id', entityId)
          .order('created_at', { ascending: false });

        if (emails) {
          emails.forEach(email => {
            allEvents.push({
              id: `email-${email.id}`,
              timestamp: email.created_at,
              type: 'email',
              action: `Email ${email.status}`,
              details: `To: ${email.recipient} - ${email.subject}`,
              status: email.status,
              metadata: {
                recipient: email.recipient,
                provider: email.provider,
                messageId: email.provider_message_id,
              },
            });

            // Add status change events
            if (email.sent_at) {
              allEvents.push({
                id: `email-sent-${email.id}`,
                timestamp: email.sent_at,
                type: 'email',
                action: 'Email Sent',
                details: `Sent via ${email.provider}`,
                status: 'sent',
              });
            }

            if (email.delivered_at) {
              allEvents.push({
                id: `email-delivered-${email.id}`,
                timestamp: email.delivered_at,
                type: 'email',
                action: 'Email Delivered',
                details: `Delivered to ${email.recipient}`,
                status: 'delivered',
              });
            }

            if (email.opened_at) {
              allEvents.push({
                id: `email-opened-${email.id}`,
                timestamp: email.opened_at,
                type: 'email',
                action: 'Email Opened',
                details: `Opened by ${email.recipient}`,
                status: 'opened',
              });
            }

            if (email.bounced_at) {
              allEvents.push({
                id: `email-bounced-${email.id}`,
                timestamp: email.bounced_at,
                type: 'email',
                action: 'Email Bounced',
                details: email.error_message || 'Email bounced',
                status: 'bounced',
              });
            }
          });
        }
      }

      // Load content events
      if (entityType === 'content') {
        const { data: emails } = await supabase
          .from('email_events')
          .select('*')
          .eq('content_id', entityId)
          .order('created_at', { ascending: false });

        if (emails) {
          emails.forEach(email => {
            allEvents.push({
              id: `email-${email.id}`,
              timestamp: email.created_at,
              type: 'email',
              action: `Email ${email.status}`,
              details: `To: ${email.recipient} - ${email.subject}`,
              status: email.status,
              metadata: {
                recipient: email.recipient,
                provider: email.provider,
                emailType: email.email_type,
              },
            });
          });
        }

        // Load tasks related to content
        const { data: tasks } = await supabase
          .from('tasks')
          .select('*')
          .contains('payload', { courseId: entityId })
          .order('created_at', { ascending: false })
          .limit(50);

        if (tasks) {
          tasks.forEach(task => {
            allEvents.push({
              id: `task-${task.id}`,
              timestamp: task.created_at,
              type: 'task',
              action: `Task: ${task.kind}`,
              details: `Status: ${task.status}`,
              status: task.status,
              metadata: task.payload,
            });
          });
        }
      }

      // Load sync run events
      if (entityType === 'sync_run') {
        const { data: syncRun } = await supabase
          .from('sync_runs')
          .select('*')
          .eq('id', entityId)
          .single();

        if (syncRun) {
          allEvents.push({
            id: `sync-started-${syncRun.id}`,
            timestamp: syncRun.started_at,
            type: 'status',
            action: 'Sync Started',
            details: `Sync type: ${syncRun.sync_type}`,
            status: 'running',
          });

          if (syncRun.completed_at) {
            allEvents.push({
              id: `sync-completed-${syncRun.id}`,
              timestamp: syncRun.completed_at,
              type: 'status',
              action: syncRun.status === 'completed' ? 'Sync Completed' : 'Sync Failed',
              details: syncRun.error_message || `Processed ${syncRun.records_processed} records`,
              status: syncRun.status,
              metadata: {
                recordsProcessed: syncRun.records_processed,
                recordsCreated: syncRun.records_created,
                recordsUpdated: syncRun.records_updated,
              },
            });
          }
        }

        // Load emails for sync run
        const { data: emails } = await supabase
          .from('email_events')
          .select('*')
          .eq('sync_run_id', entityId)
          .order('created_at', { ascending: false });

        if (emails) {
          emails.forEach(email => {
            allEvents.push({
              id: `email-${email.id}`,
              timestamp: email.created_at,
              type: 'email',
              action: `Email ${email.status}`,
              details: `To: ${email.recipient} - ${email.subject}`,
              status: email.status,
            });
          });
        }
      }

      // Sort all events by timestamp
      allEvents.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());

      setEvents(allEvents);
    } catch (error) {
      console.error('Error loading timeline:', error);
    } finally {
      setLoading(false);
    }
  };

  const getEventIcon = (type: string, status?: string) => {
    if (type === 'task') {
      if (status === 'completed') return '✅';
      if (status === 'failed') return '❌';
      if (status === 'running') return '⏳';
      return '📋';
    }
    if (type === 'email') {
      if (status === 'delivered') return '✅';
      if (status === 'opened') return '👁️';
      if (status === 'bounced') return '⚠️';
      if (status === 'sent') return '📤';
      return '📧';
    }
    if (type === 'audit') return '📝';
    if (type === 'status') return '🔄';
    return '•';
  };

  const getEventColor = (type: string, status?: string) => {
    if (status === 'completed' || status === 'delivered' || status === 'opened') {
      return 'text-green-600 bg-green-50';
    }
    if (status === 'failed' || status === 'bounced') {
      return 'text-red-600 bg-red-50';
    }
    if (status === 'running' || status === 'sent') {
      return 'text-blue-600 bg-blue-50';
    }
    return 'text-gray-600 bg-gray-50';
  };

  const filteredEvents = events.filter(event => {
    if (filter === 'all') return true;
    return event.type === filter;
  });

  return (
    <div className="bg-white rounded-lg shadow">
      <div className="p-6 border-b border-gray-200">
        <div className="flex justify-between items-center">
          <h2 className="text-xl font-semibold">Timeline</h2>
          <select
            value={filter}
            onChange={e => setFilter(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="all">All Events</option>
            <option value="task">Tasks</option>
            <option value="email">Emails</option>
            <option value="audit">Audit Logs</option>
            <option value="status">Status Changes</option>
          </select>
        </div>
      </div>

      <div className="p-6">
        {loading ? (
          <div className="text-center py-12">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            <p className="mt-4 text-gray-600">Loading timeline...</p>
          </div>
        ) : filteredEvents.length > 0 ? (
          <div className="space-y-4">
            {filteredEvents.map((event, index) => (
              <div key={event.id} className="flex gap-4">
                {/* Timeline line */}
                <div className="flex flex-col items-center">
                  <div
                    className={`w-10 h-10 rounded-full flex items-center justify-center ${getEventColor(
                      event.type,
                      event.status
                    )}`}
                  >
                    <span className="text-lg">{getEventIcon(event.type, event.status)}</span>
                  </div>
                  {index < filteredEvents.length - 1 && (
                    <div className="w-0.5 h-full bg-gray-200 flex-1 mt-2"></div>
                  )}
                </div>

                {/* Event content */}
                <div className="flex-1 pb-8">
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="font-semibold text-gray-900">{event.action}</h3>
                      <p className="text-sm text-gray-600 mt-1">{event.details}</p>
                      {event.metadata && Object.keys(event.metadata).length > 0 && (
                        <details className="mt-2">
                          <summary className="text-xs text-blue-600 cursor-pointer">
                            View details
                          </summary>
                          <pre className="mt-2 text-xs bg-gray-50 p-2 rounded overflow-x-auto">
                            {JSON.stringify(event.metadata, null, 2)}
                          </pre>
                        </details>
                      )}
                    </div>
                    <span className="text-xs text-gray-500 whitespace-nowrap ml-4">
                      {new Date(event.timestamp).toLocaleString()}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <p className="text-gray-600">No timeline events found</p>
          </div>
        )}
      </div>
    </div>
  );
}
