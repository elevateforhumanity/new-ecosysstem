const express = require('express');
const cors = require('cors');
const { createClient } = require('@supabase/supabase-js');

const app = express();
const PORT = process.env.PORT || 3001;

// Supabase client
const supabase = createClient(
  process.env.SUPABASE_URL || 'https://cuxzzpsyufcewtmicszk.supabase.co',
  process.env.SUPABASE_SERVICE_KEY || process.env.SUPABASE_ANON_KEY
);

// Middleware
app.use(cors());
app.use(express.json());

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// ==================== COURSES ====================

// Get all published courses
app.get('/api/courses', async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('courses')
      .select('*')
      .eq('published', true)
      .order('created_at', { ascending: false });

    if (error) throw error;
    res.json({ success: true, data });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Get single course with modules
app.get('/api/courses/:id', async (req, res) => {
  try {
    const { data: course, error: courseError } = await supabase
      .from('courses')
      .select('*')
      .eq('id', req.params.id)
      .single();

    if (courseError) throw courseError;

    const { data: modules, error: modulesError } = await supabase
      .from('modules')
      .select('*')
      .eq('course_id', req.params.id)
      .order('order_index');

    if (modulesError) throw modulesError;

    res.json({ success: true, data: { ...course, modules } });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// ==================== ENROLLMENTS ====================

// Get user enrollments
app.get('/api/enrollments/:userId', async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('enrollments')
      .select(`
        *,
        courses (*)
      `)
      .eq('user_id', req.params.userId);

    if (error) throw error;
    res.json({ success: true, data });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Enroll in course
app.post('/api/enrollments', async (req, res) => {
  try {
    const { user_id, course_id } = req.body;

    // Check if already enrolled
    const { data: existing } = await supabase
      .from('enrollments')
      .select('id')
      .eq('user_id', user_id)
      .eq('course_id', course_id)
      .single();

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

    res.json({ success: true, data });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// ==================== PROGRESS ====================

// Get enrollment progress
app.get('/api/progress/:enrollmentId', async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('module_progress')
      .select(`
        *,
        modules (*)
      `)
      .eq('enrollment_id', req.params.enrollmentId)
      .order('modules(order_index)');

    if (error) throw error;
    res.json({ success: true, data });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Update module progress
app.put('/api/progress/:progressId', async (req, res) => {
  try {
    const { completed, time_spent_minutes } = req.body;

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
    res.status(500).json({ success: false, error: error.message });
  }
});

// ==================== CERTIFICATES ====================

// Get user certificates
app.get('/api/certificates/:userId', async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('certificates')
      .select(`
        *,
        courses (title, description)
      `)
      .eq('user_id', req.params.userId)
      .order('issued_at', { ascending: false });

    if (error) throw error;
    res.json({ success: true, data });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// ==================== DASHBOARD STATS ====================

// Get user dashboard stats
app.get('/api/dashboard/:userId', async (req, res) => {
  try {
    // Get enrollments with progress
    const { data: enrollments } = await supabase
      .from('enrollments')
      .select('*, courses(*)')
      .eq('user_id', req.params.userId);

    // Get certificates
    const { data: certificates } = await supabase
      .from('certificates')
      .select('*')
      .eq('user_id', req.params.userId);

    // Calculate total learning hours
    let totalHours = 0;
    let completedModules = 0;

    for (const enrollment of enrollments || []) {
      const { data: progress } = await supabase
        .from('module_progress')
        .select('completed, time_spent_minutes')
        .eq('enrollment_id', enrollment.id);

      if (progress) {
        completedModules += progress.filter(p => p.completed).length;
        totalHours += progress.reduce((sum, p) => sum + (p.time_spent_minutes || 0), 0) / 60;
      }
    }

    res.json({
      success: true,
      data: {
        enrollments: enrollments?.length || 0,
        certificates: certificates?.length || 0,
        totalHours: Math.round(totalHours),
        completedModules,
        courses: enrollments || []
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Start server
app.listen(PORT, () => {
  console.log(`✅ LMS Backend running on port ${PORT}`);
  console.log(`📡 API: http://localhost:${PORT}/api`);
  console.log(`🏥 Health: http://localhost:${PORT}/health`);
});

module.exports = app;
