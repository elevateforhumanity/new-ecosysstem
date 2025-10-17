import React, { useState } from 'react';

const FullSailLanding = () => {
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    program: '',
    employment: ''
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log('Form submitted:', formData);
    // Add your form submission logic here
    alert('Thank you! We will contact you soon.');
  };

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const programs = [
    {
      icon: '🛡️',
      title: 'Cybersecurity',
      description: 'Protect organizations from cyber threats with CompTIA Security+ certification.',
      features: [
        'CompTIA Security+ Certification',
        'Ethical Hacking Training',
        'Network Security',
        '12-16 weeks',
        '$65,000+ average salary'
      ]
    },
    {
      icon: '☁️',
      title: 'Cloud Computing',
      description: 'Master cloud platforms with Google Cloud and Microsoft Azure certifications.',
      features: [
        'Google Cloud Certification',
        'Microsoft Azure Training',
        'Cloud Architecture',
        '8-12 weeks',
        '$75,000+ average salary'
      ]
    },
    {
      icon: '🏥',
      title: 'Healthcare (CNA)',
      description: 'Start your healthcare career as a Certified Nursing Assistant.',
      features: [
        'State CNA Certification',
        'Clinical Training',
        'Patient Care Skills',
        '6-8 weeks',
        '$35,000+ average salary'
      ]
    },
    {
      icon: '⚡',
      title: 'Electrical Trades',
      description: 'Join the IBEW union with electrical apprenticeship preparation.',
      features: [
        'IBEW Apprenticeship Prep',
        'Electrical Fundamentals',
        'Safety Training',
        '12-16 weeks',
        '$70,000+ average salary'
      ]
    },
    {
      icon: '🏗️',
      title: 'Construction',
      description: 'Build your future with NCCER construction certifications.',
      features: [
        'NCCER Core Certification',
        'Construction Safety',
        'Blueprint Reading',
        '10-14 weeks',
        '$55,000+ average salary'
      ]
    },
    {
      icon: '💅',
      title: 'Beauty & Wellness',
      description: 'Launch your career in the beauty industry with professional certifications.',
      features: [
        'Cosmetology License Prep',
        'Esthetics Training',
        'Nail Technology',
        '8-12 weeks',
        '$40,000+ average salary'
      ]
    }
  ];

  const stats = [
    { number: '89%', label: 'Job Placement Rate' },
    { number: '106+', label: 'Certifications Offered' },
    { number: '2,500+', label: 'Students Trained' },
    { number: '$0', label: 'Cost for Qualified Residents' }
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header Banner */}
      <div className="bg-gray-900 text-white text-center py-3 text-sm">
        <span className="bg-orange-500 text-white px-3 py-1 rounded font-bold mr-2">
          FREE TRAINING
        </span>
        Available for Qualified Indiana Residents • WIOA Approved Programs
      </div>

      {/* Hero Section with Form */}
      <div className="bg-gradient-to-br from-gray-800 to-gray-700 text-white">
        <div className="max-w-7xl mx-auto">
          <div className="grid lg:grid-cols-[1fr_400px] grid-cols-1">
            {/* Hero Content */}
            <div className="p-10 lg:p-16 flex flex-col justify-center">
              <div className="bg-orange-500 text-white px-4 py-2 rounded-full text-xs font-bold uppercase inline-block w-fit mb-5">
                89% Job Placement Rate
              </div>
              
              <h1 className="text-4xl lg:text-5xl font-bold mb-5 leading-tight">
                Start Your Career in Tech & Trades
              </h1>
              
              <p className="text-xl mb-8 text-gray-200 leading-relaxed">
                Get job-ready in months, not years with industry-recognized certifications and guaranteed employer connections.
              </p>
              
              <ul className="space-y-3 mb-8">
                {[
                  'Free training for qualified residents',
                  'Industry-recognized certifications',
                  'Job placement assistance included',
                  'Flexible scheduling options',
                  'No experience required'
                ].map((feature, index) => (
                  <li key={index} className="flex items-start text-lg">
                    <span className="text-green-400 font-bold text-xl mr-3">✓</span>
                    {feature}
                  </li>
                ))}
              </ul>
            </div>

            {/* Lead Capture Form */}
            <div className="bg-white text-gray-800 p-8 lg:p-10 shadow-2xl">
              <div className="text-center mb-8">
                <h2 className="text-2xl font-bold text-gray-800 mb-2">
                  Get Program Info
                </h2>
                <p className="text-gray-600">
                  Find out if you qualify for free training
                </p>
              </div>

              <form onSubmit={handleSubmit} className="space-y-5">
                <div>
                  <label htmlFor="firstName" className="block font-bold text-gray-800 mb-1">
                    First Name *
                  </label>
                  <input
                    type="text"
                    id="firstName"
                    name="firstName"
                    value={formData.firstName}
                    onChange={handleChange}
                    className="w-full px-4 py-3 border-2 border-gray-300 rounded focus:border-orange-500 focus:outline-none text-base"
                    required
                  />
                </div>

                <div>
                  <label htmlFor="lastName" className="block font-bold text-gray-800 mb-1">
                    Last Name *
                  </label>
                  <input
                    type="text"
                    id="lastName"
                    name="lastName"
                    value={formData.lastName}
                    onChange={handleChange}
                    className="w-full px-4 py-3 border-2 border-gray-300 rounded focus:border-orange-500 focus:outline-none text-base"
                    required
                  />
                </div>

                <div>
                  <label htmlFor="email" className="block font-bold text-gray-800 mb-1">
                    Email Address *
                  </label>
                  <input
                    type="email"
                    id="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    className="w-full px-4 py-3 border-2 border-gray-300 rounded focus:border-orange-500 focus:outline-none text-base"
                    required
                  />
                </div>

                <div>
                  <label htmlFor="phone" className="block font-bold text-gray-800 mb-1">
                    Phone Number *
                  </label>
                  <input
                    type="tel"
                    id="phone"
                    name="phone"
                    value={formData.phone}
                    onChange={handleChange}
                    className="w-full px-4 py-3 border-2 border-gray-300 rounded focus:border-orange-500 focus:outline-none text-base"
                    required
                  />
                </div>

                <div>
                  <label htmlFor="program" className="block font-bold text-gray-800 mb-1">
                    Program Interest *
                  </label>
                  <select
                    id="program"
                    name="program"
                    value={formData.program}
                    onChange={handleChange}
                    className="w-full px-4 py-3 border-2 border-gray-300 rounded focus:border-orange-500 focus:outline-none text-base bg-white"
                    required
                  >
                    <option value="">Select a Program</option>
                    <option value="cybersecurity">Cybersecurity</option>
                    <option value="cloud-computing">Cloud Computing</option>
                    <option value="healthcare">Healthcare (CNA)</option>
                    <option value="electrical">Electrical Trades</option>
                    <option value="construction">Construction</option>
                    <option value="beauty">Beauty & Wellness</option>
                  </select>
                </div>

                <div>
                  <label htmlFor="employment" className="block font-bold text-gray-800 mb-1">
                    Current Employment Status *
                  </label>
                  <select
                    id="employment"
                    name="employment"
                    value={formData.employment}
                    onChange={handleChange}
                    className="w-full px-4 py-3 border-2 border-gray-300 rounded focus:border-orange-500 focus:outline-none text-base bg-white"
                    required
                  >
                    <option value="">Select Status</option>
                    <option value="unemployed">Unemployed</option>
                    <option value="underemployed">Underemployed</option>
                    <option value="employed">Employed (seeking change)</option>
                    <option value="student">Student</option>
                  </select>
                </div>

                <button
                  type="submit"
                  className="w-full bg-orange-500 hover:bg-orange-600 text-white py-4 rounded font-bold text-lg uppercase tracking-wider transition-colors"
                >
                  Get Free Program Info
                </button>

                <p className="text-xs text-gray-600 leading-relaxed mt-4">
                  By submitting this form, you consent to receive emails and texts from Elevate for Humanity. 
                  You may opt out at any time. Message and data rates may apply.
                </p>
              </form>
            </div>
          </div>
        </div>
      </div>

      {/* Programs Section */}
      <div className="py-16 px-6 bg-gray-50">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-4xl font-bold text-center text-gray-800 mb-12">
            Choose Your Career Path
          </h2>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {programs.map((program, index) => (
              <div
                key={index}
                className="bg-white rounded-lg p-8 shadow-lg hover:-translate-y-2 transition-transform text-center"
              >
                <span className="text-5xl block mb-5">{program.icon}</span>
                <h3 className="text-2xl font-bold text-gray-800 mb-4">
                  {program.title}
                </h3>
                <p className="text-gray-600 mb-5 leading-relaxed">
                  {program.description}
                </p>
                <ul className="text-left space-y-2 mb-6">
                  {program.features.map((feature, idx) => (
                    <li key={idx} className="text-gray-800 text-sm pl-5 relative">
                      <span className="absolute left-0 text-orange-500 font-bold">•</span>
                      {feature}
                    </li>
                  ))}
                </ul>
                <button className="bg-gray-800 hover:bg-gray-700 text-white px-6 py-3 rounded font-bold transition-colors">
                  Learn More
                </button>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Stats Section */}
      <div className="bg-gray-800 text-white py-16 px-6 text-center">
        <div className="max-w-4xl mx-auto">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-8">
            {stats.map((stat, index) => (
              <div key={index}>
                <div className="text-5xl font-bold text-orange-500 mb-3">
                  {stat.number}
                </div>
                <div className="text-lg">
                  {stat.label}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default FullSailLanding;
