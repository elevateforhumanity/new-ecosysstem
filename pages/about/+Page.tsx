import React from 'react'



export { Page }

function Page() {
  return (
    <>
      <div className="max-w-4xl mx-auto">
        <h1 className="text-4xl font-bold mb-6">About Elevate for Humanity</h1>
        
        <div className="prose prose-lg mb-12">
          <p className="text-xl text-gray-700 mb-6">
            We are an Indianapolis-based government contractor dedicated to empowering people and elevating communities through accessible workforce development programs.
          </p>
        </div>

        {/* Mission & Vision */}
        <div className="grid md:grid-cols-2 gap-8 mb-12">
          <div className="bg-blue-50 rounded-xl p-6">
            <h2 className="text-2xl font-bold mb-3">Our Mission</h2>
            <p className="text-gray-700">
              To provide 100% FREE, high-quality workforce training programs that prepare individuals for in-demand careers and create pathways to economic mobility.
            </p>
          </div>
          <div className="bg-purple-50 rounded-xl p-6">
            <h2 className="text-2xl font-bold mb-3">Our Vision</h2>
            <p className="text-gray-700">
              A community where every individual has access to the training, resources, and support needed to achieve their career goals and build a better future.
            </p>
          </div>
        </div>

        {/* Credentials */}
        <div className="bg-white border-2 border-gray-100 rounded-xl p-8 mb-12">
          <h2 className="text-2xl font-bold mb-6">Official Credentials</h2>
          <div className="grid md:grid-cols-3 gap-6">
            <div className="text-center">
              <div className="text-4xl mb-2">🏛️</div>
              <h3 className="font-semibold mb-1">Government Contractor</h3>
              <p className="text-sm text-gray-600">SAM Registered</p>
            </div>
            <div className="text-center">
              <div className="text-4xl mb-2">📋</div>
              <h3 className="font-semibold mb-1">ETPL Provider</h3>
              <p className="text-sm text-gray-600">State Approved</p>
            </div>
            <div className="text-center">
              <div className="text-4xl mb-2">🎓</div>
              <h3 className="font-semibold mb-1">DOL Apprenticeship Sponsor</h3>
              <p className="text-sm text-gray-600">Federally Recognized</p>
            </div>
          </div>
        </div>

        {/* Impact Stats */}
        <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl p-8 mb-12">
          <h2 className="text-2xl font-bold mb-6 text-center">Our Impact</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {[
              { value: '1,247', label: 'Students Trained' },
              { value: '92%', label: 'Job Placement Rate' },
              { value: '$2.85M', label: 'Funding Distributed' },
              { value: '100%', label: 'FREE to Students' },
            ].map(({ value, label }) => (
              <div key={label} className="text-center">
                <div className="text-3xl font-bold mb-1">{value}</div>
                <div className="text-sm text-blue-100">{label}</div>
              </div>
            ))}
          </div>
        </div>

        {/* What Makes Us Different */}
        <div className="mb-12">
          <h2 className="text-2xl font-bold mb-6">What Makes Us Different</h2>
          <div className="space-y-4">
            {[
              {
                title: '100% FREE Programs',
                description: 'No tuition, no hidden fees. All programs are completely free for eligible Marion County residents.'
              },
              {
                title: 'Job Placement Support',
                description: 'We don\'t just train you—we help you get hired. 92% of our graduates secure employment in their field.'
              },
              {
                title: 'Federal Compliance',
                description: 'All programs meet DOL, DOE, and DWD standards with comprehensive tracking and reporting.'
              },
              {
                title: 'Industry Partnerships',
                description: 'Direct connections with employers actively hiring in construction, healthcare, transportation, and more.'
              },
              {
                title: 'Supportive Community',
                description: 'Small class sizes, dedicated instructors, and ongoing support throughout your career journey.'
              }
            ].map((item) => (
              <div key={item.title} className="bg-white border-2 border-gray-100 rounded-xl p-6">
                <h3 className="text-xl font-semibold mb-2">{item.title}</h3>
                <p className="text-gray-700">{item.description}</p>
              </div>
            ))}
          </div>
        </div>

        {/* CTA */}
        <div className="bg-black text-white rounded-xl p-8 text-center">
          <h2 className="text-2xl font-bold mb-3">Ready to Start Your Journey?</h2>
          <p className="text-lg mb-6">Join our community of successful graduates</p>
          <a href="/get-started">
            <button className="bg-white text-black px-8 py-3 rounded-xl font-semibold hover:bg-gray-100 transition-colors">
              Apply Now - It's FREE
            </button>
          </a>
        </div>
      </div>
    </>
  )
}

