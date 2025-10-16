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
require('./env-guard');
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
const { paginationValidation } = require('./validators/lmsValidators');

app.get('/api/v1/enrollments', 
  authenticateToken,
  paginationValidation,
  async (req, res) => {
    try {
      const page = parseInt(req.query.page) || 1;
      const limit = Math.min(parseInt(req.query.limit) || 20, 100);
      const offset = (page - 1) * limit;
      const { sort = 'enrolled_at', order = 'desc', status } = req.query;

      let query = supabase
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
        `, { count: 'exact' })
        .eq('user_id', req.user.id);

      if (status) {
        query = query.eq('status', status);
      }

      query = query
        .order(sort, { ascending: order === 'asc' })
        .range(offset, offset + limit - 1);

      const { data, error, count } = await query;

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
      console.error('Error fetching enrollments:', error);
      res.status(500).json({ success: false, error: 'Failed to fetch enrollments' });
    }
  }
);

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

const { certificateValidation } = require('./validators/lmsValidators');

// Get user certificates with pagination
app.get('/api/v1/certificates', 
  authenticateToken,
  certificateValidation.list,
  async (req, res) => {
    try {
      const page = parseInt(req.query.page) || 1;
      const limit = Math.min(parseInt(req.query.limit) || 20, 100);
      const offset = (page - 1) * limit;
      const { course_id, sort = 'issued_at', order = 'desc' } = req.query;

      let query = supabase
        .from('certificates')
        .select(`
          *,
          courses (
            id,
            title,
            description,
            thumbnail_url
          )
        `, { count: 'exact' })
        .eq('user_id', req.user.id);

      if (course_id) {
        query = query.eq('course_id', course_id);
      }

      query = query
        .order(sort, { ascending: order === 'asc' })
        .range(offset, offset + limit - 1);

      const { data, error, count } = await query;

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
      console.error('Error fetching certificates:', error);
      res.status(500).json({ success: false, error: 'Failed to fetch certificates' });
    }
  }
);

// Get single certificate
app.get('/api/v1/certificates/:id',
  authenticateToken,
  certificateValidation.get,
  async (req, res) => {
    try {
      const { data, error } = await supabase
        .from('certificates')
        .select(`
          *,
          courses (
            id,
            title,
            description,
            instructor_name,
            thumbnail_url
          )
        `)
        .eq('id', req.params.id)
        .eq('user_id', req.user.id)
        .single();

      if (error) throw error;

      if (!data) {
        return res.status(404).json({
          success: false,
          error: 'Certificate not found'
        });
      }

      res.json({ success: true, data });
    } catch (error) {
      console.error('Error fetching certificate:', error);
      res.status(500).json({ success: false, error: 'Failed to fetch certificate' });
    }
  }
);

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
    let averageProgress = 0;

    if (progressData) {
      completedModules = progressData.filter(p => p.completed).length;
      totalHours = progressData.reduce((sum, p) => sum + (p.time_spent_minutes || 0), 0) / 60;
    }

    if (enrollments && enrollments.length > 0) {
      averageProgress = Math.round(
        enrollments.reduce((sum, e) => sum + (e.progress || 0), 0) / enrollments.length
      );
    }

    // Get recent activity (last 5 progress updates)
    const { data: recentActivity } = await supabase
      .from('module_progress')
      .select(`
        *,
        course_modules (
          title,
          course_id
        )
      `)
      .in('enrollment_id', enrollments.map(e => e.id))
      .order('updated_at', { ascending: false })
      .limit(5);

    // Calculate learning streak
    const { data: streakData } = await supabase
      .from('module_progress')
      .select('updated_at')
      .in('enrollment_id', enrollments.map(e => e.id))
      .order('updated_at', { ascending: false })
      .limit(30);

    const learningStreak = calculateStreak(streakData);

    res.json({
      success: true,
      data: {
        stats: {
          enrolledCourses: enrollments?.length || 0,
          completedCourses: enrollments?.filter(e => e.status === 'completed').length || 0,
          certificates: certificatesCount || 0,
          totalHours: Math.round(totalHours),
          completedModules,
          averageProgress,
          learningStreak
        },
        recentActivity: recentActivity || [],
        courses: enrollments || []
      }
    });
  } catch (error) {
    console.error('Error fetching dashboard:', error);
    res.status(500).json({ success: false, error: 'Failed to fetch dashboard data' });
  }
});

// Helper function to calculate learning streak
function calculateStreak(progressData) {
  if (!progressData || progressData.length === 0) return 0;
  
  let streak = 0;
  let currentDate = new Date();
  currentDate.setHours(0, 0, 0, 0);
  
  for (const item of progressData) {
    const itemDate = new Date(item.updated_at);
    itemDate.setHours(0, 0, 0, 0);
    
    const diffDays = Math.floor((currentDate - itemDate) / (1000 * 60 * 60 * 24));
    
    if (diffDays === streak) {
      streak++;
    } else if (diffDays > streak) {
      break;
    }
  }
  
  return streak;
}

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
app.get('/api/v1/agent/history', 
  authenticateToken,
  paginationValidation,
  async (req, res) => {
    try {
      const page = parseInt(req.query.page) || 1;
      const limit = Math.min(parseInt(req.query.limit) || 50, 100);
      const offset = (page - 1) * limit;

      const { data, error, count } = await supabase
        .from('agent_events')
        .select('*', { count: 'exact' })
        .eq('user_id', req.user.id)
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
      console.error('Error fetching agent history:', error);
      res.status(500).json({ success: false, error: 'Failed to fetch history' });
    }
  }
);

// ============================================
// LMS API ENDPOINTS
// ============================================

// Get all courses
app.get('/api/lms/courses', optionalAuth, async (req, res) => {
  try {
    const { data: courses, error } = await supabase
      .from('courses')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) throw error;

    res.json({ success: true, courses: courses || [] });
  } catch (error) {
    console.error('Error fetching courses:', error);
    res.status(500).json({ success: false, error: 'Failed to fetch courses' });
  }
});

// Get single course details
app.get('/api/lms/course/:id', optionalAuth, async (req, res) => {
  try {
    const { id } = req.params;

    const { data: course, error } = await supabase
      .from('courses')
      .select(`
        *,
        course_modules (
          id,
          title,
          duration,
          order_index,
          content
        )
      `)
      .eq('id', id)
      .single();

    if (error) throw error;

    if (!course) {
      return res.status(404).json({ success: false, error: 'Course not found' });
    }

    res.json({ success: true, course });
  } catch (error) {
    console.error('Error fetching course:', error);
    res.status(500).json({ success: false, error: 'Failed to fetch course details' });
  }
});

// Get user's enrolled courses
app.get('/api/lms/my-courses', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.id;

    const { data: enrollments, error } = await supabase
      .from('enrollments')
      .select(`
        *,
        courses (
          id,
          title,
          description,
          duration,
          modules
        )
      `)
      .eq('user_id', userId)
      .order('enrolled_at', { ascending: false });

    if (error) throw error;

    res.json({ success: true, enrollments: enrollments || [] });
  } catch (error) {
    console.error('Error fetching user courses:', error);
    res.status(500).json({ success: false, error: 'Failed to fetch enrolled courses' });
  }
});

// Enroll in a course
app.post('/api/lms/enroll/:courseId', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.id;
    const { courseId } = req.params;

    // Check if already enrolled
    const { data: existing } = await supabase
      .from('enrollments')
      .select('id')
      .eq('user_id', userId)
      .eq('course_id', courseId)
      .single();

    if (existing) {
      return res.status(400).json({ success: false, error: 'Already enrolled in this course' });
    }

    // Create enrollment
    const { data: enrollment, error } = await supabase
      .from('enrollments')
      .insert({
        user_id: userId,
        course_id: courseId,
        progress: 0,
        completed: false
      })
      .select()
      .single();

    if (error) throw error;

    res.json({ success: true, enrollment });
  } catch (error) {
    console.error('Error enrolling in course:', error);
    res.status(500).json({ success: false, error: 'Failed to enroll in course' });
  }
});

// Update course progress
app.put('/api/lms/progress/:courseId', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.id;
    const { courseId } = req.params;
    const { progress, completed } = req.body;

    const { data: enrollment, error } = await supabase
      .from('enrollments')
      .update({
        progress: progress || 0,
        completed: completed || false,
        updated_at: new Date().toISOString()
      })
      .eq('user_id', userId)
      .eq('course_id', courseId)
      .select()
      .single();

    if (error) throw error;

    if (!enrollment) {
      return res.status(404).json({ success: false, error: 'Enrollment not found' });
    }

    res.json({ success: true, enrollment });
  } catch (error) {
    console.error('Error updating progress:', error);
    res.status(500).json({ success: false, error: 'Failed to update progress' });
  }
});

// Get user progress for a course
app.get('/api/lms/progress/:courseId', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.id;
    const { courseId } = req.params;

    const { data: progress, error } = await supabase
      .from('user_progress')
      .select(`
        *,
        course_modules (
          id,
          title,
          duration,
          order_index
        )
      `)
      .eq('user_id', userId)
      .eq('module_id', courseId);

    if (error) throw error;

    res.json({ success: true, progress: progress || [] });
  } catch (error) {
    console.error('Error fetching progress:', error);
    res.status(500).json({ success: false, error: 'Failed to fetch progress' });
  }
});

// Get assignments
app.get('/api/lms/assignments', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.id;

    // Get user's enrolled courses
    const { data: enrollments } = await supabase
      .from('enrollments')
      .select('course_id')
      .eq('user_id', userId);

    const courseIds = enrollments?.map(e => e.course_id) || [];

    // Mock assignments for now (add assignments table later)
    const assignments = [
      {
        id: 1,
        title: 'AI Project: Build a Chatbot',
        course_id: courseIds[0],
        due_date: '2025-10-20',
        status: 'pending'
      },
      {
        id: 2,
        title: 'Data Analysis Report',
        course_id: courseIds[1],
        due_date: '2025-10-18',
        status: 'submitted'
      }
    ];

    res.json({ success: true, assignments });
  } catch (error) {
    console.error('Error fetching assignments:', error);
    res.status(500).json({ success: false, error: 'Failed to fetch assignments' });
  }
});

// Submit assignment
app.post('/api/lms/submit', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.id;
    const { assignmentId, content, fileUrl } = req.body;

    // Mock submission (add submissions table later)
    const submission = {
      id: Date.now(),
      user_id: userId,
      assignment_id: assignmentId,
      content,
      file_url: fileUrl,
      submitted_at: new Date().toISOString(),
      status: 'submitted'
    };

    res.json({ success: true, submission });
  } catch (error) {
    console.error('Error submitting assignment:', error);
    res.status(500).json({ success: false, error: 'Failed to submit assignment' });
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
  console.log(`📚 LMS Endpoints:`);
  console.log(`   - GET  /api/lms/courses`);
  console.log(`   - GET  /api/lms/course/:id`);
  console.log(`   - GET  /api/lms/my-courses`);
  console.log(`   - POST /api/lms/enroll/:courseId`);
  console.log(`   - PUT  /api/lms/progress/:courseId`);
  console.log(`   - GET  /api/lms/progress/:courseId`);
  console.log(`   - GET  /api/lms/assignments`);
  console.log(`   - POST /api/lms/submit`);
});

module.exports = app;
