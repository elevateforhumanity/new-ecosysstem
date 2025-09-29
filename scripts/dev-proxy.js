// ESM proxy (requires "type":"module")
import httpProxy from 'http-proxy'
import http from 'http'
const TARGET = 'http://127.0.0.1:8012'
const PORT = 9000
console.log(`🔄 Starting dev proxy on ${PORT} → ${TARGET}`)
const proxy = httpProxy.createProxyServer({ target: TARGET, ws: true, changeOrigin: true, timeout: 30000, proxyTimeout: 30000 })
proxy.on('proxyReq', (pReq, req) => { pReq.setHeader('Host', 'localhost'); console.log(`📡 ${req.method} ${req.url}`) })
proxy.on('proxyRes', (pRes, req) => console.log(`✅ ${pRes.statusCode} ${req.url}`))
proxy.on('error', (e, req, res) => { console.error(`❌ Proxy error: ${e.message}`); if (res && !res.headersSent){ res.writeHead(502,{'Content-Type':'text/plain'}); res.end(`Proxy error: ${e.message}\nTarget: ${TARGET}`) }})
const server = http.createServer((req, res)=>proxy.web(req,res))
server.on('upgrade',(req,socket,head)=>proxy.ws(req,socket,head))
server.listen(PORT,'0.0.0.0',()=>console.log(`🚀 Proxy http://localhost:${PORT} → ${TARGET}`))
