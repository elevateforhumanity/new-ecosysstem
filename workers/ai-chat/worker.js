const MODEL = "@cf/meta/llama-3-8b-instruct";
const RATE_LIMIT = 200; // requests per day per IP
const MAX_HISTORY = 10; // limit conversation history

export default {
  async fetch(req, env) {
    const url = new URL(req.url);
    if (req.method === "OPTIONS") return cors();

    if (req.method === "POST" && url.pathname === "/chat") {
      const clientIP = req.headers.get("CF-Connecting-IP") || "unknown";
      
      // Rate limiting check
      const rateLimitKey = `ratelimit:chat:${clientIP}:${getDateKey()}`;
      const currentCount = await getKVCount(env, rateLimitKey);
      if (currentCount >= RATE_LIMIT) {
        return jsonRes({ ok:false, error:"Rate limit exceeded. Try again tomorrow." }, 429);
      }

      try {
        const body = await req.json();
        const { history = [], question = "", persona = "Helpful website agent for EFH." } = body || {};
        
        if (!question?.trim()) {
          return jsonRes({ ok:false, error:"question is required" }, 400);
        }
        
        // limit history for cost control
        const trimmed = history.slice(-MAX_HISTORY);

        const messages = [
          { role:"system", content: `${persona} If unsure, say you'll escalate. Be concise.` },
          ...trimmed.map(m => ({ role: m.role === "user" ? "user":"assistant", content: String(m.content||"")})),
          { role:"user", content: question }
        ];

        const startTime = Date.now();
        const out = await runAI(env, MODEL, messages, 0.3);
        const duration = Date.now() - startTime;
        
        // Increment rate limit counter
        await incrementKVCount(env, rateLimitKey);
        
        // Log to analyzer
        await logToAnalyzer(env, "ai-chat", "chat", true, duration, { history_length: trimmed.length });
        
        return jsonRes({ ok:true, answer: out, _meta: { duration_ms: duration } });
      } catch (e) {
        await logToAnalyzer(env, "ai-chat", "chat", false, 0, { error: String(e) });
        return jsonRes({ ok:false, error:String(e) }, 500);
      }
    }

    return jsonRes({ ok:true, module:"ai-chat" });
  }
};

async function runAI(env, model, messages, temperature=0.3) {
  const r = await fetch(`https://api.cloudflare.com/client/v4/accounts/${env.CF_ACCOUNT_ID}/ai/run/${model}`, {
    method:"POST",
    headers: { "Authorization": `Bearer ${env.CF_API_TOKEN}`, "Content-Type":"application/json" },
    body: JSON.stringify({ temperature, messages })
  });
  const j = await r.json();
  if (!r.ok || !j?.result?.response) throw new Error(j?.errors?.[0]?.message || "AI error");
  return j.result.response.trim();
}

function getDateKey() {
  const d = new Date();
  return `${d.getUTCFullYear()}-${String(d.getUTCMonth()+1).padStart(2,'0')}-${String(d.getUTCDate()).padStart(2,'0')}`;
}

async function getKVCount(env, key) {
  if (!env.REGISTRY) return 0;
  try {
    const val = await env.REGISTRY.get(key);
    return val ? parseInt(val, 10) : 0;
  } catch {
    return 0;
  }
}

async function incrementKVCount(env, key) {
  if (!env.REGISTRY) return;
  try {
    const current = await getKVCount(env, key);
    await env.REGISTRY.put(key, String(current + 1), { expirationTtl: 86400 }); // 24h TTL
  } catch {}
}

async function logToAnalyzer(env, autopilot, task, ok, duration, metadata = {}) {
  try {
    const analyzerURL = env.ANALYZER_URL || "https://efh-autopilot-analyzer.elevateforhumanity.workers.dev/logs/ingest";
    await fetch(analyzerURL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        autopilot,
        task,
        ok,
        duration_ms: duration,
        timestamp: new Date().toISOString(),
        ...metadata
      })
    });
  } catch {}
}

function cors(){ return new Response(null, { headers: { "Access-Control-Allow-Origin":"*","Access-Control-Allow-Methods":"GET,POST,OPTIONS","Access-Control-Allow-Headers":"Content-Type,Authorization" } }); }
function jsonRes(b,s=200){ return new Response(JSON.stringify(b), { status:s, headers:{ "Content-Type":"application/json","Access-Control-Allow-Origin":"*" } }); }
