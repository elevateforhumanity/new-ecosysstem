import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { supa } from '../../services/supa';

export default function InstructorDashboard() {
  const [courses, setCourses] = useState<any[]>([]);
  const [stats, setStats] = useState({ courses: 0, lessons: 0, students: 0 });

  useEffect(() => {
    loadData();
  }, []);

  async function loadData() {
    // Load instructor's courses
    const { data: coursesData } = await supa
      .from('courses')
      .select('*, lessons(count)')
      .order('title');

    setCourses(coursesData || []);

    // Calculate stats
    const totalLessons = coursesData?.reduce(
      (sum, c) => sum + (c.lessons?.[0]?.count || 0),
      0
    );

    setStats({
      courses: coursesData?.length || 0,
      lessons: totalLessons || 0,
      students: 0, // TODO: Count from enrollments
    });
  }

  return (
    <section className="section">
      <div className="container">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Instructor Dashboard</h1>
            <p className="mt-2 text-slate-600">
              Manage your courses and lessons
            </p>
          </div>
          <Link to="/instructor/course/new" className="btn">
            + New Course
          </Link>
        </div>

        {/* Stats */}
        <div className="mt-8 grid gap-6 sm:grid-cols-3">
          <div className="card p-6">
            <div className="text-3xl font-extrabold text-brand-600">
              {stats.courses}
            </div>
            <div className="mt-1 text-slate-600">Courses</div>
          </div>
          <div className="card p-6">
            <div className="text-3xl font-extrabold text-brand-600">
              {stats.lessons}
            </div>
            <div className="mt-1 text-slate-600">Lessons</div>
          </div>
          <div className="card p-6">
            <div className="text-3xl font-extrabold text-brand-600">
              {stats.students}
            </div>
            <div className="mt-1 text-slate-600">Students</div>
          </div>
        </div>

        {/* Courses List */}
        <div className="mt-8">
          <h2 className="text-xl font-semibold">Your Courses</h2>
          <div className="mt-4 space-y-3">
            {courses.map((course) => (
              <div
                key={course.id}
                className="card p-5 flex items-center justify-between"
              >
                <div>
                  <div className="text-xs text-slate-500">{course.code}</div>
                  <div className="font-semibold">{course.title}</div>
                  <div className="mt-1 text-sm text-slate-600">
                    {course.lessons?.[0]?.count || 0} lessons
                  </div>
                </div>
                <div className="flex gap-2">
                  <Link
                    to={`/instructor/course/${course.id}/edit`}
                    className="btn-outline"
                  >
                    Edit
                  </Link>
                  <Link
                    to={`/instructor/course/${course.id}/lessons`}
                    className="btn"
                  >
                    Lessons
                  </Link>
                </div>
              </div>
            ))}
            {courses.length === 0 && (
              <div className="card p-6 text-center text-slate-600">
                No courses yet. Create your first course to get started!
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
