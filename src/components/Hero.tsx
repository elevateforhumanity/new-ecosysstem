export default function Hero() {
  return (
    <section className="section pt-12 md:pt-20">
      <div className="container grid md:grid-cols-2 gap-10 items-center">
        <div>
          <span className="inline-block rounded-full bg-brand-100 text-brand-700 px-3 py-1 text-xs font-semibold">
            Marion County • 100% FREE Programs
          </span>
          <h1 className="mt-4 text-4xl md:text-5xl font-extrabold tracking-tight">
            Empowering People. <span className="text-brand-600">Elevating Communities.</span>
          </h1>
          <p className="mt-4 text-slate-600">
            ETPL provider & DOL apprenticeship sponsor connecting education, employment, and entrepreneurship
            through workforce innovation and philanthropy.
          </p>
          <div className="mt-6 flex flex-wrap gap-3">
            <a href="/programs" className="btn">Explore Programs</a>
            <a href="/partners" className="btn-outline">Partner With Us</a>
          </div>
          <ul className="mt-6 grid grid-cols-2 gap-4 text-sm text-slate-600">
            <li>✅ 1,247 students trained</li>
            <li>✅ 92% job placement</li>
            <li>✅ $2.85M funding distributed</li>
            <li>✅ 100% FREE to students</li>
          </ul>
        </div>
        <div className="relative">
          <div className="card p-2">
            <img
              src="/hero/efh-hero.jpg"
              alt="Students at Elevate for Humanity"
              className="h-[320px] w-full rounded-2xl object-cover"
              srcSet="/hero/efh-hero@1x.jpg 1x, /hero/efh-hero@2x.jpg 2x, /hero/efh-hero@3x.jpg 3x"
            />
          </div>
        </div>
      </div>
    </section>
  );
}
