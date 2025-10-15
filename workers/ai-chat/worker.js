const MODEL = "@cf/meta/llama-3-8b-instruct";

export default {
  async fetch(req, env) {
    const url = new URL(req.url);
    if (req.method === "OPTIONS") return cors();

    if (req.method === "POST" && url.pathname === "/chat") {
      try {
        const body = await req.json();
        const { history = [], question = "", persona = "Helpful website agent for EFH." } = body || {};
        // limit history for cost control
        const trimmed = history.slice(-10);

        const messages = [
          { role:"system", content: `${persona} If unsure, say you'll escalate. Be concise.` },
          ...trimmed.map(m => ({ role: m.role === "user" ? "user":"assistant", content: String(m.content||"")})),
          { role:"user", content: question }
        ];

        const out = await runAI(env, MODEL, messages, 0.3);
        return jsonRes({ ok:true, answer: out });
      } catch (e) {
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
function cors(){ return new Response(null, { headers: { "Access-Control-Allow-Origin":"*","Access-Control-Allow-Methods":"GET,POST,OPTIONS","Access-Control-Allow-Headers":"Content-Type,Authorization" } }); }
function jsonRes(b,s=200){ return new Response(JSON.stringify(b), { status:s, headers:{ "Content-Type":"application/json","Access-Control-Allow-Origin":"*" } }); }
