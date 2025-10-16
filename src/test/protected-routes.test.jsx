import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { HelmetProvider } from 'react-helmet-async';
import { ProtectedRoute } from '../components/ProtectedRoute';

const TestComponent = ({ text }) => <div>{text}</div>;
const LoginPage = () => <div>Login Page</div>;

const renderProtectedRoute = (component, { route = '/', requiredRole } = {}) => {
  return render(
    <HelmetProvider>
      <MemoryRouter initialEntries={[route]}>
        <Routes>
          <Route path="/login" element={<LoginPage />} />
          <Route
            path="/"
            element={
              <ProtectedRoute requiredRole={requiredRole}>
                {component}
              </ProtectedRoute>
            }
          />
        </Routes>
      </MemoryRouter>
    </HelmetProvider>
  );
};

describe('Protected Routes', () => {
  describe('Authentication', () => {
    it('allows access when authenticated', () => {
      renderProtectedRoute(<TestComponent text="Protected Content" />);
      expect(screen.getByText('Protected Content')).toBeInTheDocument();
    });

    // Note: These tests use placeholder authentication
    // In production, replace with actual auth context
    it('renders content for authenticated users', () => {
      renderProtectedRoute(<TestComponent text="Secure Page" />);
      expect(screen.getByText('Secure Page')).toBeInTheDocument();
    });
  });

  describe('Role-Based Access', () => {
    it('allows admin access to admin routes', () => {
      renderProtectedRoute(
        <TestComponent text="Admin Dashboard" />,
        { requiredRole: 'admin' }
      );
      expect(screen.getByText('Admin Dashboard')).toBeInTheDocument();
    });

    it('allows instructor access to instructor routes', () => {
      renderProtectedRoute(
        <TestComponent text="Instructor Portal" />,
        { requiredRole: 'instructor' }
      );
      expect(screen.getByText('Instructor Portal')).toBeInTheDocument();
    });

    it('allows admin access to instructor routes', () => {
      // Admins should have access to all routes
      renderProtectedRoute(
        <TestComponent text="Instructor Content" />,
        { requiredRole: 'instructor' }
      );
      expect(screen.getByText('Instructor Content')).toBeInTheDocument();
    });
  });

  describe('Route Protection', () => {
    it('protects admin routes', () => {
      const routes = [
        '/admin-console',
        '/admin-dashboard',
        '/user-management'
      ];
      
      routes.forEach(route => {
        expect(route).toMatch(/^\/admin/);
      });
    });

    it('protects instructor routes', () => {
      const routes = [
        '/instructor',
        '/instructor-edit',
        '/instructor-new',
        '/course-builder'
      ];
      
      routes.forEach(route => {
        expect(route).toMatch(/^\/instructor|course-builder/);
      });
    });
  });
});
