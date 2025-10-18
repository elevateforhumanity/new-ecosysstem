import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { supa } from '../../services/supa';

export default function LessonManager() {
  const { courseId } = useParams();
  const [course, setCourse] = useState<any>(null);
  const [lessons, setLessons] = useState<any[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({
    title: '',
    video_url: '',
    html: '',
  });

  useEffect(() => {
    loadData();
  }, [courseId]);

  async function loadData() {
    const { data: courseData } = await supa
      .from('courses')
      .select('*')
      .eq('id', courseId)
      .single();

    setCourse(courseData);

    const { data: lessonsData } = await supa
      .from('lessons')
      .select('*')
      .eq('course_id', courseId)
      .order('idx');

    setLessons(lessonsData || []);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    const nextIdx = lessons.length + 1;

    const { error } = await supa.from('lessons').insert([
      {
        course_id: courseId,
        idx: nextIdx,
        ...form,
      },
    ]);

    if (error) {
      alert(error.message);
      return;
    }

    setForm({ title: '', video_url: '', html: '' });
    setShowForm(false);
    loadData();
  }

  async function deleteLesson(lessonId: string) {
    if (!confirm('Delete this lesson?')) return;

    const { error } = await supa.from('lessons').delete().eq('id', lessonId);

    if (error) {
      alert(error.message);
      return;
    }

    loadData();
  }

  if (!course)
    return (
      <div className="section">
        <div className="container">Loading...</div>
      </div>
    );

  return (
    <section className="section">
      <div className="container max-w-4xl">
        <div className="flex items-center justify-between">
          <div>
            <Link
              to="/instructor"
              className="text-sm text-brand-600 hover:text-brand-700"
            >
              ← Back to Dashboard
            </Link>
            <h1 className="mt-2 text-3xl font-bold">{course.title}</h1>
            <p className="mt-1 text-slate-600">Manage lessons</p>
          </div>
          <button onClick={() => setShowForm(!showForm)} className="btn">
            {showForm ? 'Cancel' : '+ Add Lesson'}
          </button>
        </div>

        {showForm && (
          <form onSubmit={handleSubmit} className="mt-6 card p-6 space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1">
                Lesson Title *
              </label>
              <input
                type="text"
                value={form.title}
                onChange={(e) => setForm({ ...form, title: e.target.value })}
                className="w-full px-3 py-2 border rounded-lg"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">
                Video URL (YouTube embed)
              </label>
              <input
                type="url"
                value={form.video_url}
                onChange={(e) =>
                  setForm({ ...form, video_url: e.target.value })
                }
                className="w-full px-3 py-2 border rounded-lg"
                placeholder="https://www.youtube.com/embed/..."
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">
                Content (HTML)
              </label>
              <textarea
                value={form.html}
                onChange={(e) => setForm({ ...form, html: e.target.value })}
                className="w-full px-3 py-2 border rounded-lg font-mono text-sm"
                rows={6}
                placeholder="<p>Lesson content here...</p>"
              />
            </div>

            <button type="submit" className="btn">
              Add Lesson
            </button>
          </form>
        )}

        <div className="mt-8 space-y-3">
          {lessons.map((lesson) => (
            <div
              key={lesson.id}
              className="card p-5 flex items-center justify-between"
            >
              <div>
                <div className="text-xs text-slate-500">
                  Lesson {lesson.idx}
                </div>
                <div className="font-semibold">{lesson.title}</div>
                {lesson.video_url && (
                  <div className="mt-1 text-xs text-slate-500">📹 Video</div>
                )}
              </div>
              <div className="flex gap-2">
                <Link
                  to={`/lms/lesson/${lesson.id}`}
                  className="btn-outline"
                  target="_blank"
                >
                  Preview
                </Link>
                <button
                  onClick={() => deleteLesson(lesson.id)}
                  className="btn-outline text-red-600 border-red-300 hover:bg-red-50"
                >
                  Delete
                </button>
              </div>
            </div>
          ))}
          {lessons.length === 0 && (
            <div className="card p-6 text-center text-slate-600">
              No lessons yet. Add your first lesson to get started!
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
