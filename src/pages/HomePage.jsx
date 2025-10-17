/*
  Copyright (c) 2025 Elevate for Humanity
  Commercial License. No resale, sublicensing, or redistribution allowed.
  See LICENSE file for details.
*/

import React from 'react';
import { Link } from 'react-router-dom';
import { SEO } from '../lib/seo/SEO';
import Header from '../components/Header';
import Footer from '../components/Footer';

export default function HomePage() {
  const productivityApps = [
    {
      name: 'Sheets',
      icon: '📊',
      path: '/sheets',
      description: 'Powerful spreadsheets with real-time collaboration',
    },
    {
      name: 'Slides',
      icon: '📽️',
      path: '/slides',
      description: 'Create stunning presentations',
    },
    {
      name: 'Docs',
      icon: '📝',
      path: '/docs',
      description: 'Word processing with smart editing',
    },
    {
      name: 'Email',
      icon: '📧',
      path: '/email',
      description: 'Professional email management',
    },
    {
      name: 'Calendar',
      icon: '📅',
      path: '/calendar',
      description: 'Schedule and organize your time',
    },
    {
      name: 'Video Meetings',
      icon: '🎥',
      path: '/meet',
      description: 'HD video conferencing',
    },
    {
      name: 'File Manager',
      icon: '📁',
      path: '/drive',
      description: 'Cloud storage and file sharing',
    },
    {
      name: 'AI Tutor',
      icon: '🤖',
      path: '/a-i-tutor',
      description: 'Personal AI learning assistant',
    },
    {
      name: 'NotebookLM',
      icon: '📓',
      path: '/notebook-l-m',
      description: 'AI-powered note taking',
    },
    {
      name: 'Elevate Brain',
      icon: '🧠',
      path: '/elevate-brain',
      description: 'AI knowledge assistant',
    },
  ];

  const trainingPrograms = [
    {
      name: 'Construction Pre-Apprenticeship',
      duration: '12-16 weeks',
      icon: '🏗️',
      credentials: 'OSHA 10, NCCER Core, Forklift',
      placement: '95%',
    },
    {
      name: 'Phlebotomy Technician',
      duration: '8-10 weeks',
      icon: '🩺',
      credentials: 'National Certification',
      placement: '92%',
    },
    {
      name: 'CDL Truck Driving',
      duration: '4-8 weeks',
      icon: '🚛',
      credentials: 'CDL Class A',
      placement: '98%',
    },
    {
      name: 'CPR Instructor',
      duration: '4-6 weeks',
      icon: '❤️',
      credentials: 'AHA Certification',
      placement: '90%',
    },
    {
      name: 'Drug Testing Collector',
      duration: '2-4 weeks',
      icon: '🧪',
      credentials: 'DOT Certified',
      placement: '88%',
    },
    {
      name: 'Financial Literacy',
      duration: '6-8 weeks',
      icon: '💰',
      credentials: 'Certificate',
      placement: '85%',
    },
    {
      name: 'Music & Dance Arts',
      duration: '12-16 weeks',
      icon: '🎵',
      credentials: 'Arts Certificate',
      placement: '82%',
    },
  ];

  return (
    <div className="min-h-screen bg-background">
      <SEO
        title="Elevate for Humanity - FREE Productivity Suite & Training Programs"
        description="Access free productivity tools (Sheets, Slides, Docs, Video Meetings) and get FREE job training in Construction, Healthcare, CDL, and more. Marion County, IN."
        canonical={`${import.meta.env.VITE_SITE_URL || ''}/`}
      />
      <Header />

      <main id="main-content">
        {/* Hero Section */}
        <section className="relative bg-gradient-to-br from-blue-700 via-purple-600 to-purple-700 text-white py-20 px-4 text-center overflow-hidden">
          <div className="absolute inset-0 bg-grid-white/[0.05] bg-[size:20px_20px]" />
          <div className="relative max-w-7xl mx-auto">
            <div className="inline-flex items-center gap-2 bg-white/20 backdrop-blur-sm px-6 py-2 rounded-full mb-6 text-sm font-semibold">
              <span className="text-2xl">🎓</span>
              <span>Marion County, IN • 100% FREE Programs</span>
            </div>

            <h1 className="text-5xl md:text-7xl font-extrabold mb-6 leading-tight">
              Empowering People.
              <br />
              <span className="text-yellow-300">Elevating Communities.</span>
            </h1>

            <p className="text-xl md:text-2xl mb-8 opacity-95 max-w-4xl mx-auto leading-relaxed">
              We connect education, employment, and entrepreneurship through
              workforce innovation and philanthropy. ETPL provider and DOL
              apprenticeship sponsor.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
              <Link
                to="/programs"
                className="px-8 py-4 bg-green-500 hover:bg-brand-success text-white rounded-full text-lg font-bold shadow-lg hover:shadow-xl transition-all transform hover:scale-105"
              >
                Explore Programs
              </Link>
              <Link
                to="/connect"
                className="px-8 py-4 bg-white/20 hover:bg-white/30 backdrop-blur-sm text-white rounded-full text-lg font-bold border-2 border-white transition-all"
              >
                Partner With Us
              </Link>
              <Link
                to="/get-started"
                className="px-8 py-4 bg-white hover:bg-brand-surface-dark text-brand-info rounded-full text-lg font-bold shadow-lg hover:shadow-xl transition-all transform hover:scale-105"
              >
                Apply Now
              </Link>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8 max-w-5xl mx-auto">
              <div className="backdrop-blur-sm bg-white/10 rounded-2xl p-6">
                <div className="text-5xl font-bold text-yellow-300 mb-2">
                  1,247
                </div>
                <div className="text-sm opacity-90">Students Trained</div>
              </div>
              <div className="backdrop-blur-sm bg-white/10 rounded-2xl p-6">
                <div className="text-5xl font-bold text-yellow-300 mb-2">
                  92%
                </div>
                <div className="text-sm opacity-90">Job Placement Rate</div>
              </div>
              <div className="backdrop-blur-sm bg-white/10 rounded-2xl p-6">
                <div className="text-5xl font-bold text-yellow-300 mb-2">
                  $2.85M
                </div>
                <div className="text-sm opacity-90">Funding Distributed</div>
              </div>
              <div className="backdrop-blur-sm bg-white/10 rounded-2xl p-6">
                <div className="text-5xl font-bold text-yellow-300 mb-2">
                  100%
                </div>
                <div className="text-sm opacity-90">FREE to Students</div>
              </div>
            </div>
          </div>
        </section>

        {/* Productivity Suite */}
        <section className="py-20 px-4 bg-brand-surface">
          <div className="max-w-7xl mx-auto">
            <div className="text-center mb-12">
              <h2 className="text-4xl md:text-5xl font-bold text-brand-text mb-4">
                FREE Productivity Suite
              </h2>
              <p className="text-xl text-brand-text-muted max-w-3xl mx-auto">
                Professional tools for work, school, and life. No subscription.
                No limits.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {productivityApps.map((app, idx) => (
                <Link
                  key={idx}
                  to={app.path}
                  className="group bg-white p-8 rounded-xl border border-brand-border hover:border-blue-300 hover:shadow-lg transition-all duration-200"
                >
                  <div className="text-5xl mb-4 group-hover:scale-110 transition-transform">
                    {app.icon}
                  </div>
                  <h3 className="text-xl font-semibold text-brand-text mb-2">
                    {app.name}
                  </h3>
                  <p className="text-brand-text-muted text-sm">
                    {app.description}
                  </p>
                </Link>
              ))}
            </div>

            <div className="text-center mt-12">
              <div className="inline-block bg-brand-surface text-brand-success px-8 py-4 rounded-xl font-semibold text-lg">
                ✅ All tools are 100% FREE • No credit card required • Unlimited
                use
              </div>
            </div>
          </div>
        </section>

        {/* Training Programs */}
        <section className="py-20 px-4 bg-white">
          <div className="max-w-7xl mx-auto">
            <div className="text-center mb-12">
              <h2 className="text-4xl md:text-5xl font-bold text-brand-text mb-4">
                FREE Job Training Programs
              </h2>
              <p className="text-xl text-brand-text-muted max-w-4xl mx-auto">
                Get certified in high-demand careers. Funded by WIOA, DOL, and
                state grants. You pay nothing.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {trainingPrograms.map((program, idx) => (
                <div
                  key={idx}
                  className="relative bg-gradient-to-br from-white to-slate-50 p-8 rounded-2xl border-2 border-brand-border hover:border-blue-300 hover:shadow-xl transition-all duration-200"
                >
                  <div className="absolute top-4 right-4 bg-brand-surface text-brand-success px-4 py-2 rounded-full text-sm font-bold">
                    {program.placement} Placement
                  </div>
                  <div className="text-6xl mb-4">{program.icon}</div>
                  <h3 className="text-2xl font-semibold text-brand-text mb-3">
                    {program.name}
                  </h3>
                  <div className="space-y-2 mb-4">
                    <div className="text-sm text-brand-text-muted">
                      ⏱️ Duration:{' '}
                      <strong className="text-brand-text">
                        {program.duration}
                      </strong>
                    </div>
                    <div className="text-sm text-brand-text-muted">
                      🎓 Earn:{' '}
                      <strong className="text-brand-text">
                        {program.credentials}
                      </strong>
                    </div>
                  </div>
                  <Link
                    to="/programs"
                    className="block text-center py-3 bg-brand-info-hover hover:bg-blue-800 text-white rounded-lg font-semibold mt-4 transition-colors"
                  >
                    Learn More & Enroll
                  </Link>
                </div>
              ))}
            </div>

            <div className="mt-16 bg-yellow-100 p-10 rounded-2xl text-center">
              <h3 className="text-3xl font-bold text-yellow-900 mb-4">
                💰 Funding Available
              </h3>
              <p className="text-lg text-yellow-800 mb-6">
                Programs funded by: WIOA • WRG • OJT • WEX • JRI • DOL • State
                Grants
              </p>
              <div className="inline-block bg-yellow-900 text-yellow-100 px-10 py-4 rounded-full font-bold text-xl">
                You Pay: $0.00
              </div>
            </div>
          </div>
        </section>

        {/* How It Works */}
        <section className="py-20 px-4 bg-brand-surface">
          <div className="max-w-6xl mx-auto">
            <h2 className="text-4xl md:text-5xl font-bold text-brand-text mb-16 text-center">
              How It Works
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
              <div className="text-center">
                <div className="w-20 h-20 bg-brand-info-hover text-white rounded-full flex items-center justify-center text-3xl font-bold mx-auto mb-6 shadow-lg">
                  1
                </div>
                <h3 className="text-2xl font-semibold text-brand-text mb-3">
                  Choose Your Path
                </h3>
                <p className="text-brand-text-muted">
                  Browse programs and select the career that interests you
                </p>
              </div>
              <div className="text-center">
                <div className="w-20 h-20 bg-brand-secondary text-white rounded-full flex items-center justify-center text-3xl font-bold mx-auto mb-6 shadow-lg">
                  2
                </div>
                <h3 className="text-2xl font-semibold text-brand-text mb-3">
                  Get Funded
                </h3>
                <p className="text-brand-text-muted">
                  We help you access grants and funding - you pay nothing
                </p>
              </div>
              <div className="text-center">
                <div className="w-20 h-20 bg-green-500 text-white rounded-full flex items-center justify-center text-3xl font-bold mx-auto mb-6 shadow-lg">
                  3
                </div>
                <h3 className="text-2xl font-semibold text-brand-text mb-3">
                  Get Trained
                </h3>
                <p className="text-brand-text-muted">
                  Complete hands-on training and earn industry certifications
                </p>
              </div>
              <div className="text-center">
                <div className="w-20 h-20 bg-red-500 text-white rounded-full flex items-center justify-center text-3xl font-bold mx-auto mb-6 shadow-lg">
                  4
                </div>
                <h3 className="text-2xl font-semibold text-brand-text mb-3">
                  Get Hired
                </h3>
                <p className="text-brand-text-muted">
                  Job placement assistance connects you with employers
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Final CTA */}
        <section className="bg-gradient-to-br from-blue-700 via-purple-600 to-purple-700 text-white py-20 px-4 text-center">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-4xl md:text-5xl font-bold mb-6">
              Ready to Transform Your Future?
            </h2>
            <p className="text-2xl mb-12 opacity-95">
              Join 1,247 students who've already started their journey to better
              careers
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                to="/programs"
                className="px-10 py-4 bg-white text-brand-info rounded-full text-xl font-bold hover:bg-brand-surface-dark transition-colors shadow-lg"
              >
                Enroll in Training
              </Link>
              <Link
                to="/connect"
                className="px-10 py-4 bg-transparent text-white rounded-full text-xl font-bold border-2 border-white hover:bg-white/10 transition-colors"
              >
                Contact Us
              </Link>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
