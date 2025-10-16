import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../store/authStore';
import api from '../../services/api';
import type { Enrollment } from '../../types';

interface Certificate {
  id: string;
  certificateId: string;
  course: {
    title: string;
  };
  issuedAt: string;
}

const StudentDashboard = () => {
  const { user } = useAuth();
  const [enrollments, setEnrollments] = useState<Enrollment[]>([]);
  const [certificates, setCertificates] = useState<Certificate[]>([]);
  const [stats, setStats] = useState({
    totalCourses: 0,
    inProgress: 0,
    completed: 0,
    totalHours: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      const [enrollmentsRes, certificatesRes] = await Promise.all([
        api.get('/enrollments'),
        api.get('/certificates').catch(() => ({ data: { certificates: [] } })),
      ]);

      const enrollmentsData = enrollmentsRes.data.enrollments || [];
      const certificatesData = certificatesRes.data.certificates || [];

      setEnrollments(enrollmentsData);
      setCertificates(certificatesData);

      // Calculate stats
      const completed = enrollmentsData.filter((e: Enrollment) => e.progress === 100).length;
      const inProgress = enrollmentsData.filter((e: Enrollment) => e.progress > 0 && e.progress < 100).length;

      setStats({
        totalCourses: enrollmentsData.length,
        inProgress,
        completed,
        totalHours: enrollmentsData.length * 10, // Placeholder
      });
    } catch (error) {
      console.error('Failed to fetch dashboard data:', error);
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
      {/* Welcome Section */}
      <div>
        <h1 className="text-3xl font-bold mb-2">Welcome back, {user?.name}!</h1>
        <p className="text-gray-600">Continue your learning journey</p>
      </div>

      {/* Stats Cards */}
      <div className="grid md:grid-cols-4 gap-6">
        <div className="card">
          <div className="text-gray-600 text-sm mb-1">Total Courses</div>
          <div className="text-3xl font-bold text-primary-600">{stats.totalCourses}</div>
        </div>
        <div className="card">
          <div className="text-gray-600 text-sm mb-1">In Progress</div>
          <div className="text-3xl font-bold text-blue-600">{stats.inProgress}</div>
        </div>
        <div className="card">
          <div className="text-gray-600 text-sm mb-1">Completed</div>
          <div className="text-3xl font-bold text-green-600">{stats.completed}</div>
        </div>
        <div className="card">
          <div className="text-gray-600 text-sm mb-1">Learning Hours</div>
          <div className="text-3xl font-bold text-purple-600">{stats.totalHours}</div>
        </div>
      </div>

      {/* My Courses */}
      <div>
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold">My Courses</h2>
          <Link to="/courses" className="text-primary-600 hover:text-primary-700 font-medium">
            Browse More →
          </Link>
        </div>

        {enrollments.length === 0 ? (
          <div className="card text-center py-12">
            <div className="text-6xl mb-4">📚</div>
            <h3 className="text-xl font-semibold mb-2">No courses yet</h3>
            <p className="text-gray-600 mb-6">Start your learning journey today!</p>
            <Link to="/courses" className="btn-primary">
              Browse Courses
            </Link>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {enrollments.map((enrollment) => (
              <div key={enrollment.id} className="card hover:shadow-lg transition-shadow">
                {enrollment.course.thumbnailUrl && (
                  <img 
                    src={enrollment.course.thumbnailUrl} 
                    alt={enrollment.course.title}
                    className="w-full h-40 object-cover rounded-lg mb-4"
                  />
                )}
                <h3 className="text-xl font-semibold mb-3">{enrollment.course.title}</h3>
                
                {/* Progress Bar */}
                <div className="mb-4">
                  <div className="flex justify-between text-sm text-gray-600 mb-2">
                    <span>Progress</span>
                    <span className="font-semibold">{enrollment.progress}%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2.5">
                    <div 
                      className="bg-primary-600 h-2.5 rounded-full transition-all" 
                      style={{ width: `${enrollment.progress}%` }}
                    ></div>
                  </div>
                </div>

                <Link 
                  to={`/learn/${enrollment.courseId}`} 
                  className="btn-primary w-full text-center"
                >
                  {enrollment.progress === 100 ? 'Review Course' : 'Continue Learning'}
                </Link>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Certificates */}
      {certificates.length > 0 && (
        <div>
          <h2 className="text-2xl font-bold mb-6">My Certificates</h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {certificates.map((cert) => (
              <div key={cert.id} className="card border-2 border-yellow-400">
                <div className="text-4xl mb-3">🏆</div>
                <h3 className="font-semibold mb-2">{cert.course.title}</h3>
                <p className="text-sm text-gray-600 mb-4">
                  Issued on {new Date(cert.issuedAt).toLocaleDateString()}
                </p>
                <button className="btn-secondary w-full">
                  View Certificate
                </button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default StudentDashboard;
