const MODEL = "@cf/meta/llama-3-8b-instruct";
const MAX_CHARS = 3500; // conservative chunk size for prompt safety

export default {
  async fetch(req, env) {
    const url = new URL(req.url);
    if (req.method === "OPTIONS") return cors();

    if (req.method === "POST" && url.pathname === "/summarize") {
      try {
        const body = await req.json();
        const { text = "", goal = "Summarize for busy staff", format = "bullets" } = body || {};
        if (!text?.trim()) return jsonRes({ ok:false, error:"text is required" }, 400);

        const chunks = chunkText(text, MAX_CHARS);
        const partials = [];
        for (const [i, c] of chunks.entries()) {
          const sys = `You summarize documents into structured JSON. No PII beyond input.`;
          const usr = `Goal: ${goal}
Format: ${format}
Text chunk ${i+1}/${chunks.length}:
${c}

Return JSON:
{ "key_points": ["..."], "risks":[ "..."], "summary":"..." }`;
          const out = await runAI(env, MODEL, sys, usr, 0.2);
          partials.push(safeParseJSON(out) ?? { key_points:[], risks:[], summary:"" });
        }

        // merge partials
        const merged = {
          key_points: dedup(flat(partials.map(p=>p.key_points||[]))).slice(0,30),
          risks:      dedup(flat(partials.map(p=>p.risks||[]))).slice(0,30),
          summary:    partials.map(p=>p.summary||"").join("\n\n").slice(0, 3000)
        };

        // optional final polish
        const polishSys = "Improve clarity and structure. Return JSON with same keys.";
        const polishUsr = `Combine and polish:\n${JSON.stringify(merged)}`;
        const polished = safeParseJSON(await runAI(env, MODEL, polishSys, polishUsr, 0.2)) ?? merged;

        return jsonRes({ ok:true, result: polished, chunks: chunks.length });
      } catch (e) {
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
function safeParseJSON(s){ try { return JSON.parse(s); } catch { return null; } }
function cors(){ return new Response(null, { headers: { "Access-Control-Allow-Origin":"*","Access-Control-Allow-Methods":"GET,POST,OPTIONS","Access-Control-Allow-Headers":"Content-Type,Authorization" } }); }
function jsonRes(b,s=200){ return new Response(JSON.stringify(b), { status:s, headers:{ "Content-Type":"application/json","Access-Control-Allow-Origin":"*" } }); }
