/*
  Copyright (c) 2025 Elevate for Humanity
  Commercial License. No resale, sublicensing, or redistribution allowed.
  See LICENSE file for details.
*/
import React, { useEffect, useState } from "react";
import AppLayout from "../layouts/AppLayout";
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  ResponsiveContainer,
  Legend,
} from "recharts";

interface Autopilot {
  name: string;
  endpoint: string;
  capabilities: string[];
  needs?: {
    kvNamespaces?: string[];
    r2Buckets?: string[];
  };
}

interface DiagnosticResult {
  token?: { id: string; status: string };
  resources?: {
    kv?: Array<{ id: string; title: string }>;
    r2?: Array<{ name: string }>;
    workers?: string[];
  };
  timestamp?: string;
}

interface LogEntry {
  ts: string;
  day: string;
  autopilot: string;
  task: string;
  capability: string;
  level: string;
  ok: boolean;
  meta: Record<string, any>;
}

interface StatsData {
  range: { start: string; end: string; days: number };
  daily: Array<{
    day: string;
    ok: number;
    fail: number;
    total: number;
    fail_rate: number;
  }>;
  by_task: Array<{
    key: string;
    ok: number;
    fail: number;
    total: number;
    fail_rate: number;
  }>;
  by_autopilot: Array<{
    key: string;
    ok: number;
    fail: number;
    total: number;
    fail_rate: number;
  }>;
}

export default function AutopilotAdmin() {
  // State
  const [darkMode, setDarkMode] = useState(false);
  const [autopilots, setAutopilots] = useState<Autopilot[]>([]);
  const [loading, setLoading] = useState(false);
  const [log, setLog] = useState("");
  const [task, setTask] = useState("generate_page");
  const [meta, setMeta] = useState("{}");
  const [diagnostics, setDiagnostics] = useState<DiagnosticResult | null>(null);
  
  // Log analyzer state
  const [from, setFrom] = useState(
    new Date(Date.now() - 86400000).toISOString().slice(0, 10)
  );
  const [to, setTo] = useState(new Date().toISOString().slice(0, 10));
  const [cap, setCap] = useState("");
  const [taskFilter, setTaskFilter] = useState("");
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [summary, setSummary] = useState<any>(null);
  const [note, setNote] = useState("");
  
  // Trends state
  const [days, setDays] = useState(30);
  const [statsData, setStatsData] = useState<StatsData | null>(null);
  
  // Registration state
  const [regName, setRegName] = useState("");
  const [regEndpoint, setRegEndpoint] = useState("");
  const [regCaps, setRegCaps] = useState("");

  // Base URLs - Update these to your deployed workers
  const ORCHESTRATOR_BASE = "https://efh-autopilot-orchestrator.workers.dev";
  const ANALYZER_BASE = "https://efh-autopilot-analyzer.workers.dev";

  // Toast notification
  const toast = (msg: string, type: "success" | "error" | "info" = "info") => {
    setNote(msg);
    setTimeout(() => setNote(""), 3000);
  };

  // Orchestrator functions
  async function fetchList() {
    setLoading(true);
    try {
      const res = await fetch(`${ORCHESTRATOR_BASE}/autopilot/list`);
      const data = await res.json();
      setAutopilots(data.autopilots || []);
      toast("Autopilots loaded", "success");
    } catch (err) {
      toast(`Error: ${err}`, "error");
      setLog(`❌ Error fetching autopilots: ${err}`);
    }
    setLoading(false);
  }

  async function runDiag() {
    setLog("Running diagnostics...");
    try {
      const res = await fetch(`${ORCHESTRATOR_BASE}/autopilot/diagnose`);
      const data = await res.json();
      setDiagnostics(data);
      setLog(JSON.stringify(data, null, 2));
      toast("Diagnostics complete", "success");
    } catch (err) {
      toast(`Error: ${err}`, "error");
      setLog(`❌ Error running diagnostics: ${err}`);
    }
  }

  async function healInfra() {
    setLog("Healing infrastructure...");
    try {
      const res = await fetch(`${ORCHESTRATOR_BASE}/autopilot/ensure-infra`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          want: {
            kvNamespaces: ["REGISTRY", "AI_EMPLOYEE_LOGS", "LOGS", "SUMMARIES"],
            r2Buckets: ["efh-assets", "efh-images", "efh-pages"],
          },
        }),
      });
      const data = await res.json();
      setLog(JSON.stringify(data, null, 2));
      toast("Infrastructure healed", "success");
    } catch (err) {
      toast(`Error: ${err}`, "error");
      setLog(`❌ Error healing infrastructure: ${err}`);
    }
  }

  async function runTask() {
    setLog("Running task...");
    try {
      const parsedMeta = JSON.parse(meta || "{}");
      const res = await fetch(`${ORCHESTRATOR_BASE}/autopilot/plan`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ task, meta: parsedMeta }),
      });
      const data = await res.json();
      setLog(JSON.stringify(data, null, 2));
      toast("Task executed", "success");
    } catch (err) {
      toast(`Error: ${err}`, "error");
      setLog(`❌ Error running task: ${err}`);
    }
  }

  async function registerAutopilot() {
    if (!regName || !regEndpoint || !regCaps) {
      toast("Fill all fields", "error");
      return;
    }
    try {
      const capabilities = regCaps.split(",").map((s) => s.trim());
      const res = await fetch(`${ORCHESTRATOR_BASE}/autopilot/registry`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: regName,
          endpoint: regEndpoint,
          capabilities,
        }),
      });
      const data = await res.json();
      setLog(JSON.stringify(data, null, 2));
      toast("Autopilot registered", "success");
      setRegName("");
      setRegEndpoint("");
      setRegCaps("");
      fetchList();
    } catch (err) {
      toast(`Error: ${err}`, "error");
    }
  }

  // Log analyzer functions
  async function loadLogs() {
    setLoading(true);
    const q = new URLSearchParams({
      from,
      to,
      ...(cap ? { cap } : {}),
      ...(taskFilter ? { task: taskFilter } : {}),
    });
    try {
      const r = await fetch(`${ANALYZER_BASE}/logs/list?${q}`);
      const j = await r.json();
      setLogs(j.logs || []);
      toast("Logs loaded", "success");
    } catch (err) {
      toast(`Error: ${err}`, "error");
    }
    setLoading(false);
  }

  async function summarize() {
    setLoading(true);
    setNote("Summarizing…");
    try {
      const r = await fetch(`${ANALYZER_BASE}/logs/summarize`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ from, to }),
      });
      const j = await r.json();
      setSummary(j);
      toast("Summary generated", "success");
    } catch (err) {
      toast(`Error: ${err}`, "error");
    }
    setNote("");
    setLoading(false);
  }

  async function loadDaily() {
    try {
      const r = await fetch(`${ANALYZER_BASE}/logs/summary?date=${to}`);
      const j = await r.json();
      setSummary(j);
      toast("Daily summary loaded", "success");
    } catch (err) {
      toast(`Error: ${err}`, "error");
    }
  }

  async function loadStats() {
    setLoading(true);
    try {
      const r = await fetch(`${ANALYZER_BASE}/logs/stats?days=${days}`);
      const j = await r.json();
      setStatsData(j);
      toast("Stats loaded", "success");
    } catch (err) {
      toast(`Error: ${err}`, "error");
    }
    setLoading(false);
  }

  // Copy to clipboard
  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast("Copied to clipboard", "success");
  };

  // Initial load
  useEffect(() => {
    fetchList();
    loadStats();
  }, []);

  useEffect(() => {
    loadStats();
  }, [days]);

  const bgClass = darkMode ? "bg-gray-900 text-white" : "bg-gray-50 text-gray-900";
  const cardClass = darkMode
    ? "bg-gray-800 border-gray-700"
    : "bg-white border-gray-200";
  const inputClass = darkMode
    ? "bg-gray-700 border-gray-600 text-white"
    : "bg-white border-gray-300 text-gray-900";

  return (
    <AppLayout>
      <div className={`min-h-screen p-6 ${bgClass}`}>
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-3xl font-bold text-red-600">
            ⚙️ Autopilot Admin Console
          </h1>
          <button
            onClick={() => setDarkMode(!darkMode)}
            className="px-4 py-2 rounded bg-gray-700 text-white hover:bg-gray-600"
          >
            {darkMode ? "☀️ Light" : "🌙 Dark"}
          </button>
        </div>

        {/* Toast notification */}
        {note && (
          <div className="fixed top-4 right-4 bg-blue-600 text-white px-4 py-2 rounded shadow-lg z-50">
            {note}
          </div>
        )}

        {/* Orchestrator Section */}
        <div className={`mb-6 p-4 border rounded-lg shadow ${cardClass}`}>
          <h2 className="font-semibold mb-4 text-blue-600 text-xl">
            🎯 Orchestrator
          </h2>

          {/* Autopilot List */}
          <div className="mb-4">
            <h3 className="font-semibold mb-2">Registered Autopilots</h3>
            {loading && <p>Loading...</p>}
            {!loading && autopilots.length === 0 && (
              <p className="text-gray-500">No autopilots registered yet.</p>
            )}
            {!loading && autopilots.length > 0 && (
              <div className="overflow-x-auto">
                <table className="w-full text-sm border-collapse">
                  <thead>
                    <tr className={darkMode ? "bg-gray-700" : "bg-gray-100"}>
                      <th className="p-2 text-left">Name</th>
                      <th className="p-2 text-left">Capabilities</th>
                      <th className="p-2 text-left">Endpoint</th>
                    </tr>
                  </thead>
                  <tbody>
                    {autopilots.map((a) => (
                      <tr key={a.name} className="border-t">
                        <td className="p-2 font-medium text-orange-600">
                          {a.name}
                        </td>
                        <td className="p-2">
                          {(a.capabilities || []).join(", ")}
                        </td>
                        <td className="p-2 text-blue-700 text-xs">
                          {a.endpoint}
                          <button
                            onClick={() => copyToClipboard(a.endpoint)}
                            className="ml-2 text-gray-500 hover:text-blue-600"
                          >
                            📋
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          {/* Action Buttons */}
          <div className="grid md:grid-cols-4 gap-4 mb-4">
            <button
              onClick={runDiag}
              className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
            >
              🔍 Diagnostics
            </button>
            <button
              onClick={healInfra}
              className="bg-orange-500 text-white px-4 py-2 rounded hover:bg-orange-600"
            >
              🩺 Heal Infra
            </button>
            <button
              onClick={fetchList}
              className="bg-gray-700 text-white px-4 py-2 rounded hover:bg-gray-800"
            >
              🔁 Refresh
            </button>
            <button
              onClick={() => copyToClipboard(ORCHESTRATOR_BASE)}
              className="bg-purple-600 text-white px-4 py-2 rounded hover:bg-purple-700"
            >
              📋 Copy URL
            </button>
          </div>

          {/* Register Autopilot */}
          <div className={`p-4 border rounded mb-4 ${cardClass}`}>
            <h3 className="font-semibold mb-2">Register New Autopilot</h3>
            <div className="grid md:grid-cols-3 gap-3">
              <input
                className={`border p-2 rounded ${inputClass}`}
                placeholder="Name (e.g., ai-employee)"
                value={regName}
                onChange={(e) => setRegName(e.target.value)}
              />
              <input
                className={`border p-2 rounded ${inputClass}`}
                placeholder="Endpoint URL"
                value={regEndpoint}
                onChange={(e) => setRegEndpoint(e.target.value)}
              />
              <input
                className={`border p-2 rounded ${inputClass}`}
                placeholder="Capabilities (comma-separated)"
                value={regCaps}
                onChange={(e) => setRegCaps(e.target.value)}
              />
            </div>
            <button
              onClick={registerAutopilot}
              className="bg-green-600 text-white px-4 py-2 mt-3 rounded hover:bg-green-700"
            >
              ➕ Register
            </button>
          </div>

          {/* Diagnostics Display */}
          {diagnostics && (
            <div className={`p-4 border rounded mb-4 ${cardClass}`}>
              <h3 className="font-semibold text-lg mb-2 text-green-700">
                Diagnostic Summary
              </h3>
              <pre className="text-xs overflow-auto max-h-64">
                {JSON.stringify(diagnostics, null, 2)}
              </pre>
            </div>
          )}

          {/* Run Task */}
          <div className={`p-4 border rounded ${cardClass}`}>
            <h3 className="font-semibold mb-2">Run Task</h3>
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label className="block font-medium mb-1">Task Name</label>
                <select
                  className={`border p-2 w-full rounded ${inputClass}`}
                  value={task}
                  onChange={(e) => setTask(e.target.value)}
                >
                  <option value="generate_page">Generate Page</option>
                  <option value="deploy_page">Deploy Page</option>
                  <option value="generate_asset">Generate Asset</option>
                  <option value="process_email">Process Email</option>
                  <option value="create_lead">Create Lead</option>
                  <option value="send_followup">Send Follow-up</option>
                  <option value="make_checkout">Make Checkout</option>
                  <option value="enroll_student">Enroll Student</option>
                  <option value="run_payout_batch">Run Payout Batch</option>
                  <option value="pay_affiliate_now">Pay Affiliate Now</option>
                </select>
              </div>
              <div>
                <label className="block font-medium mb-1">Meta (JSON)</label>
                <textarea
                  className={`border p-2 rounded w-full h-20 font-mono text-xs ${inputClass}`}
                  value={meta}
                  onChange={(e) => setMeta(e.target.value)}
                  placeholder='{"pageType": "home"}'
                />
              </div>
            </div>
            <button
              onClick={runTask}
              className="bg-green-600 text-white px-4 py-2 mt-3 rounded hover:bg-green-700"
            >
              🚀 Run Task
            </button>
          </div>
        </div>

        {/* Log Analyzer Section */}
        <div className={`mb-6 p-4 border rounded-lg shadow ${cardClass}`}>
          <h2 className="font-semibold mb-4 text-blue-600 text-xl">
            📊 Log Analyzer
          </h2>

          {/* Filters */}
          <div className="grid md:grid-cols-5 gap-3 mb-4">
            <div>
              <label className="block text-sm">From</label>
              <input
                type="date"
                className={`border p-2 rounded w-full ${inputClass}`}
                value={from}
                onChange={(e) => setFrom(e.target.value)}
              />
            </div>
            <div>
              <label className="block text-sm">To</label>
              <input
                type="date"
                className={`border p-2 rounded w-full ${inputClass}`}
                value={to}
                onChange={(e) => setTo(e.target.value)}
              />
            </div>
            <div>
              <label className="block text-sm">Capability</label>
              <input
                className={`border p-2 rounded w-full ${inputClass}`}
                value={cap}
                onChange={(e) => setCap(e.target.value)}
                placeholder="e.g. payouts.batch.run"
              />
            </div>
            <div>
              <label className="block text-sm">Task</label>
              <input
                className={`border p-2 rounded w-full ${inputClass}`}
                value={taskFilter}
                onChange={(e) => setTaskFilter(e.target.value)}
                placeholder="e.g. run_payout_batch"
              />
            </div>
            <div className="flex items-end gap-2">
              <button
                onClick={loadLogs}
                className="bg-gray-700 text-white px-3 py-2 rounded w-full"
              >
                Refresh
              </button>
            </div>
          </div>

          {/* Summary Actions */}
          <div className="flex items-center gap-2 mb-4">
            <button
              onClick={summarize}
              className="bg-blue-600 text-white px-3 py-2 rounded"
            >
              AI Summarize
            </button>
            <button
              onClick={loadDaily}
              className="bg-orange-500 text-white px-3 py-2 rounded"
            >
              Load Daily Digest
            </button>
            <button
              onClick={() => copyToClipboard(ANALYZER_BASE)}
              className="bg-purple-600 text-white px-3 py-2 rounded"
            >
              📋 Copy URL
            </button>
            {loading && <span className="text-sm text-gray-500">Working…</span>}
          </div>

          {/* Summary Display */}
          {summary && (
            <div className={`p-4 border rounded mb-6 shadow ${cardClass}`}>
              <h2 className="font-semibold text-lg text-blue-700">
                Summary: {summary.date}
              </h2>
              <p className="text-sm text-gray-600 mb-2">
                OK: {summary.counts?.ok ?? summary.n_ok} · Fail:{" "}
                {summary.counts?.fail ?? summary.n_fail}
              </p>
              <div
                className="prose max-w-none"
                dangerouslySetInnerHTML={{
                  __html: (summary.summary_markdown || "").replace(
                    /\n/g,
                    "<br/>"
                  ),
                }}
              />
              {summary.highlights?.length ? (
                <ul className="list-disc pl-6 mt-2">
                  {summary.highlights.map((h: string, i: number) => (
                    <li key={i}>{h}</li>
                  ))}
                </ul>
              ) : null}
              {summary.next_actions?.length ? (
                <>
                  <h3 className="font-semibold mt-3">Next actions</h3>
                  <ul className="list-disc pl-6">
                    {summary.next_actions.map((h: string, i: number) => (
                      <li key={i}>{h}</li>
                    ))}
                  </ul>
                </>
              ) : null}
            </div>
          )}

          {/* Logs Table */}
          <div className="overflow-x-auto border rounded">
            <table className="min-w-full text-sm">
              <thead className={darkMode ? "bg-gray-700" : "bg-gray-100"}>
                <tr>
                  <th className="p-2 text-left">Time</th>
                  <th className="p-2 text-left">Autopilot</th>
                  <th className="p-2 text-left">Task</th>
                  <th className="p-2 text-left">Capability</th>
                  <th className="p-2 text-left">OK</th>
                  <th className="p-2 text-left">Level</th>
                </tr>
              </thead>
              <tbody>
                {logs.map((l, i) => (
                  <tr key={i} className="border-t">
                    <td className="p-2">
                      {new Date(l.ts).toLocaleString()}
                    </td>
                    <td className="p-2">{l.autopilot}</td>
                    <td className="p-2">{l.task}</td>
                    <td className="p-2">{l.capability}</td>
                    <td
                      className={`p-2 ${
                        l.ok ? "text-green-700" : "text-red-600"
                      }`}
                    >
                      {l.ok ? "yes" : "no"}
                    </td>
                    <td className="p-2">{l.level}</td>
                  </tr>
                ))}
                {!logs.length && (
                  <tr>
                    <td
                      className="p-4 text-center text-gray-500"
                      colSpan={6}
                    >
                      No events
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Trends Section */}
        <div className={`mb-6 p-4 border rounded-lg shadow ${cardClass}`}>
          <div className="flex items-center gap-3 mb-4">
            <h2 className="text-2xl font-bold text-red-600">📈 Trends</h2>
            <select
              className={`border p-2 rounded ${inputClass}`}
              value={days}
              onChange={(e) => setDays(Number(e.target.value))}
            >
              <option value={7}>7 days</option>
              <option value={14}>14 days</option>
              <option value={30}>30 days</option>
              <option value={60}>60 days</option>
            </select>
          </div>

          {statsData && (
            <div className="grid gap-6 md:grid-cols-2">
              {/* Daily OK vs Fail */}
              <div className={`border rounded-lg p-4 shadow ${cardClass}`}>
                <h3 className="font-semibold mb-2 text-blue-700">
                  Daily OK vs Fail
                </h3>
                <ResponsiveContainer width="100%" height={260}>
                  <BarChart data={statsData.daily}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="day" hide />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Bar dataKey="ok" stackId="a" fill="#10b981" />
                    <Bar dataKey="fail" stackId="a" fill="#ef4444" />
                  </BarChart>
                </ResponsiveContainer>
                <p className="text-xs text-gray-500 mt-1">
                  Range: {statsData.range.start} → {statsData.range.end}
                </p>
              </div>

              {/* Failure Rate */}
              <div className={`border rounded-lg p-4 shadow ${cardClass}`}>
                <h3 className="font-semibold mb-2 text-blue-700">
                  % Failure Rate
                </h3>
                <ResponsiveContainer width="100%" height={260}>
                  <LineChart data={statsData.daily}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="day" hide />
                    <YAxis domain={[0, "auto"]} />
                    <Tooltip />
                    <Line
                      type="monotone"
                      dataKey="fail_rate"
                      stroke="#ef4444"
                      dot={false}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>

              {/* Top Tasks */}
              <div
                className={`border rounded-lg p-4 shadow md:col-span-2 ${cardClass}`}
              >
                <h3 className="font-semibold mb-2 text-blue-700">
                  Top Tasks (volume & failure %)
                </h3>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={statsData.by_task}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="key" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Bar dataKey="total" fill="#3b82f6" />
                    <Bar dataKey="fail_rate" fill="#f97316" />
                  </BarChart>
                </ResponsiveContainer>
              </div>

              {/* Top Autopilots */}
              <div
                className={`border rounded-lg p-4 shadow md:col-span-2 ${cardClass}`}
              >
                <h3 className="font-semibold mb-2 text-blue-700">
                  Top Autopilots (volume & failure %)
                </h3>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={statsData.by_autopilot}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="key" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Bar dataKey="total" fill="#8b5cf6" />
                    <Bar dataKey="fail_rate" fill="#ef4444" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          )}
        </div>

        {/* Log Panel */}
        <div
          className={`p-4 rounded-lg font-mono text-sm whitespace-pre-wrap max-h-96 overflow-auto ${
            darkMode ? "bg-black text-green-400" : "bg-gray-100 text-gray-900"
          }`}
        >
          {log || "Ready."}
        </div>
      </div>
    </AppLayout>
  );
}
