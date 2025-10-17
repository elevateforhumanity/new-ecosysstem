import { useEffect, useState } from "react";
import { listCourses, type Course } from "../../services/courses";

export default function CoursesIndex() {
  const [items, setItems] = useState<Course[]>([]);

  useEffect(() => {
    listCourses().then(setItems);
  }, []);

  return (
    <section className="section">
      <div className="container">
        <h1 className="text-3xl font-bold">All Courses</h1>
        <div className="mt-6 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {items.map((c) => (
            <a
              key={c.id}
              href={`/lms/course/${c.id}`}
              className="card p-5 hover:shadow-lg transition"
            >
              <div className="text-xs text-slate-500">{c.code}</div>
              <div className="mt-1 text-lg font-semibold">{c.title}</div>
              {c.summary && (
                <p className="mt-2 text-sm text-slate-600">{c.summary}</p>
              )}
            </a>
          ))}
        </div>
      </div>
    </section>
  );
}
