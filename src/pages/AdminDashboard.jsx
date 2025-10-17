/*
  Copyright (c) 2025 Elevate for Humanity
  Commercial License. No resale, sublicensing, or redistribution allowed.
  See LICENSE file for details.
*/
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import AppLayout from '../layouts/AppLayout';
import { StatCard, LineChart, BarChart, PieChart } from '../components/Chart';
import { api } from '../lib/api';
import { LoadingSpinner } from '../components/LoadingSpinner';

export default function AdminDashboard() {
  const [stats, setStats] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    setIsLoading(true);
    try {
      const data = await api.get('/admin/dashboard');
      setStats(data);
    } catch (error) {
      console.error('Failed to fetch dashboard data:', error);
      setStats(getMockData());
    } finally {
      setIsLoading(false);
    }
  };

  const getMockData = () => ({
    overview: {
      totalUsers: { value: 12458, change: 12.5 },
      activeCourses: { value: 342, change: 8.3 },
      revenue: { value: 45230, change: 15.7 },
      supportTickets: { value: 23, change: -18.2 },
    },
    userGrowth: [
      { label: 'Jan', value: 8500 },
      { label: 'Feb', value: 9200 },
      { label: 'Mar', value: 9800 },
      { label: 'Apr', value: 10500 },
      { label: 'May', value: 11200 },
      { label: 'Jun', value: 12458 },
    ],
    courseEnrollments: [
      { label: 'Web Dev', value: 3420 },
      { label: 'Data Science', value: 2890 },
      { label: 'Design', value: 2340 },
      { label: 'Marketing', value: 1980 },
      { label: 'Business', value: 1560 },
    ],
    usersByRole: [
      { label: 'Students', value: 10890 },
      { label: 'Instructors', value: 1234 },
      { label: 'Admins', value: 334 },
    ],
    revenueByMonth: [
      { label: 'Jan', value: 32000 },
      { label: 'Feb', value: 35000 },
      { label: 'Mar', value: 38000 },
      { label: 'Apr', value: 41000 },
      { label: 'May', value: 43000 },
      { label: 'Jun', value: 45230 },
    ],
  });

  if (isLoading) {
    return (
      <AppLayout>
        <div
          style={{
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            minHeight: 400,
          }}
        >
          <LoadingSpinner size="large" />
        </div>
      </AppLayout>
    );
  }

  const data = stats || getMockData();

  return (
    <AppLayout>
      <div style={{ maxWidth: 1400, margin: '0 auto', padding: 32 }}>
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: 32,
          }}
        >
          <h1 style={{ fontSize: 32, fontWeight: 700 }}>
            Admin Analytics Dashboard
          </h1>
          <button
            onClick={fetchDashboardData}
            style={{
              padding: '10px 20px',
              fontSize: 14,
              border: '1px solid var(--color-border)',
              borderRadius: 6,
              backgroundColor: 'var(--color-bg-secondary)',
              color: 'var(--color-text-primary)',
              cursor: 'pointer',
            }}
          >
            🔄 Refresh
          </button>
        </div>

        {/* Overview Stats */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
            gap: 20,
            marginBottom: 40,
          }}
        >
          <StatCard
            title="Total Users"
            value={data.overview.totalUsers.value.toLocaleString()}
            change={data.overview.totalUsers.change}
            icon="👥"
            color="var(--color-primary)"
          />
          <StatCard
            title="Active Courses"
            value={data.overview.activeCourses.value.toLocaleString()}
            change={data.overview.activeCourses.change}
            icon="📚"
            color="var(--color-success)"
          />
          <StatCard
            title="Revenue (MTD)"
            value={`$${data.overview.revenue.value.toLocaleString()}`}
            change={data.overview.revenue.change}
            icon="💰"
            color="var(--color-warning)"
          />
          <StatCard
            title="Support Tickets"
            value={data.overview.supportTickets.value.toLocaleString()}
            change={data.overview.supportTickets.change}
            icon="🎫"
            color="var(--color-danger)"
          />
        </div>

        {/* Charts Grid */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(500px, 1fr))',
            gap: 24,
            marginBottom: 40,
          }}
        >
          {/* User Growth */}
          <div
            style={{
              backgroundColor: 'var(--color-card-bg)',
              padding: 24,
              borderRadius: 8,
              border: '1px solid var(--color-border)',
            }}
          >
            <h3 style={{ fontSize: 18, fontWeight: 600, marginBottom: 20 }}>
              User Growth
            </h3>
            <LineChart
              data={data.userGrowth}
              width={500}
              height={300}
              color="var(--color-primary)"
            />
          </div>

          {/* Revenue Trend */}
          <div
            style={{
              backgroundColor: 'var(--color-card-bg)',
              padding: 24,
              borderRadius: 8,
              border: '1px solid var(--color-border)',
            }}
          >
            <h3 style={{ fontSize: 18, fontWeight: 600, marginBottom: 20 }}>
              Revenue Trend
            </h3>
            <LineChart
              data={data.revenueByMonth}
              width={500}
              height={300}
              color="var(--color-success)"
            />
          </div>

          {/* Course Enrollments */}
          <div
            style={{
              backgroundColor: 'var(--color-card-bg)',
              padding: 24,
              borderRadius: 8,
              border: '1px solid var(--color-border)',
            }}
          >
            <h3 style={{ fontSize: 18, fontWeight: 600, marginBottom: 20 }}>
              Top Courses by Enrollment
            </h3>
            <BarChart
              data={data.courseEnrollments}
              width={500}
              height={300}
              color="var(--color-info)"
            />
          </div>

          {/* Users by Role */}
          <div
            style={{
              backgroundColor: 'var(--color-card-bg)',
              padding: 24,
              borderRadius: 8,
              border: '1px solid var(--color-border)',
            }}
          >
            <h3 style={{ fontSize: 18, fontWeight: 600, marginBottom: 20 }}>
              Users by Role
            </h3>
            <PieChart data={data.usersByRole} width={500} height={300} />
          </div>
        </div>

        {/* Quick Actions */}
        <h2 style={{ fontSize: 24, fontWeight: 600, marginBottom: 20 }}>
          Quick Actions
        </h2>
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
            gap: 24,
          }}
        >
          <Link
            to="/user-management"
            style={{
              backgroundColor: 'var(--color-card-bg)',
              padding: 24,
              borderRadius: 8,
              border: '1px solid var(--color-border)',
              textDecoration: 'none',
              color: 'inherit',
            }}
          >
            <div style={{ fontSize: 32, marginBottom: 12 }}>👥</div>
            <h3 style={{ fontSize: 18, fontWeight: 600, marginBottom: 8 }}>
              User Management
            </h3>
            <p style={{ fontSize: 14, color: 'var(--color-text-secondary)' }}>
              Manage users, roles, and permissions
            </p>
          </Link>

          <Link
            to="/course-builder"
            style={{
              backgroundColor: 'var(--color-card-bg)',
              padding: 24,
              borderRadius: 8,
              border: '1px solid var(--color-border)',
              textDecoration: 'none',
              color: 'inherit',
            }}
          >
            <div style={{ fontSize: 32, marginBottom: 12 }}>📚</div>
            <h3 style={{ fontSize: 18, fontWeight: 600, marginBottom: 8 }}>
              Course Management
            </h3>
            <p style={{ fontSize: 14, color: 'var(--color-text-secondary)' }}>
              Review and manage all courses
            </p>
          </Link>

          <Link
            to="/analytics"
            style={{
              backgroundColor: 'var(--color-card-bg)',
              padding: 24,
              borderRadius: 8,
              border: '1px solid var(--color-border)',
              textDecoration: 'none',
              color: 'inherit',
            }}
          >
            <div style={{ fontSize: 32, marginBottom: 12 }}>📊</div>
            <h3 style={{ fontSize: 18, fontWeight: 600, marginBottom: 8 }}>
              Detailed Analytics
            </h3>
            <p style={{ fontSize: 14, color: 'var(--color-text-secondary)' }}>
              View platform analytics and reports
            </p>
          </Link>

          <Link
            to="/settings"
            style={{
              backgroundColor: 'var(--color-card-bg)',
              padding: 24,
              borderRadius: 8,
              border: '1px solid var(--color-border)',
              textDecoration: 'none',
              color: 'inherit',
            }}
          >
            <div style={{ fontSize: 32, marginBottom: 12 }}>⚙️</div>
            <h3 style={{ fontSize: 18, fontWeight: 600, marginBottom: 8 }}>
              Platform Settings
            </h3>
            <p style={{ fontSize: 14, color: 'var(--brand-text-muted)' }}>
              Configure platform settings
            </p>
          </Link>
        </div>
      </div>
    </AppLayout>
  );
}
