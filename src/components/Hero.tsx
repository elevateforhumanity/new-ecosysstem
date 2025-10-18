export default function Hero() {
  return (
    <section className="relative bg-gradient-to-b from-slate-50 to-white py-20 md:py-28">
      <div className="container">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          <div className="max-w-2xl">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-brand-100 text-brand-700 text-sm font-semibold mb-6">
              <span>🎓</span>
              <span>100% FREE Training • Marion County</span>
            </div>
            
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-slate-900 leading-tight mb-6">
              Ignite Your Future: <span className="text-brand-600">Fund Training Today</span>
            </h1>
            
            <p className="text-xl text-slate-600 leading-relaxed mb-8">
              Empower Dreams: Support Skills Development and Transform Lives at Elevate for Humanity. 
              Invest in Growth, Today! Marion County.
            </p>
            
            <div className="flex flex-wrap gap-4 mb-10">
              <a href="/programs" className="btn">
                Explore Programs
              </a>
              <a href="/apply" className="btn-outline">
                Apply Now
              </a>
            </div>
            
            <div className="grid grid-cols-2 gap-6 pt-8 border-t border-slate-200">
              <div>
                <div className="text-3xl font-bold text-brand-600">1,247</div>
                <div className="text-sm text-slate-600">Students Trained</div>
              </div>
              <div>
                <div className="text-3xl font-bold text-brand-600">92%</div>
                <div className="text-sm text-slate-600">Job Placement</div>
              </div>
            </div>
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
