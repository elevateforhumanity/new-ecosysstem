const MODEL = "@cf/meta/llama-3-8b-instruct";
const RATE_LIMIT = 100; // requests per day per IP
const MAX_WORD_BUDGET = 500; // prevent excessive token usage

export default {
  async fetch(req, env) {
    const url = new URL(req.url);
    if (req.method === "OPTIONS") return cors();

    if (req.method === "POST" && url.pathname === "/copy") {
      const clientIP = req.headers.get("CF-Connecting-IP") || "unknown";
      
      // Rate limiting check
      const rateLimitKey = `ratelimit:copy:${clientIP}:${getDateKey()}`;
      const currentCount = await getKVCount(env, rateLimitKey);
      if (currentCount >= RATE_LIMIT) {
        return jsonRes({ ok:false, error:"Rate limit exceeded. Try again tomorrow." }, 429);
      }

      try {
        const body = await req.json();
        const {
          prompt = "",
          audience = "general",
          tone = "confident, friendly, helpful",
          sections = ["headline","subheadline","body","cta"],
          word_budget = 220,
          brand = env.BRAND_NAME || "EFH",
          brand_colors = (env.BRAND_COLORS || "red, orange, blue, white")
        } = body || {};

        // Cost guard: limit word budget
        const safeBudget = Math.min(word_budget, MAX_WORD_BUDGET);

        const sys = `You are a senior copywriter for ${brand}. Use brand colors: ${brand_colors}. 
Return ONLY valid JSON with fields matching 'sections'. Keep language clear, inclusive, and action-oriented.`;
        const user = `Create website copy. 
Prompt: ${prompt}
Audience: ${audience}
Tone: ${tone}
Sections: ${sections.join(", ")}
Word budget (approx): ${safeBudget}
Return JSON object with keys exactly: ${sections.join(", ")}`;

        const startTime = Date.now();
        const out = await runAI(env, MODEL, sys, user, 0.4);
        const duration = Date.now() - startTime;
        
        // Improved JSON parsing with fallback
        const json = extractJSON(out, sections);
        
        // Increment rate limit counter
        await incrementKVCount(env, rateLimitKey);
        
        // Log to analyzer
        await logToAnalyzer(env, "ai-copy", "generate", true, duration, { sections: sections.length, word_budget: safeBudget });
        
        return jsonRes({ ok:true, brand, sections: json, _meta: { duration_ms: duration } });
      } catch (e) {
        await logToAnalyzer(env, "ai-copy", "generate", false, 0, { error: String(e) });
        return jsonRes({ ok:false, error: String(e) }, 500);
      }
    }

    return jsonRes({ ok:true, module:"ai-copy" });
  }
};

/* ===== helpers ===== */
async function runAI(env, model, system, user, temperature=0.3) {
  const r = await fetch(`https://api.cloudflare.com/client/v4/accounts/${env.CF_ACCOUNT_ID}/ai/run/${model}`, {
    method: "POST",
    headers: { "Authorization": `Bearer ${env.CF_API_TOKEN}`, "Content-Type":"application/json" },
    body: JSON.stringify({
      temperature,
      messages: [
        { role:"system", content: system },
        { role:"user",   content: user }
      ]
    })
  });
  const j = await r.json();
  if (!r.ok || !j?.result?.response) throw new Error(j?.errors?.[0]?.message || "AI error");
  return j.result.response.trim();
}
function safeParseJSON(s){ try { return JSON.parse(s); } catch { return null; } }

// Improved JSON extraction with fallback strategies
function extractJSON(text, sections) {
  // Try direct parse
  let json = safeParseJSON(text);
  if (json && typeof json === 'object') return json;
  
  // Try extracting from markdown code block
  const codeBlockMatch = text.match(/```(?:json)?\s*(\{[\s\S]*?\})\s*```/);
  if (codeBlockMatch) {
    json = safeParseJSON(codeBlockMatch[1]);
    if (json) return json;
  }
  
  // Try finding JSON object in text
  const jsonMatch = text.match(/\{[\s\S]*\}/);
  if (jsonMatch) {
    json = safeParseJSON(jsonMatch[0]);
    if (json) return json;
  }
  
  // Fallback: return empty sections
  return sections.reduce((m,k)=>(m[k]="",m),{});
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
function jsonRes(body, status=200){ return new Response(JSON.stringify(body), { status, headers: { "Content-Type":"application/json","Access-Control-Allow-Origin":"*" } }); }
