import React from 'react'



export { Page }

function Page() {
  const programs = [
    {
      title: 'Construction Pre-Apprenticeship',
      duration: '12-16 weeks',
      hours: '400+ hours',
      placement: '95%',
      description: 'OSHA-certified training with hands-on experience in carpentry, electrical, plumbing, and HVAC.',
      credentials: ['OSHA 10', 'First Aid/CPR', 'Forklift Certification']
    },
    {
      title: 'Phlebotomy Technician',
      duration: '8-10 weeks',
      hours: '200+ hours',
      placement: '92%',
      description: 'Clinical training with certification exam prep. Includes externship at local healthcare facilities.',
      credentials: ['CPT Certification', 'Clinical Externship', 'HIPAA Training']
    },
    {
      title: 'CDL Truck Driving',
      duration: '4-8 weeks',
      hours: '160+ hours',
      placement: '98%',
      description: 'Class A CDL training with job placement assistance. Behind-the-wheel training included.',
      credentials: ['Class A CDL', 'Hazmat Endorsement', 'Air Brakes']
    },
    {
      title: 'CPR Instructor Certification',
      duration: '4-6 weeks',
      hours: '80+ hours',
      placement: '90%',
      description: 'Become a certified CPR/First Aid instructor. Teach in schools, businesses, and community centers.',
      credentials: ['AHA Instructor', 'First Aid Instructor', 'AED Training']
    },
    {
      title: 'Drug Testing Collector',
      duration: '2-4 weeks',
      hours: '40+ hours',
      placement: '88%',
      description: 'DOT-compliant drug testing certification. Work in healthcare, transportation, or corporate settings.',
      credentials: ['DOT Certification', 'Chain of Custody', 'Lab Procedures']
    },
    {
      title: 'Financial Literacy Coach',
      duration: '6-8 weeks',
      hours: '120+ hours',
      placement: '85%',
      description: 'Help individuals and families achieve financial wellness. Credit counseling and budgeting skills.',
      credentials: ['Financial Coach Certification', 'Credit Counseling', 'Tax Preparation Basics']
    }
  ]

  return (
    <>
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-2xl p-8 mb-8">
        <h1 className="text-4xl font-bold mb-3">Workforce Training Programs</h1>
        <p className="text-xl mb-4">100% FREE programs for Marion County, IN residents</p>
        <div className="flex gap-6 text-sm">
          <div>✅ ETPL Provider</div>
          <div>✅ DOL Apprenticeship Sponsor</div>
          <div>✅ 92% Job Placement Rate</div>
        </div>
      </div>

      {/* Programs Grid */}
      <div className="grid md:grid-cols-2 gap-6 mb-12">
        {programs.map((program) => (
          <div key={program.title} className="bg-white rounded-xl border-2 border-gray-100 p-6 hover:border-blue-300 transition-colors">
            <h2 className="text-2xl font-bold mb-3">{program.title}</h2>
            
            <div className="flex gap-4 text-sm text-gray-600 mb-4">
              <span>⏱️ {program.duration}</span>
              <span>📚 {program.hours}</span>
              <span className="text-green-600 font-semibold">✅ {program.placement} Placement</span>
            </div>

            <p className="text-gray-700 mb-4">{program.description}</p>

            <div className="mb-4">
              <h4 className="font-semibold text-sm text-gray-700 mb-2">Credentials Earned:</h4>
              <div className="flex flex-wrap gap-2">
                {program.credentials.map((cred) => (
                  <span key={cred} className="bg-blue-50 text-blue-700 px-3 py-1 rounded-full text-xs font-medium">
                    {cred}
                  </span>
                ))}
              </div>
            </div>

            <a href="/get-started">
              <button className="w-full bg-black text-white py-3 rounded-xl font-semibold hover:bg-gray-800 transition-colors">
                Apply Now - FREE
              </button>
            </a>
          </div>
        ))}
      </div>

      {/* Eligibility */}
      <div className="bg-yellow-50 border-2 border-yellow-200 rounded-xl p-6 mb-8">
        <h3 className="text-xl font-bold mb-3">Eligibility Requirements</h3>
        <ul className="space-y-2 text-gray-700">
          <li>✅ Marion County, IN resident</li>
          <li>✅ 18 years or older</li>
          <li>✅ High school diploma or GED (or working towards it)</li>
          <li>✅ Eligible to work in the United States</li>
          <li>✅ Committed to completing the program</li>
        </ul>
      </div>

      {/* CTA */}
      <div className="bg-black text-white rounded-2xl p-8 text-center">
        <h2 className="text-3xl font-bold mb-3">Ready to Transform Your Career?</h2>
        <p className="text-lg mb-6">Join 1,247+ students who have successfully completed our programs</p>
        <a href="/get-started">
          <button className="bg-white text-black px-8 py-4 rounded-xl font-semibold text-lg hover:bg-gray-100 transition-colors">
            Apply Now - 100% FREE
          </button>
        </a>
      </div>
    </>
  )
}

