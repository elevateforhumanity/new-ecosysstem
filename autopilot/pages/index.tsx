import { useState, useEffect } from 'react';
import Head from 'next/head';

interface Stats {
  candidates: number;
  interviews: number;
  jobPostings: number;
  githubIssues?: number;
}

export default function AutopilotDashboard() {
  const [stats, setStats] = useState<Stats>({
    candidates: 0,
    interviews: 0,
    jobPostings: 0,
  });
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [isDryRun, setIsDryRun] = useState(true);

  useEffect(() => {
    fetchStats();
    checkDryRunStatus();
  }, []);

  const fetchStats = async () => {
    try {
      const res = await fetch('/api/stats');
      const data = await res.json();
      setStats(data);
    } catch (error) {
      console.error('Failed to fetch stats:', error);
    }
  };

  const checkDryRunStatus = async () => {
    try {
      const res = await fetch('/api/config');
      const data = await res.json();
      setIsDryRun(data.dryRun);
    } catch (error) {
      console.error('Failed to check dry run status:', error);
    }
  };

  const handleAction = async (action: string) => {
    setLoading(true);
    setMessage('');
    
    try {
      const res = await fetch(`/api/${action}`, {
        method: 'POST',
      });
      const data = await res.json();
      
      if (data.success) {
        setMessage(`✅ ${data.message}`);
        fetchStats();
      } else {
        setMessage(`❌ ${data.error || 'Action failed'}`);
      }
    } catch (error) {
      setMessage(`❌ Error: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Head>
        <title>EFH Autopilot Dashboard</title>
        <meta name="description" content="Elevate for Humanity Hiring Automation" />
      </Head>

      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-4xl font-bold text-gray-900">
              🤖 EFH Autopilot Dashboard
            </h1>
            <p className="mt-2 text-lg text-gray-600">
              Hiring automation for Elevate for Humanity
            </p>
            {isDryRun && (
              <div className="mt-4 bg-yellow-50 border-l-4 border-yellow-400 p-4">
                <div className="flex">
                  <div className="flex-shrink-0">
                    <svg className="h-5 w-5 text-yellow-400" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <div className="ml-3">
                    <p className="text-sm text-yellow-700">
                      <strong>DRY RUN MODE:</strong> No actual changes will be made to GitHub or external systems.
                      Set <code>DRY_RUN=false</code> in .env to enable writes.
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4 mb-8">
            <div className="card">
              <div className="flex items-center">
                <div className="flex-shrink-0 bg-blue-500 rounded-md p-3">
                  <svg className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                  </svg>
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 truncate">Candidates</dt>
                    <dd className="text-3xl font-semibold text-gray-900">{stats.candidates}</dd>
                  </dl>
                </div>
              </div>
            </div>

            <div className="card">
              <div className="flex items-center">
                <div className="flex-shrink-0 bg-green-500 rounded-md p-3">
                  <svg className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 truncate">Interviews</dt>
                    <dd className="text-3xl font-semibold text-gray-900">{stats.interviews}</dd>
                  </dl>
                </div>
              </div>
            </div>

            <div className="card">
              <div className="flex items-center">
                <div className="flex-shrink-0 bg-purple-500 rounded-md p-3">
                  <svg className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 truncate">Job Postings</dt>
                    <dd className="text-3xl font-semibold text-gray-900">{stats.jobPostings}</dd>
                  </dl>
                </div>
              </div>
            </div>

            <div className="card">
              <div className="flex items-center">
                <div className="flex-shrink-0 bg-orange-500 rounded-md p-3">
                  <svg className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                  </svg>
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 truncate">GitHub Issues</dt>
                    <dd className="text-3xl font-semibold text-gray-900">{stats.githubIssues || 0}</dd>
                  </dl>
                </div>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-2 mb-8">
            <div className="card">
              <h2 className="text-xl font-semibold mb-4">📝 Job Post Generation</h2>
              <p className="text-gray-600 mb-4">
                Generate job post drafts in Markdown format for LinkedIn, Indeed, and other platforms.
              </p>
              <button
                onClick={() => handleAction('generate-job-posts')}
                disabled={loading}
                className="btn btn-primary w-full"
              >
                {loading ? 'Generating...' : 'Generate Job Drafts'}
              </button>
            </div>

            <div className="card">
              <h2 className="text-xl font-semibold mb-4">🐙 GitHub Setup</h2>
              <p className="text-gray-600 mb-4">
                Create labels, issues, and project boards from your hiring plan.
              </p>
              <button
                onClick={() => handleAction('github-setup')}
                disabled={loading}
                className="btn btn-primary w-full"
              >
                {loading ? 'Setting up...' : 'Setup GitHub'}
              </button>
            </div>

            <div className="card">
              <h2 className="text-xl font-semibold mb-4">📊 Export Candidates</h2>
              <p className="text-gray-600 mb-4">
                Export candidate data to CSV for analysis or reporting.
              </p>
              <button
                onClick={() => handleAction('export-candidates')}
                disabled={loading}
                className="btn btn-secondary w-full"
              >
                {loading ? 'Exporting...' : 'Export to CSV'}
              </button>
            </div>

            <div className="card">
              <h2 className="text-xl font-semibold mb-4">🔄 Sync Status</h2>
              <p className="text-gray-600 mb-4">
                Refresh data from Supabase and GitHub.
              </p>
              <button
                onClick={() => fetchStats()}
                disabled={loading}
                className="btn btn-secondary w-full"
              >
                {loading ? 'Syncing...' : 'Refresh Data'}
              </button>
            </div>
          </div>

          {/* Message Display */}
          {message && (
            <div className={`p-4 rounded-lg mb-8 ${
              message.startsWith('✅') ? 'bg-green-50 text-green-800' : 'bg-red-50 text-red-800'
            }`}>
              {message}
            </div>
          )}

          {/* Candidate Intake Form */}
          <div className="card">
            <h2 className="text-2xl font-semibold mb-4">➕ Add New Candidate</h2>
            <form onSubmit={(e) => {
              e.preventDefault();
              handleAction('add-candidate');
            }}>
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div>
                  <label className="label">Full Name *</label>
                  <input type="text" name="fullName" required className="input" />
                </div>
                <div>
                  <label className="label">Email *</label>
                  <input type="email" name="email" required className="input" />
                </div>
                <div>
                  <label className="label">Phone</label>
                  <input type="tel" name="phone" className="input" />
                </div>
                <div>
                  <label className="label">Position *</label>
                  <input type="text" name="position" required className="input" />
                </div>
                <div>
                  <label className="label">LinkedIn URL</label>
                  <input type="url" name="linkedin" className="input" />
                </div>
                <div>
                  <label className="label">Source</label>
                  <select name="source" className="input">
                    <option value="">Select source...</option>
                    <option value="LinkedIn">LinkedIn</option>
                    <option value="Indeed">Indeed</option>
                    <option value="Referral">Referral</option>
                    <option value="Direct">Direct Application</option>
                    <option value="Other">Other</option>
                  </select>
                </div>
              </div>
              <div className="mt-4">
                <label className="label">Notes</label>
                <textarea name="notes" rows={3} className="input"></textarea>
              </div>
              <div className="mt-6">
                <button type="submit" disabled={loading} className="btn btn-primary">
                  {loading ? 'Adding...' : 'Add Candidate'}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </>
  );
}
