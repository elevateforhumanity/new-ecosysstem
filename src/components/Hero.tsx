export default function Hero() {
  return (
    <section className="section pt-12 md:pt-20">
      <div className="container grid md:grid-cols-2 gap-10 items-center">
        <div>
          <span className="inline-block rounded-full bg-brand-100 text-brand-700 px-4 py-1.5 text-sm font-semibold">
            🎓 100% FREE Training • No Cost to You
          </span>
          <h1 className="mt-4 text-4xl md:text-5xl font-extrabold tracking-tight leading-tight">
            Start Your New Career in <span className="text-brand-600">Weeks, Not Years</span>
          </h1>
          <p className="mt-4 text-lg text-slate-700 leading-relaxed">
            Get job-ready training in healthcare, construction, beauty, and more. 
            We help you earn industry certifications and connect directly with employers—all at no cost to you.
          </p>
          <div className="mt-6 flex flex-wrap gap-3">
            <a href="/programs" className="btn text-lg px-6 py-3">
              See Our Programs →
            </a>
            <a href="/apply" className="btn-outline text-lg px-6 py-3">
              Apply Now (It's Free!)
            </a>
          </div>
          <div className="mt-8 p-4 bg-slate-50 rounded-lg border border-slate-200">
            <p className="text-sm font-semibold text-slate-700 mb-2">What You Get:</p>
            <ul className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-sm text-slate-600">
              <li className="flex items-center gap-2">
                <span className="text-green-600">✓</span> Free training & certifications
              </li>
              <li className="flex items-center gap-2">
                <span className="text-green-600">✓</span> Job placement support
              </li>
              <li className="flex items-center gap-2">
                <span className="text-green-600">✓</span> Hands-on experience
              </li>
              <li className="flex items-center gap-2">
                <span className="text-green-600">✓</span> Career coaching included
              </li>
            </ul>
          </div>
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
