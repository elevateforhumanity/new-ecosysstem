import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import {
  getCourse,
  listLessons,
  type Course,
  type Lesson,
} from "../../services/courses";

export default function CoursePage() {
  const { courseId } = useParams();
  const [course, setCourse] = useState<Course | null>(null);
  const [lessons, setLessons] = useState<Lesson[]>([]);

  useEffect(() => {
    if (!courseId) return;
    getCourse(courseId).then(setCourse);
    listLessons(courseId).then(setLessons);
  }, [courseId]);

  if (!course)
    return (
      <div className="section">
        <div className="container max-w-2xl mx-auto">
          <div className="card p-8 text-center">
            <div className="animate-pulse">
              <div className="h-8 bg-slate-200 rounded w-3/4 mx-auto mb-4"></div>
              <div className="h-4 bg-slate-200 rounded w-1/2 mx-auto mb-2"></div>
              <div className="h-4 bg-slate-200 rounded w-2/3 mx-auto"></div>
            </div>
            <p className="mt-4 text-slate-600">Loading course...</p>
          </div>
        </div>
      </div>
    );

  return (
    <section className="section">
      <div className="container grid md:grid-cols-[1fr_320px] gap-10">
        <div>
          <h1 className="text-3xl font-bold">{course.title}</h1>
          {course.summary && (
            <p className="mt-2 text-slate-600">{course.summary}</p>
          )}
          <div className="mt-6 space-y-3">
            {lessons.map((lsn) => (
              <Link
                key={lsn.id}
                to={`/lms/lesson/${lsn.id}`}
                className="card p-4 block"
              >
                <div className="text-xs text-slate-500">Lesson {lsn.idx}</div>
                <div className="font-semibold">{lsn.title}</div>
              </Link>
            ))}
          </div>
        </div>
        <aside className="card p-4">
          <div className="font-semibold">Course Info</div>
          <ul className="mt-2 text-sm text-slate-600 space-y-1">
            <li>Code: {course.code}</li>
            <li>Lessons: {lessons.length}</li>
          </ul>
          <a
            href={`/programs/${course.program_id ?? ""}`}
            className="btn mt-4"
          >
            Program Path
          </a>
        </aside>
      </div>
    </section>
  );
}
