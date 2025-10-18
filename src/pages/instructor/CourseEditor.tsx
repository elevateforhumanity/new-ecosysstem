import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { supa } from '../../services/supa';

export default function CourseEditor() {
  const { courseId } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [form, setForm] = useState({
    code: '',
    title: '',
    summary: '',
    program_id: '',
  });
  const [programs, setPrograms] = useState<any[]>([]);

  useEffect(() => {
    loadPrograms();
    if (courseId && courseId !== 'new') {
      loadCourse();
    }
  }, [courseId]);

  async function loadPrograms() {
    const { data } = await supa
      .from('programs')
      .select('id, title')
      .order('title');
    setPrograms(data || []);
  }

  async function loadCourse() {
    const { data, error } = await supa
      .from('courses')
      .select('*')
      .eq('id', courseId)
      .single();

    if (error) {
      setError(error.message);
      return;
    }

    setForm({
      code: data.code,
      title: data.title,
      summary: data.summary || '',
      program_id: data.program_id || '',
    });
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      if (courseId === 'new') {
        const { data, error } = await supa
          .from('courses')
          .insert([form])
          .select()
          .single();

        if (error) throw error;
        navigate(`/instructor/course/${data.id}/lessons`);
      } else {
        const { error } = await supa
          .from('courses')
          .update(form)
          .eq('id', courseId);

        if (error) throw error;
        navigate('/instructor');
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <section className="section">
      <div className="container max-w-2xl">
        <h1 className="text-3xl font-bold">
          {courseId === 'new' ? 'Create Course' : 'Edit Course'}
        </h1>

        {error && (
          <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-600 text-sm">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="mt-6 space-y-6">
          <div>
            <label className="block text-sm font-medium mb-1">
              Course Code *
            </label>
            <input
              type="text"
              value={form.code}
              onChange={(e) => setForm({ ...form, code: e.target.value })}
              className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-brand-300"
              placeholder="e.g., HLTH-101"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Title *</label>
            <input
              type="text"
              value={form.title}
              onChange={(e) => setForm({ ...form, title: e.target.value })}
              className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-brand-300"
              placeholder="e.g., Patient Care Basics"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Summary</label>
            <textarea
              value={form.summary}
              onChange={(e) => setForm({ ...form, summary: e.target.value })}
              className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-brand-300"
              rows={3}
              placeholder="Brief description of the course"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Program</label>
            <select
              value={form.program_id}
              onChange={(e) => setForm({ ...form, program_id: e.target.value })}
              className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-brand-300"
            >
              <option value="">No program (standalone)</option>
              {programs.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.title}
                </option>
              ))}
            </select>
          </div>

          <div className="flex gap-3">
            <button type="submit" className="btn" disabled={loading}>
              {loading ? 'Saving...' : 'Save Course'}
            </button>
            <button
              type="button"
              onClick={() => navigate('/instructor')}
              className="btn-outline"
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </section>
  );
}
