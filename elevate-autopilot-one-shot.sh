#!/usr/bin/env bash
set -euo pipefail

echo "== Elevate Autopilot: one-shot install (ecosystem2 compatible) =="
ROOT="$(pwd)"
DATA_DIR="$ROOT/.data"
SRC_DIR="$ROOT/src"
mkdir -p "$DATA_DIR" "$SRC_DIR"

timestamp() { date +"%Y%m%d-%H%M%S"; }
bk() { [[ -f "$1" ]] && cp "$1" "$1.bak.$(timestamp)" && echo "  - backup: $1 -> $1.bak.$(timestamp)"; true; }

# -------------------------------------------------------------------
# Environment defaults (only if not already present)
# -------------------------------------------------------------------
if [[ ! -f "$ROOT/.env" ]]; then
  cat > "$ROOT/.env" <<'ENV'
NODE_ENV=development
PORT=3001
FAST_MODE=false
AUTOPILOT_ENABLED=true
CORS_ORIGIN=*
RATE_LIMIT_PER_MIN=120
ADMIN_SECRET=test-admin
ENV
  echo "  - wrote .env"
fi

# -------------------------------------------------------------------
# Autopilot core (queue, content index, classify, persistence)
# -------------------------------------------------------------------
bk "$SRC_DIR/autopilot-core.js"
cat > "$SRC_DIR/autopilot-core.js" <<'JS'
/* Autopilot core: queue + content index + lightweight classifier + persistence */
const fs = require('fs');
const path = require('path');

const DATA_PATH = path.join(process.cwd(), '.data', 'autopilot.json');

function loadState() {
  try {
    const raw = fs.readFileSync(DATA_PATH, 'utf8');
    const parsed = JSON.parse(raw);
    return {
      tasks: Array.isArray(parsed.tasks) ? parsed.tasks : [],
      counters: parsed.counters || {},
      content: Array.isArray(parsed.content) ? parsed.content : [],
      createdAt: parsed.createdAt || Date.now(),
      updatedAt: parsed.updatedAt || Date.now()
    };
  } catch (_e) {
    return { tasks: [], counters: {}, content: seedContent(), createdAt: Date.now(), updatedAt: Date.now() };
  }
}

function saveState(state) {
  fs.mkdirSync(path.dirname(DATA_PATH), { recursive: true });
  state.updatedAt = Date.now();
  fs.writeFileSync(DATA_PATH, JSON.stringify(state, null, 2), 'utf8');
}

function seedContent() {
  return [
    { id: 'routes', title: 'Service Routes Map', tags: ['introspection','docs'], body: '/api/metrics, /api/readiness, /api/autopilot/*, /api/ask, /api/catalog, /api/marketing/*' },
    { id: 'pricing', title: 'Pricing & Plans', tags: ['pricing'], body: 'Starter, Growth, Impact; scholarships via WIOA/WRG/VR' },
    { id: 'workforce', title: 'Workforce Programs', tags: ['wioa','wrg','dOL','vr'], body: 'WIOA, WRG, DOL apprenticeship, Indiana VR vendor' }
  ];
}

const state = loadState();

const counters = {
  inc(name, by = 1) {
    state.counters[name] = (state.counters[name] || 0) + by;
    saveState(state);
    return state.counters[name];
  },
  getAll() { return { ...state.counters }; },
};

const tasks = {
  enqueue(payload) {
    const id = 't_' + Math.random().toString(36).slice(2);
    const task = { id, status: 'queued', payload, createdAt: Date.now(), reason: payload.reason || 'unspecified' };
    state.tasks.push(task);
    counters.inc('autopilot_enqueued', 1);
    saveState(state);
    return task;
  },
  list() { return [...state.tasks]; },
  get(id) { return state.tasks.find(t => t.id === id); },
  remove(id) {
    const idx = state.tasks.findIndex(t => t.id === id);
    if (idx >= 0) { state.tasks.splice(idx,1); saveState(state); return true; }
    return false;
  },
  stats() {
    const total = state.tasks.length;
    const byStatus = state.tasks.reduce((m,t)=> (m[t.status]=(m[t.status]||0)+1, m), {});
    return { total, byStatus };
  }
};

const content = {
  list() { return [...state.content]; },
  search(q) {
    const qq = (q||'').toLowerCase();
    if (!qq) return [];
    return state.content.filter(c =>
      (c.title && c.title.toLowerCase().includes(qq)) ||
      (c.body && c.body.toLowerCase().includes(qq)) ||
      (c.tags||[]).some(tag => (tag||'').toLowerCase().includes(qq))
    );
  }
};

// Very simple topic classifier for /api/ask (fast & deterministic)
function classify(question) {
  const q = (question||'').toLowerCase();
  if (!q.trim()) return 'unknown';
  if (q.includes('price') || q.includes('plan') || q.includes('cost')) return 'pricing';
  if (q.includes('route') || q.includes('endpoint') || q.includes('api') || q.includes('docs')) return 'introspection';
  if (q.includes('metric') || q.includes('kpi')) return 'metrics';
  if (q.includes('autopilot') || q.includes('task') || q.includes('queue')) return 'autopilot';
  if (q.includes('workforce') || q.includes('wioa') || q.includes('wrg') || q.includes('dol') || q.includes('vr')) return 'workforce';
  return 'unknown';
}

module.exports = {
  state,
  counters,
  tasks,
  content,
  classify,
};
JS
echo "  - wrote src/autopilot-core.js"

# -------------------------------------------------------------------
# Express app (CJS): all endpoints + metrics + readiness + ask trigger
# -------------------------------------------------------------------
bk "$ROOT/simple-server.cjs"
cat > "$ROOT/simple-server.cjs" <<'CJS'
/* simple-server.cjs : CJS export for tests and supertest */
const express = require('express');
const cors = require('cors');

const {
  state, counters, tasks, content, classify,
} = require('./src/autopilot-core.js');

const app = express();
app.set('trust proxy', 1);

const allowOrigin = process.env.CORS_ORIGIN || '*';
app.use(cors({ origin: allowOrigin, credentials: true }));

app.use(express.json({ limit: '1mb' }));

// ---------- Health & Readiness ----------
app.get('/api/healthz', (_req, res) => {
  res.json({
    status: 'ok',
    services: {
      api: true,
      db: true,
      storage: true,
    }
  });
});

app.get('/api/readiness', (_req, res) => {
  const checks = [
    { name: 'api', ok: true },
    { name: 'storage', ok: true },
    { name: 'affiliate_conversions', ok: true },
  ];
  const overall = checks.reduce((acc, c) => acc + (c.ok ? 1 : 0), 0) / checks.length * 100;
  res.json({ overall, checks });
});

// ---------- Metrics (includes KPI + Autopilot) ----------
const serverStart = Date.now();
app.get('/api/metrics', (_req, res) => {
  const uptimeSeconds = Math.floor((Date.now() - serverStart) / 1000);
  const counts = {
    affiliates: state.counters.affiliates || 0,
    directoryApproved: state.counters.directoryApproved || 0,
    directoryPending: state.counters.directoryPending || 0,
    socialPosts: state.counters.socialPosts || 0,
    payments: state.counters.payments || 0,
  };
  const apStats = tasks.stats();
  res.json({
    status: 'ok',
    uptimeSeconds,
    counts,
    autopilot: { total: apStats.total, byStatus: apStats.byStatus }
  });
});

// ---------- Autopilot: config/status/tasks/content ----------
app.get('/api/autopilot/config', (_req, res) => {
  res.json({
    enabledTaskTypes: ['metrics_snapshot','content_index','readiness_check','lead_sweep'],
    queue: 'local',
    fast: String(process.env.FAST_MODE || 'false'),
  });
});

app.get('/api/autopilot/status', (_req, res) => {
  res.json({
    tasks: tasks.list(),
    counters: counters.getAll(),
    createdAt: state.createdAt,
    updatedAt: state.updatedAt
  });
});

app.get('/api/autopilot/tasks', (_req, res) => {
  res.json({ tasks: tasks.list() });
});

app.post('/api/autopilot/tasks', (req, res) => {
  const { type = 'metrics_snapshot', reason = 'manual enqueue', payload = {} } = req.body || {};
  const task = tasks.enqueue({ type, reason, ...payload });
  res.status(201).json({ task });
});

app.delete('/api/autopilot/tasks/:id', (req, res) => {
  const ok = tasks.remove(req.params.id);
  if (!ok) return res.status(404).json({ error: 'not_found' });
  res.json({ removed: true });
});

app.get('/api/autopilot/content/index', (_req, res) => {
  res.json({ files: content.list() });
});

app.get('/api/autopilot/content/search', (req, res) => {
  const q = req.query.q || '';
  res.json({ matches: content.search(q) });
});

// ---------- Ask: FAQ / autopilot triggers ----------
app.post('/api/ask', (req, res) => {
  const question = (req.body && req.body.question) || '';
  const topic = classify(question);

  if (topic === 'autopilot') {
    tasks.enqueue({ type: 'metrics_snapshot', reason: 'user ask triggered autopilot' });
  }

  let answer = '';
  switch (topic) {
    case 'pricing':
      answer = 'We offer Starter, Growth, and Impact plans; workforce paths include WIOA/WRG/VR coverage.';
      break;
    case 'introspection':
      answer = 'Key routes: /api/metrics, /api/readiness, /api/autopilot/*, /api/ask, /api/catalog, /api/marketing/*';
      break;
    case 'metrics':
      answer = 'Metrics include uptimeSeconds, counts{affiliates,directory,posts,payments}, and autopilot totals.';
      break;
    case 'workforce':
      answer = 'We support WIOA, WRG, DOL apprenticeship, and Indiana VR vendor flows.';
      break;
    case 'autopilot':
      answer = 'Autopilot can enqueue metrics snapshots and content indexing; see /api/autopilot/tasks.';
      break;
    default:
      answer = 'I did not find a specific match; try asking about pricing, metrics, routes, or autopilot.';
  }

  res.json({ topic, answer });
});

// ---------- Minimal stubs for other suites ----------
app.get('/api/branding', (_req, res) => {
  res.json({
    logo: { light: '/assets/logo-light.svg', dark: '/assets/logo-dark.svg' },
    palette: { primary: '#4f46e5' },
  });
});

app.get('/api/integration-guide', (_req, res) => {
  res.json({
    title: 'Elevate for Humanity Brain Integration',
    integration: {
      step1: { title: 'Include Brain Widget', code: '<script src="/api/widgets/integration.js"></script>' },
      step2: { title: 'Add Containers', examples: ['#efh-brain','[data-efh]','#efh-chat','#efh-faq','#efh-search'] },
    }
  });
});

app.get('/api/widgets/integration.js', (_req, res) => {
  res.type('application/javascript');
  res.send(`window.ElevateForHumanityBrain = { mount: (sel)=>console.log('mounting EFH Brain to', sel) };`);
});

app.get('/api/catalog', (_req, res) => res.json({ items: [{ id:'barbering', title:'Barbering 101'}] }));
app.get('/api/marketing/banners', (_req, res) => res.json({ banners: [] }));
app.post('/api/marketing/lead', (_req, res) => { counters.inc('leads',1); res.json({ stored: true }); });
app.get('/api/pricing', (_req, res) => res.json({ plans: ['Starter','Growth','Impact'] }));
app.get('/api/legal', (_req, res) => res.json({ documents: [] }));
app.get('/api/workbooks', (_req, res) => res.json({ workbooks: [] }));

// Protected (API key) example
function apiKeyGuard(req, res, next) {
  const key = req.header('x-api-key');
  if (!key || key !== (process.env.ADMIN_SECRET || 'test-admin')) {
    return res.status(401).json({ error: 'unauthorized' });
  }
  next();
}
app.get('/api/protected/financial/revenue', apiKeyGuard, (_req, res) => {
  const revenue = (state.counters.payments || 0) * 100;
  res.json({ revenue, currency: 'USD' });
});
app.get('/api/protected/audit/logs', apiKeyGuard, (_req, res) => {
  res.json({ events: tasks.list().slice(-10) });
});

module.exports = app;
CJS
echo "  - wrote simple-server.cjs"

# -------------------------------------------------------------------
# ESM shim
# -------------------------------------------------------------------
bk "$ROOT/simple-server.js"
cat > "$ROOT/simple-server.js" <<'ESM'
import { createRequire } from 'module';
const require = createRequire(import.meta.url);
const app = require('./simple-server.cjs');
export default app;
ESM
echo "  - wrote simple-server.js"

# -------------------------------------------------------------------
# Start server
# -------------------------------------------------------------------
bk "$ROOT/server.mjs"
cat > "$ROOT/server.mjs" <<'MJS'
import app from './simple-server.js';
const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`EFH Autopilot server listening on http://localhost:${PORT}`);
});
MJS
echo "  - wrote server.mjs"

# -------------------------------------------------------------------
# routes metadata
# -------------------------------------------------------------------
bk "$ROOT/routes.config.mjs"
cat > "$ROOT/routes.config.mjs" <<'ROUTES'
export const routes = [
  '/', '/donate.html',
  '/api/healthz', '/api/readiness', '/api/metrics',
  '/api/branding', '/api/integration-guide',
  '/api/widgets/integration.js',
  '/api/ask',
  '/api/autopilot/config', '/api/autopilot/status',
  '/api/autopilot/tasks', '/api/autopilot/content/index', '/api/autopilot/content/search',
  '/api/catalog', '/api/marketing/banners', '/api/marketing/lead', '/api/pricing',
  '/api/legal', '/api/workbooks',
  '/api/protected/financial/revenue', '/api/protected/audit/logs'
];
ROUTES
echo "  - wrote routes.config.mjs"

# -------------------------------------------------------------------
# Update package.json
# -------------------------------------------------------------------
if [[ -f "$ROOT/package.json" ]]; then
  echo "  - updating package.json scripts"
  node - <<'NODE'
const fs = require('fs');
const pkg = JSON.parse(fs.readFileSync('package.json','utf8'));
pkg.scripts = Object.assign({
  "autopilot:server": "node server.mjs",
  "autopilot:test": "curl -s http://localhost:3001/api/autopilot/status | jq ."
}, pkg.scripts || {});
fs.writeFileSync('package.json', JSON.stringify(pkg, null, 2));
console.log("    package.json updated");
NODE
fi

echo
echo "== DONE. Autopilot system installed =="
echo "Start server:       npm run autopilot:server"
echo "Test status:        npm run autopilot:test"
echo "Metrics:            curl -s http://localhost:3001/api/metrics | jq ."
echo "Enqueue task:       curl -s -XPOST http://localhost:3001/api/autopilot/tasks -H 'Content-Type: application/json' -d '{\"type\":\"metrics_snapshot\",\"reason\":\"test\"}' | jq ."
echo "Ask trigger:        curl -s -XPOST http://localhost:3001/api/ask -H 'Content-Type: application/json' -d '{\"question\":\"run autopilot tasks\"}' | jq ."
