import React from 'react';
import { Link } from 'react-router-dom';

export function SereneComfortCare() {
  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#fff' }}>
      {/* Hero Section */}
      <div
        style={{
          background:
            'linear-gradient(135deg, var(--brand-success) 0%, var(--brand-success) 100%)',
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
            💚 Serene Comfort Care
          </h1>
          <p style={{ fontSize: '1.5rem', marginBottom: '2rem', opacity: 0.9 }}>
            Healthcare Services & Professional Training Programs
          </p>
          <p
            style={{
              fontSize: '1.125rem',
              marginBottom: '2rem',
              maxWidth: '800px',
              margin: '0 auto 2rem',
            }}
          >
            Providing compassionate care and training the next generation of
            healthcare professionals
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
              to="/serene-comfort-care/services"
              style={{
                padding: '1rem 2rem',
                backgroundColor: '#fff',
                color: 'var(--brand-success)',
                borderRadius: '0.5rem',
                fontWeight: '600',
                textDecoration: 'none',
                fontSize: '1.125rem',
              }}
            >
              Our Services
            </Link>
            <Link
              to="/serene-comfort-care/apply"
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
              Join Our Team
            </Link>
          </div>
        </div>
      </div>

      {/* Services Section */}
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
            Our Care Services
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
              <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>🏥</div>
              <h3
                style={{
                  fontSize: '1.5rem',
                  fontWeight: '600',
                  marginBottom: '1rem',
                }}
              >
                Home Health Care
              </h3>
              <p
                style={{ color: 'var(--brand-text-muted)', lineHeight: '1.6' }}
              >
                Professional in-home care services including nursing, personal
                care, and companionship
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
              <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>👴</div>
              <h3
                style={{
                  fontSize: '1.5rem',
                  fontWeight: '600',
                  marginBottom: '1rem',
                }}
              >
                Senior Care
              </h3>
              <p
                style={{ color: 'var(--brand-text-muted)', lineHeight: '1.6' }}
              >
                Specialized care for elderly patients with dignity, respect, and
                compassion
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
              <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>🩺</div>
              <h3
                style={{
                  fontSize: '1.5rem',
                  fontWeight: '600',
                  marginBottom: '1rem',
                }}
              >
                Medical Support
              </h3>
              <p
                style={{ color: 'var(--brand-text-muted)', lineHeight: '1.6' }}
              >
                Skilled nursing, medication management, and post-operative care
                services
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Training Programs Section */}
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
            Professional Training Programs
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
                title: 'Certified Nursing Assistant (CNA)',
                icon: '👩‍⚕️',
                desc: 'Comprehensive CNA training with state certification preparation',
              },
              {
                title: 'Home Health Aide (HHA)',
                icon: '🏠',
                desc: 'Professional home care training for in-home patient support',
              },
              {
                title: 'Medical Assistant',
                icon: '💉',
                desc: 'Clinical and administrative skills for medical office settings',
              },
              {
                title: 'Phlebotomy Technician',
                icon: '🩸',
                desc: 'Blood collection and laboratory specimen processing training',
              },
              {
                title: 'Patient Care Technician',
                icon: '❤️',
                desc: 'Advanced patient care skills for hospital and clinical settings',
              },
              {
                title: 'CPR & First Aid',
                icon: '🚑',
                desc: 'Life-saving emergency response and first aid certification',
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
                  to="/serene-comfort-care/apply"
                  style={{
                    color: 'var(--brand-success)',
                    fontWeight: '600',
                    textDecoration: 'none',
                  }}
                >
                  Apply Now →
                </Link>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Why Choose Us Section */}
      <div
        style={{
          backgroundColor: 'var(--brand-surface)',
          padding: '4rem 2rem',
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
            Why Choose Serene Comfort Care
          </h2>
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
              gap: '2rem',
            }}
          >
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>✨</div>
              <h3
                style={{
                  fontSize: '1.25rem',
                  fontWeight: '600',
                  marginBottom: '0.5rem',
                }}
              >
                Compassionate Care
              </h3>
              <p style={{ color: 'var(--brand-text-muted)' }}>
                Every patient receives personalized, dignified care
              </p>
            </div>
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>🎓</div>
              <h3
                style={{
                  fontSize: '1.25rem',
                  fontWeight: '600',
                  marginBottom: '0.5rem',
                }}
              >
                Expert Training
              </h3>
              <p style={{ color: 'var(--brand-text-muted)' }}>
                Learn from experienced healthcare professionals
              </p>
            </div>
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>📜</div>
              <h3
                style={{
                  fontSize: '1.25rem',
                  fontWeight: '600',
                  marginBottom: '0.5rem',
                }}
              >
                State Certified
              </h3>
              <p style={{ color: 'var(--brand-text-muted)' }}>
                All programs meet state certification requirements
              </p>
            </div>
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>💼</div>
              <h3
                style={{
                  fontSize: '1.25rem',
                  fontWeight: '600',
                  marginBottom: '0.5rem',
                }}
              >
                Job Placement
              </h3>
              <p style={{ color: 'var(--brand-text-muted)' }}>
                Connect with healthcare employers upon graduation
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* CTA Section */}
      <div
        style={{
          background:
            'linear-gradient(135deg, var(--brand-success) 0%, var(--brand-success) 100%)',
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
            Start Your Healthcare Career
          </h2>
          <p
            style={{ fontSize: '1.125rem', marginBottom: '2rem', opacity: 0.9 }}
          >
            Join Serene Comfort Care and make a difference in people's lives
            while building a rewarding career
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
              to="/serene-comfort-care/care-team"
              style={{
                padding: '1rem 2rem',
                backgroundColor: '#fff',
                color: 'var(--brand-success)',
                borderRadius: '0.5rem',
                fontWeight: '600',
                textDecoration: 'none',
                fontSize: '1.125rem',
              }}
            >
              Meet Our Team
            </Link>
            <Link
              to="/serene-comfort-care/apply"
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
              Apply Today
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
          © 2025 Serene Comfort Care. All rights reserved.
        </p>
        <p style={{ fontSize: '0.875rem', color: 'var(--brand-text-light)' }}>
          Part of the Elevate for Humanity Network
        </p>
      </div>
    </div>
  );
}

export default SereneComfortCare;
