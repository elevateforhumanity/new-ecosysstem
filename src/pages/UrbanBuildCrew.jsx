import React from 'react';
import { Link } from 'react-router-dom';

export function UrbanBuildCrew() {
  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#fff' }}>
      {/* Hero Section */}
      <div
        style={{
          background:
            'linear-gradient(135deg, var(--brand-warning) 0%, var(--brand-warning-hover) 100%)',
          color: '#fff',
          padding: '4rem 2rem',
          textAlign: 'center',
        }}
      >
        <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
          <h1
            style={{
              fontSize: '3rem',
              fontWeight: '700',
              marginBottom: '1rem',
            }}
          >
            🏗️ Urban Build Crew
          </h1>
          <p style={{ fontSize: '1.5rem', marginBottom: '2rem', opacity: 0.9 }}>
            Construction, Trades & Urban Elevate Learn2Earn Workforce
          </p>
          <p
            style={{
              fontSize: '1.125rem',
              marginBottom: '2rem',
              maxWidth: '800px',
              margin: '0 auto 2rem',
            }}
          >
            Building careers in construction and skilled trades through hands-on
            training and real-world experience
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
              to="/urban-build-crew/courses"
              style={{
                padding: '1rem 2rem',
                backgroundColor: '#fff',
                color: 'var(--brand-warning)',
                borderRadius: '0.5rem',
                fontWeight: '600',
                textDecoration: 'none',
                fontSize: '1.125rem',
              }}
            >
              View Courses
            </Link>
            <Link
              to="/urban-build-crew/contact"
              style={{
                padding: '1rem 2rem',
                backgroundColor: 'rgba(255,255,255,0.2)',
                color: '#fff',
                border: '2px solid #fff',
                borderRadius: '0.5rem',
                fontWeight: '600',
                textDecoration: 'none',
                fontSize: '1.125rem',
              }}
            >
              Get Started
            </Link>
          </div>
        </div>
      </div>

      {/* Features Section */}
      <div
        style={{
          padding: '4rem 2rem',
          backgroundColor: 'var(--brand-surface)',
        }}
      >
        <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
          <h2
            style={{
              fontSize: '2rem',
              fontWeight: '700',
              textAlign: 'center',
              marginBottom: '3rem',
            }}
          >
            What We Offer
          </h2>
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
              gap: '2rem',
            }}
          >
            <div
              style={{
                backgroundColor: '#fff',
                padding: '2rem',
                borderRadius: '0.5rem',
                boxShadow: '0 4px 6px rgba(0,0,0,0.1)',
              }}
            >
              <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>🔨</div>
              <h3
                style={{
                  fontSize: '1.5rem',
                  fontWeight: '600',
                  marginBottom: '1rem',
                }}
              >
                Hands-On Training
              </h3>
              <p
                style={{ color: 'var(--brand-text-muted)', lineHeight: '1.6' }}
              >
                Learn construction and trade skills through real-world projects
                and experienced instructors
              </p>
            </div>
            <div
              style={{
                backgroundColor: '#fff',
                padding: '2rem',
                borderRadius: '0.5rem',
                boxShadow: '0 4px 6px rgba(0,0,0,0.1)',
              }}
            >
              <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>📜</div>
              <h3
                style={{
                  fontSize: '1.5rem',
                  fontWeight: '600',
                  marginBottom: '1rem',
                }}
              >
                Industry Certifications
              </h3>
              <p
                style={{ color: 'var(--brand-text-muted)', lineHeight: '1.6' }}
              >
                Earn recognized certifications in OSHA, welding, electrical,
                plumbing, and more
              </p>
            </div>
            <div
              style={{
                backgroundColor: '#fff',
                padding: '2rem',
                borderRadius: '0.5rem',
                boxShadow: '0 4px 6px rgba(0,0,0,0.1)',
              }}
            >
              <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>💼</div>
              <h3
                style={{
                  fontSize: '1.5rem',
                  fontWeight: '600',
                  marginBottom: '1rem',
                }}
              >
                Job Placement
              </h3>
              <p
                style={{ color: 'var(--brand-text-muted)', lineHeight: '1.6' }}
              >
                Connect with local contractors and construction companies for
                immediate employment opportunities
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Programs Section */}
      <div style={{ padding: '4rem 2rem' }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
          <h2
            style={{
              fontSize: '2rem',
              fontWeight: '700',
              textAlign: 'center',
              marginBottom: '3rem',
            }}
          >
            Training Programs
          </h2>
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(350px, 1fr))',
              gap: '2rem',
            }}
          >
            {[
              {
                title: 'General Construction',
                icon: '🏗️',
                desc: 'Foundation skills in construction, safety, and project management',
              },
              {
                title: 'Electrical Systems',
                icon: '⚡',
                desc: 'Residential and commercial electrical installation and maintenance',
              },
              {
                title: 'Plumbing & HVAC',
                icon: '🔧',
                desc: 'Plumbing systems, HVAC installation, and climate control',
              },
              {
                title: 'Carpentry & Framing',
                icon: '🪚',
                desc: 'Woodworking, framing, finish carpentry, and cabinetry',
              },
              {
                title: 'Welding & Metalwork',
                icon: '🔥',
                desc: 'MIG, TIG, and stick welding with metal fabrication',
              },
              {
                title: 'Heavy Equipment',
                icon: '🚜',
                desc: 'Operation and maintenance of construction machinery',
              },
            ].map((program, i) => (
              <div
                key={i}
                style={{
                  border: '1px solid var(--brand-border)',
                  borderRadius: '0.5rem',
                  padding: '2rem',
                }}
              >
                <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>
                  {program.icon}
                </div>
                <h3
                  style={{
                    fontSize: '1.5rem',
                    fontWeight: '600',
                    marginBottom: '1rem',
                  }}
                >
                  {program.title}
                </h3>
                <p
                  style={{
                    color: 'var(--brand-text-muted)',
                    marginBottom: '1.5rem',
                    lineHeight: '1.6',
                  }}
                >
                  {program.desc}
                </p>
                <Link
                  to="/urban-build-crew/courses"
                  style={{
                    color: 'var(--brand-warning)',
                    fontWeight: '600',
                    textDecoration: 'none',
                  }}
                >
                  Learn More →
                </Link>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Stats Section */}
      <div
        style={{
          backgroundColor: 'var(--brand-surface)',
          padding: '4rem 2rem',
        }}
      >
        <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
              gap: '2rem',
              textAlign: 'center',
            }}
          >
            <div>
              <div
                style={{
                  fontSize: '3rem',
                  fontWeight: '700',
                  color: 'var(--brand-warning)',
                  marginBottom: '0.5rem',
                }}
              >
                500+
              </div>
              <div
                style={{
                  color: 'var(--brand-text-muted)',
                  fontSize: '1.125rem',
                }}
              >
                Graduates Placed
              </div>
            </div>
            <div>
              <div
                style={{
                  fontSize: '3rem',
                  fontWeight: '700',
                  color: 'var(--brand-warning)',
                  marginBottom: '0.5rem',
                }}
              >
                95%
              </div>
              <div
                style={{
                  color: 'var(--brand-text-muted)',
                  fontSize: '1.125rem',
                }}
              >
                Job Placement Rate
              </div>
            </div>
            <div>
              <div
                style={{
                  fontSize: '3rem',
                  fontWeight: '700',
                  color: 'var(--brand-warning)',
                  marginBottom: '0.5rem',
                }}
              >
                $45K
              </div>
              <div
                style={{
                  color: 'var(--brand-text-muted)',
                  fontSize: '1.125rem',
                }}
              >
                Average Starting Salary
              </div>
            </div>
            <div>
              <div
                style={{
                  fontSize: '3rem',
                  fontWeight: '700',
                  color: 'var(--brand-warning)',
                  marginBottom: '0.5rem',
                }}
              >
                50+
              </div>
              <div
                style={{
                  color: 'var(--brand-text-muted)',
                  fontSize: '1.125rem',
                }}
              >
                Partner Companies
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* CTA Section */}
      <div
        style={{
          background:
            'linear-gradient(135deg, var(--brand-warning) 0%, var(--brand-warning-hover) 100%)',
          color: '#fff',
          padding: '4rem 2rem',
          textAlign: 'center',
        }}
      >
        <div style={{ maxWidth: '800px', margin: '0 auto' }}>
          <h2
            style={{
              fontSize: '2rem',
              fontWeight: '700',
              marginBottom: '1rem',
            }}
          >
            Start Building Your Career Today
          </h2>
          <p
            style={{ fontSize: '1.125rem', marginBottom: '2rem', opacity: 0.9 }}
          >
            Join Urban Build Crew and gain the skills you need for a successful
            career in construction
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
              to="/urban-build-crew/about"
              style={{
                padding: '1rem 2rem',
                backgroundColor: '#fff',
                color: 'var(--brand-warning)',
                borderRadius: '0.5rem',
                fontWeight: '600',
                textDecoration: 'none',
                fontSize: '1.125rem',
              }}
            >
              About Us
            </Link>
            <Link
              to="/urban-build-crew/contact"
              style={{
                padding: '1rem 2rem',
                backgroundColor: 'rgba(255,255,255,0.2)',
                color: '#fff',
                border: '2px solid #fff',
                borderRadius: '0.5rem',
                fontWeight: '600',
                textDecoration: 'none',
                fontSize: '1.125rem',
              }}
            >
              Apply Now
            </Link>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div
        style={{
          backgroundColor: 'var(--brand-text)',
          color: '#fff',
          padding: '2rem',
          textAlign: 'center',
        }}
      >
        <p style={{ marginBottom: '0.5rem' }}>
          © 2025 Urban Build Crew. All rights reserved.
        </p>
        <p style={{ fontSize: '0.875rem', color: 'var(--brand-text-light)' }}>
          Part of the Elevate for Humanity Network
        </p>
      </div>
    </div>
  );
}

export default UrbanBuildCrew;
