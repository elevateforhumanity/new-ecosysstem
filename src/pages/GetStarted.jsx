import React from 'react';
import { Link } from 'react-router-dom';

/**
 * GetStarted Page - Onboarding hub for all user types
 */
export function GetStarted() {
  const roles = [
    {
      title: 'Teachers',
      icon: '👨‍🏫',
      description: 'Create courses, manage assignments, and engage students',
      quickStart: [
        'Create your first course',
        'Add students to your class',
        'Create an assignment',
        'Schedule a virtual class',
      ],
      resources: [
        { name: 'Teacher Quick Start Guide', url: '/resources/teacher-guide' },
        { name: 'Video Tutorials', url: '/training/videos' },
        { name: 'Lesson Plan Templates', url: '/resources/templates' },
        { name: 'Teacher Community', url: '/community/teachers' },
      ],
    },
    {
      title: 'Students',
      icon: '🎓',
      description: 'Access courses, submit assignments, and collaborate',
      quickStart: [
        'Join your first class',
        'Complete your profile',
        'Submit an assignment',
        'Join a study group',
      ],
      resources: [
        { name: 'Student Guide', url: '/resources/student-guide' },
        { name: 'Mobile App Tutorial', url: '/training/mobile' },
        { name: 'Study Tips', url: '/resources/study-tips' },
        { name: 'Student Help Center', url: '/support/students' },
      ],
    },
    {
      title: 'Administrators',
      icon: '🏢',
      description: 'Manage users, configure settings, and monitor usage',
      quickStart: [
        'Set up your institution',
        'Add users and assign roles',
        'Configure security policies',
        'View analytics dashboard',
      ],
      resources: [
        { name: 'Admin Setup Guide', url: '/resources/admin-guide' },
        { name: 'Security Best Practices', url: '/resources/security' },
        { name: 'Billing & Licensing', url: '/admin/billing' },
        { name: 'Technical Documentation', url: '/docs' },
      ],
    },
    {
      title: 'Parents',
      icon: '👨‍👩‍👧',
      description: 'Monitor progress, communicate with teachers, stay informed',
      quickStart: [
        'Create parent account',
        'Link to student account',
        'View grades and progress',
        'Message teachers',
      ],
      resources: [
        { name: 'Parent Portal Guide', url: '/resources/parent-guide' },
        { name: 'Progress Monitoring', url: '/parent/progress' },
        { name: 'Communication Tools', url: '/parent/messages' },
        { name: 'Parent Community', url: '/community/parents' },
      ],
    },
  ];

  return (
    <div
      style={{ minHeight: '100vh', backgroundColor: 'var(--brand-surface)' }}
    >
      {/* Hero Section */}
      <div
        style={{
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          color: '#fff',
          padding: '4rem 2rem',
          textAlign: 'center',
        }}
      >
        <h1
          style={{ fontSize: '3rem', marginBottom: '1rem', fontWeight: '700' }}
        >
          Get Started with Elevate
        </h1>
        <p
          style={{
            fontSize: '1.25rem',
            maxWidth: '800px',
            margin: '0 auto',
            opacity: 0.9,
          }}
        >
          Everything you need to start teaching, learning, and collaborating
        </p>
      </div>

      {/* Quick Start by Role */}
      <div
        style={{ maxWidth: '1400px', margin: '0 auto', padding: '4rem 2rem' }}
      >
        <h2
          style={{
            fontSize: '2rem',
            marginBottom: '2rem',
            textAlign: 'center',
          }}
        >
          Choose Your Role to Get Started
        </h2>

        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
            gap: '2rem',
          }}
        >
          {roles.map((role, index) => (
            <div
              key={index}
              style={{
                backgroundColor: '#fff',
                borderRadius: '0.75rem',
                padding: '2rem',
                boxShadow: '0 4px 6px rgba(0,0,0,0.1)',
                transition: 'transform 0.2s, box-shadow 0.2s',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'translateY(-4px)';
                e.currentTarget.style.boxShadow =
                  '0 12px 24px rgba(0,0,0,0.15)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.boxShadow = '0 4px 6px rgba(0,0,0,0.1)';
              }}
            >
              <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>
                {role.icon}
              </div>
              <h3 style={{ fontSize: '1.5rem', marginBottom: '0.5rem' }}>
                {role.title}
              </h3>
              <p
                style={{
                  color: 'var(--brand-text-muted)',
                  marginBottom: '1.5rem',
                }}
              >
                {role.description}
              </p>

              <div style={{ marginBottom: '1.5rem' }}>
                <h4
                  style={{
                    fontSize: '1rem',
                    marginBottom: '0.75rem',
                    fontWeight: '600',
                  }}
                >
                  Quick Start Steps:
                </h4>
                <ol
                  style={{ paddingLeft: '1.5rem', color: 'var(--brand-text)' }}
                >
                  {role.quickStart.map((step, i) => (
                    <li key={i} style={{ marginBottom: '0.5rem' }}>
                      {step}
                    </li>
                  ))}
                </ol>
              </div>

              <div>
                <h4
                  style={{
                    fontSize: '1rem',
                    marginBottom: '0.75rem',
                    fontWeight: '600',
                  }}
                >
                  Resources:
                </h4>
                <div
                  style={{
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '0.5rem',
                  }}
                >
                  {role.resources.map((resource, i) => (
                    <Link
                      key={i}
                      to={resource.url}
                      style={{
                        color: 'var(--brand-info)',
                        textDecoration: 'none',
                        fontSize: '0.875rem',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.5rem',
                      }}
                    >
                      <span>→</span>
                      {resource.name}
                    </Link>
                  ))}
                </div>
              </div>

              <button
                style={{
                  width: '100%',
                  marginTop: '1.5rem',
                  padding: '0.75rem',
                  backgroundColor: 'var(--brand-info)',
                  color: '#fff',
                  border: 'none',
                  borderRadius: '0.5rem',
                  fontSize: '1rem',
                  fontWeight: '600',
                  cursor: 'pointer',
                }}
              >
                Start as {role.title.slice(0, -1)}
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Training & Certification */}
      <div style={{ backgroundColor: '#fff', padding: '4rem 2rem' }}>
        <div style={{ maxWidth: '1400px', margin: '0 auto' }}>
          <h2
            style={{
              fontSize: '2rem',
              marginBottom: '2rem',
              textAlign: 'center',
            }}
          >
            Training & Certification
          </h2>

          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
              gap: '2rem',
            }}
          >
            <div style={{ textAlign: 'center' }}>
              <div
                style={{
                  width: '80px',
                  height: '80px',
                  backgroundColor: 'var(--brand-surface)',
                  borderRadius: '50%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  margin: '0 auto 1rem',
                  fontSize: '2rem',
                }}
              >
                📚
              </div>
              <h3 style={{ fontSize: '1.25rem', marginBottom: '0.5rem' }}>
                Learning Center
              </h3>
              <p
                style={{
                  color: 'var(--brand-text-muted)',
                  marginBottom: '1rem',
                }}
              >
                50+ self-paced courses and 200+ video tutorials
              </p>
              <Link
                to="/training/learning-center"
                style={{
                  color: 'var(--brand-info)',
                  textDecoration: 'none',
                  fontWeight: '600',
                }}
              >
                Browse Courses →
              </Link>
            </div>

            <div style={{ textAlign: 'center' }}>
              <div
                style={{
                  width: '80px',
                  height: '80px',
                  backgroundColor: '#f0fdf4',
                  borderRadius: '50%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  margin: '0 auto 1rem',
                  fontSize: '2rem',
                }}
              >
                🎓
              </div>
              <h3 style={{ fontSize: '1.25rem', marginBottom: '0.5rem' }}>
                Certifications
              </h3>
              <p
                style={{
                  color: 'var(--brand-text-muted)',
                  marginBottom: '1rem',
                }}
              >
                Become a certified Elevate educator or administrator
              </p>
              <Link
                to="/training/certifications"
                style={{
                  color: 'var(--brand-info)',
                  textDecoration: 'none',
                  fontWeight: '600',
                }}
              >
                View Programs →
              </Link>
            </div>

            <div style={{ textAlign: 'center' }}>
              <div
                style={{
                  width: '80px',
                  height: '80px',
                  backgroundColor: '#fef3c7',
                  borderRadius: '50%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  margin: '0 auto 1rem',
                  fontSize: '2rem',
                }}
              >
                🎥
              </div>
              <h3 style={{ fontSize: '1.25rem', marginBottom: '0.5rem' }}>
                Product Demos
              </h3>
              <p
                style={{
                  color: 'var(--brand-text-muted)',
                  marginBottom: '1rem',
                }}
              >
                Live demos every week, on-demand videos anytime
              </p>
              <Link
                to="/demos"
                style={{
                  color: 'var(--brand-info)',
                  textDecoration: 'none',
                  fontWeight: '600',
                }}
              >
                Watch Demos →
              </Link>
            </div>

            <div style={{ textAlign: 'center' }}>
              <div
                style={{
                  width: '80px',
                  height: '80px',
                  backgroundColor: '#fce7f3',
                  borderRadius: '50%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  margin: '0 auto 1rem',
                  fontSize: '2rem',
                }}
              >
                🛠️
              </div>
              <h3 style={{ fontSize: '1.25rem', marginBottom: '0.5rem' }}>
                App Hub
              </h3>
              <p
                style={{
                  color: 'var(--brand-text-muted)',
                  marginBottom: '1rem',
                }}
              >
                100+ integrations and add-ons to extend functionality
              </p>
              <Link
                to="/app-hub"
                style={{
                  color: 'var(--brand-info)',
                  textDecoration: 'none',
                  fontWeight: '600',
                }}
              >
                Explore Apps →
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Community & Support */}
      <div style={{ padding: '4rem 2rem' }}>
        <div style={{ maxWidth: '1400px', margin: '0 auto' }}>
          <h2
            style={{
              fontSize: '2rem',
              marginBottom: '2rem',
              textAlign: 'center',
            }}
          >
            Connect with the Community
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
                borderRadius: '0.75rem',
                boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
              }}
            >
              <h3 style={{ fontSize: '1.25rem', marginBottom: '1rem' }}>
                💬 Communities
              </h3>
              <p
                style={{
                  color: 'var(--brand-text-muted)',
                  marginBottom: '1rem',
                }}
              >
                Join 50,000+ educators sharing best practices and resources
              </p>
              <ul style={{ listStyle: 'none', padding: 0 }}>
                <li style={{ marginBottom: '0.5rem' }}>
                  <Link
                    to="/community/teachers"
                    style={{
                      color: 'var(--brand-info)',
                      textDecoration: 'none',
                    }}
                  >
                    → Teacher Community
                  </Link>
                </li>
                <li style={{ marginBottom: '0.5rem' }}>
                  <Link
                    to="/community/admins"
                    style={{
                      color: 'var(--brand-info)',
                      textDecoration: 'none',
                    }}
                  >
                    → Administrator Forum
                  </Link>
                </li>
                <li style={{ marginBottom: '0.5rem' }}>
                  <Link
                    to="/community/developers"
                    style={{
                      color: 'var(--brand-info)',
                      textDecoration: 'none',
                    }}
                  >
                    → Developer Community
                  </Link>
                </li>
              </ul>
            </div>

            <div
              style={{
                backgroundColor: '#fff',
                padding: '2rem',
                borderRadius: '0.75rem',
                boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
              }}
            >
              <h3 style={{ fontSize: '1.25rem', marginBottom: '1rem' }}>
                🤝 Find a Partner
              </h3>
              <p
                style={{
                  color: 'var(--brand-text-muted)',
                  marginBottom: '1rem',
                }}
              >
                Connect with authorized partners for implementation and support
              </p>
              <ul style={{ listStyle: 'none', padding: 0 }}>
                <li style={{ marginBottom: '0.5rem' }}>
                  <Link
                    to="/partners/sales"
                    style={{
                      color: 'var(--brand-info)',
                      textDecoration: 'none',
                    }}
                  >
                    → Sales Partners
                  </Link>
                </li>
                <li style={{ marginBottom: '0.5rem' }}>
                  <Link
                    to="/partners/training"
                    style={{
                      color: 'var(--brand-info)',
                      textDecoration: 'none',
                    }}
                  >
                    → Training Partners
                  </Link>
                </li>
                <li style={{ marginBottom: '0.5rem' }}>
                  <Link
                    to="/partners/technology"
                    style={{
                      color: 'var(--brand-info)',
                      textDecoration: 'none',
                    }}
                  >
                    → Technology Partners
                  </Link>
                </li>
              </ul>
            </div>

            <div
              style={{
                backgroundColor: '#fff',
                padding: '2rem',
                borderRadius: '0.75rem',
                boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
              }}
            >
              <h3 style={{ fontSize: '1.25rem', marginBottom: '1rem' }}>
                📞 Get Support
              </h3>
              <p
                style={{
                  color: 'var(--brand-text-muted)',
                  marginBottom: '1rem',
                }}
              >
                We're here to help you succeed
              </p>
              <ul style={{ listStyle: 'none', padding: 0 }}>
                <li style={{ marginBottom: '0.5rem' }}>
                  <Link
                    to="/support"
                    style={{
                      color: 'var(--brand-info)',
                      textDecoration: 'none',
                    }}
                  >
                    → Help Center
                  </Link>
                </li>
                <li style={{ marginBottom: '0.5rem' }}>
                  <Link
                    to="/support/contact"
                    style={{
                      color: 'var(--brand-info)',
                      textDecoration: 'none',
                    }}
                  >
                    → Contact Support
                  </Link>
                </li>
                <li style={{ marginBottom: '0.5rem' }}>
                  <a
                    href="tel:1-800-ELEVATE"
                    style={{
                      color: 'var(--brand-info)',
                      textDecoration: 'none',
                    }}
                  >
                    → Call 1-800-ELEVATE
                  </a>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>

      {/* Institution Types */}
      <div style={{ backgroundColor: '#fff', padding: '4rem 2rem' }}>
        <div style={{ maxWidth: '1400px', margin: '0 auto' }}>
          <h2
            style={{
              fontSize: '2rem',
              marginBottom: '2rem',
              textAlign: 'center',
            }}
          >
            Solutions by Institution Type
          </h2>

          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(350px, 1fr))',
              gap: '2rem',
            }}
          >
            <div
              style={{
                border: '2px solid var(--brand-border)',
                borderRadius: '0.75rem',
                padding: '2rem',
                transition: 'border-color 0.2s',
              }}
              onMouseEnter={(e) =>
                (e.currentTarget.style.borderColor = 'var(--brand-info)')
              }
              onMouseLeave={(e) =>
                (e.currentTarget.style.borderColor = 'var(--brand-border)')
              }
            >
              <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>🏫</div>
              <h3 style={{ fontSize: '1.5rem', marginBottom: '0.5rem' }}>
                K-12 Schools
              </h3>
              <p
                style={{
                  color: 'var(--brand-text-muted)',
                  marginBottom: '1rem',
                }}
              >
                Complete solution for elementary, middle, and high schools
              </p>
              <ul
                style={{ color: 'var(--brand-text)', marginBottom: '1.5rem' }}
              >
                <li>Parent portal included</li>
                <li>Age-appropriate content</li>
                <li>COPPA compliant</li>
                <li>Standards alignment</li>
              </ul>
              <Link
                to="/solutions/k12"
                style={{
                  display: 'inline-block',
                  padding: '0.75rem 1.5rem',
                  backgroundColor: 'var(--brand-info)',
                  color: '#fff',
                  textDecoration: 'none',
                  borderRadius: '0.5rem',
                  fontWeight: '600',
                }}
              >
                Learn More
              </Link>
            </div>

            <div
              style={{
                border: '2px solid var(--brand-border)',
                borderRadius: '0.75rem',
                padding: '2rem',
                transition: 'border-color 0.2s',
              }}
              onMouseEnter={(e) =>
                (e.currentTarget.style.borderColor = 'var(--brand-info)')
              }
              onMouseLeave={(e) =>
                (e.currentTarget.style.borderColor = 'var(--brand-border)')
              }
            >
              <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>🎓</div>
              <h3 style={{ fontSize: '1.5rem', marginBottom: '0.5rem' }}>
                Higher Education
              </h3>
              <p
                style={{
                  color: 'var(--brand-text-muted)',
                  marginBottom: '1rem',
                }}
              >
                Comprehensive platform for colleges and universities
              </p>
              <ul
                style={{ color: 'var(--brand-text)', marginBottom: '1.5rem' }}
              >
                <li>Research tools (NotebookLM)</li>
                <li>Career services integration</li>
                <li>Multi-campus support</li>
                <li>Advanced analytics</li>
              </ul>
              <Link
                to="/solutions/higher-ed"
                style={{
                  display: 'inline-block',
                  padding: '0.75rem 1.5rem',
                  backgroundColor: 'var(--brand-info)',
                  color: '#fff',
                  textDecoration: 'none',
                  borderRadius: '0.5rem',
                  fontWeight: '600',
                }}
              >
                Learn More
              </Link>
            </div>

            <div
              style={{
                border: '2px solid var(--brand-border)',
                borderRadius: '0.75rem',
                padding: '2rem',
                transition: 'border-color 0.2s',
              }}
              onMouseEnter={(e) =>
                (e.currentTarget.style.borderColor = 'var(--brand-info)')
              }
              onMouseLeave={(e) =>
                (e.currentTarget.style.borderColor = 'var(--brand-border)')
              }
            >
              <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>🌐</div>
              <h3 style={{ fontSize: '1.5rem', marginBottom: '0.5rem' }}>
                Distance Learning
              </h3>
              <p
                style={{
                  color: 'var(--brand-text-muted)',
                  marginBottom: '1rem',
                }}
              >
                Built for online and hybrid education
              </p>
              <ul
                style={{ color: 'var(--brand-text)', marginBottom: '1.5rem' }}
              >
                <li>Fully online platform</li>
                <li>HD video conferencing</li>
                <li>Mobile-first design</li>
                <li>Global accessibility</li>
              </ul>
              <Link
                to="/solutions/distance-learning"
                style={{
                  display: 'inline-block',
                  padding: '0.75rem 1.5rem',
                  backgroundColor: 'var(--brand-info)',
                  color: '#fff',
                  textDecoration: 'none',
                  borderRadius: '0.5rem',
                  fontWeight: '600',
                }}
              >
                Learn More
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* CTA Section */}
      <div
        style={{
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          color: '#fff',
          padding: '4rem 2rem',
          textAlign: 'center',
        }}
      >
        <h2 style={{ fontSize: '2.5rem', marginBottom: '1rem' }}>
          Ready to Get Started?
        </h2>
        <p style={{ fontSize: '1.25rem', marginBottom: '2rem', opacity: 0.9 }}>
          Start your free 30-day trial today. No credit card required.
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
            to="/signup"
            style={{
              display: 'inline-block',
              padding: '1rem 2rem',
              backgroundColor: '#fff',
              color: '#667eea',
              textDecoration: 'none',
              borderRadius: '0.5rem',
              fontSize: '1.125rem',
              fontWeight: '600',
            }}
          >
            Start Free Trial
          </Link>
          <Link
            to="/demo"
            style={{
              display: 'inline-block',
              padding: '1rem 2rem',
              backgroundColor: 'transparent',
              color: '#fff',
              textDecoration: 'none',
              borderRadius: '0.5rem',
              fontSize: '1.125rem',
              fontWeight: '600',
              border: '2px solid #fff',
            }}
          >
            Schedule Demo
          </Link>
          <a
            href="tel:1-800-ELEVATE"
            style={{
              display: 'inline-block',
              padding: '1rem 2rem',
              backgroundColor: 'transparent',
              color: '#fff',
              textDecoration: 'none',
              borderRadius: '0.5rem',
              fontSize: '1.125rem',
              fontWeight: '600',
              border: '2px solid #fff',
            }}
          >
            Call Sales
          </a>
        </div>
      </div>
    </div>
  );
}

export default GetStarted;
