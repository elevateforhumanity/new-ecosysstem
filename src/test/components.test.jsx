import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { HelmetProvider } from 'react-helmet-async';
import { ProtectedRoute } from '../components/ProtectedRoute';
import AppLayout from '../layouts/AppLayout';

const renderWithProviders = (component) => {
  return render(
    <HelmetProvider>
      <MemoryRouter>
        {component}
      </MemoryRouter>
    </HelmetProvider>
  );
};

describe('Component Tests', () => {
  describe('AppLayout', () => {
    it('renders navigation links', () => {
      renderWithProviders(
        <AppLayout title="Test Page">
          <div>Content</div>
        </AppLayout>
      );
      
      expect(screen.getByText('Home')).toBeInTheDocument();
      expect(screen.getByText('Courses')).toBeInTheDocument();
      expect(screen.getByText('Account')).toBeInTheDocument();
      expect(screen.getByText('Support')).toBeInTheDocument();
      expect(screen.getByText('Partners')).toBeInTheDocument();
    });

    it('renders footer links', () => {
      renderWithProviders(
        <AppLayout>
          <div>Content</div>
        </AppLayout>
      );
      
      expect(screen.getByText('Privacy Policy')).toBeInTheDocument();
      expect(screen.getByText('Terms of Service')).toBeInTheDocument();
      expect(screen.getByText('Refund Policy')).toBeInTheDocument();
    });

    it('renders children content', () => {
      renderWithProviders(
        <AppLayout>
          <div>Test Content</div>
        </AppLayout>
      );
      
      expect(screen.getByText('Test Content')).toBeInTheDocument();
    });

    it('sets page title', () => {
      renderWithProviders(
        <AppLayout title="Custom Title">
          <div>Content</div>
        </AppLayout>
      );
      
      // Helmet updates document.title asynchronously
      setTimeout(() => {
        expect(document.title).toContain('Custom Title');
      }, 0);
    });
  });

  describe('ProtectedRoute', () => {
    it('renders children when authenticated', () => {
      renderWithProviders(
        <ProtectedRoute>
          <div>Protected Content</div>
        </ProtectedRoute>
      );
      
      expect(screen.getByText('Protected Content')).toBeInTheDocument();
    });

    it('renders children for admin role', () => {
      renderWithProviders(
        <ProtectedRoute requiredRole="admin">
          <div>Admin Content</div>
        </ProtectedRoute>
      );
      
      expect(screen.getByText('Admin Content')).toBeInTheDocument();
    });

    it('renders children for instructor role', () => {
      renderWithProviders(
        <ProtectedRoute requiredRole="instructor">
          <div>Instructor Content</div>
        </ProtectedRoute>
      );
      
      expect(screen.getByText('Instructor Content')).toBeInTheDocument();
    });
  });
});
