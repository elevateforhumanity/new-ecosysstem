/**
 * EFH Autopilot Orchestrator
 * 
 * Master controller that:
 * - Routes tasks to specialized autopilots
 * - Verifies capabilities and permissions
 * - Auto-creates KV namespaces, R2 buckets
 * - Deploys Workers when needed
 * - Self-heals infrastructure
 * 
 * ENV SECRETS required:
 *  - CF_API_TOKEN (with Workers Scripts:Edit, KV:Edit, R2:Edit, Account:Read)
 *  - CF_ACCOUNT_ID
 * 
 * BINDINGS:
 *  - REGISTRY (KV): stores autopilot registry, capabilities, and state
 *  - ASSETS (R2): optional R2 binding for direct object storage
 */

const CF_API = "https://api.cloudflare.com/client/v4";

export default {
  async fetch(req, env, ctx) {
    const url = new URL(req.url);

    // CORS
    if (req.method === "OPTIONS") return cors();

    // Routes
    if (url.pathname === "/autopilot/diagnose" && req.method === "GET") {
      return diagnose(env);
    }
    if (url.pathname === "/autopilot/ensure-infra" && req.method === "POST") {
      const body = await req.json();
      return ensureInfra(env, body.want || {});
    }
    if (url.pathname === "/autopilot/plan" && req.method === "POST") {
      const body = await req.json();
      return planAndRun(env, body.task, body.meta || {});
    }
    if (url.pathname === "/autopilot/registry" && req.method === "POST") {
      const body = await req.json();
      return upsertAutopilot(env, body);
    }
    if (url.pathname === "/autopilot/list" && req.method === "GET") {
      return listAutopilots(env);
    }
    if (url.pathname === "/health" && req.method === "GET") {
      return j({ status: "healthy", service: "autopilot-orchestrator", timestamp: new Date().toISOString() });
    }

    // Cron: periodic health checks
    if (req.method === "POST" && url.pathname === "/__scheduled") {
      ctx.waitUntil(periodicHealth(env));
      return new Response("ok");
    }

    return new Response("Not Found", { status: 404 });
  },

  // Cron trigger
  async scheduled(event, env, ctx) {
    ctx.waitUntil(periodicHealth(env));
  }
};

/* ---------------------- Core: Registry ---------------------- */
/**
 * Autopilot definition schema:
 * {
 *   name: "payouts-batch",
 *   endpoint: "https://efh-agent.workers.dev/payouts/run",
 *   capabilities: ["commissions.read","payouts.create","stripe.transfer"],
 *   needs: { kvNamespaces: ["REGISTRY"], r2Buckets: ["efh-payouts-logs"], workers: [] }
 * }
 */

async function upsertAutopilot(env, ap) {
  if (!ap?.name || !ap?.endpoint) {
    return j({ error: "name and endpoint required" }, 400);
  }
  
  await kvPut(env, `autopilot:${ap.name}`, JSON.stringify(ap));
  
  return j({ 
    ok: true, 
    autopilot: ap,
    message: `Autopilot '${ap.name}' registered successfully`
  });
}

async function listAutopilots(env) {
  const keys = await kvList(env, "autopilot:");
  const items = [];
  
  for (const k of keys) {
    const v = await kvGet(env, k);
    if (v) {
      try {
        items.push(JSON.parse(v));
      } catch (e) {
        console.error(`Failed to parse autopilot ${k}:`, e);
      }
    }
  }
  
  return j({ 
    autopilots: items,
    count: items.length
  });
}

/* ---------------------- Planner/Runner ---------------------- */

async function planAndRun(env, task, meta) {
  if (!task) {
    return j({ error: "task required" }, 400);
  }

  // Map task → required capability label
  const taskToCap = {
    "generate_page": "web.pages.generate",
    "deploy_page": "web.pages.deploy",
    "run_payout_batch": "payouts.batch.run",
    "pay_affiliate_now": "payouts.transfer.single",
    "ingest_intake_doc": "files.intake.upload",
    "enroll_student": "lms.enrollment.create",
    "process_email": "email.process",
    "create_lead": "crm.lead.create",
    "send_followup": "email.send",
    "make_checkout": "payment.checkout.create",
    "generate_asset": "web.asset.generate"
  };

  const needed = taskToCap[task];
  if (!needed) {
    return j({ 
      error: `Unknown task: ${task}`,
      availableTasks: Object.keys(taskToCap)
    }, 400);
  }

  // Find an autopilot that advertises the capability
  const aps = await listAutopilotsRaw(env);
  const matches = aps.filter(a => a.capabilities?.includes(needed));

  if (!matches.length) {
    // Try to auto-configure an autopilot
    const candidate = aps.find(a => a.capabilities?.includes(closestFamilyCap(needed)));
    if (candidate) {
      const cfg = await tryConfigureAutopilot(env, candidate, needed);
      if (cfg?.ok) {
        return forwardTask(candidate, task, meta);
      }
    }
    
    return j({ 
      error: `No autopilot currently supports ${needed}`,
      hint: "Register or configure an autopilot to add this capability.",
      registeredAutopilots: aps.map(a => ({ name: a.name, capabilities: a.capabilities }))
    }, 422);
  }

  // Check/ensure infra for the first match
  const chosen = matches[0];
  const ensureRes = await ensureNeeds(env, chosen.needs || {});
  
  if (!ensureRes.ok) {
    return j({ 
      error: "Infrastructure not ready",
      details: ensureRes,
      autopilot: chosen.name
    }, 500);
  }

  // Forward task to that autopilot
  return forwardTask(chosen, task, meta);
}

function closestFamilyCap(cap) {
  // Naive fallback matcher: "payouts.batch.run" → "payouts"
  const family = cap.split(".")[0];
  return family;
}

async function forwardTask(ap, task, meta) {
  try {
    const r = await fetch(ap.endpoint, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ task, meta })
    });
    
    const txt = await r.text();
    let payload;
    try { 
      payload = JSON.parse(txt); 
    } catch { 
      payload = { raw: txt }; 
    }
    
    return j({ 
      autopilot: ap.name,
      ok: r.ok,
      status: r.status,
      result: payload
    });
  } catch (error) {
    return j({
      autopilot: ap.name,
      ok: false,
      error: error.message
    }, 500);
  }
}

async function listAutopilotsRaw(env) {
  const keys = await kvList(env, "autopilot:");
  const arr = [];
  
  for (const k of keys) {
    const v = await kvGet(env, k);
    if (v) {
      try {
        arr.push(JSON.parse(v));
      } catch (e) {
        console.error(`Failed to parse autopilot ${k}:`, e);
      }
    }
  }
  
  return arr;
}

/* ---------------------- Infra/Permissions ---------------------- */

async function diagnose(env) {
  const report = { 
    token: {}, 
    resources: {},
    timestamp: new Date().toISOString()
  };

  // Verify token/scopes
  try {
    const v = await cfFetch(env, `/user/tokens/verify`, { method: "GET" });
    report.token = v.success ? v.result : { error: v.errors };
  } catch (e) {
    report.token = { error: e.message };
  }

  // KV namespaces list
  try {
    const kv = await cfFetch(env, `/accounts/${env.CF_ACCOUNT_ID}/storage/kv/namespaces`);
    report.resources.kv = kv.success ? kv.result : { error: kv.errors };
  } catch (e) {
    report.resources.kv = { error: e.message };
  }

  // R2 buckets
  try {
    const r2 = await cfFetch(env, `/accounts/${env.CF_ACCOUNT_ID}/r2/buckets`);
    report.resources.r2 = r2.success ? r2.result : { error: r2.errors };
  } catch (e) {
    report.resources.r2 = { error: e.message };
  }

  // Workers list
  try {
    const ws = await cfFetch(env, `/accounts/${env.CF_ACCOUNT_ID}/workers/scripts`);
    report.resources.workers = ws.success ? ws.result.map(s => s.id) : { error: ws.errors };
  } catch (e) {
    report.resources.workers = { error: e.message };
  }

  return j(report);
}

async function ensureInfra(env, want = {}) {
  const out = { 
    created: { kv: [], r2: [], workers: [] }, 
    errors: [],
    skipped: { kv: [], r2: [] }
  };

  // KV namespaces
  if (want.kvNamespaces?.length) {
    try {
      const list = await cfFetch(env, `/accounts/${env.CF_ACCOUNT_ID}/storage/kv/namespaces`);
      const have = (list.result || []).map(n => n.title);
      
      for (const ns of want.kvNamespaces) {
        if (!have.includes(ns)) {
          const r = await cfFetch(env, `/accounts/${env.CF_ACCOUNT_ID}/storage/kv/namespaces`, {
            method: "POST",
            body: { title: ns }
          });
          
          if (r.success) {
            out.created.kv.push({ name: ns, id: r.result.id });
          } else {
            out.errors.push({ kv: ns, error: r.errors });
          }
        } else {
          out.skipped.kv.push(ns);
        }
      }
    } catch (e) {
      out.errors.push({ kv: "all", error: e.message });
    }
  }

  // R2 buckets
  if (want.r2Buckets?.length) {
    try {
      const list = await cfFetch(env, `/accounts/${env.CF_ACCOUNT_ID}/r2/buckets`);
      const have = (list.result?.buckets || []).map(b => b.name);
      
      for (const b of want.r2Buckets) {
        if (!have.includes(b)) {
          const r = await cfFetch(env, `/accounts/${env.CF_ACCOUNT_ID}/r2/buckets`, {
            method: "POST",
            body: { name: b }
          });
          
          if (r.success) {
            out.created.r2.push(b);
          } else {
            out.errors.push({ r2: b, error: r.errors });
          }
        } else {
          out.skipped.r2.push(b);
        }
      }
    } catch (e) {
      out.errors.push({ r2: "all", error: e.message });
    }
  }

  // Workers (optional deploy)
  if (want.workers?.length) {
    for (const w of want.workers) {
      try {
        const r = await cfPutWorker(env, w.name, w.content);
        if (r.success) {
          out.created.workers.push(w.name);
        } else {
          out.errors.push({ worker: w.name, error: r.errors });
        }
      } catch (e) {
        out.errors.push({ worker: w.name, error: e.message });
      }
    }
  }

  // Guidance
  if (out.created.kv.length) {
    out.note_kv = "Add these KV namespaces to wrangler.toml [[kv_namespaces]] bindings.";
  }
  if (out.created.r2.length) {
    out.note_r2 = "Add these R2 buckets to wrangler.toml [[r2_buckets]] bindings.";
  }

  return j({ 
    ok: out.errors.length === 0,
    ...out
  });
}

async function tryConfigureAutopilot(env, ap, neededCap) {
  try {
    const r = await fetch(ap.endpoint + "/configure", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ enable: neededCap })
    });
    
    if (r.ok) {
      // Update registry
      ap.capabilities = Array.from(new Set([...(ap.capabilities || []), neededCap]));
      await kvPut(env, `autopilot:${ap.name}`, JSON.stringify(ap));
      return { ok: true };
    }
  } catch (e) {
    console.error(`Failed to configure autopilot ${ap.name}:`, e);
  }
  
  return { ok: false };
}

async function ensureNeeds(env, needs) {
  const want = {
    kvNamespaces: needs.kvNamespaces || [],
    r2Buckets: needs.r2Buckets || [],
    workers: needs.workers || []
  };
  
  const result = await ensureInfra(env, want);
  return result;
}

/* ---------------------- Cloudflare API helpers ---------------------- */

async function cfFetch(env, path, { method = "GET", body } = {}) {
  const r = await fetch(`${CF_API}${path}`, {
    method,
    headers: {
      Authorization: `Bearer ${env.CF_API_TOKEN}`,
      "Content-Type": "application/json"
    },
    body: body ? JSON.stringify(body) : undefined
  });
  
  return r.json();
}

async function cfPutWorker(env, scriptName, rawContent) {
  // Deploy a simple Worker by name
  const form = new FormData();
  form.append("metadata", new Blob([JSON.stringify({ main_module: "index.mjs" })], { type: "application/json" }));
  form.append("index.mjs", new Blob([rawContent], { type: "application/javascript+module" }), "index.mjs");

  const r = await fetch(`${CF_API}/accounts/${env.CF_ACCOUNT_ID}/workers/scripts/${scriptName}`, {
    method: "PUT",
    headers: { Authorization: `Bearer ${env.CF_API_TOKEN}` },
    body: form
  });
  
  return r.json();
}

/* ---------------------- KV helpers ---------------------- */

async function kvPut(env, key, val) {
  if (!env.REGISTRY) {
    console.warn("REGISTRY KV binding not available");
    return;
  }
  await env.REGISTRY.put(key, val);
}

async function kvGet(env, key) {
  if (!env.REGISTRY) return null;
  return env.REGISTRY.get(key);
}

async function kvList(env, prefix) {
  if (!env.REGISTRY) return [];
  const out = await env.REGISTRY.list({ prefix });
  return out.keys.map(k => k.name);
}

/* ---------------------- Cron health ---------------------- */

async function periodicHealth(env) {
  // Ensure critical infrastructure exists
  await ensureInfra(env, {
    kvNamespaces: ["REGISTRY"],
    r2Buckets: ["efh-assets"]
  });
}

/* ---------------------- Utils ---------------------- */

function j(body, status = 200) {
  return new Response(JSON.stringify(body, null, 2), {
    status,
    headers: {
      "Content-Type": "application/json",
      "Access-Control-Allow-Origin": "*"
    }
  });
}

function cors() {
  return new Response(null, {
    headers: {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "GET,POST,OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type,Authorization"
    }
  });
}
