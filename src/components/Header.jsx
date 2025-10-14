import React from 'react';
import { Link } from 'react-router-dom';

const Header = () => {
  return (
    <header className="site-header" role="banner">
      <div className="header-container">
        <Link to="/" className="header-logo" aria-label="Elevate for Humanity Home">
          <h1>Elevate for Humanity</h1>
        </Link>
        <nav className="header-nav" role="navigation" aria-label="Main navigation">
          <Link to="/" aria-label="Home page">Home</Link>
          <Link to="/about" aria-label="About us">About</Link>
          <Link to="/blog" aria-label="Blog posts">Blog</Link>
          <Link to="/contact" aria-label="Contact us">Contact</Link>
        </nav>
      </div>
    </header>
  );
};

export default Header;
