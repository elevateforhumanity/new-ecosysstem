type Program = {
  slug: string;
  title: string;
  track: "Healthcare" | "Construction" | "Beauty" | "Business" | "Tech";
  blurb: string;
  hours: string;
  certs?: string[];
  image: string;
};

const PROGRAMS: Program[] = [
  {
    slug: "cna-hha",
    title: "CNA / HHA",
    track: "Healthcare",
    blurb: "State-aligned training with clinicals and direct employer placement.",
    hours: "4–8 weeks",
    certs: ["CNA", "HHA", "CPR/AED"],
    image: "/programs/cna.jpg",
  },
  {
    slug: "welding-aws",
    title: "Welding (AWS SENSE)",
    track: "Construction",
    blurb: "Hands-on welding lab and industry-recognized AWS SENSE credentials.",
    hours: "6–10 weeks",
    certs: ["AWS SENSE"],
    image: "/programs/welding.jpg",
  },
  {
    slug: "nail-tech",
    title: "Nail Technology",
    track: "Beauty",
    blurb: "State board preparation with salon-ready portfolio and sanitation.",
    hours: "8–12 weeks",
    certs: ["State Board Prep"],
    image: "/programs/nails.jpg",
  },
  {
    slug: "cdl",
    title: "CDL (A/B) Prep",
    track: "Business",
    blurb: "Permit prep, simulator practice, and employer-ready onboarding.",
    hours: "3–6 weeks",
    certs: ["CDL A/B Prep"],
    image: "/programs/cdl.jpg",
  },
  {
    slug: "office-tech",
    title: "Office Tech & AI",
    track: "Tech",
    blurb: "Docs, Sheets, CRM, and AI workflows for modern office careers.",
    hours: "4–6 weeks",
    certs: ["Certiport (optional)"],
    image: "/programs/office.jpg",
  },
  {
    slug: "osha10",
    title: "OSHA-10 + CPR",
    track: "Construction",
    blurb: "Worksite safety fundamentals plus life-saving CPR/AED certification.",
    hours: "1–2 weeks",
    certs: ["OSHA-10", "CPR/AED"],
    image: "/programs/osha.jpg",
  },
];

export default function ProgramsGrid() {
  return (
    <section className="section">
      <div className="container">
        <div className="flex items-end justify-between gap-4">
          <div>
            <h2 className="text-2xl font-semibold">Featured Programs</h2>
            <p className="mt-2 text-slate-600">
              ETPL-eligible • WRG/WEX/JRI stackable • Employer pathways
            </p>
          </div>
          <a href="/apply" className="btn hidden md:inline-flex">
            Apply Now
          </a>
        </div>

        <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {PROGRAMS.map((p) => (
            <a
              key={p.slug}
              href={`/programs/${p.slug}`}
              className="card overflow-hidden group"
            >
              <div className="aspect-[16/9] overflow-hidden">
                <img
                  src={p.image}
                  alt={p.title}
                  className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-[1.03]"
                  loading="lazy"
                  srcSet={`${p.image} 1x`}
                />
              </div>
              <div className="p-4 md:p-5">
                <div className="flex items-center gap-2">
                  <span className="rounded-full bg-brand-50 text-brand-700 px-2.5 py-1 text-xs font-semibold">
                    {p.track}
                  </span>
                  <span className="text-xs text-slate-500">{p.hours}</span>
                </div>
                <h3 className="mt-2 text-lg font-semibold">{p.title}</h3>
                <p className="mt-1 text-sm text-slate-600">{p.blurb}</p>
                {!!p.certs?.length && (
                  <div className="mt-3 flex flex-wrap gap-2">
                    {p.certs.map((c) => (
                      <span
                        key={c}
                        className="text-xs text-slate-600 bg-slate-100 px-2 py-1 rounded-full"
                      >
                        {c}
                      </span>
                    ))}
                  </div>
                )}
                <div className="mt-4">
                  <span className="btn-outline">View Program</span>
                </div>
              </div>
            </a>
          ))}
        </div>

        <div className="mt-8 text-center md:hidden">
          <a href="/apply" className="btn">
            Apply Now
          </a>
        </div>
      </div>
    </section>
  );
}
