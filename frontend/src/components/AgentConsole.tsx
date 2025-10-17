/**
 * EFH Autopilot Agent Console
 * Dual-mode interface: Natural language OR structured commands
 */

import { useEffect, useMemo, useState } from 'react';

interface CommandDef {
  name: string;
  description: string;
  paramsSchema: {
    properties?: Record<string, { type: string; enum?: string[] }>;
    required?: string[];
  };
  rolesAllowed: string[];
}

interface AgentResponse {
  success: boolean;
  action?: string;
  result?: {
    message: string;
    data?: any;
  };
  error?: string;
}

interface AgentConsoleProps {
  jwt: string;
  commands: CommandDef[];
  userRoles?: string[];
}

export default function AgentConsole({
  jwt,
  commands,
  userRoles = ['admin'],
}: AgentConsoleProps) {
  const [mode, setMode] = useState<'natural' | 'structured'>('natural');
  const [prompt, setPrompt] = useState('');
  const [selected, setSelected] = useState<string>(commands[0]?.name || '');
  const selectedCmd = useMemo(
    () => commands.find((c) => c.name === selected),
    [commands, selected]
  );
  const [params, setParams] = useState<Record<string, any>>({});
  const [output, setOutput] = useState<AgentResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [history, setHistory] = useState<
    Array<{ prompt: string; response: AgentResponse }>
  >([]);

  useEffect(() => {
    setParams({});
  }, [selected]);

  async function runNatural() {
    if (!prompt.trim()) return;

    setLoading(true);
    setOutput(null);

    try {
      const res = await fetch('/api/agent', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${jwt}`,
          'x-user-roles': userRoles.join(','),
        },
        body: JSON.stringify({ prompt }),
      });

      const data: AgentResponse = await res.json();
      setOutput(data);
      setHistory((prev) => [...prev, { prompt, response: data }]);

      if (data.success) {
        setPrompt('');
      }
    } catch (error) {
      setOutput({
        success: false,
        error: error instanceof Error ? error.message : 'Network error',
      });
    } finally {
      setLoading(false);
    }
  }

  async function runStructured() {
    setLoading(true);
    setOutput(null);

    const structuredPrompt = `Execute ${selected} with ${JSON.stringify(params)}`;

    try {
      const res = await fetch('/api/agent', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${jwt}`,
          'x-user-roles': userRoles.join(','),
        },
        body: JSON.stringify({ prompt: structuredPrompt }),
      });

      const data: AgentResponse = await res.json();
      setOutput(data);
      setHistory((prev) => [
        ...prev,
        { prompt: structuredPrompt, response: data },
      ]);
    } catch (error) {
      setOutput({
        success: false,
        error: error instanceof Error ? error.message : 'Network error',
      });
    } finally {
      setLoading(false);
    }
  }

  function handleKeyDown(e: React.KeyboardEvent) {
    if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) {
      runNatural();
    }
  }

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="rounded-2xl border border-neutral-800 bg-neutral-950 text-white shadow-2xl">
        {/* Header */}
        <div className="border-b border-neutral-800 p-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-semibold">🤖 EFH Autopilot Agent</h2>
              <p className="mt-2 text-sm text-neutral-400">
                Natural language OR structured commands for program management
              </p>
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => setMode('natural')}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  mode === 'natural'
                    ? 'bg-emerald-600 text-white'
                    : 'bg-neutral-800 text-neutral-400 hover:bg-neutral-700'
                }`}
              >
                Natural
              </button>
              <button
                onClick={() => setMode('structured')}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  mode === 'structured'
                    ? 'bg-emerald-600 text-white'
                    : 'bg-neutral-800 text-neutral-400 hover:bg-neutral-700'
                }`}
              >
                Structured
              </button>
            </div>
          </div>
        </div>

        {/* Input Area */}
        <div className="p-6">
          {mode === 'natural' ? (
            <>
              <textarea
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="E.g., Create a Tax Prep program for $2500 (CIP 52.0304, 80 hours)."
                className="w-full h-32 p-4 bg-neutral-900 text-white rounded-xl border border-neutral-700 focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 resize-none font-mono text-sm"
                disabled={loading}
              />
              <div className="mt-4 flex items-center justify-between">
                <div className="text-xs text-neutral-500">
                  {loading ? 'Processing...' : 'Cmd/Ctrl + Enter to run'}
                </div>
                <button
                  onClick={runNatural}
                  disabled={loading || !prompt.trim()}
                  className="rounded-xl bg-emerald-500 px-6 py-3 font-medium hover:bg-emerald-400 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  {loading ? 'Running...' : 'Run'}
                </button>
              </div>
            </>
          ) : (
            <div className="space-y-4">
              <label className="block">
                <span className="text-sm text-neutral-400 font-medium">
                  Command
                </span>
                <select
                  value={selected}
                  onChange={(e) => setSelected(e.target.value)}
                  className="mt-2 w-full bg-neutral-900 p-3 rounded-lg border border-neutral-700 focus:border-emerald-500 focus:outline-none"
                >
                  {commands.map((c) => (
                    <option key={c.name} value={c.name}>
                      {c.name} — {c.description}
                    </option>
                  ))}
                </select>
              </label>

              {selectedCmd?.paramsSchema?.properties && (
                <div className="grid gap-3">
                  {Object.entries(selectedCmd.paramsSchema.properties).map(
                    ([key, schema]) => (
                      <label key={key} className="block">
                        <span className="text-sm text-neutral-400">
                          {key}
                          {selectedCmd.paramsSchema.required?.includes(key) && (
                            <span className="text-red-400 ml-1">*</span>
                          )}
                        </span>
                        {schema.enum ? (
                          <select
                            className="mt-1 w-full bg-neutral-900 p-2 rounded-lg border border-neutral-700"
                            onChange={(e) =>
                              setParams((p) => ({
                                ...p,
                                [key]: e.target.value,
                              }))
                            }
                          >
                            <option value="">Select...</option>
                            {schema.enum.map((opt) => (
                              <option key={opt} value={opt}>
                                {opt}
                              </option>
                            ))}
                          </select>
                        ) : (
                          <input
                            type={schema.type === 'number' ? 'number' : 'text'}
                            className="mt-1 w-full bg-neutral-900 p-2 rounded-lg border border-neutral-700 focus:border-emerald-500 focus:outline-none"
                            onChange={(e) =>
                              setParams((p) => ({
                                ...p,
                                [key]:
                                  schema.type === 'number'
                                    ? Number(e.target.value)
                                    : e.target.value,
                              }))
                            }
                            placeholder={schema.type}
                          />
                        )}
                      </label>
                    )
                  )}
                </div>
              )}

              <button
                onClick={runStructured}
                disabled={loading}
                className="w-full rounded-xl bg-emerald-500 px-6 py-3 font-medium hover:bg-emerald-400 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {loading ? 'Executing...' : 'Execute'}
              </button>
            </div>
          )}
        </div>

        {/* Output Area */}
        {output && (
          <div className="border-t border-neutral-800 p-6">
            <div className="text-sm font-medium text-neutral-400 mb-2">
              Output:
            </div>
            <div
              className={`p-4 rounded-xl font-mono text-sm ${
                output.success
                  ? 'bg-emerald-950/50 border border-emerald-800 text-emerald-300'
                  : 'bg-red-950/50 border border-red-800 text-red-300'
              }`}
            >
              {output.success ? (
                <>
                  <div className="font-semibold mb-2">✅ {output.action}</div>
                  <div className="whitespace-pre-wrap">
                    {output.result?.message}
                  </div>
                  {output.result?.data && (
                    <details className="mt-3">
                      <summary className="cursor-pointer text-neutral-400 hover:text-white">
                        View data
                      </summary>
                      <pre className="mt-2 text-xs overflow-auto max-h-64">
                        {JSON.stringify(output.result.data, null, 2)}
                      </pre>
                    </details>
                  )}
                </>
              ) : (
                <>
                  <div className="font-semibold mb-2">❌ Error</div>
                  <div>{output.error}</div>
                </>
              )}
            </div>
          </div>
        )}

        {/* History */}
        {history.length > 0 && (
          <div className="border-t border-neutral-800 p-6">
            <details>
              <summary className="cursor-pointer text-sm font-medium text-neutral-400 hover:text-white">
                Command History ({history.length})
              </summary>
              <div className="mt-4 space-y-3 max-h-64 overflow-auto">
                {history
                  .slice()
                  .reverse()
                  .map((item, i) => (
                    <div
                      key={i}
                      className="p-3 rounded-lg bg-neutral-900 text-xs"
                    >
                      <div className="text-neutral-400 mb-1">
                        → {item.prompt}
                      </div>
                      <div
                        className={
                          item.response.success
                            ? 'text-emerald-400'
                            : 'text-red-400'
                        }
                      >
                        {item.response.success ? '✅' : '❌'}{' '}
                        {item.response.result?.message || item.response.error}
                      </div>
                    </div>
                  ))}
              </div>
            </details>
          </div>
        )}
      </div>
    </div>
  );
}
