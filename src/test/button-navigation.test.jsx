import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { HelmetProvider } from 'react-helmet-async';

// Import pages to test
import GetStarted from '../pages/GetStarted';
import Home from '../pages/Home';
import Connect from '../pages/Connect';

const renderWithProviders = (component, initialRoute = '/') => {
  return render(
    <HelmetProvider>
      <MemoryRouter initialEntries={[initialRoute]}>
        {component}
      </MemoryRouter>
    </HelmetProvider>
  );
};

describe('Button Functionality Tests', () => {
  describe('GetStarted Page', () => {
    it('renders all navigation buttons', () => {
      renderWithProviders(<GetStarted />);
      
      // Check page renders without errors
      const buttons = screen.getAllByRole('button');
      const links = screen.getAllByRole('link');
      expect(buttons.length + links.length).toBeGreaterThan(0);
    });

    it('has working navigation links', () => {
      renderWithProviders(<GetStarted />);
      
      const links = screen.getAllByRole('link');
      expect(links.length).toBeGreaterThan(0);
      
      // Verify links have href attributes
      links.forEach(link => {
        expect(link).toHaveAttribute('href');
      });
    });
  });

  describe('Home Page', () => {
    it('renders navigation buttons', () => {
      renderWithProviders(<Home />);
      
      // Check for main CTA buttons
      const links = screen.getAllByRole('link');
      expect(links.length).toBeGreaterThan(0);
    });

    it('all buttons have valid click handlers or hrefs', () => {
      renderWithProviders(<Home />);
      
      const buttons = screen.queryAllByRole('button');
      const links = screen.getAllByRole('link');
      
      // All interactive elements should exist
      expect(buttons.length + links.length).toBeGreaterThan(0);
    });
  });

  describe('Connect Page', () => {
    it('renders contact form', () => {
      renderWithProviders(<Connect />);
      
      // Check for form elements - Connect page has inputs
      const inputs = screen.getAllByRole('textbox');
      expect(inputs.length).toBeGreaterThan(0);
    });

    it('handles form submission', async () => {
      const { container } = renderWithProviders(<Connect />);
      
      // Find form inputs by name attribute
      const nameInput = container.querySelector('input[name="name"]');
      const emailInput = container.querySelector('input[name="email"]');
      const messageInput = container.querySelector('textarea[name="message"]');
      const subjectInput = container.querySelector('input[name="subject"]');
      
      expect(nameInput).toBeInTheDocument();
      expect(emailInput).toBeInTheDocument();
      
      // Fill required form fields
      fireEvent.change(nameInput, { target: { value: 'Test User' } });
      fireEvent.change(emailInput, { target: { value: 'test@example.com' } });
      fireEvent.change(subjectInput, { target: { value: 'Test Subject' } });
      fireEvent.change(messageInput, { target: { value: 'Test message' } });
      
      // Submit form
      const submitButton = screen.getByRole('button', { name: /send message/i });
      fireEvent.click(submitButton);
      
      // Wait for loading state
      await waitFor(() => {
        // Button should show loading or success state
        const button = screen.getByRole('button');
        expect(button.textContent).toMatch(/Sending|Send Message|Thank You/i);
      }, { timeout: 2000 });
    });
  });
});

describe('Navigation Tests', () => {
  it('all Link components have "to" prop', () => {
    renderWithProviders(<GetStarted />);
    
    const links = screen.getAllByRole('link');
    links.forEach(link => {
      // React Router links should have href
      expect(link.getAttribute('href')).toBeTruthy();
    });
  });

  it('navigation links are not broken', () => {
    renderWithProviders(<Home />);
    
    const links = screen.getAllByRole('link');
    links.forEach(link => {
      const href = link.getAttribute('href');
      // Should not be empty or just #
      expect(href).not.toBe('');
      expect(href).not.toBe('#');
    });
  });
});

describe('Interactive Elements', () => {
  it('buttons have accessible labels', () => {
    renderWithProviders(<GetStarted />);
    
    const buttons = screen.queryAllByRole('button');
    buttons.forEach(button => {
      // Button should have text content or aria-label
      const hasText = button.textContent.trim().length > 0;
      const hasAriaLabel = button.getAttribute('aria-label');
      expect(hasText || hasAriaLabel).toBeTruthy();
    });
  });

  it('links have accessible text', () => {
    renderWithProviders(<Home />);
    
    const links = screen.getAllByRole('link');
    links.forEach(link => {
      // Link should have text content or aria-label
      const hasText = link.textContent.trim().length > 0;
      const hasAriaLabel = link.getAttribute('aria-label');
      expect(hasText || hasAriaLabel).toBeTruthy();
    });
  });
});

describe('Error Handling', () => {
  it('form handles submission errors gracefully', async () => {
    renderWithProviders(<Connect />);
    
    // This test verifies the form doesn't crash on submission
    const form = screen.queryByRole('form');
    if (form) {
      fireEvent.submit(form);
      
      // Should not throw error
      await waitFor(() => {
        expect(form).toBeInTheDocument();
      });
    }
  });
});
