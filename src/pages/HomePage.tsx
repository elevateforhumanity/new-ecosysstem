import React from 'react';
import { Helmet } from 'react-helmet-async';
import { Link } from 'react-router-dom';

export default function HomePage() {
  return (
    <>
      <Helmet>
        <title>Career Training Programs | Elevate for Humanity</title>
        <meta
          name="description"
          content="WIOA approved career training programs in technology, healthcare, and skilled trades. Free training available with job placement assistance."
        />
      </Helmet>

      {/* Hero Section */}
      <section className="relative bg-gradient-to-r from-blue-900 via-purple-900 to-blue-800 text-white overflow-hidden">
        <div className="absolute inset-0 bg-black opacity-50"></div>
        <div className="relative container mx-auto px-4 py-20">
          <div className="max-w-4xl mx-auto text-center">
            <h1 className="text-5xl md:text-6xl font-bold mb-6">
              Transform Your Career with Free Training
            </h1>
            <p className="text-xl md:text-2xl mb-8">
              WIOA-approved programs in technology, healthcare, and skilled
              trades
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                to="/programs"
                className="bg-yellow-500 text-black px-8 py-4 rounded-lg font-bold text-lg hover:bg-yellow-400 transition-colors"
              >
                View Programs
              </Link>
              <Link
                to="/student"
                className="border-2 border-white text-white px-8 py-4 rounded-lg font-bold text-lg hover:bg-white hover:text-blue-900 transition-colors"
              >
                Get Started
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Programs Preview */}
      <section className="py-16 bg-brand-surface">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold text-brand-text mb-4">
              Popular Programs
            </h2>
            <p className="text-xl text-brand-text-muted">
              Choose from our WIOA approved programs
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {/* Cybersecurity */}
            <div className="bg-white rounded-xl shadow-lg overflow-hidden hover:shadow-xl transition-shadow">
              <div className="h-48 bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
                <div className="text-white text-center">
                  <div className="text-6xl mb-4">🔒</div>
                  <h3 className="text-2xl font-bold">Cybersecurity</h3>
                </div>
              </div>
              <div className="p-6">
                <p className="text-brand-text-muted mb-4">
                  Learn to protect digital assets and networks from cyber
                  threats.
                </p>
                <div className="flex justify-between items-center mb-4">
                  <span className="text-sm text-brand-text-light">
                    12-16 weeks
                  </span>
                  <span className="bg-brand-surface text-brand-success px-3 py-1 rounded-full text-sm">
                    $65K+ avg
                  </span>
                </div>
                <Link
                  to="/programs/cybersecurity"
                  className="block w-full bg-brand-info text-white text-center py-3 rounded-lg hover:bg-brand-info-hover transition-colors"
                >
                  Learn More
                </Link>
              </div>
            </div>

            {/* Cloud Computing */}
            <div className="bg-white rounded-xl shadow-lg overflow-hidden hover:shadow-xl transition-shadow">
              <div className="h-48 bg-gradient-to-br from-green-500 to-blue-600 flex items-center justify-center">
                <div className="text-white text-center">
                  <div className="text-6xl mb-4">☁️</div>
                  <h3 className="text-2xl font-bold">Cloud Computing</h3>
                </div>
              </div>
              <div className="p-6">
                <p className="text-brand-text-muted mb-4">
                  Master AWS, Azure, and Google Cloud platforms.
                </p>
                <div className="flex justify-between items-center mb-4">
                  <span className="text-sm text-brand-text-light">
                    10-14 weeks
                  </span>
                  <span className="bg-brand-surface text-brand-success px-3 py-1 rounded-full text-sm">
                    $70K+ avg
                  </span>
                </div>
                <Link
                  to="/programs/cloud-computing"
                  className="block w-full bg-brand-info text-white text-center py-3 rounded-lg hover:bg-brand-info-hover transition-colors"
                >
                  Learn More
                </Link>
              </div>
            </div>

            {/* Healthcare */}
            <div className="bg-white rounded-xl shadow-lg overflow-hidden hover:shadow-xl transition-shadow">
              <div className="h-48 bg-gradient-to-br from-red-500 to-pink-600 flex items-center justify-center">
                <div className="text-white text-center">
                  <div className="text-6xl mb-4">🏥</div>
                  <h3 className="text-2xl font-bold">Healthcare</h3>
                </div>
              </div>
              <div className="p-6">
                <p className="text-brand-text-muted mb-4">
                  CNA and Home Health Aide certification programs.
                </p>
                <div className="flex justify-between items-center mb-4">
                  <span className="text-sm text-brand-text-light">
                    6-8 weeks
                  </span>
                  <span className="bg-brand-surface text-brand-success px-3 py-1 rounded-full text-sm">
                    $35K+ avg
                  </span>
                </div>
                <Link
                  to="/programs/healthcare"
                  className="block w-full bg-brand-info text-white text-center py-3 rounded-lg hover:bg-brand-info-hover transition-colors"
                >
                  Learn More
                </Link>
              </div>
            </div>
          </div>

          <div className="text-center mt-12">
            <Link
              to="/programs"
              className="inline-block bg-brand-info text-white px-8 py-4 rounded-lg font-bold text-lg hover:bg-brand-info-hover transition-colors"
            >
              View All Programs
            </Link>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold text-brand-text mb-4">
              Why Choose Elevate?
            </h2>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="text-5xl mb-4">✅</div>
              <h3 className="text-xl font-bold mb-2">WIOA Approved</h3>
              <p className="text-brand-text-muted">
                Federally approved programs with funding available
              </p>
            </div>

            <div className="text-center">
              <div className="text-5xl mb-4">💼</div>
              <h3 className="text-xl font-bold mb-2">Job Placement</h3>
              <p className="text-brand-text-muted">
                Career support and job placement assistance
              </p>
            </div>

            <div className="text-center">
              <div className="text-5xl mb-4">🎓</div>
              <h3 className="text-xl font-bold mb-2">
                Industry Certifications
              </h3>
              <p className="text-brand-text-muted">
                Earn recognized credentials from top providers
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-16 bg-blue-900 text-white">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-4xl font-bold mb-4">
            Ready to Start Your Journey?
          </h2>
          <p className="text-xl mb-8">
            Check your eligibility for free training today
          </p>
          <Link
            to="/student"
            className="inline-block bg-yellow-500 text-black px-8 py-4 rounded-lg font-bold text-lg hover:bg-yellow-400 transition-colors"
          >
            Check Eligibility
          </Link>
        </div>
      </section>
    </>
  );
}
