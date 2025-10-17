/*
  Copyright (c) 2025 Elevate for Humanity
  Commercial License. No resale, sublicensing, or redistribution allowed.
  See LICENSE file for details.
*/
import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import AppLayout from '../layouts/AppLayout';

export default function Certificates() {
  const [filter, setFilter] = useState('all');

  const certificates = [
    {
      id: 1,
      courseName: 'Introduction to Web Development',
      instructor: 'Dr. Sarah Johnson',
      completionDate: '2024-12-15',
      issueDate: '2024-12-16',
      certificateId: 'CERT-2024-001234',
      grade: '95%',
      status: 'issued',
      skills: ['HTML', 'CSS', 'JavaScript'],
    },
    {
      id: 2,
      courseName: 'Data Science Fundamentals',
      instructor: 'Prof. Michael Chen',
      completionDate: '2024-11-28',
      issueDate: '2024-11-29',
      certificateId: 'CERT-2024-001189',
      grade: '88%',
      status: 'issued',
      skills: ['Python', 'Data Analysis', 'Statistics'],
    },
    {
      id: 3,
      courseName: 'Digital Marketing Essentials',
      instructor: 'Emily Rodriguez',
      completionDate: '2024-10-10',
      issueDate: '2024-10-11',
      certificateId: 'CERT-2024-000987',
      grade: '92%',
      status: 'issued',
      skills: ['SEO', 'Social Media', 'Content Marketing'],
    },
    {
      id: 4,
      courseName: 'Project Management Professional',
      instructor: 'James Wilson',
      completionDate: null,
      issueDate: null,
      certificateId: null,
      grade: 'In Progress',
      status: 'in-progress',
      progress: 65,
      skills: ['Agile', 'Scrum', 'Leadership'],
    },
  ];

  const filteredCertificates = certificates.filter((cert) => {
    if (filter === 'all') return true;
    return cert.status === filter;
  });

  const issuedCount = certificates.filter((c) => c.status === 'issued').length;
  const inProgressCount = certificates.filter(
    (c) => c.status === 'in-progress'
  ).length;

  return (
    <AppLayout>
      <div style={{ maxWidth: 1200, margin: '0 auto', padding: 32 }}>
        {/* Header */}
        <div style={{ marginBottom: 32 }}>
          <h1 style={{ fontSize: 32, fontWeight: 700, marginBottom: 8 }}>
            My Certificates
          </h1>
          <p style={{ color: 'var(--brand-text-muted)', fontSize: 16 }}>
            View, download, and share your earned certificates
          </p>
        </div>

        {/* Stats */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
            gap: 20,
            marginBottom: 32,
          }}
        >
          <div
            style={{
              backgroundColor: '#fff',
              padding: 24,
              borderRadius: 8,
              border: '1px solid var(--brand-border)',
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
              {issuedCount}
            </div>
            <div style={{ fontSize: 14, color: 'var(--brand-text-muted)' }}>
              Certificates Earned
            </div>
          </div>

          <div
            style={{
              backgroundColor: '#fff',
              padding: 24,
              borderRadius: 8,
              border: '1px solid var(--brand-border)',
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
              {inProgressCount}
            </div>
            <div style={{ fontSize: 14, color: 'var(--brand-text-muted)' }}>
              In Progress
            </div>
          </div>

          <div
            style={{
              backgroundColor: '#fff',
              padding: 24,
              borderRadius: 8,
              border: '1px solid var(--brand-border)',
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
              {certificates.reduce(
                (acc, cert) => acc + (cert.skills?.length || 0),
                0
              )}
            </div>
            <div style={{ fontSize: 14, color: 'var(--brand-text-muted)' }}>
              Skills Acquired
            </div>
          </div>
        </div>

        {/* Filter Tabs */}
        <div
          style={{
            display: 'flex',
            gap: 12,
            marginBottom: 24,
            borderBottom: '2px solid var(--brand-border)',
          }}
        >
          <button
            onClick={() => setFilter('all')}
            style={{
              padding: '12px 24px',
              backgroundColor: 'transparent',
              color:
                filter === 'all'
                  ? 'var(--brand-info)'
                  : 'var(--brand-text-muted)',
              border: 'none',
              borderBottom:
                filter === 'all'
                  ? '2px solid var(--brand-info)'
                  : '2px solid transparent',
              fontSize: 14,
              fontWeight: 600,
              cursor: 'pointer',
              marginBottom: -2,
            }}
          >
            All ({certificates.length})
          </button>
          <button
            onClick={() => setFilter('issued')}
            style={{
              padding: '12px 24px',
              backgroundColor: 'transparent',
              color:
                filter === 'issued'
                  ? 'var(--brand-info)'
                  : 'var(--brand-text-muted)',
              border: 'none',
              borderBottom:
                filter === 'issued'
                  ? '2px solid var(--brand-info)'
                  : '2px solid transparent',
              fontSize: 14,
              fontWeight: 600,
              cursor: 'pointer',
              marginBottom: -2,
            }}
          >
            Issued ({issuedCount})
          </button>
          <button
            onClick={() => setFilter('in-progress')}
            style={{
              padding: '12px 24px',
              backgroundColor: 'transparent',
              color:
                filter === 'in-progress'
                  ? 'var(--brand-info)'
                  : 'var(--brand-text-muted)',
              border: 'none',
              borderBottom:
                filter === 'in-progress'
                  ? '2px solid var(--brand-info)'
                  : '2px solid transparent',
              fontSize: 14,
              fontWeight: 600,
              cursor: 'pointer',
              marginBottom: -2,
            }}
          >
            In Progress ({inProgressCount})
          </button>
        </div>

        {/* Certificates List */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
          {filteredCertificates.map((cert) => (
            <div
              key={cert.id}
              style={{
                backgroundColor: '#fff',
                border: '1px solid var(--brand-border)',
                borderRadius: 8,
                padding: 24,
                transition: 'box-shadow 0.2s',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.boxShadow =
                  '0 4px 12px rgba(0, 0, 0, 0.1)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.boxShadow = 'none';
              }}
            >
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'flex-start',
                }}
              >
                <div style={{ flex: 1 }}>
                  {/* Course Name & Status */}
                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: 12,
                      marginBottom: 8,
                    }}
                  >
                    <h3 style={{ fontSize: 20, fontWeight: 600, margin: 0 }}>
                      {cert.courseName}
                    </h3>
                    <span
                      style={{
                        padding: '4px 12px',
                        backgroundColor:
                          cert.status === 'issued' ? '#d4edda' : '#fff3cd',
                        color: cert.status === 'issued' ? '#155724' : '#856404',
                        borderRadius: 12,
                        fontSize: 12,
                        fontWeight: 500,
                      }}
                    >
                      {cert.status === 'issued' ? 'Issued' : 'In Progress'}
                    </span>
                  </div>

                  {/* Instructor */}
                  <p
                    style={{
                      fontSize: 14,
                      color: 'var(--brand-text-muted)',
                      marginBottom: 12,
                    }}
                  >
                    Instructor: {cert.instructor}
                  </p>

                  {/* Details Grid */}
                  <div
                    style={{
                      display: 'grid',
                      gridTemplateColumns:
                        'repeat(auto-fit, minmax(150px, 1fr))',
                      gap: 16,
                      marginBottom: 16,
                    }}
                  >
                    {cert.completionDate && (
                      <div>
                        <div
                          style={{
                            fontSize: 12,
                            color: '#999',
                            marginBottom: 4,
                          }}
                        >
                          Completion Date
                        </div>
                        <div style={{ fontSize: 14, fontWeight: 500 }}>
                          {new Date(cert.completionDate).toLocaleDateString()}
                        </div>
                      </div>
                    )}

                    {cert.certificateId && (
                      <div>
                        <div
                          style={{
                            fontSize: 12,
                            color: '#999',
                            marginBottom: 4,
                          }}
                        >
                          Certificate ID
                        </div>
                        <div
                          style={{
                            fontSize: 14,
                            fontWeight: 500,
                            fontFamily: 'monospace',
                          }}
                        >
                          {cert.certificateId}
                        </div>
                      </div>
                    )}

                    <div>
                      <div
                        style={{ fontSize: 12, color: '#999', marginBottom: 4 }}
                      >
                        Grade
                      </div>
                      <div style={{ fontSize: 14, fontWeight: 500 }}>
                        {cert.grade}
                      </div>
                    </div>
                  </div>

                  {/* Progress Bar (for in-progress courses) */}
                  {cert.status === 'in-progress' &&
                    cert.progress !== undefined && (
                      <div style={{ marginBottom: 16 }}>
                        <div
                          style={{
                            display: 'flex',
                            justifyContent: 'space-between',
                            marginBottom: 8,
                          }}
                        >
                          <span
                            style={{
                              fontSize: 12,
                              color: 'var(--brand-text-muted)',
                            }}
                          >
                            Progress
                          </span>
                          <span style={{ fontSize: 12, fontWeight: 600 }}>
                            {cert.progress}%
                          </span>
                        </div>
                        <div
                          style={{
                            width: '100%',
                            height: 8,
                            backgroundColor: 'var(--brand-border)',
                            borderRadius: 4,
                            overflow: 'hidden',
                          }}
                        >
                          <div
                            style={{
                              width: `${cert.progress}%`,
                              height: '100%',
                              backgroundColor: 'var(--brand-info)',
                              transition: 'width 0.3s',
                            }}
                          />
                        </div>
                      </div>
                    )}

                  {/* Skills */}
                  {cert.skills && cert.skills.length > 0 && (
                    <div>
                      <div
                        style={{ fontSize: 12, color: '#999', marginBottom: 8 }}
                      >
                        Skills Covered
                      </div>
                      <div
                        style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}
                      >
                        {cert.skills.map((skill, index) => (
                          <span
                            key={index}
                            style={{
                              padding: '4px 12px',
                              backgroundColor: '#f0f0f0',
                              borderRadius: 12,
                              fontSize: 12,
                              color: '#333',
                            }}
                          >
                            {skill}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                {/* Certificate Preview */}
                <div
                  style={{
                    width: 120,
                    height: 90,
                    backgroundColor:
                      cert.status === 'issued'
                        ? '#f8f8f8'
                        : 'var(--brand-border)',
                    borderRadius: 4,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    marginLeft: 24,
                    border: '1px solid var(--brand-border)',
                  }}
                >
                  <span style={{ fontSize: 32 }}>
                    {cert.status === 'issued' ? '🏆' : '⏳'}
                  </span>
                </div>
              </div>

              {/* Actions */}
              {cert.status === 'issued' && (
                <div
                  style={{
                    display: 'flex',
                    gap: 12,
                    marginTop: 20,
                    paddingTop: 20,
                    borderTop: '1px solid #f0f0f0',
                  }}
                >
                  <button
                    style={{
                      padding: '8px 20px',
                      backgroundColor: 'var(--brand-info)',
                      color: '#fff',
                      border: 'none',
                      borderRadius: 6,
                      fontSize: 14,
                      fontWeight: 500,
                      cursor: 'pointer',
                    }}
                  >
                    Download PDF
                  </button>
                  <button
                    style={{
                      padding: '8px 20px',
                      backgroundColor: '#fff',
                      color: 'var(--brand-info)',
                      border: '1px solid var(--brand-info)',
                      borderRadius: 6,
                      fontSize: 14,
                      fontWeight: 500,
                      cursor: 'pointer',
                    }}
                  >
                    Share on LinkedIn
                  </button>
                  <button
                    style={{
                      padding: '8px 20px',
                      backgroundColor: '#fff',
                      color: 'var(--brand-text-muted)',
                      border: '1px solid var(--brand-border)',
                      borderRadius: 6,
                      fontSize: 14,
                      fontWeight: 500,
                      cursor: 'pointer',
                    }}
                  >
                    Verify Certificate
                  </button>
                </div>
              )}

              {cert.status === 'in-progress' && (
                <div
                  style={{
                    marginTop: 20,
                    paddingTop: 20,
                    borderTop: '1px solid #f0f0f0',
                  }}
                >
                  <Link
                    to={`/course/${cert.id}`}
                    style={{
                      display: 'inline-block',
                      padding: '8px 20px',
                      backgroundColor: 'var(--brand-success)',
                      color: '#fff',
                      border: 'none',
                      borderRadius: 6,
                      fontSize: 14,
                      fontWeight: 500,
                      textDecoration: 'none',
                    }}
                  >
                    Continue Course
                  </Link>
                </div>
              )}
            </div>
          ))}
        </div>

        {filteredCertificates.length === 0 && (
          <div
            style={{
              textAlign: 'center',
              padding: 48,
              backgroundColor: '#f8f8f8',
              borderRadius: 8,
            }}
          >
            <div style={{ fontSize: 48, marginBottom: 16 }}>📜</div>
            <h3 style={{ fontSize: 20, fontWeight: 600, marginBottom: 8 }}>
              No certificates yet
            </h3>
            <p
              style={{
                fontSize: 14,
                color: 'var(--brand-text-muted)',
                marginBottom: 24,
              }}
            >
              Complete courses to earn certificates and showcase your skills
            </p>
            <Link
              to="/courses"
              style={{
                display: 'inline-block',
                padding: '12px 24px',
                backgroundColor: 'var(--brand-info)',
                color: '#fff',
                borderRadius: 6,
                fontSize: 14,
                fontWeight: 600,
                textDecoration: 'none',
              }}
            >
              Browse Courses
            </Link>
          </div>
        )}

        {/* Certificate Verification Info */}
        <div
          style={{
            marginTop: 48,
            padding: 24,
            backgroundColor: '#f8f8f8',
            borderRadius: 8,
          }}
        >
          <h3 style={{ fontSize: 18, fontWeight: 600, marginBottom: 12 }}>
            Certificate Verification
          </h3>
          <p
            style={{
              fontSize: 14,
              color: 'var(--brand-text-muted)',
              marginBottom: 16,
              lineHeight: 1.6,
            }}
          >
            All certificates include a unique verification code. Employers or
            institutions can verify the authenticity of your certificate by
            entering the certificate ID on our verification page.
          </p>
          <Link
            to="/verify-certificate"
            style={{
              color: 'var(--brand-info)',
              textDecoration: 'none',
              fontSize: 14,
              fontWeight: 500,
            }}
          >
            Verify a Certificate →
          </Link>
        </div>
      </div>
    </AppLayout>
  );
}
