import { useEffect, useState } from "react";
import { listPrograms, type Program } from "../services/programs";

export default function ProgramsIndex() {
  const [items, setItems] = useState<Program[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    listPrograms()
      .then(setItems)
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }, []);

  if (loading)
    return (
      <div className="section">
        <div className="container">Loading…</div>
      </div>
    );
  if (error)
    return (
      <div className="section">
        <div className="container text-red-600">{error}</div>
      </div>
    );

  return (
    <section className="section">
      <div className="container">
        <h1 className="text-3xl font-bold">Programs</h1>
        <div className="mt-6 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {items.map((p) => (
            <a
              key={p.id}
              href={`/programs/${p.slug}`}
              className="card overflow-hidden group"
            >
              <div className="aspect-[16/9] overflow-hidden">
                <img
                  src={p.cover_url ?? "/programs/placeholder.jpg"}
                  alt={p.title}
                  className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-[1.03]"
                />
              </div>
              <div className="p-4 md:p-5">
                <div className="flex items-center gap-2">
                  <span className="rounded-full bg-brand-50 text-brand-700 px-2.5 py-1 text-xs font-semibold">
                    {p.track}
                  </span>
                  {p.hours && (
                    <span className="text-xs text-slate-500">{p.hours}</span>
                  )}
                </div>
                <h3 className="mt-2 text-lg font-semibold">{p.title}</h3>
                {p.blurb && (
                  <p className="mt-1 text-sm text-slate-600">{p.blurb}</p>
                )}
              </div>
            </a>
          ))}
        </div>
      </div>
    </section>
  );
}
