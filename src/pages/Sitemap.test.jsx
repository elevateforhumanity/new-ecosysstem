import React from 'react';
import { render, screen } from '@testing-library/react';
import { HelmetProvider } from 'react-helmet-async';
import { BrowserRouter } from 'react-router-dom';
import { test, expect } from 'vitest';
import Sitemap from './Sitemap';

// Mock window.location for testing
Object.defineProperty(window, 'location', {
  value: {
    href: 'http://localhost:3000/sitemap',
    origin: 'http://localhost:3000'
  },
  writable: true
});

const SitemapWithProviders = () => (
  <HelmetProvider>
    <BrowserRouter>
      <Sitemap />
    </BrowserRouter>
  </HelmetProvider>
);

test('renders sitemap page with proper title', () => {
  render(<SitemapWithProviders />);
  
  expect(screen.getAllByRole('heading', { level: 1 })[0]).toHaveTextContent('Site Map');
});

test('displays navigation sections', () => {
  render(<SitemapWithProviders />);
  
  // Check for key links instead of section headers
  expect(screen.getByText('Home')).toBeInTheDocument();
  expect(screen.getByText('About')).toBeInTheDocument();
  expect(screen.getByText('Course Library')).toBeInTheDocument();
  expect(screen.getByText('Student Portal')).toBeInTheDocument();
});

test('contains key navigation links', () => {
  render(<SitemapWithProviders />);
  
  // Test key navigation links
  const homeLinks = screen.getAllByRole('link', { name: 'Home' });
  expect(homeLinks[0]).toHaveAttribute('href', '/');
  
  const courseLinks = screen.getAllByRole('link', { name: 'Course Library' });
  expect(courseLinks[0]).toHaveAttribute('href', '/courses');
  
  const studentLinks = screen.getAllByRole('link', { name: 'Student Portal' });
  expect(studentLinks[0]).toHaveAttribute('href', '/student');
});

test('displays legal and policy links', () => {
  render(<SitemapWithProviders />);
  
  const privacyLinks = screen.getAllByRole('link', { name: 'Privacy Policy' });
  expect(privacyLinks[0]).toHaveAttribute('href', '/privacy-policy');
  
  const refundLinks = screen.getAllByRole('link', { name: 'Refund Policy' });
  expect(refundLinks[0]).toHaveAttribute('href', '/refund-policy');
  
  const termsLinks = screen.getAllByRole('link', { name: 'Terms of Service' });
  expect(termsLinks[0]).toHaveAttribute('href', '/terms-of-service');
});

test('includes handbook image with proper alt text', () => {
  render(<SitemapWithProviders />);
  
  const handbookImages = screen.getAllByAltText('Elevate for Humanity Student Handbook cover');
  expect(handbookImages[0]).toBeInTheDocument();
  expect(handbookImages[0]).toHaveAttribute('src', '/images/handbook-cover.jpg');
});

test('has proper SEO structure for search engines', () => {
  render(<SitemapWithProviders />);

  // Verify the component renders the main content
  expect(screen.getAllByRole('heading', { level: 1 })[0]).toBeInTheDocument();
  expect(screen.getAllByRole('heading', { level: 1 })[0]).toHaveTextContent('Site Map');
});