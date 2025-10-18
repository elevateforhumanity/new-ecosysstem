import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { getProgramBySlug, type Program } from '../services/programs';
import { listCoursesByProgram, type Course } from '../services/courses';

export default function ProgramPage() {
  const { slug } = useParams();
  const [program, setProgram] = useState<Program | null>(null);
  const [courses, setCourses] = useState<Course[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!slug) return;
    (async () => {
      try {
        const p = await getProgramBySlug(slug);
        setProgram(p);
        const cs = await listCoursesByProgram(p.id);
        setCourses(cs);
      } catch (e: any) {
        setError(e.message);
      }
    })();
  }, [slug]);

  if (error)
    return (
      <div className="section">
        <div className="container max-w-2xl mx-auto">
          <div className="card p-8 text-center">
            <div className="text-4xl mb-4">😕</div>
            <h2 className="text-2xl font-bold text-red-600">
              Program Not Found
            </h2>
            <p className="mt-2 text-slate-600">{error}</p>
            <div className="mt-6 flex gap-3 justify-center">
              <Link to="/programs" className="btn">
                Browse All Programs
              </Link>
              <Link to="/" className="btn-outline">
                Go Home
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  if (!program)
    return (
      <div className="section">
        <div className="container max-w-2xl mx-auto">
          <div className="card p-8 text-center">
            <div className="animate-pulse">
              <div className="h-8 bg-slate-200 rounded w-3/4 mx-auto mb-4"></div>
              <div className="h-4 bg-slate-200 rounded w-1/2 mx-auto mb-2"></div>
              <div className="h-4 bg-slate-200 rounded w-2/3 mx-auto"></div>
            </div>
            <p className="mt-4 text-slate-600">Loading program details...</p>
          </div>
        </div>
      </div>
    );

  return (
    <div>
      <section className="section pt-8">
        <div className="container grid md:grid-cols-2 gap-10 items-start">
          <div>
            <h1 className="text-3xl md:text-4xl font-extrabold">
              {program.title}
            </h1>
            {program.blurb && (
              <p className="mt-3 text-slate-600">{program.blurb}</p>
            )}
            <div className="mt-5 flex flex-wrap gap-3">
              <a href="/apply" className="btn text-lg px-6 py-3">
                Apply Now (It's Free!) →
              </a>
              <a href="/contact" className="btn-outline text-lg px-6 py-3">
                Have Questions?
              </a>
            </div>
            <ul className="mt-6 text-sm text-slate-600">
              {program.hours && <li>⏱️ Duration: {program.hours}</li>}
              <li>📚 Track: {program.track}</li>
            </ul>
          </div>
          <div className="card overflow-hidden">
            <img
              src={program.cover_url ?? '/programs/placeholder.jpg'}
              alt={program.title}
              className="w-full h-[320px] object-cover"
            />
          </div>
        </div>
      </section>

      <section className="section bg-slate-50">
        <div className="container">
          <div className="text-center max-w-2xl mx-auto mb-8">
            <h2 className="text-3xl font-bold">What You'll Learn</h2>
            <p className="mt-2 text-slate-600">
              This program includes {courses.length} course
              {courses.length !== 1 ? 's' : ''} designed to get you job-ready
            </p>
          </div>
          <div className="mt-6 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {courses.map((c) => (
              <Link
                key={c.id}
                to={`/lms/course/${c.id}`}
                className="card p-6 hover:shadow-lg transition-all hover:-translate-y-1"
              >
                <div className="text-xs font-semibold text-brand-600 uppercase tracking-wide">
                  {c.code}
                </div>
                <div className="mt-2 text-xl font-bold">{c.title}</div>
                {c.summary && (
                  <p className="mt-3 text-sm text-slate-600 leading-relaxed">
                    {c.summary}
                  </p>
                )}
                <div className="mt-4 text-brand-600 text-sm font-medium">
                  Start Learning →
                </div>
              </Link>
            ))}
            {courses.length === 0 && (
              <div className="col-span-full text-center py-12">
                <div className="text-4xl mb-4">📚</div>
                <p className="text-slate-600">
                  Courses are being added to this program.
                </p>
                <p className="mt-2 text-sm text-slate-500">
                  Check back soon or contact us for more information.
                </p>
              </div>
            )}
          </div>
        </div>
      </section>
    </div>
  );
}
