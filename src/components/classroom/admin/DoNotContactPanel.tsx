import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';

interface DoNotContactEntry {
  id: string;
  email: string;
  reason: string;
  reason_details: string | null;
  added_by_email: string | null;
  created_at: string;
  expires_at: string | null;
}

export default function DoNotContactPanel() {
  const [entries, setEntries] = useState<DoNotContactEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddForm, setShowAddForm] = useState(false);
  const [newEntry, setNewEntry] = useState({
    email: '',
    reason: 'user_request',
    reason_details: '',
    expires_at: '',
  });
  const [alertMessage, setAlertMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  useEffect(() => {
    loadEntries();
  }, []);

  const loadEntries = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('do_not_contact')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      setAlertMessage({ type: 'error', text: `Failed to load entries: ${error.message}` });
    } else {
      setEntries(data || []);
    }
    setLoading(false);
  };

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const { error } = await supabase.rpc('add_to_do_not_contact', {
      p_email: newEntry.email,
      p_reason: newEntry.reason,
      p_reason_details: newEntry.reason_details || null,
      p_expires_at: newEntry.expires_at || null,
    });

    if (error) {
      setAlertMessage({ type: 'error', text: `Failed to add entry: ${error.message}` });
    } else {
      setAlertMessage({ type: 'success', text: `Added ${newEntry.email} to Do Not Contact list` });
      setNewEntry({ email: '', reason: 'user_request', reason_details: '', expires_at: '' });
      setShowAddForm(false);
      loadEntries();
    }
  };

  const handleRemove = async (email: string) => {
    if (!confirm(`Remove ${email} from Do Not Contact list?`)) {
      return;
    }

    const { error } = await supabase.rpc('remove_from_do_not_contact', {
      p_email: email,
    });

    if (error) {
      setAlertMessage({ type: 'error', text: `Failed to remove entry: ${error.message}` });
    } else {
      setAlertMessage({ type: 'success', text: `Removed ${email} from Do Not Contact list` });
      loadEntries();
    }
  };

  const getReasonLabel = (reason: string) => {
    const labels: Record<string, string> = {
      user_request: 'User Request',
      hard_bounce: 'Hard Bounce',
      spam_complaint: 'Spam Complaint',
      admin_block: 'Admin Block',
      legal_requirement: 'Legal Requirement',
    };
    return labels[reason] || reason;
  };

  const getReasonColor = (reason: string) => {
    const colors: Record<string, string> = {
      user_request: 'bg-blue-100 text-blue-800',
      hard_bounce: 'bg-red-100 text-red-800',
      spam_complaint: 'bg-orange-100 text-orange-800',
      admin_block: 'bg-purple-100 text-purple-800',
      legal_requirement: 'bg-gray-100 text-gray-800',
    };
    return colors[reason] || 'bg-gray-100 text-gray-800';
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-12">
        <div className="text-gray-500">Loading...</div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto p-6">
      <div className="mb-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold mb-2">Do Not Contact List</h1>
            <p className="text-gray-600">Manage email addresses that should not receive communications</p>
          </div>
          <button
            onClick={() => setShowAddForm(!showAddForm)}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            {showAddForm ? 'Cancel' : 'Add Entry'}
          </button>
        </div>
      </div>

      {/* Alert Message */}
      {alertMessage && (
        <div className={`mb-6 p-4 rounded-lg ${alertMessage.type === 'success' ? 'bg-green-50 border border-green-200' : 'bg-red-50 border border-red-200'}`}>
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <span className="text-lg mr-2">{alertMessage.type === 'success' ? '✅' : '❌'}</span>
              <p className={`text-sm font-medium ${alertMessage.type === 'success' ? 'text-green-800' : 'text-red-800'}`}>
                {alertMessage.text}
              </p>
            </div>
            <button
              onClick={() => setAlertMessage(null)}
              className={`text-sm font-medium ${alertMessage.type === 'success' ? 'text-green-600 hover:text-green-800' : 'text-red-600 hover:text-red-800'}`}
            >
              Dismiss
            </button>
          </div>
        </div>
      )}

      {/* Add Form */}
      {showAddForm && (
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4">Add to Do Not Contact</h2>
          <form onSubmit={handleAdd} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Email Address</label>
              <input
                type="email"
                required
                value={newEntry.email}
                onChange={(e) => setNewEntry({ ...newEntry, email: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="user@example.com"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Reason</label>
              <select
                value={newEntry.reason}
                onChange={(e) => setNewEntry({ ...newEntry, reason: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="user_request">User Request</option>
                <option value="hard_bounce">Hard Bounce</option>
                <option value="spam_complaint">Spam Complaint</option>
                <option value="admin_block">Admin Block</option>
                <option value="legal_requirement">Legal Requirement</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Details (Optional)</label>
              <textarea
                value={newEntry.reason_details}
                onChange={(e) => setNewEntry({ ...newEntry, reason_details: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                rows={3}
                placeholder="Additional context..."
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Expiration Date (Optional)</label>
              <input
                type="datetime-local"
                value={newEntry.expires_at}
                onChange={(e) => setNewEntry({ ...newEntry, expires_at: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
              <p className="text-xs text-gray-500 mt-1">Leave empty for permanent block</p>
            </div>

            <div className="flex gap-3">
              <button
                type="submit"
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                Add to List
              </button>
              <button
                type="button"
                onClick={() => setShowAddForm(false)}
                className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 focus:outline-none focus:ring-2 focus:ring-gray-500"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
        <div className="bg-white rounded-lg shadow p-6">
          <div className="text-3xl font-bold text-gray-900">{entries.length}</div>
          <div className="text-sm text-gray-600">Total Blocked</div>
        </div>
        <div className="bg-white rounded-lg shadow p-6">
          <div className="text-3xl font-bold text-gray-900">
            {entries.filter(e => e.expires_at && new Date(e.expires_at) > new Date()).length}
          </div>
          <div className="text-sm text-gray-600">Temporary Blocks</div>
        </div>
        <div className="bg-white rounded-lg shadow p-6">
          <div className="text-3xl font-bold text-gray-900">
            {entries.filter(e => !e.expires_at || new Date(e.expires_at) <= new Date()).length}
          </div>
          <div className="text-sm text-gray-600">Permanent Blocks</div>
        </div>
      </div>

      {/* Entries Table */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Email
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Reason
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Details
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Added By
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Added
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Expires
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {entries.map((entry) => (
                <tr key={entry.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    {entry.email}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 py-1 text-xs font-semibold rounded-full ${getReasonColor(entry.reason)}`}>
                      {getReasonLabel(entry.reason)}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-500 max-w-xs truncate">
                    {entry.reason_details || '-'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {entry.added_by_email || 'System'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {new Date(entry.created_at).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {entry.expires_at ? (
                      <span className={new Date(entry.expires_at) > new Date() ? 'text-orange-600' : 'text-gray-400'}>
                        {new Date(entry.expires_at).toLocaleDateString()}
                      </span>
                    ) : (
                      <span className="text-gray-400">Never</span>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm">
                    <button
                      onClick={() => handleRemove(entry.email)}
                      className="text-red-600 hover:text-red-800 font-medium"
                    >
                      Remove
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {entries.length === 0 && (
          <div className="text-center py-12">
            <p className="text-gray-500">No entries in Do Not Contact list</p>
          </div>
        )}
      </div>
    </div>
  );
}
