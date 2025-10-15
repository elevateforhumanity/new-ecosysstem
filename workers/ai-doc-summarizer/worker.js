export default {
  async fetch(req, env) {
    const url = new URL(req.url);
    if (req.method === "OPTIONS") return new Response(null, {headers:{
      "Access-Control-Allow-Origin":"*","Access-Control-Allow-Methods":"GET,POST,OPTIONS","Access-Control-Allow-Headers":"Content-Type,Authorization"}});

    if (req.method === "POST" && url.pathname === "/summarize") {
      const body = await req.json().catch(()=>({}));
      // Minimal stub response; replace with your model call
      return new Response(JSON.stringify({ ok:true, module:"ai-doc-summarizer", received: body, note: "Document summarization / key points (stub)" }), { headers: {"Content-Type":"application/json","Access-Control-Allow-Origin":"*"}});
    }

    return new Response(JSON.stringify({ ok:true, module:"ai-doc-summarizer"}), { headers: {"Content-Type":"application/json","Access-Control-Allow-Origin":"*"}});
  }
}
