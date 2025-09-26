// app/server.js
import express from 'express';
import cors from 'cors';
import http from 'http';
import { Server as SocketIOServer } from 'socket.io';

const app = express();
const PORT = process.env.PORT || 3000;

app.set('trust proxy', true);
app.use(cors({ origin: '*', methods: ['GET','POST','PUT','DELETE','OPTIONS'] }));
app.use(express.json());

// ---- health
app.get('/health', (_req, res) => res.status(200).send('OK'));

// ---- admin UI/API (proxied via Caddy at /admin/*)
app.get('/admin', (_req, res) => res.send('EFH Admin is running.'));
app.get('/admin/status', (_req, res) => res.json({ status: 'ok', ts: Date.now() }));

// ---- example APIs (proxied via /api/*)
app.get('/api/ping', (_req, res) => res.json({ ok: true, ts: Date.now() }));
app.post('/api/enroll', (req, res) => res.json({ received: true, body: req.body }));

// Sample API endpoints
app.get('/api/courses', (req, res) => {
  res.json([
    {
      id: 1,
      title: 'Digital Marketing Fundamentals',
      description: 'Learn the basics of digital marketing including SEO, social media, and email marketing.',
      duration: '8 weeks',
      level: 'Beginner',
      category: 'Marketing'
    },
    {
      id: 2,
      title: 'Web Development Bootcamp',
      description: 'Comprehensive course covering HTML, CSS, JavaScript, and React.',
      duration: '12 weeks',
      level: 'Intermediate',
      category: 'Technology'
    },
    {
      id: 3,
      title: 'Project Management Certification',
      description: 'Prepare for PMP certification with comprehensive project management training.',
      duration: '6 weeks',
      level: 'Advanced',
      category: 'Management'
    }
  ]);
});

app.get('/api/students', (req, res) => {
  res.json([
    { id: 1, name: 'John Doe', email: 'john@example.com', course: 'Digital Marketing' },
    { id: 2, name: 'Jane Smith', email: 'jane@example.com', course: 'Web Development' }
  ]);
});

// ---- static assets for admin (optional)
// Place files in app/public/admin and serve them at /admin/assets/*
app.use('/admin/assets', express.static('public/admin', { maxAge: '1h', etag: true }));

// ---- Socket.IO (proxied via Caddy at /socket.io/*)
const server = http.createServer(app);
const io = new SocketIOServer(server, {
  path: '/socket.io',
  cors: { origin: '*', methods: ['GET','POST'] }
});

io.on('connection', (socket) => {
  console.log('WS client connected', socket.id);
  socket.emit('welcome', { message: 'Hello from EFH WS!' });
  socket.on('ping', (data) => socket.emit('pong', { received: data }));
  socket.on('disconnect', () => console.log('WS client disconnected', socket.id));
});

server.listen(PORT, '0.0.0.0', () =>
  console.log(`EFH app server listening on http://0.0.0.0:${PORT}`)
);