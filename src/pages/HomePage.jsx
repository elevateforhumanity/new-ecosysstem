/*
  Copyright (c) 2025 Elevate for Humanity
  Commercial License. No resale, sublicensing, or redistribution allowed.
  See LICENSE file for details.
*/

import React from "react";
import { Link } from "react-router-dom";
import { SEO } from "../lib/seo/SEO";
import Header from "../components/Header";
import Footer from "../components/Footer";

export default function HomePage() {
  const productivityApps = [
    { name: "Sheets", icon: "📊", path: "/sheets", description: "Powerful spreadsheets with real-time collaboration" },
    { name: "Slides", icon: "📽️", path: "/slides", description: "Create stunning presentations" },
    { name: "Docs", icon: "📝", path: "/docs", description: "Word processing with smart editing" },
    { name: "Email", icon: "📧", path: "/email", description: "Professional email management" },
    { name: "Calendar", icon: "📅", path: "/calendar", description: "Schedule and organize your time" },
    { name: "Video Meetings", icon: "🎥", path: "/meet", description: "HD video conferencing" },
    { name: "File Manager", icon: "📁", path: "/drive", description: "Cloud storage and file sharing" },
    { name: "AI Tutor", icon: "🤖", path: "/a-i-tutor", description: "Personal AI learning assistant" },
    { name: "NotebookLM", icon: "📓", path: "/notebook-l-m", description: "AI-powered note taking" },
    { name: "Elevate Brain", icon: "🧠", path: "/elevate-brain", description: "AI knowledge assistant" }
  ];

  const trainingPrograms = [
    { name: "Construction Pre-Apprenticeship", duration: "12-16 weeks", icon: "🏗️", credentials: "OSHA 10, NCCER Core, Forklift", placement: "95%" },
    { name: "Phlebotomy Technician", duration: "8-10 weeks", icon: "🩺", credentials: "National Certification", placement: "92%" },
    { name: "CDL Truck Driving", duration: "4-8 weeks", icon: "🚛", credentials: "CDL Class A", placement: "98%" },
    { name: "CPR Instructor", duration: "4-6 weeks", icon: "❤️", credentials: "AHA Certification", placement: "90%" },
    { name: "Drug Testing Collector", duration: "2-4 weeks", icon: "🧪", credentials: "DOT Certified", placement: "88%" },
    { name: "Financial Literacy", duration: "6-8 weeks", icon: "💰", credentials: "Certificate", placement: "85%" },
    { name: "Music & Dance Arts", duration: "12-16 weeks", icon: "🎵", credentials: "Arts Certificate", placement: "82%" }
  ];

  return (
    <div style={{ minHeight: '100vh', background: '#ffffff' }}>
      <SEO
        title="Elevate for Humanity - FREE Productivity Suite & Training Programs"
        description="Access free productivity tools (Sheets, Slides, Docs, Video Meetings) and get FREE job training in Construction, Healthcare, CDL, and more. Marion County, IN."
        canonical={`${import.meta.env.VITE_SITE_URL || ""}/`}
      />
      <Header />
      
      <main id="main-content">
        {/* Hero Section */}
        <section style={{ background: 'linear-gradient(135deg, #1e40af 0%, #7c3aed 100%)', color: 'white', padding: '5rem 2rem', textAlign: 'center' }}>
          <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
            <div style={{ display: 'inline-block', background: 'rgba(255,255,255,0.2)', padding: '0.5rem 1.5rem', borderRadius: '50px', marginBottom: '1.5rem', fontSize: '0.9rem', fontWeight: '600' }}>
              🎓 Marion County, IN • 100% FREE Programs
            </div>
            
            <h1 style={{ fontSize: 'clamp(2.5rem, 6vw, 5rem)', marginBottom: '1.5rem', fontWeight: '800', lineHeight: '1.1' }}>
              Empowering People.<br/>Elevating Communities.
            </h1>
            
            <p style={{ fontSize: 'clamp(1.2rem, 3vw, 1.8rem)', marginBottom: '2rem', opacity: 0.95, maxWidth: '900px', margin: '0 auto 2rem' }}>
              We connect education, employment, and entrepreneurship through workforce innovation and philanthropy. ETPL provider and DOL apprenticeship sponsor.
            </p>

            <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', flexWrap: 'wrap', marginBottom: '3rem' }}>
              <Link to="/programs" style={{ padding: '1.25rem 3rem', background: '#10b981', color: 'white', textDecoration: 'none', borderRadius: '50px', fontSize: '1.25rem', fontWeight: 'bold', boxShadow: '0 8px 20px rgba(16,185,129,0.4)' }}>
                Explore Programs
              </Link>
              <Link to="/connect" style={{ padding: '1.25rem 3rem', background: 'rgba(255,255,255,0.2)', color: 'white', textDecoration: 'none', borderRadius: '50px', fontSize: '1.25rem', fontWeight: 'bold', border: '2px solid white' }}>
                Partner With Us
              </Link>
              <Link to="/get-started" style={{ padding: '1.25rem 3rem', background: 'white', color: '#1e40af', textDecoration: 'none', borderRadius: '50px', fontSize: '1.25rem', fontWeight: 'bold', boxShadow: '0 8px 20px rgba(255,255,255,0.3)' }}>
                Apply Now
              </Link>
            </div>

            {/* Stats */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '2rem', maxWidth: '900px', margin: '0 auto' }}>
              <div><div style={{ fontSize: '3rem', fontWeight: 'bold', color: '#fbbf24' }}>1,247</div><div style={{ fontSize: '1rem', opacity: 0.9 }}>Students Trained</div></div>
              <div><div style={{ fontSize: '3rem', fontWeight: 'bold', color: '#fbbf24' }}>92%</div><div style={{ fontSize: '1rem', opacity: 0.9 }}>Job Placement Rate</div></div>
              <div><div style={{ fontSize: '3rem', fontWeight: 'bold', color: '#fbbf24' }}>$2.85M</div><div style={{ fontSize: '1rem', opacity: 0.9 }}>Funding Distributed</div></div>
              <div><div style={{ fontSize: '3rem', fontWeight: 'bold', color: '#fbbf24' }}>100%</div><div style={{ fontSize: '1rem', opacity: 0.9 }}>FREE to Students</div></div>
            </div>
          </div>
        </section>

        {/* Productivity Suite */}
        <section style={{ padding: '5rem 2rem', background: '#f8fafc' }}>
          <div style={{ maxWidth: '1400px', margin: '0 auto' }}>
            <div style={{ textAlign: 'center', marginBottom: '3rem' }}>
              <h2 style={{ fontSize: 'clamp(2rem, 4vw, 3.5rem)', marginBottom: '1rem', color: '#1f2937', fontWeight: '700' }}>FREE Productivity Suite</h2>
              <p style={{ fontSize: '1.25rem', color: '#64748b', maxWidth: '700px', margin: '0 auto' }}>Professional tools for work, school, and life. No subscription. No limits.</p>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '1.5rem' }}>
              {productivityApps.map((app, idx) => (
                <Link key={idx} to={app.path} style={{ background: 'white', padding: '2rem', borderRadius: '12px', textDecoration: 'none', border: '1px solid #e2e8f0', transition: 'all 0.2s', display: 'block' }}>
                  <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>{app.icon}</div>
                  <h3 style={{ fontSize: '1.5rem', marginBottom: '0.5rem', color: '#1f2937', fontWeight: '600' }}>{app.name}</h3>
                  <p style={{ color: '#64748b', fontSize: '0.95rem' }}>{app.description}</p>
                </Link>
              ))}
            </div>

            <div style={{ textAlign: 'center', marginTop: '3rem' }}>
              <div style={{ display: 'inline-block', background: '#dcfce7', color: '#166534', padding: '1rem 2rem', borderRadius: '12px', fontWeight: '600', fontSize: '1.125rem' }}>
                ✅ All tools are 100% FREE • No credit card required • Unlimited use
              </div>
            </div>
          </div>
        </section>

        {/* Training Programs */}
        <section style={{ padding: '5rem 2rem', background: 'white' }}>
          <div style={{ maxWidth: '1400px', margin: '0 auto' }}>
            <div style={{ textAlign: 'center', marginBottom: '3rem' }}>
              <h2 style={{ fontSize: 'clamp(2rem, 4vw, 3.5rem)', marginBottom: '1rem', color: '#1f2937', fontWeight: '700' }}>FREE Job Training Programs</h2>
              <p style={{ fontSize: '1.25rem', color: '#64748b', maxWidth: '800px', margin: '0 auto' }}>Get certified in high-demand careers. Funded by WIOA, DOL, and state grants. You pay nothing.</p>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '2rem' }}>
              {trainingPrograms.map((program, idx) => (
                <div key={idx} style={{ background: 'linear-gradient(135deg, #ffffff 0%, #f8fafc 100%)', padding: '2rem', borderRadius: '16px', border: '2px solid #e2e8f0', position: 'relative' }}>
                  <div style={{ position: 'absolute', top: '1rem', right: '1rem', background: '#dcfce7', color: '#166534', padding: '0.5rem 1rem', borderRadius: '20px', fontSize: '0.875rem', fontWeight: '700' }}>
                    {program.placement} Placement
                  </div>
                  <div style={{ fontSize: '4rem', marginBottom: '1rem' }}>{program.icon}</div>
                  <h3 style={{ fontSize: '1.5rem', marginBottom: '0.75rem', color: '#1f2937', fontWeight: '600' }}>{program.name}</h3>
                  <div style={{ marginBottom: '1rem' }}>
                    <div style={{ fontSize: '0.875rem', color: '#64748b', marginBottom: '0.5rem' }}>⏱️ Duration: <strong>{program.duration}</strong></div>
                    <div style={{ fontSize: '0.875rem', color: '#64748b' }}>🎓 Earn: <strong>{program.credentials}</strong></div>
                  </div>
                  <Link to="/programs" style={{ display: 'block', textAlign: 'center', padding: '0.875rem', background: '#1e40af', color: 'white', textDecoration: 'none', borderRadius: '8px', fontWeight: '600', marginTop: '1rem' }}>
                    Learn More & Enroll
                  </Link>
                </div>
              ))}
            </div>

            <div style={{ marginTop: '4rem', background: '#fef3c7', padding: '2.5rem', borderRadius: '16px', textAlign: 'center' }}>
              <h3 style={{ fontSize: '2rem', marginBottom: '1rem', color: '#92400e', fontWeight: '700' }}>💰 Funding Available</h3>
              <p style={{ fontSize: '1.125rem', color: '#78350f', marginBottom: '1.5rem' }}>Programs funded by: WIOA • WRG • OJT • WEX • JRI • DOL • State Grants</p>
              <div style={{ display: 'inline-block', background: '#92400e', color: '#fef3c7', padding: '1rem 2.5rem', borderRadius: '50px', fontWeight: '700', fontSize: '1.25rem' }}>
                You Pay: $0.00
              </div>
            </div>
          </div>
        </section>

        {/* How It Works */}
        <section style={{ padding: '5rem 2rem', background: '#f8fafc' }}>
          <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
            <h2 style={{ fontSize: 'clamp(2rem, 4vw, 3.5rem)', marginBottom: '3rem', color: '#1f2937', fontWeight: '700', textAlign: 'center' }}>How It Works</h2>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '2rem' }}>
              <div style={{ textAlign: 'center' }}>
                <div style={{ width: '80px', height: '80px', background: '#1e40af', color: 'white', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '2rem', fontWeight: 'bold', margin: '0 auto 1.5rem' }}>1</div>
                <h3 style={{ fontSize: '1.5rem', marginBottom: '0.75rem', color: '#1f2937' }}>Choose Your Path</h3>
                <p style={{ color: '#64748b' }}>Browse programs and select the career that interests you</p>
              </div>
              <div style={{ textAlign: 'center' }}>
                <div style={{ width: '80px', height: '80px', background: '#7c3aed', color: 'white', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '2rem', fontWeight: 'bold', margin: '0 auto 1.5rem' }}>2</div>
                <h3 style={{ fontSize: '1.5rem', marginBottom: '0.75rem', color: '#1f2937' }}>Get Funded</h3>
                <p style={{ color: '#64748b' }}>We help you access grants and funding - you pay nothing</p>
              </div>
              <div style={{ textAlign: 'center' }}>
                <div style={{ width: '80px', height: '80px', background: '#10b981', color: 'white', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '2rem', fontWeight: 'bold', margin: '0 auto 1.5rem' }}>3</div>
                <h3 style={{ fontSize: '1.5rem', marginBottom: '0.75rem', color: '#1f2937' }}>Get Trained</h3>
                <p style={{ color: '#64748b' }}>Complete hands-on training and earn industry certifications</p>
              </div>
              <div style={{ textAlign: 'center' }}>
                <div style={{ width: '80px', height: '80px', background: '#ef4444', color: 'white', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '2rem', fontWeight: 'bold', margin: '0 auto 1.5rem' }}>4</div>
                <h3 style={{ fontSize: '1.5rem', marginBottom: '0.75rem', color: '#1f2937' }}>Get Hired</h3>
                <p style={{ color: '#64748b' }}>Job placement assistance connects you with employers</p>
              </div>
            </div>
          </div>
        </section>

        {/* Final CTA */}
        <section style={{ background: 'linear-gradient(135deg, #1e40af 0%, #7c3aed 100%)', color: 'white', padding: '5rem 2rem', textAlign: 'center' }}>
          <div style={{ maxWidth: '900px', margin: '0 auto' }}>
            <h2 style={{ fontSize: 'clamp(2rem, 4vw, 3.5rem)', marginBottom: '1.5rem', fontWeight: '700' }}>Ready to Transform Your Future?</h2>
            <p style={{ fontSize: '1.5rem', marginBottom: '3rem', opacity: 0.95 }}>Join 1,247 students who've already started their journey to better careers</p>
            <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', flexWrap: 'wrap' }}>
              <Link to="/programs" style={{ padding: '1.25rem 3rem', background: 'white', color: '#1e40af', textDecoration: 'none', borderRadius: '50px', fontSize: '1.25rem', fontWeight: 'bold' }}>Enroll in Training</Link>
              <Link to="/connect" style={{ padding: '1.25rem 3rem', background: 'transparent', color: 'white', textDecoration: 'none', borderRadius: '50px', fontSize: '1.25rem', fontWeight: 'bold', border: '2px solid white' }}>Contact Us</Link>
            </div>
          </div>
        </section>
      </main>
      
      <Footer />
    </div>
  );
}
