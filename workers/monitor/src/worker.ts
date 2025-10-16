export interface Env {
  TARGET_URL: string
  SLACK_WEBHOOK: string
}

export default {
  async scheduled(_event: ScheduledEvent, env: Env, ctx: ExecutionContext) {
    const start = Date.now()
    let ok = false, status = 0, err: string | undefined
    try {
      const res = await fetch(env.TARGET_URL + "/@vite/client", { cf: { cacheTtl: 0 } })
      status = res.status
      ok = res.ok
    } catch (e: any) {
      err = e?.message || String(e)
    }
    const ms = Date.now() - start
    if (!ok) {
      const text = `⚠️ EFH preview down\nURL: ${env.TARGET_URL}\nStatus: ${status}\nErr: ${err ?? "none"}\nRTT: ${ms}ms`
      await fetch(env.SLACK_WEBHOOK, { method: "POST", body: JSON.stringify({ text }) })
    }
  },

  async fetch(req: Request, env: Env) {
    // optional: on-demand health probe
    const res = await fetch(env.TARGET_URL + "/@vite/client")
    return new Response(JSON.stringify({ ok: res.ok, status: res.status }), {
      headers: { "content-type": "application/json" }
    })
  }
}
