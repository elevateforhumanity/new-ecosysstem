const MODEL = "@cf/meta/llama-3-8b-instruct";

export default {
  async fetch(req, env) {
    const url = new URL(req.url);
    if (req.method === "OPTIONS") return cors();

    if (req.method === "POST" && url.pathname === "/form") {
      try {
        const body = await req.json();
        const {
          prompt = "Create an intake form for name, email, phone",
          storage = "supabase", // future: allow other backends
          table = "intake_forms",
          brand = env.BRAND_NAME || "EFH"
        } = body || {};

        const sys = `You generate SAFE JSON form schemas and a React component string using Tailwind.
Return ONLY valid JSON in this structure:
{
  "schema": {
    "name": "string",
    "fields": [
      {"key":"full_name","label":"Full Name","type":"text","required":true,"min":2,"max":80},
      {"key":"email","label":"Email","type":"email","required":true},
      {"key":"phone","label":"Phone","type":"tel","required":false},
      ...
    ]
  },
  "react_component": "<COMPONENT CODE AS STRING>"
}`;
        const usr = `Brand: ${brand}
Storage target: ${storage}
Supabase table: ${table}
Form prompt: ${prompt}
Validation: include sensible 'required', 'min', 'max' where relevant. 
React component: 
- functional component, props: { onSubmit }, 
- local state per field, 
- basic required/min/max checks, 
- POST to /api/forms/submit as example, 
- Tailwind classes, 
- no external libs.`;

        const out = await runAI(env, MODEL, sys, usr, 0.2);
        const json = safeParseJSON(out);
        if (!json?.schema?.fields || !json?.react_component) throw new Error("Malformed AI response");

        return jsonRes({ ok:true, ...json, storage, table });
      } catch (e) {
        return jsonRes({ ok:false, error:String(e) }, 500);
      }
    }

    return jsonRes({ ok:true, module:"ai-form" });
  }
};

/* helpers */
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
