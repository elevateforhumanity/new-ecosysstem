/*
  Copyright (c) 2025 Elevate for Humanity
  Commercial License. No resale, sublicensing, or redistribution allowed.
  See LICENSE file for details.
*/

import React from "react";
import AppLayout from "../layouts/AppLayout";
import { useAnalytics } from "../hooks/useAnalytics";

export default function Analytics() {
  useAnalytics("Analytics Dashboard");

  const stats = [
    { label: "Total Enrollments", value: "1,247", change: "+12%", trend: "up" },
    { label: "Course Completions", value: "1,087", change: "+8%", trend: "up" },
    { label: "Active Students", value: "892", change: "+15%", trend: "up" },
    { label: "Revenue (YTD)", value: "$2.85M", change: "+23%", trend: "up" }
  ];

  const topCourses = [
    { name: "Workforce Readiness 101", enrollments: 342, completion: 87 },
    { name: "Financial Literacy Basics", enrollments: 298, completion: 92 },
    { name: "Digital Skills Fundamentals", enrollments: 276, completion: 85 },
    { name: "Career Development", enrollments: 231, completion: 79 },
    { name: "Business Essentials", enrollments: 189, completion: 88 }
  ];

  const recentActivity = [
    { date: "2025-10-03", event: "New enrollment in Workforce Readiness 101", user: "Sarah Johnson" },
    { date: "2025-10-03", event: "Course completed: Financial Literacy Basics", user: "Michael Chen" },
    { date: "2025-10-02", event: "New enrollment in Digital Skills Fundamentals", user: "Emily Rodriguez" },
    { date: "2025-10-02", event: "Course completed: Career Development", user: "David Kim" },
    { date: "2025-10-01", event: "New enrollment in Business Essentials", user: "Jessica Williams" }
  ];

  return (
    <AppLayout title="Analytics Dashboard">
      <div style={{ maxWidth: '1400px', margin: '0 auto', padding: '2rem' }}>
        {/* Header */}
        <header style={{ marginBottom: '2rem' }}>
          <h1 style={{ fontSize: '2rem', marginBottom: '0.5rem', color: 'var(--brand-text)' }}>Analytics Dashboard</h1>
          <p style={{ color: 'var(--brand-text-muted)' }}>Track performance metrics and student engagement across all programs</p>
        </header>

        {/* Key Metrics */}
        <section style={{ marginBottom: '3rem' }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '1.5rem' }}>
            {stats.map((stat, idx) => (
              <StatCard key={idx} {...stat} />
            ))}
          </div>
        </section>

        {/* Two Column Layout */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(500px, 1fr))', gap: '2rem', marginBottom: '3rem' }}>
          {/* Top Courses */}
          <section>
            <h2 style={{ fontSize: '1.5rem', marginBottom: '1rem', color: 'var(--brand-text)' }}>Top Performing Courses</h2>
            <div style={{ background: 'white', border: '1px solid var(--brand-border)', borderRadius: '8px', overflow: 'hidden' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                  <tr style={{ background: 'var(--brand-surface)', borderBottom: '1px solid var(--brand-border)' }}>
                    <th style={{ padding: '1rem', textAlign: 'left', fontSize: '0.875rem', fontWeight: '600', color: 'var(--brand-text-muted)' }}>Course</th>
                    <th style={{ padding: '1rem', textAlign: 'right', fontSize: '0.875rem', fontWeight: '600', color: 'var(--brand-text-muted)' }}>Enrollments</th>
                    <th style={{ padding: '1rem', textAlign: 'right', fontSize: '0.875rem', fontWeight: '600', color: 'var(--brand-text-muted)' }}>Completion</th>
                  </tr>
                </thead>
                <tbody>
                  {topCourses.map((course, idx) => (
                    <tr key={idx} style={{ borderBottom: '1px solid var(--brand-border)' }}>
                      <td style={{ padding: '1rem', color: 'var(--brand-text)' }}>{course.name}</td>
                      <td style={{ padding: '1rem', textAlign: 'right', color: 'var(--brand-text)' }}>{course.enrollments}</td>
                      <td style={{ padding: '1rem', textAlign: 'right' }}>
                        <span style={{ 
                          padding: '0.25rem 0.75rem', 
                          background: course.completion >= 85 ? '#dcfce7' : '#fef3c7',
                          color: course.completion >= 85 ? '#166534' : '#854d0e',
                          borderRadius: '9999px',
                          fontSize: '0.875rem',
                          fontWeight: '600'
                        }}>
                          {course.completion}%
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>

          {/* Recent Activity */}
          <section>
            <h2 style={{ fontSize: '1.5rem', marginBottom: '1rem', color: 'var(--brand-text)' }}>Recent Activity</h2>
            <div style={{ background: 'white', border: '1px solid var(--brand-border)', borderRadius: '8px', padding: '1rem' }}>
              <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
                {recentActivity.map((activity, idx) => (
                  <li key={idx} style={{ 
                    padding: '1rem 0', 
                    borderBottom: idx < recentActivity.length - 1 ? '1px solid var(--brand-border)' : 'none' 
                  }}>
                    <div style={{ fontSize: '0.875rem', color: 'var(--brand-text-muted)', marginBottom: '0.25rem' }}>{activity.date}</div>
                    <div style={{ color: 'var(--brand-text)', marginBottom: '0.25rem' }}>{activity.event}</div>
                    <div style={{ fontSize: '0.875rem', color: 'var(--brand-text-muted)' }}>User: {activity.user}</div>
                  </li>
                ))}
              </ul>
            </div>
          </section>
        </div>

        {/* Engagement Overview */}
        <section>
          <h2 style={{ fontSize: '1.5rem', marginBottom: '1rem', color: 'var(--brand-text)' }}>Engagement Overview</h2>
          <div style={{ background: 'white', border: '1px solid var(--brand-border)', borderRadius: '8px', padding: '2rem' }}>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '2rem' }}>
              <MetricItem label="Average Completion Rate" value="87%" />
              <MetricItem label="Student Satisfaction" value="4.6/5.0" />
              <MetricItem label="Active Instructors" value="42" />
              <MetricItem label="Total Courses" value="68" />
            </div>
          </div>
        </section>
      </div>
    </AppLayout>
  );
}

function StatCard({ label, value, change, trend }) {
  return (
    <div style={{ 
      background: 'white', 
      border: '1px solid var(--brand-border)', 
      borderRadius: '8px', 
      padding: '1.5rem' 
    }}>
      <div style={{ fontSize: '0.875rem', color: 'var(--brand-text-muted)', marginBottom: '0.5rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
        {label}
      </div>
      <div style={{ fontSize: '2rem', fontWeight: '700', color: 'var(--brand-text)', marginBottom: '0.5rem' }}>
        {value}
      </div>
      <div style={{ 
        fontSize: '0.875rem', 
        color: trend === 'up' ? 'var(--brand-success)' : 'var(--brand-danger)',
        fontWeight: '600'
      }}>
        {change} from last month
      </div>
    </div>
  );
}

function MetricItem({ label, value }) {
  return (
    <div style={{ textAlign: 'center' }}>
      <div style={{ fontSize: '2rem', fontWeight: '700', color: 'var(--brand-info)', marginBottom: '0.5rem' }}>
        {value}
      </div>
      <div style={{ fontSize: '0.875rem', color: 'var(--brand-text-muted)' }}>
        {label}
      </div>
    </div>
  );
}
