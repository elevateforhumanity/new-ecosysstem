const MODEL = "@cf/meta/llama-3-8b-instruct";

export default {
  async fetch(req, env) {
    const url = new URL(req.url);
    if (req.method === "OPTIONS") return cors();

    if (req.method === "POST" && url.pathname === "/copy") {
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

        const sys = `You are a senior copywriter for ${brand}. Use brand colors: ${brand_colors}. 
Return ONLY valid JSON with fields matching 'sections'. Keep language clear, inclusive, and action-oriented.`;
        const user = `Create website copy. 
Prompt: ${prompt}
Audience: ${audience}
Tone: ${tone}
Sections: ${sections.join(", ")}
Word budget (approx): ${word_budget}
Return JSON object with keys exactly: ${sections.join(", ")}`;

        const out = await runAI(env, MODEL, sys, user, 0.4);
        const json = safeParseJSON(out) ?? sections.reduce((m,k)=>(m[k]="",m),{});
        return jsonRes({ ok:true, brand, sections: json });
      } catch (e) {
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
function cors(){ return new Response(null, { headers: { "Access-Control-Allow-Origin":"*","Access-Control-Allow-Methods":"GET,POST,OPTIONS","Access-Control-Allow-Headers":"Content-Type,Authorization" } }); }
function jsonRes(body, status=200){ return new Response(JSON.stringify(body), { status, headers: { "Content-Type":"application/json","Access-Control-Allow-Origin":"*" } }); }
