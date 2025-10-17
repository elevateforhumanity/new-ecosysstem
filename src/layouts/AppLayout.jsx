import React from "react";
import PropTypes from "prop-types";
import { NavLink } from "react-router-dom";
import { Helmet } from "react-helmet-async";

export default function AppLayout({ title, children }) {
  return (
    <>
      <Helmet>
        <title>{title ? `${title} | App` : "App"}</title>
        <meta name="description" content="Workforce readiness and learning platform." />
      </Helmet>
      <a href="#main-content" className="skip-link">Skip to content</a>
      <header style={{ padding: "12px 24px", background: "#0f172a" }}>
        <nav style={{ display: "flex", gap: 16, flexWrap: "wrap" }}>
          <NavLink style={linkStyle} to="/">Home</NavLink>
          <NavLink style={linkStyle} to="/courses">Courses</NavLink>
          <NavLink style={linkStyle} to="/account">Account</NavLink>
          <NavLink style={linkStyle} to="/support">Support</NavLink>
          <NavLink style={linkStyle} to="/partners">Partners</NavLink>
        </nav>
      </header>
      <main id="main-content">{children}</main>
      <footer style={{ padding: 24, textAlign: "center", fontSize: 12, color: "var(--brand-text-muted)", borderTop: "1px solid var(--brand-border)" }}>
        <div style={{ marginBottom: 16 }}>
          <NavLink style={footerLinkStyle} to="/privacy-policy">Privacy Policy</NavLink>
          {" | "}
          <NavLink style={footerLinkStyle} to="/terms-of-service">Terms of Service</NavLink>
          {" | "}
          <NavLink style={footerLinkStyle} to="/refund-policy">Refund Policy</NavLink>
          {" | "}
          <NavLink style={footerLinkStyle} to="/support">Support</NavLink>
        </div>
        <div>© {new Date().getFullYear()} Elevate for Humanity. All rights reserved.</div>
      </footer>
    </>
  );
}

const linkStyle = ({ isActive }) => ({
  color: isActive ? "#38bdf8" : "var(--brand-border)",
  textDecoration: "none",
  fontWeight: 500
});

const footerLinkStyle = {
  color: "var(--brand-text-muted)",
  textDecoration: "none",
  fontSize: 12
};

AppLayout.propTypes = {
  title: PropTypes.string,
  children: PropTypes.node
};