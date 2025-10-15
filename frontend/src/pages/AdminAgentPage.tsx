/**
 * Admin Agent Page
 * Example usage of AgentConsole component
 */

import AgentConsole from '../components/AgentConsole';
import commands from '../../../workers/agent/commands.json';

export default function AdminAgentPage() {
  // In production, get JWT from Supabase auth session
  const jwt = localStorage.getItem('supabase.auth.token') || '';
  
  // In production, get user roles from auth session
  const userRoles = ['admin']; // or ['admin', 'staff']

  return (
    <div className="min-h-screen bg-neutral-900 py-12">
      <div className="max-w-7xl mx-auto px-4">
        {/* Page Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-white">AI Autopilot Agent</h1>
          <p className="mt-2 text-neutral-400">
            Manage programs, enrollments, affiliates, and reports with natural language or structured commands
          </p>
        </div>

        {/* Agent Console */}
        <AgentConsole 
          jwt={jwt}
          commands={commands.commands}
          userRoles={userRoles}
        />

        {/* Quick Reference */}
        <div className="mt-12 rounded-2xl border border-neutral-800 bg-neutral-950 p-6 text-white">
          <h2 className="text-xl font-semibold mb-4">Quick Reference</h2>
          
          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <h3 className="text-sm font-medium text-emerald-400 mb-2">Program Management</h3>
              <ul className="space-y-1 text-sm text-neutral-400">
                <li>• Create new training programs</li>
                <li>• Update tuition and pricing</li>
                <li>• Generate ETPL reports</li>
              </ul>
            </div>

            <div>
              <h3 className="text-sm font-medium text-emerald-400 mb-2">Student Enrollment</h3>
              <ul className="space-y-1 text-sm text-neutral-400">
                <li>• Enroll students in programs</li>
                <li>• Update enrollment status</li>
                <li>• Track progress and completions</li>
              </ul>
            </div>

            <div>
              <h3 className="text-sm font-medium text-emerald-400 mb-2">Affiliate Management</h3>
              <ul className="space-y-1 text-sm text-neutral-400">
                <li>• Register new affiliates</li>
                <li>• Track referrals and conversions</li>
                <li>• Calculate commissions</li>
              </ul>
            </div>

            <div>
              <h3 className="text-sm font-medium text-emerald-400 mb-2">Payouts & Reports</h3>
              <ul className="space-y-1 text-sm text-neutral-400">
                <li>• Process payout batches</li>
                <li>• View dashboard statistics</li>
                <li>• Generate compliance reports</li>
              </ul>
            </div>
          </div>
        </div>

        {/* Example Commands */}
        <div className="mt-8 rounded-2xl border border-neutral-800 bg-neutral-950 p-6 text-white">
          <h2 className="text-xl font-semibold mb-4">Example Commands</h2>
          
          <div className="space-y-4">
            <div>
              <div className="text-sm font-medium text-neutral-400 mb-1">Create Program:</div>
              <code className="block bg-neutral-900 p-3 rounded-lg text-sm text-emerald-400">
                "Create a Tax Preparation & Business Ops program for $2,500, 80 hours, CIP 52.0304"
              </code>
            </div>

            <div>
              <div className="text-sm font-medium text-neutral-400 mb-1">Update Tuition:</div>
              <code className="block bg-neutral-900 p-3 rounded-lg text-sm text-emerald-400">
                "Update tuition to $1,200 for program abc-123"
              </code>
            </div>

            <div>
              <div className="text-sm font-medium text-neutral-400 mb-1">Create Affiliate:</div>
              <code className="block bg-neutral-900 p-3 rounded-lg text-sm text-emerald-400">
                "Create gold tier affiliate for user xyz-789"
              </code>
            </div>

            <div>
              <div className="text-sm font-medium text-neutral-400 mb-1">Process Payouts:</div>
              <code className="block bg-neutral-900 p-3 rounded-lg text-sm text-emerald-400">
                "Run payout batch for commissions before 2025-10-15"
              </code>
            </div>
          </div>
        </div>

        {/* Security Notice */}
        <div className="mt-8 rounded-xl border border-yellow-800 bg-yellow-950/20 p-4 text-yellow-200">
          <div className="flex items-start gap-3">
            <span className="text-2xl">⚠️</span>
            <div>
              <div className="font-medium">Admin Access Required</div>
              <div className="text-sm text-yellow-300/80 mt-1">
                This agent requires admin or staff role. All actions are logged to the audit table for compliance.
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
