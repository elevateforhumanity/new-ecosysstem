// Simple in-memory LMS service (fallback when no database present)
// Can be upgraded later to use Prisma / real DB.

const courses = [
  {
    id: 'c_ai_fundamentals',
    slug: 'ai-fundamentals',
    title: 'AI Fundamentals',
    description: 'Foundational AI concepts, terminology, and practical intro projects.',
    level: 'beginner'
  },
  {
    id: 'c_data_science_bootcamp',
    slug: 'data-science-bootcamp',
    title: 'Data Science Bootcamp',
    description: 'End-to-end data workflows, exploratory analysis, modeling, evaluation.',
    level: 'intermediate'
  }
];

const lessons = [
  { id: 'l1', courseId: 'c_ai_fundamentals', title: 'Intro to AI', order: 1 },
  { id: 'l2', courseId: 'c_ai_fundamentals', title: 'Machine Learning Basics', order: 2 },
  { id: 'l3', courseId: 'c_ai_fundamentals', title: 'Neural Networks Overview', order: 3 },
  { id: 'l4', courseId: 'c_data_science_bootcamp', title: 'Data Collection & Cleaning', order: 1 },
  { id: 'l5', courseId: 'c_data_science_bootcamp', title: 'Exploratory Data Analysis', order: 2 },
  { id: 'l6', courseId: 'c_data_science_bootcamp', title: 'Model Building', order: 3 }
];

// Basic in-memory progress map: userId -> Set(lessonId)
const progressMap = new Map();

function listCourses() { return courses; }
function getCourse(id) { return courses.find(c => c.id === id || c.slug === id); }
function listLessons(courseId) { return lessons.filter(l => l.courseId === courseId).sort((a,b)=>a.order-b.order); }

function recordProgress({ userId = 'demo-user', lessonId }) {
  if (!lessonId || !lessons.find(l => l.id === lessonId)) {
    const err = new Error('Invalid lessonId');
    err.statusCode = 400;
    err.type = 'validation';
    throw err;
  }
  if (!progressMap.has(userId)) progressMap.set(userId, new Set());
  progressMap.get(userId).add(lessonId);
  return getProgressSummary(userId);
}

function getProgressSummary(userId = 'demo-user') {
  const completed = progressMap.get(userId) || new Set();
  const total = lessons.length;
  return {
    userId,
    completedLessons: Array.from(completed),
    completedCount: completed.size,
    totalLessons: total,
    percent: total === 0 ? 0 : Math.round((completed.size / total) * 100)
  };
}

module.exports = {
  listCourses,
  getCourse,
  listLessons,
  recordProgress,
  getProgressSummary
};
