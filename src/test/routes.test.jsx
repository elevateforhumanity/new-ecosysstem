import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MemoryRouter, Routes, Route } from 'react-router-dom';
import { HelmetProvider } from 'react-helmet-async';

// Import pages
import Account from '../pages/Account';
import Profile from '../pages/Profile';
import Settings from '../pages/Settings';
import Login from '../pages/Login';
import NotFound from '../pages/NotFound';
import ThankYou from '../pages/ThankYou';
import ForgotPassword from '../pages/ForgotPassword';
import ResetPassword from '../pages/ResetPassword';
import VerifyEmail from '../pages/VerifyEmail';

const renderWithRouter = (component, { route = '/' } = {}) => {
  return render(
    <HelmetProvider>
      <MemoryRouter initialEntries={[route]}>{component}</MemoryRouter>
    </HelmetProvider>
  );
};

describe('Route Tests', () => {
  describe('Priority 1 Routes', () => {
    it('renders Account page', () => {
      renderWithRouter(<Account />);
      expect(screen.getByText(/My Account/i)).toBeInTheDocument();
    });

    it('renders Profile page', () => {
      renderWithRouter(<Profile />);
      expect(screen.getByText(/Edit Profile/i)).toBeInTheDocument();
    });

    it('renders Settings page', () => {
      renderWithRouter(<Settings />);
      expect(
        screen.getByRole('heading', { name: /Settings/i })
      ).toBeInTheDocument();
    });

    it('renders Login page', () => {
      renderWithRouter(<Login />);
      expect(screen.getByText(/Sign in to your account/i)).toBeInTheDocument();
    });
  });

  describe('Priority 2 Routes', () => {
    it('renders ThankYou page', () => {
      renderWithRouter(<ThankYou />);
      expect(screen.getByText(/Thank You/i)).toBeInTheDocument();
    });

    it('renders NotFound page', () => {
      renderWithRouter(<NotFound />);
      expect(screen.getByText(/404/i)).toBeInTheDocument();
    });
  });

  describe('Verification Routes', () => {
    it('renders ForgotPassword page', () => {
      renderWithRouter(<ForgotPassword />);
      expect(screen.getByText(/Forgot Password/i)).toBeInTheDocument();
    });

    it('renders ResetPassword page', () => {
      renderWithRouter(<ResetPassword />);
      expect(
        screen.getByRole('heading', { name: /Reset Password/i })
      ).toBeInTheDocument();
    });

    it('renders VerifyEmail page', () => {
      renderWithRouter(<VerifyEmail />);
      expect(screen.getByText(/Verify Your Email/i)).toBeInTheDocument();
    });
  });

  describe('Route Navigation', () => {
    it('navigates to 404 for unknown routes', () => {
      renderWithRouter(
        <Routes>
          <Route path="*" element={<NotFound />} />
        </Routes>,
        { route: '/unknown-route' }
      );
      expect(screen.getByText(/404/i)).toBeInTheDocument();
    });
  });
});
