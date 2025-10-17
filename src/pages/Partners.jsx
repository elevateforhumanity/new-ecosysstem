/*
  Copyright (c) 2025 Elevate for Humanity
  Commercial License. No resale, sublicensing, or redistribution allowed.
  See LICENSE file for details.
*/
import React from 'react';
import { Link } from 'react-router-dom';
import AppLayout from '../layouts/AppLayout';

export default function Partners() {
  const partners = [
    {
      id: 1,
      name: 'Global Education Alliance',
      category: 'Education',
      description:
        'Providing quality education resources to underserved communities worldwide.',
      logo: '🎓',
      website: 'https://example.com',
      since: '2020',
    },
    {
      id: 2,
      name: 'Tech for Good Foundation',
      category: 'Technology',
      description:
        'Empowering communities through technology training and digital literacy programs.',
      logo: '💻',
      website: 'https://example.com',
      since: '2019',
    },
    {
      id: 3,
      name: 'Community Health Network',
      category: 'Healthcare',
      description:
        'Delivering healthcare services and wellness programs to remote areas.',
      logo: '🏥',
      website: 'https://example.com',
      since: '2021',
    },
    {
      id: 4,
      name: 'Sustainable Development Corp',
      category: 'Environment',
      description:
        'Promoting sustainable practices and environmental conservation initiatives.',
      logo: '🌱',
      website: 'https://example.com',
      since: '2018',
    },
    {
      id: 5,
      name: 'Youth Empowerment Initiative',
      category: 'Youth Development',
      description:
        'Supporting youth leadership and skill development programs globally.',
      logo: '🌟',
      website: 'https://example.com',
      since: '2022',
    },
    {
      id: 6,
      name: 'Women in STEM Alliance',
      category: 'Gender Equality',
      description:
        "Advancing women's participation in science, technology, engineering, and mathematics.",
      logo: '👩‍🔬',
      website: 'https://example.com',
      since: '2020',
    },
  ];

  const categories = [
    'All',
    'Education',
    'Technology',
    'Healthcare',
    'Environment',
    'Youth Development',
    'Gender Equality',
  ];
  const [selectedCategory, setSelectedCategory] = React.useState('All');

  const filteredPartners =
    selectedCategory === 'All'
      ? partners
      : partners.filter((p) => p.category === selectedCategory);

  return (
    <AppLayout>
      <div style={{ maxWidth: 1200, margin: '0 auto', padding: 32 }}>
        {/* Header */}
        <div style={{ marginBottom: 40 }}>
          <h1 style={{ fontSize: 36, fontWeight: 700, marginBottom: 12 }}>
            Our Partners
          </h1>
          <p
            style={{
              fontSize: 18,
              color: 'var(--brand-text-muted)',
              maxWidth: 800,
            }}
          >
            We collaborate with leading organizations worldwide to expand our
            impact and reach more communities in need.
          </p>
        </div>

        {/* Stats */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
            gap: 20,
            marginBottom: 40,
          }}
        >
          <div
            style={{
              backgroundColor: '#fff',
              padding: 24,
              borderRadius: 8,
              border: '1px solid var(--brand-border)',
              textAlign: 'center',
            }}
          >
            <div
              style={{
                fontSize: 32,
                fontWeight: 700,
                color: 'var(--brand-info)',
                marginBottom: 8,
              }}
            >
              50+
            </div>
            <div style={{ fontSize: 14, color: 'var(--brand-text-muted)' }}>
              Partner Organizations
            </div>
          </div>

          <div
            style={{
              backgroundColor: '#fff',
              padding: 24,
              borderRadius: 8,
              border: '1px solid var(--brand-border)',
              textAlign: 'center',
            }}
          >
            <div
              style={{
                fontSize: 32,
                fontWeight: 700,
                color: 'var(--brand-success)',
                marginBottom: 8,
              }}
            >
              120+
            </div>
            <div style={{ fontSize: 14, color: 'var(--brand-text-muted)' }}>
              Countries Reached
            </div>
          </div>

          <div
            style={{
              backgroundColor: '#fff',
              padding: 24,
              borderRadius: 8,
              border: '1px solid var(--brand-border)',
              textAlign: 'center',
            }}
          >
            <div
              style={{
                fontSize: 32,
                fontWeight: 700,
                color: 'var(--brand-warning)',
                marginBottom: 8,
              }}
            >
              2M+
            </div>
            <div style={{ fontSize: 14, color: 'var(--brand-text-muted)' }}>
              Lives Impacted
            </div>
          </div>

          <div
            style={{
              backgroundColor: '#fff',
              padding: 24,
              borderRadius: 8,
              border: '1px solid var(--brand-border)',
              textAlign: 'center',
            }}
          >
            <div
              style={{
                fontSize: 32,
                fontWeight: 700,
                color: 'var(--brand-danger)',
                marginBottom: 8,
              }}
            >
              500+
            </div>
            <div style={{ fontSize: 14, color: 'var(--brand-text-muted)' }}>
              Active Projects
            </div>
          </div>
        </div>

        {/* Category Filter */}
        <div
          style={{
            display: 'flex',
            gap: 12,
            marginBottom: 32,
            flexWrap: 'wrap',
          }}
        >
          {categories.map((category) => (
            <button
              key={category}
              onClick={() => setSelectedCategory(category)}
              style={{
                padding: '8px 16px',
                backgroundColor:
                  selectedCategory === category ? 'var(--brand-info)' : '#fff',
                color: selectedCategory === category ? '#fff' : '#333',
                border: '1px solid var(--brand-border)',
                borderRadius: 20,
                fontSize: 14,
                fontWeight: 500,
                cursor: 'pointer',
                transition: 'all 0.2s',
              }}
            >
              {category}
            </button>
          ))}
        </div>

        {/* Partners Grid */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(350px, 1fr))',
            gap: 24,
            marginBottom: 40,
          }}
        >
          {filteredPartners.map((partner) => (
            <div
              key={partner.id}
              style={{
                backgroundColor: '#fff',
                border: '1px solid var(--brand-border)',
                borderRadius: 8,
                padding: 24,
                transition: 'transform 0.2s, box-shadow 0.2s',
                cursor: 'pointer',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'translateY(-4px)';
                e.currentTarget.style.boxShadow =
                  '0 4px 12px rgba(0, 0, 0, 0.1)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.boxShadow = 'none';
              }}
            >
              <div
                style={{
                  display: 'flex',
                  alignItems: 'flex-start',
                  marginBottom: 16,
                }}
              >
                <div
                  style={{
                    fontSize: 48,
                    marginRight: 16,
                    flexShrink: 0,
                  }}
                >
                  {partner.logo}
                </div>
                <div style={{ flex: 1 }}>
                  <h3
                    style={{ fontSize: 18, fontWeight: 600, marginBottom: 4 }}
                  >
                    {partner.name}
                  </h3>
                  <div
                    style={{
                      display: 'inline-block',
                      padding: '4px 12px',
                      backgroundColor: '#f0f0f0',
                      borderRadius: 12,
                      fontSize: 12,
                      color: 'var(--brand-text-muted)',
                      marginBottom: 8,
                    }}
                  >
                    {partner.category}
                  </div>
                </div>
              </div>

              <p
                style={{
                  fontSize: 14,
                  color: 'var(--brand-text-muted)',
                  lineHeight: 1.6,
                  marginBottom: 16,
                }}
              >
                {partner.description}
              </p>

              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  paddingTop: 16,
                  borderTop: '1px solid #f0f0f0',
                }}
              >
                <div style={{ fontSize: 13, color: '#999' }}>
                  Partner since {partner.since}
                </div>
                <a
                  href={partner.website}
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{
                    color: 'var(--brand-info)',
                    textDecoration: 'none',
                    fontSize: 14,
                    fontWeight: 500,
                  }}
                >
                  Visit Website →
                </a>
              </div>
            </div>
          ))}
        </div>

        {/* Become a Partner CTA */}
        <div
          style={{
            backgroundColor: 'var(--brand-info)',
            color: '#fff',
            padding: 48,
            borderRadius: 12,
            textAlign: 'center',
            marginTop: 40,
          }}
        >
          <h2 style={{ fontSize: 28, fontWeight: 700, marginBottom: 16 }}>
            Become a Partner
          </h2>
          <p
            style={{
              fontSize: 16,
              marginBottom: 24,
              opacity: 0.9,
              maxWidth: 600,
              margin: '0 auto 24px',
            }}
          >
            Join our network of organizations committed to making a positive
            impact. Together, we can reach more communities and create lasting
            change.
          </p>
          <div
            style={{
              display: 'flex',
              gap: 16,
              justifyContent: 'center',
              flexWrap: 'wrap',
            }}
          >
            <Link
              to="/contact"
              style={{
                padding: '12px 32px',
                backgroundColor: '#fff',
                color: 'var(--brand-info)',
                border: 'none',
                borderRadius: 6,
                fontSize: 16,
                fontWeight: 600,
                textDecoration: 'none',
                display: 'inline-block',
              }}
            >
              Get in Touch
            </Link>
            <a
              href="/partnership-info.pdf"
              download
              style={{
                padding: '12px 32px',
                backgroundColor: 'transparent',
                color: '#fff',
                border: '2px solid #fff',
                borderRadius: 6,
                fontSize: 16,
                fontWeight: 600,
                textDecoration: 'none',
                display: 'inline-block',
              }}
            >
              Download Partnership Info
            </a>
          </div>
        </div>

        {/* Partnership Benefits */}
        <div style={{ marginTop: 60 }}>
          <h2
            style={{
              fontSize: 28,
              fontWeight: 700,
              marginBottom: 32,
              textAlign: 'center',
            }}
          >
            Partnership Benefits
          </h2>
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
              gap: 24,
            }}
          >
            <div style={{ textAlign: 'center', padding: 20 }}>
              <div style={{ fontSize: 48, marginBottom: 16 }}>🤝</div>
              <h3 style={{ fontSize: 18, fontWeight: 600, marginBottom: 8 }}>
                Collaborative Impact
              </h3>
              <p
                style={{
                  fontSize: 14,
                  color: 'var(--brand-text-muted)',
                  lineHeight: 1.6,
                }}
              >
                Work together on projects that amplify your organization's
                mission and reach.
              </p>
            </div>

            <div style={{ textAlign: 'center', padding: 20 }}>
              <div style={{ fontSize: 48, marginBottom: 16 }}>🌍</div>
              <h3 style={{ fontSize: 18, fontWeight: 600, marginBottom: 8 }}>
                Global Network
              </h3>
              <p
                style={{
                  fontSize: 14,
                  color: 'var(--brand-text-muted)',
                  lineHeight: 1.6,
                }}
              >
                Access our worldwide network of partners, resources, and
                expertise.
              </p>
            </div>

            <div style={{ textAlign: 'center', padding: 20 }}>
              <div style={{ fontSize: 48, marginBottom: 16 }}>📊</div>
              <h3 style={{ fontSize: 18, fontWeight: 600, marginBottom: 8 }}>
                Shared Resources
              </h3>
              <p
                style={{
                  fontSize: 14,
                  color: 'var(--brand-text-muted)',
                  lineHeight: 1.6,
                }}
              >
                Leverage shared tools, platforms, and best practices for greater
                efficiency.
              </p>
            </div>

            <div style={{ textAlign: 'center', padding: 20 }}>
              <div style={{ fontSize: 48, marginBottom: 16 }}>🎯</div>
              <h3 style={{ fontSize: 18, fontWeight: 600, marginBottom: 8 }}>
                Measurable Results
              </h3>
              <p
                style={{
                  fontSize: 14,
                  color: 'var(--brand-text-muted)',
                  lineHeight: 1.6,
                }}
              >
                Track and report on the collective impact of our partnership
                initiatives.
              </p>
            </div>
          </div>
        </div>
      </div>
    </AppLayout>
  );
}
