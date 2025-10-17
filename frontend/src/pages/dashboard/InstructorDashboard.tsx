import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../../services/api';

interface Course {
  id: string;
  title: string;
  slug: string;
  published: boolean;
  price: number;
  thumbnailUrl?: string;
  _count?: {
    enrollments: number;
    lessons: number;
  };
}

const InstructorDashboard = () => {
  const [courses, setCourses] = useState<Course[]>([]);
  const [stats, setStats] = useState({
    totalStudents: 0,
    activeCourses: 0,
    totalRevenue: 0,
    avgRating: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchInstructorData();
  }, []);

  const fetchInstructorData = async () => {
    try {
      const coursesRes = await api.get('/courses?instructor=me');
      const coursesData = coursesRes.data.courses || [];
      setCourses(coursesData);

      // Calculate stats
      const totalStudents = coursesData.reduce(
        (sum: number, c: Course) => sum + (c._count?.enrollments || 0),
        0
      );
      const activeCourses = coursesData.filter(
        (c: Course) => c.published
      ).length;
      const totalRevenue = coursesData.reduce(
        (sum: number, c: Course) =>
          sum + c.price * (c._count?.enrollments || 0),
        0
      );

      setStats({
        totalStudents,
        activeCourses,
        totalRevenue,
        avgRating: 4.5, // Placeholder
      });
    } catch (error) {
      console.error('Failed to fetch instructor data:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Instructor Dashboard</h1>
        <Link to="/dashboard/instructor/create" className="btn-primary">
          + Create New Course
        </Link>
      </div>

      {/* Stats Cards */}
      <div className="grid md:grid-cols-4 gap-6">
        <div className="card">
          <div className="text-gray-600 text-sm mb-1">Total Students</div>
          <div className="text-3xl font-bold text-primary-600">
            {stats.totalStudents}
          </div>
        </div>
        <div className="card">
          <div className="text-gray-600 text-sm mb-1">Active Courses</div>
          <div className="text-3xl font-bold text-blue-600">
            {stats.activeCourses}
          </div>
        </div>
        <div className="card">
          <div className="text-gray-600 text-sm mb-1">Total Revenue</div>
          <div className="text-3xl font-bold text-green-600">
            ${stats.totalRevenue.toFixed(2)}
          </div>
        </div>
        <div className="card">
          <div className="text-gray-600 text-sm mb-1">Avg Rating</div>
          <div className="text-3xl font-bold text-yellow-600">
            {stats.avgRating} ★
          </div>
        </div>
      </div>

      {/* Your Courses */}
      <div>
        <h2 className="text-2xl font-bold mb-6">Your Courses</h2>
        {courses.length === 0 ? (
          <div className="card text-center py-12">
            <div className="text-6xl mb-4">📚</div>
            <h3 className="text-xl font-semibold mb-2">No courses yet</h3>
            <p className="text-gray-600 mb-6">
              Create your first course and start teaching!
            </p>
            <Link to="/dashboard/instructor/create" className="btn-primary">
              Create Your First Course
            </Link>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {courses.map((course) => (
              <div
                key={course.id}
                className="card hover:shadow-lg transition-shadow"
              >
                {course.thumbnailUrl && (
                  <img
                    src={course.thumbnailUrl}
                    alt={course.title}
                    className="w-full h-40 object-cover rounded-lg mb-4"
                  />
                )}
                <div className="flex items-center gap-2 mb-2">
                  <span
                    className={`px-2 py-1 rounded text-xs font-medium ${
                      course.published
                        ? 'bg-green-100 text-green-800'
                        : 'bg-gray-100 text-gray-800'
                    }`}
                  >
                    {course.published ? 'Published' : 'Draft'}
                  </span>
                </div>
                <h3 className="text-xl font-semibold mb-2">{course.title}</h3>
                <div className="flex justify-between text-sm text-gray-600 mb-4">
                  <span>{course._count?.enrollments || 0} students</span>
                  <span>{course._count?.lessons || 0} lessons</span>
                </div>
                <div className="flex gap-2">
                  <Link
                    to={`/dashboard/instructor/courses/${course.id}/edit`}
                    className="flex-1 btn-secondary text-center"
                  >
                    Edit
                  </Link>
                  <Link
                    to={`/courses/${course.slug}`}
                    className="flex-1 btn-primary text-center"
                  >
                    View
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default InstructorDashboard;
