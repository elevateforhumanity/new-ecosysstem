const MODEL = "@cf/meta/llama-3-8b-instruct";
const MAX_CHARS = 3500; // conservative chunk size for prompt safety
const RATE_LIMIT = 50; // requests per day per IP
const MAX_TEXT_LENGTH = 50000; // prevent excessive processing

export default {
  async fetch(req, env) {
    const url = new URL(req.url);
    if (req.method === "OPTIONS") return cors();

    if (req.method === "POST" && url.pathname === "/summarize") {
      const clientIP = req.headers.get("CF-Connecting-IP") || "unknown";
      
      // Rate limiting check
      const rateLimitKey = `ratelimit:doc:${clientIP}:${getDateKey()}`;
      const currentCount = await getKVCount(env, rateLimitKey);
      if (currentCount >= RATE_LIMIT) {
        return jsonRes({ ok:false, error:"Rate limit exceeded. Try again tomorrow." }, 429);
      }

      try {
        const body = await req.json();
        const { text = "", goal = "Summarize for busy staff", format = "bullets" } = body || {};
        if (!text?.trim()) return jsonRes({ ok:false, error:"text is required" }, 400);
        
        // Cost guard: limit text length
        const safeText = text.slice(0, MAX_TEXT_LENGTH);

        const startTime = Date.now();
        const chunks = chunkText(safeText, MAX_CHARS);
        const partials = [];
        
        for (const [i, c] of chunks.entries()) {
          const sys = `You summarize documents. Extract key points, identify risks, provide summary. Return plain text with sections: KEY POINTS:, RISKS:, SUMMARY:`;
          const usr = `Goal: ${goal}
Format: ${format}
Text chunk ${i+1}/${chunks.length}:
${c}`;
          const out = await runAI(env, MODEL, sys, usr, 0.2);
          partials.push(parseStructuredText(out));
        }

        // merge partials
        const merged = {
          key_points: dedup(flat(partials.map(p=>p.key_points||[]))).slice(0,30),
          risks:      dedup(flat(partials.map(p=>p.risks||[]))).slice(0,30),
          summary:    partials.map(p=>p.summary||"").join("\n\n").slice(0, 3000)
        };

        const duration = Date.now() - startTime;
        
        // Increment rate limit counter
        await incrementKVCount(env, rateLimitKey);
        
        // Log to analyzer
        await logToAnalyzer(env, "ai-doc", "summarize", true, duration, { chunks: chunks.length, text_length: safeText.length });
        
        return jsonRes({ ok:true, result: merged, chunks: chunks.length, _meta: { duration_ms: duration } });
      } catch (e) {
        await logToAnalyzer(env, "ai-doc", "summarize", false, 0, { error: String(e) });
        return jsonRes({ ok:false, error:String(e) }, 500);
      }
    }

    return jsonRes({ ok:true, module:"ai-doc" });
  }
};

/* helpers */
function chunkText(s, n){ const out=[]; for (let i=0;i<s.length;i+=n) out.push(s.slice(i,i+n)); return out; }
function flat(a){ return a.reduce((m,x)=>m.concat(x),[]); }
function dedup(a){ return Array.from(new Set(a.map(v=>String(v).trim()).filter(Boolean))); }

// Parse structured text output (more reliable than JSON for this model)
function parseStructuredText(text) {
  const result = { key_points: [], risks: [], summary: "" };
  
  const keyPointsMatch = text.match(/KEY POINTS?:([\s\S]*?)(?=RISKS?:|SUMMARY:|$)/i);
  if (keyPointsMatch) {
    result.key_points = keyPointsMatch[1]
      .split(/\n/)
      .map(l => l.replace(/^[-•*]\s*/, '').trim())
      .filter(Boolean);
  }
  
  const risksMatch = text.match(/RISKS?:([\s\S]*?)(?=SUMMARY:|$)/i);
  if (risksMatch) {
    result.risks = risksMatch[1]
      .split(/\n/)
      .map(l => l.replace(/^[-•*]\s*/, '').trim())
      .filter(Boolean);
  }
  
  const summaryMatch = text.match(/SUMMARY:([\s\S]*?)$/i);
  if (summaryMatch) {
    result.summary = summaryMatch[1].trim();
  }
  
  return result;
}

async function runAI(env, model, system, user, temperature=0.2){
  const r = await fetch(`https://api.cloudflare.com/client/v4/accounts/${env.CF_ACCOUNT_ID}/ai/run/${model}`, {
    method:"POST",
    headers: { "Authorization": `Bearer ${env.CF_API_TOKEN}`, "Content-Type":"application/json" },
    body: JSON.stringify({ temperature, messages:[{role:"system",content:system},{role:"user",content:user}] })
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

function safeParseJSON(s){ try { return JSON.parse(s); } catch { return null; } }
function cors(){ return new Response(null, { headers: { "Access-Control-Allow-Origin":"*","Access-Control-Allow-Methods":"GET,POST,OPTIONS","Access-Control-Allow-Headers":"Content-Type,Authorization" } }); }
function jsonRes(b,s=200){ return new Response(JSON.stringify(b), { status:s, headers:{ "Content-Type":"application/json","Access-Control-Allow-Origin":"*" } }); }
