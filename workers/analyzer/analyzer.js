/**
 * AUTOPILOT AI LOG ANALYZER
 * - Ingest logs from all autopilots
 * - Query logs by time/capability/task
 * - Summarize with Workers AI
 * KV:
 *   LOGS:
 *     logs:<YYYY-MM-DD>:<ulid> -> {ts, autopilot, task, capability, level, ok, meta}
 *     idx:<YYYY-MM-DD>         -> newline-delimited list of ULIDs for that day
 *   SUMMARIES:
 *     sum:<YYYY-MM-DD>         -> {ts, date, counts, failures, highlights, text}
 */

const AI_MODEL = "@cf/meta/llama-3-8b-instruct";

export default {
  async fetch(req, env, ctx) {
    const url = new URL(req.url);
    if (req.method === "OPTIONS") return okCors();

    if (req.method === "POST" && url.pathname === "/logs/ingest") return ingest(req, env);
    if (req.method === "GET"  && url.pathname === "/logs/list")   return listLogs(url, env);
    if (req.method === "POST" && url.pathname === "/logs/summarize") return summarizeOnDemand(req, env);
    if (req.method === "GET"  && url.pathname === "/logs/summary") return getSummary(url, env);
    if (req.method === "GET"  && url.pathname === "/logs/stats") return stats(url, env);
    if (req.method === "GET"  && url.pathname === "/health") return json({ status: "healthy", service: "efh-autopilot-analyzer" });

    if (req.method === "POST" && url.pathname === "/__scheduled") {
      ctx.waitUntil(nightly(env));
      return new Response("ok");
    }
    return new Response("Not Found", { status: 404 });
  },
  async scheduled(event, env, ctx) {
    ctx.waitUntil(nightly(env));
  }
};

/* ============ Ingest ============ */
async function ingest(req, env) {
  const body = await req.json();
  // expected: { autopilot, task, capability, level="info"|"warn"|"error", ok=true/false, meta={} }
  const ts = new Date().toISOString();
  const day = ts.slice(0,10);
  const id = ulid();
  const rec = {
    ts, day,
    autopilot: body.autopilot || "unknown",
    task: body.task || "unknown",
    capability: body.capability || "unknown",
    level: body.level || (body.ok ? "info" : "error"),
    ok: body.ok ?? true,
    meta: body.meta || {}
  };

  await env.LOGS.put(`logs:${day}:${id}`, JSON.stringify(rec), { metadata: { day, task: rec.task, cap: rec.capability, ok: rec.ok } });
  await env.LOGS.put(`idx:${day}`, (await env.LOGS.get(`idx:${day}`) || "") + id + "\n");
  return json({ ok: true, id });
}

/* ============ List ============ */
async function listLogs(url, env) {
  const from = url.searchParams.get("from"); // ISO
  const to   = url.searchParams.get("to");
  const cap  = url.searchParams.get("cap");
  const task = url.searchParams.get("task");

  const days = expandDays(from, to);
  const out = [];

  for (const d of days) {
    const idx = await env.LOGS.get(`idx:${d}`);
    if (!idx) continue;
    const ids = idx.split("\n").filter(Boolean);
    // fetch in batches
    const batchSize = 20;
    for (let i=0;i<ids.length;i+=batchSize) {
      const keys = ids.slice(i, i+batchSize).map(id => `logs:${d}:${id}`);
      const vals = await env.LOGS.getMany(keys);
      for (const v of vals) {
        if (!v) continue;
        try {
          const rec = JSON.parse(v);
          if (cap && rec.capability !== cap) continue;
          if (task && rec.task !== task) continue;
          out.push(rec);
        } catch {}
      }
    }
  }

  // newest first
  out.sort((a,b)=>a.ts<b.ts?1:-1);
  return json({ logs: out.slice(0, 1000) }); // cap to 1k rows for UI speed
}

/* ============ Summarize (on-demand) ============ */
async function summarizeOnDemand(req, env) {
  const { from, to } = await req.json();
  const days = expandDays(from, to);
  const logs = await collectDays(days, env);
  const sum = await summarizeLogsWithAI(logs, env, { label: `${from}..${to}` });
  return json(sum);
}

/* ============ Get summary for a day ============ */
async function getSummary(url, env) {
  const date = url.searchParams.get("date") || new Date().toISOString().slice(0,10);
  const val = await env.SUMMARIES.get(`sum:${date}`);
  if (!val) return json({ error: "no-summary" }, 404);
  return json(JSON.parse(val));
}

/* ============ Stats endpoint ============ */
async function stats(url, env) {
  const days = Number(url.searchParams.get("days") || 30);
  const end = new Date(); end.setUTCHours(0,0,0,0);
  const start = new Date(end); start.setUTCDate(start.getUTCDate() - (days - 1));

  // collect logs day-by-day
  const series = [];
  const byTask = new Map();      // task -> {ok, fail}
  const byAuto = new Map();      // autopilot -> {ok, fail}

  for (let d = new Date(start); d <= end; d.setUTCDate(d.getUTCDate()+1)) {
    const key = d.toISOString().slice(0,10);
    const idx = await env.LOGS.get(`idx:${key}`);
    let ok = 0, fail = 0;
    if (idx) {
      const ids = idx.split("\n").filter(Boolean);
      for (let i = 0; i < ids.length; i += 25) {
        const keys = ids.slice(i, i + 25).map(id => `logs:${key}:${id}`);
        const vals = await env.LOGS.getMany(keys);
        for (const v of vals) if (v) {
          const rec = JSON.parse(v);
          if (rec.ok) ok++; else fail++;
          // task tallies
          const t = rec.task || "unknown";
          const tt = byTask.get(t) || { ok:0, fail:0 }; tt[rec.ok?"ok":"fail"]++; byTask.set(t, tt);
          // autopilot tallies
          const a = rec.autopilot || "unknown";
          const aa = byAuto.get(a) || { ok:0, fail:0 }; aa[rec.ok?"ok":"fail"]++; byAuto.set(a, aa);
        }
      }
    }
    const total = ok + fail;
    series.push({ day: key, ok, fail, total, fail_rate: total ? +(fail/total*100).toFixed(1) : 0 });
  }

  const toArr = (m) => Array.from(m.entries()).map(([k,v]) => ({
    key: k, ok: v.ok, fail: v.fail, total: v.ok+v.fail,
    fail_rate: v.ok+v.fail ? +(v.fail/(v.ok+v.fail)*100).toFixed(1) : 0
  })).sort((a,b)=>b.total-a.total);

  return json({
    range: { start: series[0]?.day, end: series.at(-1)?.day, days: series.length },
    daily: series,
    by_task: toArr(byTask).slice(0, 20),
    by_autopilot: toArr(byAuto).slice(0, 20)
  });
}

/* ============ Nightly cron ============ */
async function nightly(env) {
  // summarize yesterday
  const d = new Date(Date.now() - 24*3600*1000).toISOString().slice(0,10);
  const logs = await collectDays([d], env);
  if (!logs.length) return;

  const sum = await summarizeLogsWithAI(logs, env, { label: d });
  await env.SUMMARIES.put(`sum:${d}`, JSON.stringify(sum));
}

/* ============ Helpers ============ */
async function collectDays(days, env) {
  const results = [];
  for (const d of days) {
    const idx = await env.LOGS.get(`idx:${d}`);
    if (!idx) continue;
    const ids = idx.split("\n").filter(Boolean);
    const batchSize = 25;
    for (let i=0;i<ids.length;i+=batchSize) {
      const keys = ids.slice(i, i+batchSize).map(id => `logs:${d}:${id}`);
      const vals = await env.LOGS.getMany(keys);
      for (const v of vals) if (v) { try { results.push(JSON.parse(v)); } catch {} }
    }
  }
  // sort ascending for timeline
  results.sort((a,b)=>a.ts>b.ts?1:-1);
  return results;
}

function expandDays(from, to) {
  const start = from ? new Date(from) : new Date(new Date().toISOString().slice(0,10));
  const end   = to ? new Date(to) : start;
  const days = [];
  const cur = new Date(Date.UTC(start.getUTCFullYear(), start.getUTCMonth(), start.getUTCDate()));
  const last= new Date(Date.UTC(end.getUTCFullYear(), end.getUTCMonth(), end.getUTCDate()));
  while (cur <= last) {
    days.push(cur.toISOString().slice(0,10));
    cur.setUTCDate(cur.getUTCDate()+1);
  }
  return days;
}

async function summarizeLogsWithAI(logs, env, { label }) {
  // Build compact, privacy-aware input (no PII)
  const MAX = 400; // cap entries for prompt size
  const slim = logs.slice(-MAX).map(x => ({
    ts: x.ts,
    ap: x.autopilot,
    t: x.task,
    cap: x.capability,
    ok: x.ok,
    lvl: x.level
  }));

  const counts = {
    total: logs.length,
    ok: logs.filter(x=>x.ok).length,
    fail: logs.filter(x=>!x.ok).length,
  };
  const byTask = tally(logs.map(l => l.task));
  const byAP   = tally(logs.map(l => l.autopilot));

  const prompt = `
You are an SRE/ops analyst. Summarize these autopilot events (no PII). 
Focus on: failures (with counts), top tasks, busiest autopilots, notable changes, and clear next actions.
Return STRICT JSON:
{
 "label": "${label}",
 "highlights": [ "string" ],
 "next_actions": [ "string" ],
 "risk_score": 0-100,
 "n_ok": ${counts.ok},
 "n_fail": ${counts.fail},
 "top_tasks": [{"task":"", "count":0}],
 "top_autopilots": [{"name":"", "count":0}],
 "summary_markdown": "short report"
}
Events (newest last):
${JSON.stringify(slim)}
`;

  const r = await fetch(`https://api.cloudflare.com/client/v4/accounts/${env.CF_ACCOUNT_ID}/ai/run/${AI_MODEL}`, {
    method: "POST",
    headers: { Authorization: `Bearer ${env.CF_API_TOKEN}`, "Content-Type": "application/json" },
    body: JSON.stringify({ messages: [{role:"system",content:"Respond only in valid JSON."},{role:"user",content:prompt}], temperature: 0.2 })
  });
  const out = await r.json();
  let parsed;
  try { parsed = JSON.parse(out.result.response); } catch { parsed = { summary_markdown: "AI summary unavailable", highlights: [], next_actions: [], risk_score: 0 }; }

  const now = new Date().toISOString();
  return {
    ts: now,
    date: label,
    counts,
    byTask,
    byAP,
    ...parsed
  };
}

function tally(arr) {
  const m = new Map();
  arr.forEach(v => m.set(v, (m.get(v)||0)+1));
  return Array.from(m.entries()).map(([k,v])=>({ key:k, count:v })).sort((a,b)=>b.count-a.count);
}

/* ------ utils ------ */
function json(body, status=200){ return new Response(JSON.stringify(body), { status, headers: { "Content-Type":"application/json", "Access-Control-Allow-Origin":"*" } }); }
function okCors(){ return new Response(null, { headers: { "Access-Control-Allow-Origin":"*", "Access-Control-Allow-Methods":"GET,POST,OPTIONS", "Access-Control-Allow-Headers":"Content-Type,Authorization" } }); }
function ulid(){ // tiny ULID-ish
  const t = Date.now().toString(36);
  const r = crypto.getRandomValues(new Uint8Array(10)).reduce((s,b)=>s+((b%36).toString(36)),"");
  return (t+r).slice(0,16);
}
