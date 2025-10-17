/*
  Copyright (c) 2025 Elevate for Humanity
  Commercial License. No resale, sublicensing, or redistribution allowed.
  See LICENSE file for details.
*/

import React from 'react';
import { Link } from 'react-router-dom';
import AppLayout from '../layouts/AppLayout';
import { useAnalytics } from '../hooks/useAnalytics';

export default function About() {
  useAnalytics('About');

  return (
    <AppLayout title="About Us">
      <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '2rem' }}>
        {/* Hero Section */}
        <header
          style={{
            textAlign: 'center',
            marginBottom: '4rem',
            padding: '3rem 0',
            background:
              'linear-gradient(135deg, var(--brand-info) 0%, var(--brand-info) 100%)',
            borderRadius: '12px',
            color: 'white',
          }}
        >
          <h1
            style={{
              fontSize: '3rem',
              marginBottom: '1rem',
              fontWeight: '700',
            }}
          >
            About Elevate for Humanity
          </h1>
          <p
            style={{
              fontSize: '1.5rem',
              maxWidth: '800px',
              margin: '0 auto',
              opacity: 0.95,
            }}
          >
            Transforming lives through accessible education and Elevate
            Learn2Earn Workforce
          </p>
        </header>

        {/* Mission Section */}
        <section style={{ marginBottom: '4rem' }}>
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
              gap: '2rem',
            }}
          >
            <div
              style={{
                background: 'var(--brand-surface)',
                padding: '2rem',
                borderRadius: '8px',
              }}
            >
              <h2
                style={{
                  fontSize: '1.75rem',
                  marginBottom: '1rem',
                  color: 'var(--brand-info)',
                }}
              >
                Our Mission
              </h2>
              <p style={{ color: 'var(--brand-text)', lineHeight: '1.8' }}>
                To empower learners and communities through innovative,
                inclusive, and compliant online education that creates pathways
                to prosperity and meaningful careers.
              </p>
            </div>

            <div
              style={{
                background: '#f0fdf4',
                padding: '2rem',
                borderRadius: '8px',
              }}
            >
              <h2
                style={{
                  fontSize: '1.75rem',
                  marginBottom: '1rem',
                  color: 'var(--brand-success)',
                }}
              >
                Our Vision
              </h2>
              <p style={{ color: 'var(--brand-text)', lineHeight: '1.8' }}>
                A world where quality education and workforce training are
                accessible to all, regardless of background or circumstance,
                creating thriving communities.
              </p>
            </div>

            <div
              style={{
                background: '#fef3c7',
                padding: '2rem',
                borderRadius: '8px',
              }}
            >
              <h2
                style={{
                  fontSize: '1.75rem',
                  marginBottom: '1rem',
                  color: '#ca8a04',
                }}
              >
                Our Values
              </h2>
              <p style={{ color: 'var(--brand-text)', lineHeight: '1.8' }}>
                Excellence, accessibility, integrity, innovation, and community
                impact guide everything we do.
              </p>
            </div>
          </div>
        </section>

        {/* Story Section */}
        <section
          style={{
            marginBottom: '4rem',
            background: 'white',
            padding: '3rem',
            borderRadius: '8px',
            border: '1px solid var(--brand-border)',
          }}
        >
          <h2
            style={{
              fontSize: '2rem',
              marginBottom: '2rem',
              color: 'var(--brand-text)',
              textAlign: 'center',
            }}
          >
            Our Story
          </h2>
          <div style={{ maxWidth: '900px', margin: '0 auto' }}>
            <p
              style={{
                fontSize: '1.125rem',
                lineHeight: '1.8',
                color: 'var(--brand-text)',
                marginBottom: '1.5rem',
              }}
            >
              Founded by <strong>Elizabeth L. Greene</strong>, Elevate for
              Humanity emerged from a vision to create meaningful pathways to
              prosperity through education and Elevate Learn2Earn Workforce. As
              a certified Veteran-Owned Small Business, we understand the
              challenges faced by those seeking to transform their lives through
              education.
            </p>
            <p
              style={{
                fontSize: '1.125rem',
                lineHeight: '1.8',
                color: 'var(--brand-text)',
                marginBottom: '1.5rem',
              }}
            >
              In partnership with Selfish Inc. dba, we've built a
              government-compliant nonprofit dedicated to accessible,
              high-quality education. We are DOL, DWD, and DOE compliant,
              committed to transparency, accessibility, and student success.
            </p>
            <p
              style={{
                fontSize: '1.125rem',
                lineHeight: '1.8',
                color: 'var(--brand-text)',
              }}
            >
              Today, we serve over 1,200 learners annually, maintain an 87%
              graduation rate, and have distributed $2.85M in funding to support
              educational opportunities. Our 82% job placement rate demonstrates
              our commitment to real-world outcomes.
            </p>
          </div>
        </section>

        {/* What We Do */}
        <section style={{ marginBottom: '4rem' }}>
          <h2
            style={{
              fontSize: '2rem',
              marginBottom: '2rem',
              color: 'var(--brand-text)',
              textAlign: 'center',
            }}
          >
            What We Do
          </h2>
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
              gap: '2rem',
            }}
          >
            <ServiceCard
              icon="🎓"
              title="Education & Training"
              description="Comprehensive Elevate Learn2Earn Workforce programs, apprenticeships, and skills training designed to meet industry demands."
            />
            <ServiceCard
              icon="🏛️"
              title="Government Partnerships"
              description="Certified government contractor providing Elevate Learn2Earn Workforce and education services for federal, state, and local agencies."
            />
            <ServiceCard
              icon="💜"
              title="Philanthropy & Grants"
              description="Supporting communities through strategic giving, grant programs, and partnerships that create lasting social impact."
            />
            <ServiceCard
              icon="🤝"
              title="Community Impact"
              description="Building stronger communities through education, mentorship, and Elevate Learn2Earn Workforce initiatives."
            />
          </div>
        </section>

        {/* Certifications & Compliance */}
        <section
          style={{
            marginBottom: '4rem',
            background: 'var(--brand-surface)',
            padding: '3rem',
            borderRadius: '8px',
          }}
        >
          <h2
            style={{
              fontSize: '2rem',
              marginBottom: '2rem',
              color: 'var(--brand-text)',
              textAlign: 'center',
            }}
          >
            Certifications & Compliance
          </h2>
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
              gap: '2rem',
              textAlign: 'center',
            }}
          >
            <div>
              <div style={{ fontSize: '3rem', marginBottom: '0.5rem' }}>🎖️</div>
              <div style={{ fontWeight: '600', color: 'var(--brand-text)' }}>
                Veteran-Owned
              </div>
              <div
                style={{
                  fontSize: '0.875rem',
                  color: 'var(--brand-text-muted)',
                }}
              >
                Small Business
              </div>
            </div>
            <div>
              <div style={{ fontSize: '3rem', marginBottom: '0.5rem' }}>✅</div>
              <div style={{ fontWeight: '600', color: 'var(--brand-text)' }}>
                DOL Compliant
              </div>
              <div
                style={{
                  fontSize: '0.875rem',
                  color: 'var(--brand-text-muted)',
                }}
              >
                Department of Labor
              </div>
            </div>
            <div>
              <div style={{ fontSize: '3rem', marginBottom: '0.5rem' }}>✅</div>
              <div style={{ fontWeight: '600', color: 'var(--brand-text)' }}>
                DWD Compliant
              </div>
              <div
                style={{
                  fontSize: '0.875rem',
                  color: 'var(--brand-text-muted)',
                }}
              >
                Elevate Learn2Earn Workforce
              </div>
            </div>
            <div>
              <div style={{ fontSize: '3rem', marginBottom: '0.5rem' }}>✅</div>
              <div style={{ fontWeight: '600', color: 'var(--brand-text)' }}>
                DOE Compliant
              </div>
              <div
                style={{
                  fontSize: '0.875rem',
                  color: 'var(--brand-text-muted)',
                }}
              >
                Department of Education
              </div>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section
          style={{
            textAlign: 'center',
            background:
              'linear-gradient(135deg, var(--brand-info) 0%, var(--brand-info) 100%)',
            padding: '3rem',
            borderRadius: '12px',
            color: 'white',
          }}
        >
          <h2 style={{ fontSize: '2rem', marginBottom: '1rem' }}>
            Ready to Get Started?
          </h2>
          <p
            style={{ fontSize: '1.25rem', marginBottom: '2rem', opacity: 0.95 }}
          >
            Join thousands of learners transforming their lives through
            education
          </p>
          <div
            style={{
              display: 'flex',
              gap: '1rem',
              justifyContent: 'center',
              flexWrap: 'wrap',
            }}
          >
            <Link
              to="/programs"
              style={{
                padding: '1rem 2rem',
                backgroundColor: 'white',
                color: 'var(--brand-info)',
                textDecoration: 'none',
                borderRadius: '6px',
                fontWeight: '600',
                fontSize: '1.125rem',
              }}
            >
              View Programs
            </Link>
            <Link
              to="/connect"
              style={{
                padding: '1rem 2rem',
                backgroundColor: 'transparent',
                color: 'white',
                textDecoration: 'none',
                borderRadius: '6px',
                fontWeight: '600',
                fontSize: '1.125rem',
                border: '2px solid white',
              }}
            >
              Contact Us
            </Link>
          </div>
        </section>
      </div>
    </AppLayout>
  );
}

function ServiceCard({ icon, title, description }) {
  return (
    <div
      style={{
        background: 'white',
        padding: '2rem',
        borderRadius: '8px',
        border: '1px solid var(--brand-border)',
        textAlign: 'center',
      }}
    >
      <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>{icon}</div>
      <h3
        style={{
          fontSize: '1.25rem',
          marginBottom: '0.75rem',
          color: 'var(--brand-text)',
        }}
      >
        {title}
      </h3>
      <p style={{ color: 'var(--brand-text-muted)', lineHeight: '1.6' }}>
        {description}
      </p>
    </div>
  );
}
