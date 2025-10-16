const express = require('express')
const cors = require('cors')

const app = express()
const PORT = process.env.API_PORT || 3001

app.use(cors({ origin: [/\.gitpod\.dev$/, 'http://localhost:5173'], credentials: true }))
app.use(express.json())

app.get('/api/health', (_req, res) => res.json({ ok: true, service: 'api', ts: Date.now() }))
app.get('/', (_req, res) => res.send('EFH API is running ✅'))

app.listen(PORT, '0.0.0.0', () => {
  console.log(`[EFH] API listening on :${PORT}`)
})
