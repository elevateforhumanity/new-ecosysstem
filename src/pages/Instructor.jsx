/*
  Copyright (c) 2025 Elevate for Humanity
  Commercial License. No resale, sublicensing, or redistribution allowed.
  See LICENSE file for details.
*/

import React from "react";
import { Link } from "react-router-dom";
import AppLayout from "../layouts/AppLayout";
import { useAnalytics } from "../hooks/useAnalytics";

export default function Instructor() {
  useAnalytics("Instructor Portal");

  return (
    <AppLayout title="Instructor Portal">
      <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '2rem' }}>
        {/* Hero Section */}
        <header style={{ textAlign: 'center', marginBottom: '3rem' }}>
          <h1 style={{ fontSize: '2.5rem', marginBottom: '1rem', color: '#1e40af' }}>
            Instructor Portal
          </h1>
          <p style={{ fontSize: '1.25rem', color: '#64748b', maxWidth: '800px', margin: '0 auto' }}>
            Welcome to the Elevate for Humanity Instructor Portal. Manage your courses, track student progress, 
            and access teaching resources all in one place.
          </p>
        </header>

        {/* Quick Actions */}
        <section style={{ marginBottom: '3rem' }}>
          <h2 style={{ fontSize: '1.75rem', marginBottom: '1.5rem', color: '#1f2937' }}>Quick Actions</h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '1.5rem' }}>
            <ActionCard 
              title="📚 My Courses"
              description="View and manage your active courses"
              link="/instructor-courses"
            />
            <ActionCard 
              title="👥 Student Progress"
              description="Track student enrollment and performance"
              link="/instructor-students"
            />
            <ActionCard 
              title="📝 Create Course"
              description="Design and publish new course content"
              link="/instructor-new"
            />
            <ActionCard 
              title="📊 Analytics"
              description="View detailed course and student analytics"
              link="/analytics"
            />
          </div>
        </section>

        {/* Resources Section */}
        <section style={{ marginBottom: '3rem' }}>
          <h2 style={{ fontSize: '1.75rem', marginBottom: '1.5rem', color: '#1f2937' }}>Teaching Resources</h2>
          <div style={{ background: '#f8fafc', padding: '2rem', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
            <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
              <ResourceItem 
                title="Instructor Handbook"
                description="Best practices and guidelines for effective online teaching"
              />
              <ResourceItem 
                title="Course Design Templates"
                description="Pre-built templates to help structure your course content"
              />
              <ResourceItem 
                title="Assessment Tools"
                description="Create quizzes, assignments, and grading rubrics"
              />
              <ResourceItem 
                title="Technical Support"
                description="Get help with platform features and troubleshooting"
              />
            </ul>
          </div>
        </section>

        {/* Support Section */}
        <section style={{ textAlign: 'center', background: '#eff6ff', padding: '2rem', borderRadius: '8px' }}>
          <h2 style={{ fontSize: '1.5rem', marginBottom: '1rem', color: '#1e40af' }}>Need Help?</h2>
          <p style={{ marginBottom: '1.5rem', color: '#64748b' }}>
            Our support team is here to assist you with any questions or technical issues.
          </p>
          <Link 
            to="/connect" 
            style={{
              display: 'inline-block',
              padding: '0.75rem 2rem',
              backgroundColor: '#1e40af',
              color: 'white',
              textDecoration: 'none',
              borderRadius: '6px',
              fontWeight: '600'
            }}
          >
            Contact Support
          </Link>
        </section>
      </div>
    </AppLayout>
  );
}

function ActionCard({ title, description, link }) {
  return (
    <Link 
      to={link}
      style={{
        display: 'block',
        padding: '1.5rem',
        background: 'white',
        border: '1px solid #e2e8f0',
        borderRadius: '8px',
        textDecoration: 'none',
        transition: 'all 0.2s',
        cursor: 'pointer'
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.borderColor = '#1e40af';
        e.currentTarget.style.boxShadow = '0 4px 6px rgba(0,0,0,0.1)';
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.borderColor = '#e2e8f0';
        e.currentTarget.style.boxShadow = 'none';
      }}
    >
      <h3 style={{ fontSize: '1.25rem', marginBottom: '0.5rem', color: '#1f2937' }}>{title}</h3>
      <p style={{ color: '#64748b', margin: 0 }}>{description}</p>
    </Link>
  );
}

function ResourceItem({ title, description }) {
  return (
    <li style={{ 
      padding: '1rem 0', 
      borderBottom: '1px solid #e2e8f0',
      ':last-child': { borderBottom: 'none' }
    }}>
      <h4 style={{ fontSize: '1.125rem', marginBottom: '0.25rem', color: '#1f2937' }}>{title}</h4>
      <p style={{ color: '#64748b', margin: 0, fontSize: '0.875rem' }}>{description}</p>
    </li>
  );
}
