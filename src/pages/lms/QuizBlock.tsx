import { useEffect, useState } from 'react';
import { supa } from '../../services/supa';

export default function QuizBlock({ lessonId }: { lessonId: string }) {
  const [q, setQ] = useState<any[]>([]);
  const [a, setA] = useState<Record<string, string>>({});
  const [submitted, setSubmitted] = useState(false);

  useEffect(() => {
    supa
      .from('quiz_questions')
      .select('id, prompt, options')
      .eq('lesson_id', lessonId)
      .then(({ data }) => setQ(data || []));
  }, [lessonId]);

  async function submit() {
    const user = (await supa.auth.getUser()).data.user;
    if (!user) return alert('Sign in required');
    const payload = Object.entries(a).map(([question_id, answer]) => ({
      question_id,
      user_id: user.id,
      answer,
    }));
    const { error } = await supa.from('quiz_responses').insert(payload);
    if (error) return alert(error.message);
    setSubmitted(true);
  }

  if (q.length === 0) return null;

  return (
    <div className="mt-8 card p-4">
      <div className="font-semibold">Quick Check</div>
      {q.map((item) => (
        <div key={item.id} className="mt-4">
          <div className="font-medium">{item.prompt}</div>
          <div className="mt-2 grid gap-2">
            {(item.options || []).map((opt: string) => (
              <label key={opt} className="flex items-center gap-2">
                <input
                  type="radio"
                  name={item.id}
                  value={opt}
                  onChange={(e) =>
                    setA((prev) => ({ ...prev, [item.id]: e.target.value }))
                  }
                />
                <span>{opt}</span>
              </label>
            ))}
          </div>
        </div>
      ))}
      <button onClick={submit} className="btn mt-4" disabled={submitted}>
        {submitted ? 'Submitted' : 'Submit'}
      </button>
    </div>
  );
}
