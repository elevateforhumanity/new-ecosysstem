import React from 'react'


export { Page }

function Page() {
  return (
    <>
      <div className="bg-blue-50 rounded-2xl p-8 mb-8">
        <div className="max-w-3xl mx-auto text-center">
          <h1 className="text-5xl font-bold text-gray-900 mb-4">
            Empowering People. Elevating Communities.
          </h1>
          <p className="text-xl text-gray-700 mb-6">
            Indianapolis-based government contractor providing workforce development solutions. 
            ETPL provider and DOL apprenticeship sponsor.
          </p>
          <div className="flex gap-4 justify-center">
            <a href="/programs" className="px-6 py-3 bg-black text-white rounded-xl font-semibold hover:bg-gray-800 transition-colors">
              View Programs
            </a>
            <a href="/get-started" className="px-6 py-3 bg-white text-black border-2 border-black rounded-xl font-semibold hover:bg-gray-50 transition-colors">
              Get Started
            </a>
          </div>
        </div>
      </div>

      {/* Statistics */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-12">
        {[
          { value: '1,247', label: 'Students Trained' },
          { value: '92%', label: 'Job Placement Rate' },
          { value: '$2.85M', label: 'Funding Distributed' },
          { value: '100%', label: 'FREE to Students' },
        ].map(({ value, label }) => (
          <div key={label} className="bg-white p-6 rounded-xl border-2 border-gray-100 text-center">
            <div className="text-3xl font-bold text-blue-600 mb-2">{value}</div>
            <div className="text-sm text-gray-600">{label}</div>
          </div>
        ))}
      </div>

      {/* Featured Programs */}
      <section className="mb-12">
        <h2 className="text-3xl font-bold mb-6">Featured Programs</h2>
        <div className="grid md:grid-cols-3 gap-6">
          {[
            {
              title: 'Construction Pre-Apprenticeship',
              duration: '12-16 weeks',
              placement: '95% Placement',
              description: 'OSHA-certified training with hands-on experience'
            },
            {
              title: 'Phlebotomy Technician',
              duration: '8-10 weeks',
              placement: '92% Placement',
              description: 'Clinical training with certification exam prep'
            },
            {
              title: 'CDL Truck Driving',
              duration: '4-8 weeks',
              placement: '98% Placement',
              description: 'Class A CDL with job placement assistance'
            },
          ].map((program) => (
            <div key={program.title} className="bg-white p-6 rounded-xl border-2 border-gray-100 hover:border-blue-300 transition-colors">
              <h3 className="text-xl font-semibold mb-2">{program.title}</h3>
              <div className="flex gap-3 text-sm text-gray-600 mb-3">
                <span>⏱️ {program.duration}</span>
                <span>✅ {program.placement}</span>
              </div>
              <p className="text-gray-600 mb-4">{program.description}</p>
              <a href="/programs" className="text-blue-600 font-semibold hover:text-blue-700">
                Learn More →
              </a>
            </div>
          ))}
        </div>
      </section>

      {/* FREE Productivity Suite */}
      <section className="bg-gradient-to-r from-purple-50 to-blue-50 rounded-2xl p-8 mb-12">
        <h2 className="text-3xl font-bold mb-4">FREE Productivity Suite</h2>
        <p className="text-lg text-gray-700 mb-6">
          Professional tools for work, school, and life. No subscription. No limits.
        </p>
        <div className="grid md:grid-cols-4 gap-4">
          {[
            'Sheets', 'Slides', 'Docs', 'Email',
            'Calendar', 'Video Meetings', 'File Manager', 'AI Tutor'
          ].map((tool) => (
            <div key={tool} className="bg-white p-4 rounded-lg text-center font-medium">
              {tool}
            </div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <div className="bg-black text-white rounded-2xl p-8 text-center">
        <h2 className="text-3xl font-bold mb-4">Ready to Start Your Journey?</h2>
        <p className="text-lg mb-6">Join 1,247+ students who have transformed their careers</p>
        <a href="/get-started" className="inline-block px-8 py-4 bg-white text-black rounded-xl font-semibold hover:bg-gray-100 transition-colors">
          Apply Now - It's FREE
        </a>
      </div>
    </>
  )
}
