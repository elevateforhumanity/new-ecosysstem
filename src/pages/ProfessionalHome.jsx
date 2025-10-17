/*
  Professional Landing Page for Elevate for Humanity
  Follows DWD/DOL branding standards and philanthropy tone
*/

import React from 'react';
import { Link } from 'react-router-dom';
import { SEO } from '../lib/seo/SEO';
import Header from '../components/Header';
import Footer from '../components/Footer';

export default function ProfessionalHome() {
  const featuredPrograms = [
    {
      icon: '🩺',
      title: 'Healthcare Careers',
      subtitle: 'CNA, HHA, QMA',
      description: 'State-approved certifications with employer partnerships',
      link: '/programs?category=healthcare',
    },
    {
      icon: '🔧',
      title: 'Trades & Apprenticeships',
      subtitle: 'HVAC, Welding, Barbering',
      description:
        'Hands-on training with WIOA and JRI earn-while-you-learn options',
      link: '/programs?category=trades',
    },
    {
      icon: '💻',
      title: 'Tech & Digital Skills',
      subtitle: 'IT, Entrepreneurship, AI',
      description: 'IT, Entrepreneurship, Cyber Safety & AI Literacy',
      link: '/programs?category=tech',
    },
    {
      icon: '💼',
      title: 'Work Experience & OJT',
      subtitle: 'Paid Learning',
      description:
        'Paid learning, internships, and re-entry employment pathways',
      link: '/get-started',
    },
  ];

  const partners = [
    'Indiana DWD',
    'WorkOne',
    'Certiport',
    'Milady',
    'HSI',
    'NCCER',
    'Ivy Tech',
    'DOL',
  ];

  const testimonials = [
    {
      quote: 'I earned my CNA and got hired through WorkOne in just 8 weeks.',
      author: 'Tierra',
      role: 'Graduate',
    },
    {
      quote:
        'Our partnership with EFH has helped us hire motivated, certified talent.',
      author: "Alina's Choice Medical Institute",
      role: 'Partner',
    },
    {
      quote:
        'The support and training changed my life. I now have a stable career.',
      author: 'Marcus',
      role: 'Graduate',
    },
  ];

  const impactStats = [
    { number: '250+', label: 'Certifications Awarded' },
    { number: '15+', label: 'Community Partners' },
    { number: '$500K+', label: 'Workforce Impact Generated' },
    { number: '95%', label: 'Job Placement Rate' },
  ];

  return (
    <div style={{ minHeight: '100vh', background: '#ffffff' }}>
      <SEO
        title="Elevate for Humanity | Workforce Innovation & Philanthropy Ecosystem"
        description="We connect education, employment, and entrepreneurship through workforce innovation and philanthropy. ETPL provider and DOL apprenticeship sponsor in Indianapolis, IN."
        canonical={`${import.meta.env.VITE_SITE_URL || ''}/`}
        keywords="workforce development, career training, Indianapolis, WIOA, apprenticeships, healthcare training, skilled trades, job placement"
      />
      <Header />

      <main id="main-content">
        {/* HERO SECTION */}
        <section
          style={{
            background:
              'linear-gradient(135deg, #1e3a8a 0%, #581c87 50%, var(--brand-info) 100%)',
            color: 'white',
            padding: '5rem 2rem',
            textAlign: 'center',
          }}
        >
          <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
            <h1
              style={{
                fontSize: 'clamp(2.5rem, 5vw, 4rem)',
                fontWeight: 'bold',
                marginBottom: '1.5rem',
                lineHeight: '1.2',
              }}
            >
              Empowering People.
              <br />
              Elevating Communities.
            </h1>
            <p
              style={{
                fontSize: 'clamp(1.125rem, 2vw, 1.5rem)',
                marginBottom: '2rem',
                color: '#bfdbfe',
                maxWidth: '800px',
                margin: '0 auto 2rem',
              }}
            >
              We connect education, employment, and entrepreneurship through
              workforce innovation and philanthropy.
            </p>
            <div
              style={{
                display: 'flex',
                flexWrap: 'wrap',
                gap: '1rem',
                justifyContent: 'center',
              }}
            >
              <Link
                to="/programs"
                style={{
                  background: 'white',
                  color: 'var(--brand-info)',
                  padding: '1rem 2rem',
                  borderRadius: '0.5rem',
                  fontWeight: '600',
                  fontSize: '1.125rem',
                  textDecoration: 'none',
                  boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)',
                  display: 'inline-block',
                }}
              >
                Explore Programs
              </Link>
              <Link
                to="/connect"
                style={{
                  background: 'transparent',
                  border: '2px solid white',
                  color: 'white',
                  padding: '1rem 2rem',
                  borderRadius: '0.5rem',
                  fontWeight: '600',
                  fontSize: '1.125rem',
                  textDecoration: 'none',
                  display: 'inline-block',
                }}
              >
                Partner With Us
              </Link>
              <Link
                to="/get-started"
                style={{
                  background: 'var(--brand-success)',
                  color: 'white',
                  padding: '1rem 2rem',
                  borderRadius: '0.5rem',
                  fontWeight: '600',
                  fontSize: '1.125rem',
                  textDecoration: 'none',
                  boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)',
                  display: 'inline-block',
                }}
              >
                Apply Now
              </Link>
            </div>
          </div>
        </section>

        {/* ABOUT + MISSION SECTION */}
        <section className="py-16 px-4 bg-brand-surface">
          <div className="max-w-6xl mx-auto grid md:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-4xl font-bold mb-6 text-brand-text">
                Building Pathways to Opportunity
              </h2>
              <p className="text-lg text-brand-text mb-4 leading-relaxed">
                At Elevate for Humanity Career & Technical Institute, we bridge
                education and employment through certified workforce training,
                entrepreneurship support, and community development.
              </p>
              <p className="text-lg text-brand-text mb-6 leading-relaxed">
                As a registered ETPL provider and DOL apprenticeship sponsor, we
                create equitable pathways for individuals to gain skills,
                certifications, and sustainable careers.
              </p>
              <Link
                to="/about"
                className="inline-block bg-brand-info text-white px-6 py-3 rounded-lg font-semibold hover:bg-brand-info-hover transition-colors"
              >
                Learn About Our Mission
              </Link>
            </div>
            <div className="bg-brand-surface rounded-lg p-8 h-64 flex items-center justify-center">
              <p className="text-brand-text-light text-center">
                [Hero Image: Community members learning together in training
                lab]
              </p>
            </div>
          </div>
        </section>

        {/* FEATURED PROGRAMS */}
        <section className="py-16 px-4">
          <div className="max-w-6xl mx-auto">
            <h2 className="text-4xl font-bold text-center mb-4 text-brand-text">
              Featured Programs
            </h2>
            <p className="text-center text-brand-text-muted mb-12 text-lg">
              Discover career pathways designed for your success
            </p>
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
              {featuredPrograms.map((program, index) => (
                <div
                  key={index}
                  className="bg-white border-2 border-brand-border rounded-lg p-6 hover:border-blue-500 hover:shadow-lg transition-all"
                >
                  <div className="text-5xl mb-4">{program.icon}</div>
                  <h3 className="text-xl font-bold mb-2 text-brand-text">
                    {program.title}
                  </h3>
                  <p className="text-sm text-brand-info font-semibold mb-3">
                    {program.subtitle}
                  </p>
                  <p className="text-brand-text-muted mb-4">
                    {program.description}
                  </p>
                  <Link
                    to={program.link}
                    className="text-brand-info font-semibold hover:text-brand-info inline-flex items-center"
                  >
                    Learn More →
                  </Link>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* PARTNER & EMPLOYER STRIP */}
        <section className="py-12 px-4 bg-brand-surface-dark">
          <div className="max-w-6xl mx-auto text-center">
            <h2 className="text-2xl font-bold mb-6 text-brand-text">
              Our Partnerships Strengthen Communities
            </h2>
            <p className="text-brand-text-muted mb-8">
              Together, we're creating job-ready futures
            </p>
            <div className="flex flex-wrap justify-center gap-8 items-center">
              {partners.map((partner, index) => (
                <div
                  key={index}
                  className="bg-white px-6 py-4 rounded-lg shadow-sm border border-brand-border font-semibold text-brand-text"
                >
                  {partner}
                </div>
              ))}
            </div>
            <div className="mt-8">
              <Link
                to="/partners"
                className="inline-block bg-brand-info text-white px-6 py-3 rounded-lg font-semibold hover:bg-brand-info-hover transition-colors"
              >
                Become a Partner
              </Link>
            </div>
          </div>
        </section>

        {/* INNOVATION SECTION */}
        <section className="py-16 px-4 bg-gradient-to-r from-purple-50 to-blue-50">
          <div className="max-w-6xl mx-auto text-center">
            <h2 className="text-4xl font-bold mb-6 text-brand-text">
              Powered by Innovation
            </h2>
            <p className="text-lg text-brand-text mb-8 max-w-3xl mx-auto">
              Elevate for Humanity's ecosystem integrates AI learning
              assistants, real-time data analytics, and secure cloud
              infrastructure—connecting learners, employers, and funders through
              one unified platform.
            </p>
            <div className="grid md:grid-cols-4 gap-6 mt-12">
              <div className="bg-white p-6 rounded-lg shadow-sm">
                <div className="text-3xl mb-3">📊</div>
                <h3 className="font-bold mb-2">Real-time Data</h3>
                <p className="text-sm text-brand-text-muted">
                  Job placement analytics
                </p>
              </div>
              <div className="bg-white p-6 rounded-lg shadow-sm">
                <div className="text-3xl mb-3">✅</div>
                <h3 className="font-bold mb-2">Compliance</h3>
                <p className="text-sm text-brand-text-muted">
                  Automated reporting
                </p>
              </div>
              <div className="bg-white p-6 rounded-lg shadow-sm">
                <div className="text-3xl mb-3">🤖</div>
                <h3 className="font-bold mb-2">AI Tutoring</h3>
                <p className="text-sm text-brand-text-muted">
                  Personalized learning
                </p>
              </div>
              <div className="bg-white p-6 rounded-lg shadow-sm">
                <div className="text-3xl mb-3">🔒</div>
                <h3 className="font-bold mb-2">Secure</h3>
                <p className="text-sm text-brand-text-muted">
                  Cloud infrastructure
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* IMPACT STATS */}
        <section className="py-16 px-4 bg-blue-900 text-white">
          <div className="max-w-6xl mx-auto">
            <h2 className="text-4xl font-bold text-center mb-12">Our Impact</h2>
            <div className="grid md:grid-cols-4 gap-8">
              {impactStats.map((stat, index) => (
                <div key={index} className="text-center">
                  <div className="text-5xl font-bold mb-2">{stat.number}</div>
                  <div className="text-blue-200">{stat.label}</div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* TESTIMONIALS */}
        <section className="py-16 px-4">
          <div className="max-w-6xl mx-auto">
            <h2 className="text-4xl font-bold text-center mb-12 text-brand-text">
              Success Stories
            </h2>
            <div className="grid md:grid-cols-3 gap-8">
              {testimonials.map((testimonial, index) => (
                <div
                  key={index}
                  className="bg-brand-surface p-8 rounded-lg border-l-4 border-blue-500"
                >
                  <p className="text-brand-text mb-4 italic">
                    "{testimonial.quote}"
                  </p>
                  <div className="font-semibold text-brand-text">
                    {testimonial.author}
                  </div>
                  <div className="text-sm text-brand-text-muted">
                    {testimonial.role}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* GET INVOLVED / PHILANTHROPY CTA */}
        <section className="py-20 px-4 bg-gradient-to-r from-green-600 to-blue-600 text-white text-center">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-4xl font-bold mb-6">
              Your Support Builds Opportunity
            </h2>
            <p className="text-xl mb-8 text-green-50">
              Every donation or partnership strengthens pathways to employment
              and self-sufficiency.
            </p>
            <div className="flex flex-wrap gap-4 justify-center">
              <Link
                to="/donate"
                className="bg-white text-brand-success px-8 py-4 rounded-lg font-semibold text-lg hover:bg-green-50 transition-colors shadow-lg"
              >
                Donate
              </Link>
              <Link
                to="/volunteer"
                className="bg-transparent border-2 border-white text-white px-8 py-4 rounded-lg font-semibold text-lg hover:bg-white hover:text-brand-success transition-colors"
              >
                Volunteer
              </Link>
              <Link
                to="/partners"
                className="bg-blue-500 text-white px-8 py-4 rounded-lg font-semibold text-lg hover:bg-brand-info transition-colors shadow-lg"
              >
                Corporate Partnerships
              </Link>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
