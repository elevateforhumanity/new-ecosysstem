import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import {
  getLesson,
  listLessons,
  upsertProgress,
  type Lesson,
} from '../../services/courses';
import QuizBlock from './QuizBlock';

export default function LessonPage() {
  const { lessonId } = useParams();
  const [lesson, setLesson] = useState<Lesson | null>(null);
  const [siblings, setSiblings] = useState<Lesson[]>([]);

  useEffect(() => {
    if (!lessonId) return;
    (async () => {
      const l = await getLesson(lessonId);
      setLesson(l);
      const s = await listLessons(l.course_id);
      setSiblings(s);
      // naive auto-progress mark
      upsertProgress(l.id, 100).catch(() => {});
    })();
  }, [lessonId]);

  if (!lesson)
    return (
      <div className="section">
        <div className="container max-w-2xl mx-auto">
          <div className="card p-8 text-center">
            <div className="animate-pulse">
              <div className="h-8 bg-slate-200 rounded w-3/4 mx-auto mb-4"></div>
              <div className="h-64 bg-slate-200 rounded mx-auto mb-4"></div>
              <div className="h-4 bg-slate-200 rounded w-full mb-2"></div>
              <div className="h-4 bg-slate-200 rounded w-5/6 mb-2"></div>
              <div className="h-4 bg-slate-200 rounded w-4/6"></div>
            </div>
            <p className="mt-4 text-slate-600">Loading lesson content...</p>
          </div>
        </div>
      </div>
    );

  const idx = siblings.findIndex((x) => x.id === lesson.id);
  const prev = idx > 0 ? siblings[idx - 1] : null;
  const next = idx >= 0 && idx < siblings.length - 1 ? siblings[idx + 1] : null;

  return (
    <section className="section">
      <div className="container grid lg:grid-cols-[1fr_320px] gap-10">
        <div>
          <div className="text-xs text-slate-500">Lesson {lesson.idx}</div>
          <h1 className="text-2xl font-bold">{lesson.title}</h1>
          {lesson.video_url && (
            <div className="mt-4 aspect-video card overflow-hidden">
              <iframe
                src={lesson.video_url}
                className="w-full h-full"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                allowFullScreen
              />
            </div>
          )}
          {lesson.html && (
            <article
              className="prose mt-6"
              dangerouslySetInnerHTML={{ __html: lesson.html }}
            />
          )}
          <QuizBlock lessonId={lesson.id} />
          <div className="mt-8 flex gap-3">
            {prev && (
              <Link to={`/lms/lesson/${prev.id}`} className="btn-outline">
                ← {prev.title}
              </Link>
            )}
            {next && (
              <Link to={`/lms/lesson/${next.id}`} className="btn">
                {next.title} →
              </Link>
            )}
          </div>
        </div>
        <aside className="card p-4">
          <div className="font-semibold">Lessons</div>
          <ol className="mt-2 space-y-2 list-decimal list-inside text-sm">
            {siblings.map((s) => (
              <li
                key={s.id}
                className={s.id === lesson.id ? 'font-semibold' : ''}
              >
                <Link to={`/lms/lesson/${s.id}`}>{s.title}</Link>
              </li>
            ))}
          </ol>
        </aside>
      </div>
    </section>
  );
}
