const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const { body, param, validationResult } = require('express-validator');
const morgan = require('morgan');
const compression = require('compression');
const jwt = require('jsonwebtoken');
const { createClient } = require('@supabase/supabase-js');

const app = express();
const PORT = process.env.PORT || 3001;

// Validate required environment variables
const requiredEnvVars = ['SUPABASE_URL', 'JWT_SECRET'];
const missingEnvVars = requiredEnvVars.filter(varName => !process.env[varName]);

if (missingEnvVars.length > 0) {
  console.error(`❌ ERROR: Missing required environment variables: ${missingEnvVars.join(', ')}`);
  process.exit(1);
}

const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_KEY = process.env.SUPABASE_ANON_KEY || process.env.SUPABASE_SERVICE_KEY;
const JWT_SECRET = process.env.JWT_SECRET;

if (!SUPABASE_KEY) {
  console.error('❌ ERROR: SUPABASE_ANON_KEY or SUPABASE_SERVICE_KEY must be set');
  process.exit(1);
}

// Supabase client
const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

// Security Middleware
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      scriptSrc: ["'self'"],
      imgSrc: ["'self'", 'data:', 'https:'],
    },
  },
}));

// CORS configuration
app.use(cors({
  origin: process.env.FRONTEND_URL || '*',
  credentials: true,
}));

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  message: 'Too many requests from this IP, please try again later.',
});
app.use('/api/', limiter);

// Body parsing and compression
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
app.use(compression());

// Logging
app.use(morgan('combined'));

// JWT Authentication Middleware
const authenticateToken = async (req, res, next) => {
  const authHeader = req.headers.authorization;
  const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN

  if (!token) {
    return res.status(401).json({ success: false, error: 'Authentication required' });
  }

  try {
    // Verify JWT token
    const decoded = jwt.verify(token, JWT_SECRET);
    
    // Get user from Supabase
    const { data: user, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', decoded.sub || decoded.userId)
      .single();

    if (error || !user) {
      return res.status(403).json({ success: false, error: 'Invalid token' });
    }

    req.user = user;
    next();
  } catch (error) {
    return res.status(403).json({ success: false, error: 'Invalid or expired token' });
  }
};

// Optional authentication (doesn't fail if no token)
const optionalAuth = async (req, res, next) => {
  const authHeader = req.headers.authorization;
  const token = authHeader && authHeader.split(' ')[1];

  if (token) {
    try {
      const decoded = jwt.verify(token, JWT_SECRET);
      const { data: user } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', decoded.sub || decoded.userId)
        .single();
      
      if (user) {
        req.user = user;
      }
    } catch (error) {
      // Continue without user
    }
  }
  next();
};

// Validation error handler
const handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ 
      success: false, 
      errors: errors.array().map(err => ({ field: err.path, message: err.msg }))
    });
  }
  next();
};

// Health check with database ping
app.get('/health', async (req, res) => {
  try {
    // Test database connection
    const { error } = await supabase.from('profiles').select('count').limit(1);
    
    res.json({ 
      status: error ? 'degraded' : 'ok', 
      timestamp: new Date().toISOString(),
      database: error ? 'error' : 'connected',
      version: '1.0.0'
    });
  } catch (error) {
    res.status(503).json({ 
      status: 'error', 
      timestamp: new Date().toISOString(),
      error: 'Service unavailable'
    });
  }
});

// ==================== COURSES ====================

// Get all published courses with pagination
app.get('/api/v1/courses', optionalAuth, async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = Math.min(parseInt(req.query.limit) || 20, 100);
    const offset = (page - 1) * limit;

    const { data, error, count } = await supabase
      .from('courses')
      .select('*', { count: 'exact' })
      .eq('published', true)
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1);

    if (error) throw error;
    
    res.json({ 
      success: true, 
      data,
      pagination: {
        page,
        limit,
        total: count,
        totalPages: Math.ceil(count / limit)
      }
    });
  } catch (error) {
    console.error('Error fetching courses:', error);
    res.status(500).json({ success: false, error: 'Failed to fetch courses' });
  }
});

// Get single course with modules
app.get('/api/v1/courses/:id', 
  param('id').isUUID().withMessage('Invalid course ID'),
  handleValidationErrors,
  optionalAuth,
  async (req, res) => {
    try {
      // Use a single query with join to avoid N+1
      const { data: course, error } = await supabase
        .from('courses')
        .select(`
          *,
          modules (
            id,
            title,
            description,
            order_index,
            duration_minutes,
            video_url
          )
        `)
        .eq('id', req.params.id)
        .single();

      if (error) {
        if (error.code === 'PGRST116') {
          return res.status(404).json({ success: false, error: 'Course not found' });
        }
        throw error;
      }

      // Sort modules by order_index
      if (course.modules) {
        course.modules.sort((a, b) => a.order_index - b.order_index);
      }

      res.json({ success: true, data: course });
    } catch (error) {
      console.error('Error fetching course:', error);
      res.status(500).json({ success: false, error: 'Failed to fetch course' });
    }
  }
);

// ==================== ENROLLMENTS ====================

// Get user enrollments
app.get('/api/v1/enrollments', authenticateToken, async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('enrollments')
      .select(`
        *,
        courses (
          id,
          title,
          description,
          duration,
          thumbnail_url
        )
      `)
      .eq('user_id', req.user.id);

    if (error) throw error;
    res.json({ success: true, data });
  } catch (error) {
    console.error('Error fetching enrollments:', error);
    res.status(500).json({ success: false, error: 'Failed to fetch enrollments' });
  }
});

// Enroll in course
app.post('/api/v1/enrollments',
  authenticateToken,
  body('course_id').isUUID().withMessage('Invalid course ID'),
  handleValidationErrors,
  async (req, res) => {
    try {
      const { course_id } = req.body;
      const user_id = req.user.id;

      // Check if course exists and is published
      const { data: course, error: courseError } = await supabase
        .from('courses')
        .select('id, published')
        .eq('id', course_id)
        .single();

      if (courseError || !course) {
        return res.status(404).json({ success: false, error: 'Course not found' });
      }

      if (!course.published) {
        return res.status(400).json({ success: false, error: 'Course is not available for enrollment' });
      }

      // Check if already enrolled
      const { data: existing } = await supabase
        .from('enrollments')
        .select('id')
        .eq('user_id', user_id)
        .eq('course_id', course_id)
        .maybeSingle();

      if (existing) {
        return res.status(400).json({ 
          success: false, 
          error: 'Already enrolled in this course' 
        });
      }

      // Create enrollment
      const { data, error } = await supabase
        .from('enrollments')
        .insert({ user_id, course_id })
        .select()
        .single();

      if (error) throw error;

      // Create module progress entries
      const { data: modules } = await supabase
        .from('modules')
        .select('id')
        .eq('course_id', course_id);

      if (modules && modules.length > 0) {
        const progressEntries = modules.map(module => ({
          enrollment_id: data.id,
          module_id: module.id,
          completed: false
        }));

        await supabase
          .from('module_progress')
          .insert(progressEntries);
      }

      res.status(201).json({ success: true, data });
    } catch (error) {
      console.error('Error creating enrollment:', error);
      res.status(500).json({ success: false, error: 'Failed to create enrollment' });
    }
  }
);

// ==================== PROGRESS ====================

// Get enrollment progress
app.get('/api/v1/progress/:enrollmentId',
  authenticateToken,
  param('enrollmentId').isUUID().withMessage('Invalid enrollment ID'),
  handleValidationErrors,
  async (req, res) => {
    try {
      // Verify user owns this enrollment
      const { data: enrollment } = await supabase
        .from('enrollments')
        .select('user_id')
        .eq('id', req.params.enrollmentId)
        .single();

      if (!enrollment || enrollment.user_id !== req.user.id) {
        return res.status(403).json({ success: false, error: 'Access denied' });
      }

      const { data, error } = await supabase
        .from('module_progress')
        .select(`
          *,
          modules (
            id,
            title,
            description,
            order_index,
            duration_minutes
          )
        `)
        .eq('enrollment_id', req.params.enrollmentId);

      if (error) throw error;

      // Sort by module order
      data.sort((a, b) => (a.modules?.order_index || 0) - (b.modules?.order_index || 0));

      res.json({ success: true, data });
    } catch (error) {
      console.error('Error fetching progress:', error);
      res.status(500).json({ success: false, error: 'Failed to fetch progress' });
    }
  }
);

// Update module progress
app.put('/api/v1/progress/:progressId',
  authenticateToken,
  param('progressId').isUUID().withMessage('Invalid progress ID'),
  body('completed').optional().isBoolean().withMessage('Completed must be boolean'),
  body('time_spent_minutes').optional().isInt({ min: 0 }).withMessage('Time must be positive integer'),
  handleValidationErrors,
  async (req, res) => {
    try {
      const { completed, time_spent_minutes } = req.body;

      // Verify user owns this progress record
      const { data: progress } = await supabase
        .from('module_progress')
        .select('enrollment_id, enrollments!inner(user_id)')
        .eq('id', req.params.progressId)
        .single();

      if (!progress || progress.enrollments.user_id !== req.user.id) {
        return res.status(403).json({ success: false, error: 'Access denied' });
      }

      const updateData = {};
      if (completed !== undefined) {
        updateData.completed = completed;
        if (completed) {
          updateData.completed_at = new Date().toISOString();
        }
      }
      if (time_spent_minutes !== undefined) {
        updateData.time_spent_minutes = time_spent_minutes;
      }

      const { data, error } = await supabase
        .from('module_progress')
        .update(updateData)
        .eq('id', req.params.progressId)
        .select()
        .single();

      if (error) throw error;
      res.json({ success: true, data });
    } catch (error) {
      console.error('Error updating progress:', error);
      res.status(500).json({ success: false, error: 'Failed to update progress' });
    }
  }
);

// ==================== CERTIFICATES ====================

// Get user certificates
app.get('/api/v1/certificates', authenticateToken, async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('certificates')
      .select(`
        *,
        courses (
          id,
          title,
          description
        )
      `)
      .eq('user_id', req.user.id)
      .order('issued_at', { ascending: false });

    if (error) throw error;
    res.json({ success: true, data });
  } catch (error) {
    console.error('Error fetching certificates:', error);
    res.status(500).json({ success: false, error: 'Failed to fetch certificates' });
  }
});

// ==================== DASHBOARD STATS ====================

// Get user dashboard stats (optimized - no N+1 queries)
app.get('/api/v1/dashboard', authenticateToken, async (req, res) => {
  try {
    // Single query with aggregation using Supabase's built-in functions
    const { data: enrollments, error: enrollError } = await supabase
      .from('enrollments')
      .select(`
        id,
        progress,
        status,
        enrolled_at,
        courses (
          id,
          title,
          description,
          thumbnail_url
        )
      `)
      .eq('user_id', req.user.id);

    if (enrollError) throw enrollError;

    // Get certificates count
    const { count: certificatesCount, error: certError } = await supabase
      .from('certificates')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', req.user.id);

    if (certError) throw certError;

    // Get aggregated progress data in one query
    const { data: progressData, error: progressError } = await supabase
      .from('module_progress')
      .select('completed, time_spent_minutes, enrollment_id')
      .in('enrollment_id', enrollments.map(e => e.id));

    if (progressError) throw progressError;

    // Calculate stats
    let totalHours = 0;
    let completedModules = 0;

    if (progressData) {
      completedModules = progressData.filter(p => p.completed).length;
      totalHours = progressData.reduce((sum, p) => sum + (p.time_spent_minutes || 0), 0) / 60;
    }

    res.json({
      success: true,
      data: {
        enrollments: enrollments?.length || 0,
        certificates: certificatesCount || 0,
        totalHours: Math.round(totalHours),
        completedModules,
        courses: enrollments || []
      }
    });
  } catch (error) {
    console.error('Error fetching dashboard:', error);
    res.status(500).json({ success: false, error: 'Failed to fetch dashboard data' });
  }
});

// ==================== AI AGENT ====================

// Agent proxy endpoint
app.post('/api/v1/agent',
  authenticateToken,
  body('prompt').notEmpty().withMessage('Prompt is required'),
  handleValidationErrors,
  async (req, res) => {
    try {
      const { prompt } = req.body;

      // Forward to Cloudflare Worker
      const agentUrl = process.env.AGENT_WORKER_URL;
      
      if (!agentUrl) {
        return res.status(503).json({ 
          success: false, 
          error: 'AI agent service not configured' 
        });
      }
      
      const response = await fetch(agentUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': req.headers.authorization,
        },
        body: JSON.stringify({ prompt, userId: req.user.id }),
      });

      const data = await response.json();
      res.json(data);
    } catch (error) {
      console.error('Error calling agent:', error);
      res.status(500).json({ success: false, error: 'AI agent service unavailable' });
    }
  }
);

// Get agent command history
app.get('/api/v1/agent/history', authenticateToken, async (req, res) => {
  try {
    const limit = Math.min(parseInt(req.query.limit) || 50, 100);

    const { data, error } = await supabase
      .from('agent_events')
      .select('*')
      .eq('user_id', req.user.id)
      .order('created_at', { ascending: false })
      .limit(limit);

    if (error) throw error;
    res.json({ success: true, data });
  } catch (error) {
    console.error('Error fetching agent history:', error);
    res.status(500).json({ success: false, error: 'Failed to fetch history' });
  }
});

// Error handling middleware (must be last)
app.use((err, req, res, next) => {
  console.error('Unhandled error:', err);
  res.status(500).json({ 
    success: false, 
    error: process.env.NODE_ENV === 'production' 
      ? 'Internal server error' 
      : err.message 
  });
});

// Start server
app.listen(PORT, () => {
  console.log(`✅ LMS Backend running on port ${PORT}`);
  console.log(`📡 API: http://localhost:${PORT}/api`);
  console.log(`🏥 Health: http://localhost:${PORT}/health`);
  console.log(`🤖 Agent: http://localhost:${PORT}/api/agent`);
});

module.exports = app;
