/*
  Copyright (c) 2025 Elevate for Humanity
  Commercial License. No resale, sublicensing, or redistribution allowed.
  See LICENSE file for details.
*/

import React from "react";
import { Link } from "react-router-dom";
import { SEO } from "../lib/seo/SEO";

export default function LMSLanding() {
  const features = [
    { icon: "📚", title: "Course Management", description: "Create, organize, and deliver engaging course content" },
    { icon: "📝", title: "Assignments & Quizzes", description: "Build assessments with automatic grading" },
    { icon: "📊", title: "Grade Book", description: "Track student progress and performance" },
    { icon: "💬", title: "Discussion Forums", description: "Foster collaboration and peer learning" },
    { icon: "📹", title: "Video Lectures", description: "Upload and stream course videos" },
    { icon: "📄", title: "Document Library", description: "Share course materials and resources" },
    { icon: "📅", title: "Calendar & Deadlines", description: "Keep students on track with due dates" },
    { icon: "🎓", title: "Certificates", description: "Award completion certificates automatically" }
  ];

  const stats = [
    { number: "1,247", label: "Active Students" },
    { number: "68", label: "Courses Available" },
    { number: "42", label: "Instructors" },
    { number: "87%", label: "Completion Rate" }
  ];

  return (
    <div style={{ minHeight: '100vh', background: '#ffffff' }}>
      <SEO
        title="Learning Management System - Elevate for Humanity"
        description="Access courses, assignments, grades, and learning resources. Professional LMS platform for students and instructors."
        canonical={`${import.meta.env.VITE_SITE_URL || ""}/lms`}
      />

      {/* Header */}
      <header style={{
        background: 'linear-gradient(135deg, #1e40af 0%, #3b82f6 100%)',
        color: 'white',
        padding: '1.5rem 2rem',
        boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
      }}>
        <div style={{ maxWidth: '1400px', margin: '0 auto', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <div style={{ fontSize: '2rem' }}>🎓</div>
            <div>
              <h1 style={{ fontSize: '1.5rem', fontWeight: '700', margin: 0 }}>Elevate LMS</h1>
              <div style={{ fontSize: '0.875rem', opacity: 0.9 }}>Learning Management System</div>
            </div>
          </div>
          <div style={{ display: 'flex', gap: '1rem' }}>
            <Link 
              to="/student-dashboard"
              style={{
                padding: '0.75rem 1.5rem',
                background: 'white',
                color: '#1e40af',
                textDecoration: 'none',
                borderRadius: '6px',
                fontWeight: '600'
              }}
            >
              Student Login
            </Link>
            <Link 
              to="/instructor"
              style={{
                padding: '0.75rem 1.5rem',
                background: 'rgba(255,255,255,0.2)',
                color: 'white',
                textDecoration: 'none',
                borderRadius: '6px',
                fontWeight: '600',
                border: '2px solid white'
              }}
            >
              Instructor Login
            </Link>
          </div>
        </div>
      </header>

      <main>
        {/* Hero Section */}
        <section style={{
          background: 'linear-gradient(to bottom, #eff6ff 0%, #ffffff 100%)',
          padding: '5rem 2rem',
          textAlign: 'center'
        }}>
          <div style={{ maxWidth: '1000px', margin: '0 auto' }}>
            <h2 style={{
              fontSize: 'clamp(2.5rem, 5vw, 4rem)',
              fontWeight: '800',
              marginBottom: '1.5rem',
              color: '#1f2937',
              lineHeight: '1.1'
            }}>
              Your Complete Learning Platform
            </h2>
            <p style={{
              fontSize: 'clamp(1.125rem, 2.5vw, 1.5rem)',
              color: '#64748b',
              marginBottom: '3rem',
              maxWidth: '800px',
              margin: '0 auto 3rem'
            }}>
              Access courses, submit assignments, track your progress, and connect with instructors—all in one place.
            </p>

            {/* Quick Access Cards */}
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
              gap: '1.5rem',
              maxWidth: '900px',
              margin: '0 auto'
            }}>
              <Link
                to="/student-dashboard"
                style={{
                  background: 'white',
                  padding: '2rem',
                  borderRadius: '12px',
                  textDecoration: 'none',
                  boxShadow: '0 4px 15px rgba(0,0,0,0.08)',
                  border: '2px solid transparent',
                  transition: 'all 0.2s'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.borderColor = '#3b82f6';
                  e.currentTarget.style.transform = 'translateY(-4px)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.borderColor = 'transparent';
                  e.currentTarget.style.transform = 'translateY(0)';
                }}
              >
                <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>👨‍🎓</div>
                <h3 style={{ fontSize: '1.5rem', fontWeight: '600', color: '#1f2937', marginBottom: '0.5rem' }}>
                  Student Portal
                </h3>
                <p style={{ color: '#64748b', fontSize: '0.95rem' }}>
                  Access your courses, assignments, and grades
                </p>
              </Link>

              <Link
                to="/instructor"
                style={{
                  background: 'white',
                  padding: '2rem',
                  borderRadius: '12px',
                  textDecoration: 'none',
                  boxShadow: '0 4px 15px rgba(0,0,0,0.08)',
                  border: '2px solid transparent',
                  transition: 'all 0.2s'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.borderColor = '#7c3aed';
                  e.currentTarget.style.transform = 'translateY(-4px)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.borderColor = 'transparent';
                  e.currentTarget.style.transform = 'translateY(0)';
                }}
              >
                <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>👨‍🏫</div>
                <h3 style={{ fontSize: '1.5rem', fontWeight: '600', color: '#1f2937', marginBottom: '0.5rem' }}>
                  Instructor Portal
                </h3>
                <p style={{ color: '#64748b', fontSize: '0.95rem' }}>
                  Manage courses, grade assignments, track students
                </p>
              </Link>

              <Link
                to="/course-catalog"
                style={{
                  background: 'white',
                  padding: '2rem',
                  borderRadius: '12px',
                  textDecoration: 'none',
                  boxShadow: '0 4px 15px rgba(0,0,0,0.08)',
                  border: '2px solid transparent',
                  transition: 'all 0.2s'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.borderColor = '#10b981';
                  e.currentTarget.style.transform = 'translateY(-4px)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.borderColor = 'transparent';
                  e.currentTarget.style.transform = 'translateY(0)';
                }}
              >
                <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>📚</div>
                <h3 style={{ fontSize: '1.5rem', fontWeight: '600', color: '#1f2937', marginBottom: '0.5rem' }}>
                  Course Catalog
                </h3>
                <p style={{ color: '#64748b', fontSize: '0.95rem' }}>
                  Browse and enroll in available courses
                </p>
              </Link>
            </div>
          </div>
        </section>

        {/* Stats Section */}
        <section style={{ padding: '4rem 2rem', background: '#f8fafc' }}>
          <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
              gap: '2rem',
              textAlign: 'center'
            }}>
              {stats.map((stat, idx) => (
                <div key={idx}>
                  <div style={{
                    fontSize: '3.5rem',
                    fontWeight: '800',
                    color: '#1e40af',
                    marginBottom: '0.5rem'
                  }}>
                    {stat.number}
                  </div>
                  <div style={{ fontSize: '1.125rem', color: '#64748b', fontWeight: '600' }}>
                    {stat.label}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section style={{ padding: '5rem 2rem' }}>
          <div style={{ maxWidth: '1400px', margin: '0 auto' }}>
            <div style={{ textAlign: 'center', marginBottom: '4rem' }}>
              <h2 style={{
                fontSize: 'clamp(2rem, 4vw, 3rem)',
                fontWeight: '700',
                color: '#1f2937',
                marginBottom: '1rem'
              }}>
                Everything You Need to Learn & Teach
              </h2>
              <p style={{ fontSize: '1.25rem', color: '#64748b', maxWidth: '700px', margin: '0 auto' }}>
                Powerful tools for students and instructors to succeed
              </p>
            </div>

            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
              gap: '2rem'
            }}>
              {features.map((feature, idx) => (
                <div
                  key={idx}
                  style={{
                    background: 'white',
                    padding: '2rem',
                    borderRadius: '12px',
                    border: '1px solid #e2e8f0',
                    transition: 'all 0.2s'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.boxShadow = '0 8px 25px rgba(0,0,0,0.1)';
                    e.currentTarget.style.transform = 'translateY(-4px)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.boxShadow = 'none';
                    e.currentTarget.style.transform = 'translateY(0)';
                  }}
                >
                  <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>{feature.icon}</div>
                  <h3 style={{
                    fontSize: '1.25rem',
                    fontWeight: '600',
                    color: '#1f2937',
                    marginBottom: '0.75rem'
                  }}>
                    {feature.title}
                  </h3>
                  <p style={{ color: '#64748b', lineHeight: '1.6' }}>
                    {feature.description}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section style={{
          background: 'linear-gradient(135deg, #1e40af 0%, #7c3aed 100%)',
          color: 'white',
          padding: '5rem 2rem',
          textAlign: 'center'
        }}>
          <div style={{ maxWidth: '800px', margin: '0 auto' }}>
            <h2 style={{
              fontSize: 'clamp(2rem, 4vw, 3rem)',
              fontWeight: '700',
              marginBottom: '1.5rem'
            }}>
              Ready to Start Learning?
            </h2>
            <p style={{
              fontSize: '1.25rem',
              marginBottom: '2.5rem',
              opacity: 0.95
            }}>
              Join thousands of students advancing their education through our platform
            </p>
            <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', flexWrap: 'wrap' }}>
              <Link
                to="/student-dashboard"
                style={{
                  padding: '1.25rem 3rem',
                  background: 'white',
                  color: '#1e40af',
                  textDecoration: 'none',
                  borderRadius: '50px',
                  fontSize: '1.25rem',
                  fontWeight: 'bold',
                  boxShadow: '0 4px 15px rgba(255,255,255,0.3)'
                }}
              >
                Access Student Portal
              </Link>
              <Link
                to="/programs"
                style={{
                  padding: '1.25rem 3rem',
                  background: 'transparent',
                  color: 'white',
                  textDecoration: 'none',
                  borderRadius: '50px',
                  fontSize: '1.25rem',
                  fontWeight: 'bold',
                  border: '2px solid white'
                }}
              >
                Browse Programs
              </Link>
            </div>
          </div>
        </section>

        {/* Support Section */}
        <section style={{ padding: '4rem 2rem', background: '#f8fafc' }}>
          <div style={{ maxWidth: '1000px', margin: '0 auto', textAlign: 'center' }}>
            <h3 style={{ fontSize: '2rem', fontWeight: '700', color: '#1f2937', marginBottom: '2rem' }}>
              Need Help Getting Started?
            </h3>
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
              gap: '2rem'
            }}>
              <div>
                <div style={{ fontSize: '2.5rem', marginBottom: '1rem' }}>📖</div>
                <h4 style={{ fontSize: '1.25rem', fontWeight: '600', color: '#1f2937', marginBottom: '0.5rem' }}>
                  Student Guide
                </h4>
                <p style={{ color: '#64748b', marginBottom: '1rem' }}>
                  Learn how to navigate courses and submit assignments
                </p>
                <Link to="/student-handbook" style={{ color: '#3b82f6', fontWeight: '600', textDecoration: 'none' }}>
                  View Guide →
                </Link>
              </div>
              <div>
                <div style={{ fontSize: '2.5rem', marginBottom: '1rem' }}>💬</div>
                <h4 style={{ fontSize: '1.25rem', fontWeight: '600', color: '#1f2937', marginBottom: '0.5rem' }}>
                  Technical Support
                </h4>
                <p style={{ color: '#64748b', marginBottom: '1rem' }}>
                  Get help with login issues or technical problems
                </p>
                <Link to="/connect" style={{ color: '#3b82f6', fontWeight: '600', textDecoration: 'none' }}>
                  Contact Support →
                </Link>
              </div>
              <div>
                <div style={{ fontSize: '2.5rem', marginBottom: '1rem' }}>❓</div>
                <h4 style={{ fontSize: '1.25rem', fontWeight: '600', color: '#1f2937', marginBottom: '0.5rem' }}>
                  FAQs
                </h4>
                <p style={{ color: '#64748b', marginBottom: '1rem' }}>
                  Find answers to common questions
                </p>
                <Link to="/support" style={{ color: '#3b82f6', fontWeight: '600', textDecoration: 'none' }}>
                  View FAQs →
                </Link>
              </div>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}
