/*
  Copyright (c) 2025 Elevate for Humanity
  Commercial License. No resale, sublicensing, or redistribution allowed.
  See LICENSE file for details.
*/

import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import AppLayout from '../layouts/AppLayout';
import { useAnalytics } from '../hooks/useAnalytics';

const programs = [
  {
    name: 'Construction Pre-Apprenticeship',
    description:
      'Comprehensive training program preparing students for careers in construction trades with industry-recognized certifications.',
    duration: '12-16 weeks',
    credentials: [
      'OSHA 10',
      'NCCER Core',
      'First Aid/CPR',
      'Forklift Certification',
    ],
    funding: ['WIOA', 'WRG', 'OJT', 'WEX', 'JRI', 'IMPLY', 'INDY', 'DOL'],
    category: 'trades',
    icon: '🏗️',
  },
  {
    name: 'Phlebotomy Technician',
    description:
      'Medical training program for aspiring phlebotomists with hands-on clinical experience and certification preparation.',
    duration: '8-10 weeks',
    credentials: ['Phlebotomy Certification', 'Bloodborne Pathogens', 'HIPAA'],
    funding: ['WIOA', 'WRG', 'OJT', 'WEX', 'IMPLY', 'INDY', 'DOL'],
    category: 'healthcare',
    icon: '🩺',
  },
  {
    name: 'CPR Instructor',
    description:
      'Become a certified CPR instructor and teach life-saving skills in your community.',
    duration: '4-6 weeks',
    credentials: ['CPR Instructor Certification', 'First Aid', 'AED Training'],
    funding: ['WIOA', 'WRG', 'OJT', 'WEX', 'IMPLY', 'INDY', 'DOL'],
    category: 'healthcare',
    icon: '❤️',
  },
  {
    name: 'OTR (Over-the-Road) Truck Driving',
    description:
      'Professional truck driving program leading to CDL Class A certification and career placement assistance.',
    duration: '4-8 weeks',
    credentials: ['CDL Class A', 'DOT Safety', 'Logistics Basics'],
    funding: ['WIOA', 'WRG', 'OJT', 'WEX', 'IMPLY', 'INDY', 'DOL'],
    category: 'transportation',
    icon: '🚛',
  },
  {
    name: 'Drug Testing Collector',
    description:
      'Specialized training for DOT-compliant drug and alcohol testing collection procedures.',
    duration: '2-4 weeks',
    credentials: ['DOT Collector Certification', 'Chain of Custody Training'],
    funding: ['WIOA', 'WRG', 'OJT', 'WEX', 'IMPLY', 'INDY', 'DOL'],
    category: 'healthcare',
    icon: '🧪',
  },
  {
    name: 'Financial Literacy',
    description:
      'Essential money management skills including budgeting, credit, and financial planning for personal and professional success.',
    duration: '6-8 weeks',
    credentials: [
      'Financial Literacy Certificate',
      'Budgeting Basics',
      'Credit Management',
    ],
    funding: ['WIOA', 'WRG', 'WEX', 'IMPLY', 'INDY'],
    category: 'business',
    icon: '💰',
  },
  {
    name: 'Music & Dance Liberal Arts',
    description:
      'Creative arts program integrating music theory, performance, and dance with academic foundations.',
    duration: '12-16 weeks',
    credentials: [
      'Arts Integration Certificate',
      'Performance Readiness',
      'Music Theory Basics',
    ],
    funding: ['WIOA', 'WRG', 'WEX', 'IMPLY', 'INDY'],
    category: 'arts',
    icon: '🎵',
  },
];

export default function Programs() {
  useAnalytics('Programs');
  const [filter, setFilter] = useState('all');

  const categories = [
    { value: 'all', label: 'All Programs' },
    { value: 'trades', label: 'Trades & Construction' },
    { value: 'healthcare', label: 'Healthcare' },
    { value: 'transportation', label: 'Transportation' },
    { value: 'business', label: 'Business & Finance' },
    { value: 'arts', label: 'Arts & Liberal Arts' },
  ];

  const filteredPrograms =
    filter === 'all' ? programs : programs.filter((p) => p.category === filter);

  return (
    <AppLayout title="Programs">
      <div style={{ maxWidth: '1400px', margin: '0 auto', padding: '2rem' }}>
        {/* Header */}
        <header style={{ textAlign: 'center', marginBottom: '3rem' }}>
          <h1
            style={{
              fontSize: '2.5rem',
              marginBottom: '1rem',
              color: 'var(--brand-info)',
            }}
          >
            Stackable Credential Programs
          </h1>
          <p
            style={{
              fontSize: '1.25rem',
              color: 'var(--brand-text-muted)',
              maxWidth: '800px',
              margin: '0 auto',
            }}
          >
            Industry-recognized training programs designed to build your skills
            and advance your career
          </p>
        </header>

        {/* Filter Tabs */}
        <div
          style={{
            display: 'flex',
            gap: '0.5rem',
            marginBottom: '2rem',
            flexWrap: 'wrap',
            justifyContent: 'center',
          }}
        >
          {categories.map((cat) => (
            <button
              key={cat.value}
              onClick={() => setFilter(cat.value)}
              style={{
                padding: '0.75rem 1.5rem',
                backgroundColor:
                  filter === cat.value ? 'var(--brand-info)' : 'white',
                color: filter === cat.value ? 'white' : 'var(--brand-text)',
                border: '1px solid var(--brand-border)',
                borderRadius: '6px',
                cursor: 'pointer',
                fontWeight: '600',
                transition: 'all 0.2s',
              }}
            >
              {cat.label}
            </button>
          ))}
        </div>

        {/* Programs Grid */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(350px, 1fr))',
            gap: '2rem',
            marginBottom: '3rem',
          }}
        >
          {filteredPrograms.map((program, idx) => (
            <ProgramCard key={idx} program={program} />
          ))}
        </div>

        {/* Funding Information */}
        <section
          style={{
            background: 'var(--brand-surface)',
            padding: '3rem',
            borderRadius: '8px',
            marginBottom: '3rem',
          }}
        >
          <h2
            style={{
              fontSize: '2rem',
              marginBottom: '1.5rem',
              color: 'var(--brand-info)',
              textAlign: 'center',
            }}
          >
            Funding Options Available
          </h2>
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
              gap: '1.5rem',
              maxWidth: '1000px',
              margin: '0 auto',
            }}
          >
            <FundingBadge
              name="WIOA"
              description="Workforce Innovation & Opportunity Act"
            />
            <FundingBadge name="WRG" description="Workforce Readiness Grant" />
            <FundingBadge name="OJT" description="On-the-Job Training" />
            <FundingBadge name="WEX" description="Work Experience" />
            <FundingBadge name="DOL" description="Department of Labor" />
            <FundingBadge
              name="JRI"
              description="Justice Reinvestment Initiative"
            />
          </div>
        </section>

        {/* CTA Section */}
        <section
          style={{
            textAlign: 'center',
            background: 'white',
            padding: '3rem',
            borderRadius: '8px',
            border: '1px solid var(--brand-border)',
          }}
        >
          <h2
            style={{
              fontSize: '2rem',
              marginBottom: '1rem',
              color: 'var(--brand-text)',
            }}
          >
            Ready to Start Your Journey?
          </h2>
          <p
            style={{
              fontSize: '1.125rem',
              color: 'var(--brand-text-muted)',
              marginBottom: '2rem',
              maxWidth: '600px',
              margin: '0 auto 2rem',
            }}
          >
            Enroll today and take the first step toward a rewarding career with
            industry-recognized credentials
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
              to="/student"
              style={{
                padding: '1rem 2rem',
                backgroundColor: 'var(--brand-info)',
                color: 'white',
                textDecoration: 'none',
                borderRadius: '6px',
                fontWeight: '600',
                fontSize: '1.125rem',
              }}
            >
              Enroll Now
            </Link>
            <Link
              to="/connect"
              style={{
                padding: '1rem 2rem',
                backgroundColor: 'white',
                color: 'var(--brand-info)',
                textDecoration: 'none',
                borderRadius: '6px',
                fontWeight: '600',
                fontSize: '1.125rem',
                border: '2px solid var(--brand-info)',
              }}
            >
              Contact Admissions
            </Link>
          </div>
        </section>
      </div>
    </AppLayout>
  );
}

function ProgramCard({ program }) {
  return (
    <div
      style={{
        background: 'white',
        border: '1px solid var(--brand-border)',
        borderRadius: '8px',
        padding: '2rem',
        display: 'flex',
        flexDirection: 'column',
        transition: 'all 0.2s',
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.boxShadow = '0 10px 25px rgba(0,0,0,0.1)';
        e.currentTarget.style.transform = 'translateY(-4px)';
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.boxShadow = 'none';
        e.currentTarget.style.transform = 'translateY(0)';
      }}
    >
      <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>
        {program.icon}
      </div>
      <h3
        style={{
          fontSize: '1.5rem',
          marginBottom: '0.75rem',
          color: 'var(--brand-text)',
        }}
      >
        {program.name}
      </h3>
      <p
        style={{
          color: 'var(--brand-text-muted)',
          marginBottom: '1rem',
          lineHeight: '1.6',
          flexGrow: 1,
        }}
      >
        {program.description}
      </p>

      <div style={{ marginBottom: '1rem' }}>
        <div
          style={{
            fontSize: '0.875rem',
            fontWeight: '600',
            color: 'var(--brand-text)',
            marginBottom: '0.5rem',
          }}
        >
          ⏱️ Duration: {program.duration}
        </div>
      </div>

      <div style={{ marginBottom: '1rem' }}>
        <div
          style={{
            fontSize: '0.875rem',
            fontWeight: '600',
            color: 'var(--brand-text)',
            marginBottom: '0.5rem',
          }}
        >
          Credentials Earned:
        </div>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
          {program.credentials.map((cred, idx) => (
            <span
              key={idx}
              style={{
                padding: '0.25rem 0.75rem',
                background: '#dcfce7',
                color: '#166534',
                borderRadius: '9999px',
                fontSize: '0.75rem',
                fontWeight: '600',
              }}
            >
              {cred}
            </span>
          ))}
        </div>
      </div>

      <div style={{ marginBottom: '1.5rem' }}>
        <div
          style={{
            fontSize: '0.875rem',
            fontWeight: '600',
            color: 'var(--brand-text)',
            marginBottom: '0.5rem',
          }}
        >
          Funding Available:
        </div>
        <div style={{ fontSize: '0.875rem', color: 'var(--brand-text-muted)' }}>
          {program.funding.join(', ')}
        </div>
      </div>

      <Link
        to="/student"
        style={{
          display: 'block',
          textAlign: 'center',
          padding: '0.75rem',
          backgroundColor: 'var(--brand-info)',
          color: 'white',
          textDecoration: 'none',
          borderRadius: '6px',
          fontWeight: '600',
        }}
      >
        Learn More & Enroll
      </Link>
    </div>
  );
}

function FundingBadge({ name, description }) {
  return (
    <div style={{ textAlign: 'center' }}>
      <div
        style={{
          fontWeight: '700',
          fontSize: '1.25rem',
          color: 'var(--brand-info)',
          marginBottom: '0.25rem',
        }}
      >
        {name}
      </div>
      <div style={{ fontSize: '0.875rem', color: 'var(--brand-text-muted)' }}>
        {description}
      </div>
    </div>
  );
}
