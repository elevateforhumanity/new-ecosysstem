import { useEffect, useState } from "react";
import { listCourses, type Course } from "../../services/courses";

export default function Dashboard() {
  const [courses, setCourses] = useState<Course[]>([]);

  useEffect(() => {
    listCourses().then(setCourses);
  }, []);

  return (
    <section className="section">
      <div className="container">
        <h1 className="text-3xl font-bold">My Learning</h1>
        <p className="mt-2 text-slate-600">Resume where you left off.</p>
        <div className="mt-6 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {courses.map((c) => (
            <a key={c.id} href={`/lms/course/${c.id}`} className="card p-5">
              <div className="text-xs text-slate-500">{c.code}</div>
              <div className="mt-1 text-lg font-semibold">{c.title}</div>
            </a>
          ))}
        </div>
      </div>
    </section>
  );
}
