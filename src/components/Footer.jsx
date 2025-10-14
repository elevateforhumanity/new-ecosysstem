import React from 'react';
import { Link } from 'react-router-dom';

const Footer = () => {
  return (
    <footer className="site-footer" role="contentinfo">
      <div className="footer-container">
        <div className="footer-section">
          <h3>Elevate for Humanity</h3>
          <p>Empowering communities through technology and innovation</p>
        </div>
        <div className="footer-section">
          <h4>Quick Links</h4>
          <nav aria-label="Footer navigation">
            <Link to="/" aria-label="Home page">Home</Link>
            <Link to="/about" aria-label="About us">About</Link>
            <Link to="/blog" aria-label="Blog posts">Blog</Link>
            <Link to="/contact" aria-label="Contact us">Contact</Link>
          </nav>
        </div>
        <div className="footer-section">
          <h4>Connect</h4>
          <nav aria-label="Social media links">
            <a href="https://facebook.com" target="_blank" rel="noopener noreferrer" aria-label="Visit our Facebook page">Facebook</a>
            <a href="https://linkedin.com" target="_blank" rel="noopener noreferrer" aria-label="Visit our LinkedIn profile">LinkedIn</a>
            <a href="https://youtube.com" target="_blank" rel="noopener noreferrer" aria-label="Visit our YouTube channel">YouTube</a>
          </nav>
        </div>
      </div>
      <div className="footer-bottom">
        <p>&copy; {new Date().getFullYear()} Elevate for Humanity. All rights reserved.</p>
      </div>
    </footer>
  );
};

export default Footer;
