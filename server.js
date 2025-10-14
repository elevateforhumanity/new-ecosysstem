const express = require('express');
const cors = require('cors');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const helmet = require('helmet');
const { authenticate, authorize, authRateLimiter, apiRateLimiter } = require('./middleware/auth');
const { validate, schemas } = require('./middleware/validation');
const { notFoundHandler, errorHandler } = require('./middleware/errorHandler');
const { auditLog } = require('./backend/dist/middleware/audit');

// Import services
const lmsService = require('./services/lms');
const emailService = require('./services/email');
const calendarService = require('./services/calendar');
const aiTutorService = require('./services/ai-tutor');
const notebookLMService = require('./services/notebook-lm');

const app = express();
const PORT = process.env.PORT || 3001;

// Require JWT_SECRET from environment - no fallback for security
if (!process.env.JWT_SECRET) {
  console.error('FATAL: JWT_SECRET environment variable is required');
  process.exit(1);
}
const JWT_SECRET = process.env.JWT_SECRET;

// Security middleware
app.use(helmet());

// CORS configuration - environment-aware
const allowedOrigins = process.env.NODE_ENV === 'production'
  ? ['https://elevateforhumanity.com', 'https://elevateforhumanity.org']
  : ['http://localhost:3000', 'http://localhost:5173', 'http://localhost:3001'];

app.use(cors({
  origin: allowedOrigins,
  credentials: true
}));

app.use(express.json());

// Apply audit logging to all routes
app.use(auditLog());

// Apply rate limiting to API routes
app.use('/api/', apiRateLimiter);

// In-memory storage (replace with database in production)
const users = new Map();
const sessions = new Map();

// Auth routes - with rate limiting and validation
app.post('/api/auth/register', authRateLimiter, validate(schemas.register), async (req, res) => {
  try {
    const { email, password, name, role } = req.body;
    
    if (users.has(email)) {
      return res.status(400).json({ 
        success: false,
        error: { code: 'USER_EXISTS', message: 'User already exists' }
      });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const user = {
      id: `user_${Date.now()}`,
      email,
      password: hashedPassword,
      name,
      role: role || 'student',
      createdAt: new Date()
    };

    users.set(email, user);
    
    const token = jwt.sign({ id: user.id, email: user.email, role: user.role }, JWT_SECRET, { expiresIn: '7d' });
    
    res.json({ 
      success: true,
      data: {
        token,
        user: { id: user.id, email: user.email, name: user.name, role: user.role }
      }
    });
  } catch (error) {
    res.status(500).json({ 
      success: false,
      error: { code: 'SERVER_ERROR', message: error.message }
    });
  }
});

app.post('/api/auth/login', authRateLimiter, validate(schemas.login), async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = users.get(email);

    if (!user || !(await bcrypt.compare(password, user.password))) {
      return res.status(401).json({ 
        success: false,
        error: { code: 'INVALID_CREDENTIALS', message: 'Invalid credentials' }
      });
    }

    const token = jwt.sign({ id: user.id, email: user.email, role: user.role }, JWT_SECRET, { expiresIn: '7d' });
    
    res.json({ 
      success: true,
      data: {
        token,
        user: { id: user.id, email: user.email, name: user.name, role: user.role }
      }
    });
  } catch (error) {
    res.status(500).json({ 
      success: false,
      error: { code: 'SERVER_ERROR', message: error.message }
    });
  }
});

app.get('/api/auth/me', authenticate, (req, res) => {
  const user = users.get(req.user.email);
  if (!user) {
    return res.status(404).json({ 
      success: false,
      error: { code: 'USER_NOT_FOUND', message: 'User not found' }
    });
  }
  
  res.json({ 
    success: true,
    data: { id: user.id, email: user.email, name: user.name, role: user.role }
  });
});

// Email API
app.get('/api/email/inbox', authenticate, async (req, res) => {
  try {
    const inbox = await emailService.getInbox(req.user.id);
    res.json({ success: true, data: inbox });
  } catch (error) {
    res.status(500).json({ 
      success: false,
      error: { code: 'SERVER_ERROR', message: error.message }
    });
  }
});

app.post('/api/email/send', authenticate, validate(schemas.sendEmail), async (req, res) => {
  try {
    const result = await emailService.sendEmail({
      from: req.user.email,
      ...req.body
    });
    res.json({ success: true, data: result });
  } catch (error) {
    res.status(500).json({ 
      success: false,
      error: { code: 'SERVER_ERROR', message: error.message }
    });
  }
});

// Calendar API
app.get('/api/calendar/events', authenticate, async (req, res) => {
  try {
    const events = await calendarService.getEvents(req.user.id);
    res.json({ success: true, data: events });
  } catch (error) {
    res.status(500).json({ 
      success: false,
      error: { code: 'SERVER_ERROR', message: error.message }
    });
  }
});

app.post('/api/calendar/events', authenticate, validate(schemas.createEvent), async (req, res) => {
  try {
    const event = await calendarService.createEvent({
      userId: req.user.id,
      ...req.body
    });
    res.json({ success: true, data: event });
  } catch (error) {
    res.status(500).json({ 
      success: false,
      error: { code: 'SERVER_ERROR', message: error.message }
    });
  }
});

// File Storage API
app.get('/api/files', authenticate, (req, res) => {
  res.json({ files: [], folders: [] });
});

app.post('/api/files/upload', authenticate, (req, res) => {
  res.json({ success: true, fileId: `file_${Date.now()}` });
});

// LMS API
app.get('/api/lms/courses', authenticate, async (req, res) => {
  try {
    const courses = await lmsService.getCourses();
    res.json({ success: true, data: courses });
  } catch (error) {
    res.status(500).json({ 
      success: false,
      error: { code: 'SERVER_ERROR', message: error.message }
    });
  }
});

// Only instructors and admins can create courses
app.post('/api/lms/courses', authenticate, authorize('instructor', 'admin'), validate(schemas.createCourse), async (req, res) => {
  try {
    const course = await lmsService.createCourse({
      instructorId: req.user.id,
      ...req.body
    });
    res.json({ success: true, data: course });
  } catch (error) {
    res.status(500).json({ 
      success: false,
      error: { code: 'SERVER_ERROR', message: error.message }
    });
  }
});

// AI Tutor API
app.post('/api/ai-tutor/chat', authenticate, validate(schemas.chatMessage), async (req, res) => {
  try {
    const result = await aiTutorService.chat({
      userId: req.user.id,
      ...req.body
    });
    res.json({ success: true, data: result });
  } catch (error) {
    res.status(500).json({ 
      success: false,
      error: { code: 'SERVER_ERROR', message: error.message }
    });
  }
});

app.post('/api/ai-tutor/grade-essay', authenticate, validate(schemas.gradeEssay), async (req, res) => {
  try {
    const result = await aiTutorService.gradeEssay({
      userId: req.user.id,
      ...req.body
    });
    res.json({ success: true, data: result });
  } catch (error) {
    res.status(500).json({ 
      success: false,
      error: { code: 'SERVER_ERROR', message: error.message }
    });
  }
});

// NotebookLM API
app.post('/api/notebook-lm/notebooks', authenticate, async (req, res) => {
  try {
    const notebook = await notebookLMService.createNotebook({
      userId: req.user.id,
      ...req.body
    });
    res.json({ success: true, data: notebook });
  } catch (error) {
    res.status(500).json({ 
      success: false,
      error: { code: 'SERVER_ERROR', message: error.message }
    });
  }
});

app.post('/api/notebook-lm/sources', authenticate, async (req, res) => {
  try {
    const source = await notebookLMService.addSource({
      userId: req.user.id,
      ...req.body
    });
    res.json({ success: true, data: source });
  } catch (error) {
    res.status(500).json({ 
      success: false,
      error: { code: 'SERVER_ERROR', message: error.message }
    });
  }
});

app.post('/api/notebook-lm/ask', authenticate, async (req, res) => {
  try {
    const result = await notebookLMService.ask({
      userId: req.user.id,
      ...req.body
    });
    res.json({ success: true, data: result });
  } catch (error) {
    res.status(500).json({ 
      success: false,
      error: { code: 'SERVER_ERROR', message: error.message }
    });
  }
});

// Admin API - Protected with role-based access control
app.get('/api/admin/stats', authenticate, authorize('admin'), (req, res) => {
  res.json({
    success: true,
    data: {
      totalUsers: users.size,
      activeUsers: users.size,
      storage: 2.4,
      revenue: 15420
    }
  });
});

app.get('/api/admin/users', authenticate, authorize('admin'), (req, res) => {
  const userList = Array.from(users.values()).map(u => ({
    id: u.id,
    email: u.email,
    name: u.name,
    role: u.role,
    createdAt: u.createdAt
  }));
  
  res.json({ 
    success: true,
    data: { users: userList }
  });
});

// WIOA Compliance Routes
const eligibilityRoutes = require('./backend/dist/routes/eligibility.routes');
const attendanceRoutes = require('./backend/dist/routes/attendance.routes');
const employmentRoutes = require('./backend/dist/routes/employment.routes');
const iepRoutes = require('./backend/dist/routes/iep.routes');
const caseManagementRoutes = require('./backend/dist/routes/case-management.routes');
const financialRoutes = require('./backend/dist/routes/financial.routes');
const supportServicesRoutes = require('./backend/dist/routes/support-services.routes');
const employerRoutes = require('./backend/dist/routes/employer.routes');
const reportingRoutes = require('./backend/dist/routes/reporting.routes');
const validationRoutes = require('./backend/dist/routes/validation.routes');
const auditRoutes = require('./backend/dist/routes/audit.routes');

app.use('/api/eligibility', eligibilityRoutes);
app.use('/api/attendance', attendanceRoutes);
app.use('/api/employment', employmentRoutes);
app.use('/api/iep', iepRoutes);
app.use('/api/case-management', caseManagementRoutes);
app.use('/api/financial', financialRoutes);
app.use('/api/support-services', supportServicesRoutes);
app.use('/api/employer', employerRoutes);
app.use('/api/reporting', reportingRoutes);
app.use('/api/validation', validationRoutes);
app.use('/api/audit', auditRoutes);

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date() });
});

// 404 handler - must be after all routes
app.use(notFoundHandler);

// Global error handler - must be last
app.use(errorHandler);

app.listen(PORT, () => {
  console.log(`✅ Server running on port ${PORT}`);
  console.log(`📡 API endpoints available at http://localhost:${PORT}/api`);
  console.log(`🔒 Security: Helmet, CORS, Rate Limiting enabled`);
  console.log(`🛡️  Environment: ${process.env.NODE_ENV || 'development'}`);
});

module.exports = app;
