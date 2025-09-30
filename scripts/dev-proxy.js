import httpProxy from 'http-proxy'
import http from 'http'
const TARGET = `http://127.0.0.1:${process.env.VITE_DEV_PORT || 8012}`
const PORT = process.env.PROXY_PORT || 9000
const proxy = httpProxy.createProxyServer({ target: TARGET, ws: true, changeOrigin: true, timeout: 30000 })
proxy.on('proxyReq', (pReq) => pReq.setHeader('Host', 'localhost'))
proxy.on('error', (e, req, res) => { console.error(`❌ ${e.message}`); if (res && !res.headersSent) res.writeHead(502).end(`Proxy error: ${e.message}`) })
const server = http.createServer((req, res)=>proxy.web(req,res))
server.on('upgrade',(req,socket,head)=>proxy.ws(req,socket,head))
server.listen(PORT,'0.0.0.0',()=>console.log(`🚀 Proxy http://localhost:${PORT} → ${TARGET}`))
