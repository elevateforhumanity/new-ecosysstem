import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { getProgramBySlug, type Program } from "../services/programs";
import { listCoursesByProgram, type Course } from "../services/courses";

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
        <div className="container text-red-600">{error}</div>
      </div>
    );
  if (!program)
    return (
      <div className="section">
        <div className="container">Loading…</div>
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
            <div className="mt-5 flex gap-3">
              <a href="/apply" className="btn">
                Apply
              </a>
              <a href="/contact" className="btn-outline">
                Ask a Question
              </a>
            </div>
            <ul className="mt-6 text-sm text-slate-600">
              {program.hours && <li>⏱️ Duration: {program.hours}</li>}
              <li>📚 Track: {program.track}</li>
            </ul>
          </div>
          <div className="card overflow-hidden">
            <img
              src={program.cover_url ?? "/programs/placeholder.jpg"}
              alt={program.title}
              className="w-full h-[320px] object-cover"
            />
          </div>
        </div>
      </section>

      <section className="section">
        <div className="container">
          <h2 className="text-2xl font-semibold">Courses Included</h2>
          <div className="mt-6 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {courses.map((c) => (
              <Link
                key={c.id}
                to={`/lms/course/${c.id}`}
                className="card p-5 hover:shadow-lg transition"
              >
                <div className="text-xs text-slate-500">{c.code}</div>
                <div className="mt-1 text-lg font-semibold">{c.title}</div>
                {c.summary && (
                  <p className="mt-2 text-sm text-slate-600">{c.summary}</p>
                )}
              </Link>
            ))}
            {courses.length === 0 && (
              <div className="text-slate-600">No courses yet.</div>
            )}
          </div>
        </div>
      </section>
    </div>
  );
}
