import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../../store/authStore';
import api from '../../services/api';
import type { Course } from '../../types';

interface Lesson {
  id: string;
  title: string;
  duration?: number;
  order: number;
}

interface Review {
  id: string;
  rating: number;
  comment: string;
  user: {
    name: string;
  };
  createdAt: string;
}

const CourseDetailPage = () => {
  const { slug } = useParams();
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  const [course, setCourse] = useState<Course | null>(null);
  const [lessons, setLessons] = useState<Lesson[]>([]);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [enrolling, setEnrolling] = useState(false);

  useEffect(() => {
    fetchCourse();
  }, [slug]);

  const fetchCourse = async () => {
    try {
      const [courseRes, lessonsRes, reviewsRes] = await Promise.all([
        api.get(`/courses/${slug}`),
        api
          .get(`/courses/${slug}/lessons`)
          .catch(() => ({ data: { lessons: [] } })),
        api
          .get(`/courses/${slug}/reviews`)
          .catch(() => ({ data: { reviews: [] } })),
      ]);

      setCourse(courseRes.data);
      setLessons(lessonsRes.data.lessons || []);
      setReviews(reviewsRes.data.reviews || []);
    } catch (error) {
      console.error('Failed to fetch course:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleEnroll = async () => {
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }

    setEnrolling(true);
    try {
      await api.post('/enrollments', { courseId: course?.id });
      navigate('/dashboard');
    } catch (error: any) {
      alert(error.response?.data?.message || 'Enrollment failed');
    } finally {
      setEnrolling(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  if (!course) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-12 text-center">
        <h1 className="text-2xl font-bold mb-4">Course not found</h1>
        <button onClick={() => navigate('/courses')} className="btn-primary">
          Browse Courses
        </button>
      </div>
    );
  }

  const avgRating = course.avgRating || 0;
  const totalStudents = course._count?.enrollments || 0;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="grid md:grid-cols-3 gap-8">
        {/* Main Content */}
        <div className="md:col-span-2 space-y-8">
          {/* Course Header */}
          <div>
            {course.thumbnailUrl && (
              <img
                src={course.thumbnailUrl}
                alt={course.title}
                className="w-full h-64 object-cover rounded-lg mb-6"
              />
            )}
            <div className="flex items-center gap-2 mb-4">
              <span className="px-3 py-1 bg-primary-100 text-primary-800 rounded-full text-sm font-medium">
                {course.category}
              </span>
              <span className="px-3 py-1 bg-gray-100 text-gray-800 rounded-full text-sm font-medium capitalize">
                {course.level}
              </span>
            </div>
            <h1 className="text-4xl font-bold mb-4">{course.title}</h1>
            <p className="text-xl text-gray-600 mb-4">{course.description}</p>

            {/* Stats */}
            <div className="flex items-center gap-6 text-sm text-gray-600">
              <div className="flex items-center gap-1">
                <span className="text-yellow-500">★</span>
                <span className="font-semibold">{avgRating.toFixed(1)}</span>
                <span>({reviews.length} reviews)</span>
              </div>
              <div>
                <span className="font-semibold">{totalStudents}</span> students
              </div>
              <div>
                Created by{' '}
                <span className="font-semibold">{course.instructor.name}</span>
              </div>
            </div>
          </div>

          {/* Course Content */}
          <div className="card">
            <h2 className="text-2xl font-bold mb-4">Course Content</h2>
            {lessons.length === 0 ? (
              <p className="text-gray-600">No lessons available yet</p>
            ) : (
              <div className="space-y-2">
                {lessons.map((lesson, index) => (
                  <div
                    key={lesson.id}
                    className="flex items-center justify-between p-3 border border-gray-200 rounded-lg hover:bg-gray-50"
                  >
                    <div className="flex items-center gap-3">
                      <span className="text-gray-400 font-medium">
                        {index + 1}
                      </span>
                      <span>{lesson.title}</span>
                    </div>
                    {lesson.duration && (
                      <span className="text-sm text-gray-500">
                        {lesson.duration} min
                      </span>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Reviews */}
          <div className="card">
            <h2 className="text-2xl font-bold mb-4">Student Reviews</h2>
            {reviews.length === 0 ? (
              <p className="text-gray-600">No reviews yet</p>
            ) : (
              <div className="space-y-4">
                {reviews.map((review) => (
                  <div
                    key={review.id}
                    className="border-b border-gray-200 pb-4 last:border-0"
                  >
                    <div className="flex items-center gap-2 mb-2">
                      <span className="font-semibold">{review.user.name}</span>
                      <div className="flex">
                        {[...Array(5)].map((_, i) => (
                          <span
                            key={i}
                            className={
                              i < review.rating
                                ? 'text-yellow-500'
                                : 'text-gray-300'
                            }
                          >
                            ★
                          </span>
                        ))}
                      </div>
                      <span className="text-sm text-gray-500">
                        {new Date(review.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                    {review.comment && (
                      <p className="text-gray-600">{review.comment}</p>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Sidebar */}
        <div>
          <div className="card sticky top-4">
            <div className="text-3xl font-bold text-primary-600 mb-4">
              ${course.price}
            </div>
            <button
              onClick={handleEnroll}
              disabled={enrolling}
              className="w-full btn-primary mb-4 disabled:opacity-50"
            >
              {enrolling ? 'Enrolling...' : 'Enroll Now'}
            </button>
            <div className="space-y-3 text-sm">
              <div className="flex items-center gap-2 text-gray-700">
                <span>✓</span>
                <span>Lifetime access</span>
              </div>
              <div className="flex items-center gap-2 text-gray-700">
                <span>✓</span>
                <span>{lessons.length} lessons</span>
              </div>
              <div className="flex items-center gap-2 text-gray-700">
                <span>✓</span>
                <span>Certificate of completion</span>
              </div>
              <div className="flex items-center gap-2 text-gray-700">
                <span>✓</span>
                <span>30-day money-back guarantee</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CourseDetailPage;
