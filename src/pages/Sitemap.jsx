/*
  Copyright (c) 2025 Elevate for Humanity
  Commercial License. No resale, sublicensing, or redistribution allowed.
  See LICENSE file for details.
*/

/*
  Copyright (c) 2025 Elevate for Humanity
  Commercial License. No resale, sublicensing, or redistribution allowed.
  See LICENSE file for details.
*/

/*
  Copyright (c) 2025 Elevate for Humanity
  Commercial License. No resale, sublicensing, or redistribution allowed.
  See LICENSE file for details.
*/

import React from "react";
import { Helmet } from "react-helmet-async";

export default function Sitemap() {
  const structuredData = {
    "@context": "https://schema.org",
    "@type": "WebPage",
    "name": "Site Map - Elevate for Humanity",
    "description": "Complete site map for Elevate for Humanity workforce training programs, student portals, and educational resources.",
    "url": window.location.href,
    "mainEntity": {
      "@type": "SiteNavigationElement",
      "name": "Site Navigation",
      "about": "Navigation structure for Elevate for Humanity educational platform"
    },
    "isPartOf": {
      "@type": "WebSite",
      "name": "Elevate for Humanity",
      "url": "https://www.elevateforhumanity.org"
    }
  };

  return (
    <>
      <Helmet>
        <title>Site Map | Elevate for Humanity - Workforce Training Navigation</title>
        <meta name="description" content="Complete site map for Elevate for Humanity workforce training programs, student portals, instructor resources, and educational ecosystem navigation." />
        <meta name="keywords" content="sitemap, navigation, workforce training, student portal, instructor portal, course library, Elevate for Humanity" />
        <meta name="robots" content="index, follow" />
        <link rel="canonical" href={`${window.location.origin}/sitemap`} />
        
        {/* Open Graph / Facebook */}
        <meta property="og:type" content="website" />
        <meta property="og:title" content="Site Map | Elevate for Humanity - Workforce Training Navigation" />
        <meta property="og:description" content="Complete site map for Elevate for Humanity workforce training programs and educational resources." />
        <meta property="og:url" content={`${window.location.origin}/sitemap`} />
        <meta property="og:site_name" content="Elevate for Humanity" />
        
        {/* Twitter */}
        <meta name="twitter:card" content="summary" />
        <meta name="twitter:title" content="Site Map | Elevate for Humanity" />
        <meta name="twitter:description" content="Complete site map for Elevate for Humanity workforce training programs and educational resources." />
        
        {/* Structured Data */}
        <script type="application/ld+json">
          {JSON.stringify(structuredData)}
        </script>
      </Helmet>
      
      <main style={{ padding: 32, maxWidth: 1200, margin: "0 auto" }}>
        <header style={{ marginBottom: 32 }}>
          <h1 style={{ fontSize: "2.5rem", marginBottom: 16, color: "#1f2937" }}>Site Map</h1>
          <p style={{ fontSize: "1.1rem", color: "#6b7280", lineHeight: 1.6 }}>
            Navigate through all sections of Elevate for Humanity's workforce training platform. 
            Find programs, resources, and tools to advance your career in AI, data science, and healthcare.
          </p>
        </header>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))", gap: 32, marginBottom: 32 }}>
          {/* Main Navigation */}
          <section>
            <h2 style={{ fontSize: "1.5rem", marginBottom: 16, color: "#374151", borderBottom: "2px solid #e5e7eb", paddingBottom: 8 }}>
              Main Navigation
            </h2>
            <ul style={{ listStyle: "none", padding: 0, margin: 0 }}>
              <li style={{ marginBottom: 8 }}><a href="/" style={{ color: "#2563eb", textDecoration: "none", fontSize: "1.1rem" }}>🏠 Home</a></li>
              <li style={{ marginBottom: 8 }}><a href="/about" style={{ color: "#2563eb", textDecoration: "none", fontSize: "1.1rem" }}>ℹ️ About</a></li>
              <li style={{ marginBottom: 8 }}><a href="/courses" style={{ color: "#2563eb", textDecoration: "none", fontSize: "1.1rem" }}>📚 Course Library</a></li>
              <li style={{ marginBottom: 8 }}><a href="/programs" style={{ color: "#2563eb", textDecoration: "none", fontSize: "1.1rem" }}>🎓 Programs</a></li>
              <li style={{ marginBottom: 8 }}><a href="/ecosystem" style={{ color: "#2563eb", textDecoration: "none", fontSize: "1.1rem" }}>🌐 Ecosystem</a></li>
            </ul>
          </section>

          {/* Student Resources */}
          <section>
            <h2 style={{ fontSize: "1.5rem", marginBottom: 16, color: "#374151", borderBottom: "2px solid #e5e7eb", paddingBottom: 8 }}>
              Student Resources
            </h2>
            <ul style={{ listStyle: "none", padding: 0, margin: 0 }}>
              <li style={{ marginBottom: 8 }}><a href="/student" style={{ color: "#2563eb", textDecoration: "none", fontSize: "1.1rem" }}>👨‍🎓 Student Portal</a></li>
              <li style={{ marginBottom: 8 }}><a href="/student-handbook" style={{ color: "#2563eb", textDecoration: "none", fontSize: "1.1rem" }}>📖 Student Handbook</a></li>
              <li style={{ marginBottom: 8 }}><a href="/analytics" style={{ color: "#2563eb", textDecoration: "none", fontSize: "1.1rem" }}>📊 Analytics</a></li>
              <li style={{ marginBottom: 8 }}><a href="/quiz" style={{ color: "#2563eb", textDecoration: "none", fontSize: "1.1rem" }}>❓ Quiz & Assessments</a></li>
              <li style={{ marginBottom: 8 }}><a href="/mentors" style={{ color: "#2563eb", textDecoration: "none", fontSize: "1.1rem" }}>👥 Mentor Directory</a></li>
            </ul>
          </section>

          {/* Instructor & Admin */}
          <section>
            <h2 style={{ fontSize: "1.5rem", marginBottom: 16, color: "#374151", borderBottom: "2px solid #e5e7eb", paddingBottom: 8 }}>
              Instructor & Admin
            </h2>
            <ul style={{ listStyle: "none", padding: 0, margin: 0 }}>
              <li style={{ marginBottom: 8 }}><a href="/instructor" style={{ color: "#2563eb", textDecoration: "none", fontSize: "1.1rem" }}>👨‍🏫 Instructor Portal</a></li>
              <li style={{ marginBottom: 8 }}><a href="/lms" style={{ color: "#2563eb", textDecoration: "none", fontSize: "1.1rem" }}>🎯 Learning Management</a></li>
              <li style={{ marginBottom: 8 }}><a href="/hub" style={{ color: "#2563eb", textDecoration: "none", fontSize: "1.1rem" }}>🏢 Hub Dashboard</a></li>
              <li style={{ marginBottom: 8 }}><a href="/connect" style={{ color: "#2563eb", textDecoration: "none", fontSize: "1.1rem" }}>🔗 Connect Platform</a></li>
            </ul>
          </section>

          {/* Legal & Compliance */}
          <section>
            <h2 style={{ fontSize: "1.5rem", marginBottom: 16, color: "#374151", borderBottom: "2px solid #e5e7eb", paddingBottom: 8 }}>
              Legal & Compliance
            </h2>
            <ul style={{ listStyle: "none", padding: 0, margin: 0 }}>
              <li style={{ marginBottom: 8 }}><a href="/privacy-policy" style={{ color: "#2563eb", textDecoration: "none", fontSize: "1.1rem" }}>🔒 Privacy Policy</a></li>
              <li style={{ marginBottom: 8 }}><a href="/refund-policy" style={{ color: "#2563eb", textDecoration: "none", fontSize: "1.1rem" }}>💰 Refund Policy</a></li>
              <li style={{ marginBottom: 8 }}><a href="/terms-of-service" style={{ color: "#2563eb", textDecoration: "none", fontSize: "1.1rem" }}>📋 Terms of Service</a></li>
              <li style={{ marginBottom: 8 }}><a href="/accessibility" style={{ color: "#2563eb", textDecoration: "none", fontSize: "1.1rem" }}>♿ Accessibility</a></li>
              <li style={{ marginBottom: 8 }}><a href="/compliance" style={{ color: "#2563eb", textDecoration: "none", fontSize: "1.1rem" }}>✅ Compliance</a></li>
            </ul>
          </section>
        </div>

        {/* Quick Actions */}
        <section style={{ background: "#f9fafb", padding: 24, borderRadius: 12, marginBottom: 32 }}>
          <h2 style={{ fontSize: "1.5rem", marginBottom: 16, color: "#374151" }}>Quick Actions</h2>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: 16 }}>
            <a href="/pay" style={{ 
              display: "block", 
              padding: 16, 
              background: "#2563eb", 
              color: "white", 
              textDecoration: "none", 
              borderRadius: 8, 
              textAlign: "center",
              fontWeight: "600"
            }}>
              💳 Enroll & Pay
            </a>
            <a href="/partners" style={{ 
              display: "block", 
              padding: 16, 
              background: "#059669", 
              color: "white", 
              textDecoration: "none", 
              borderRadius: 8, 
              textAlign: "center",
              fontWeight: "600"
            }}>
              🤝 Partner Portal
            </a>
            <a href="/account" style={{ 
              display: "block", 
              padding: 16, 
              background: "#7c3aed", 
              color: "white", 
              textDecoration: "none", 
              borderRadius: 8, 
              textAlign: "center",
              fontWeight: "600"
            }}>
              👤 My Account
            </a>
          </div>
        </section>

        <img
          src="/images/handbook-cover.jpg"
          alt="Elevate for Humanity Student Handbook cover"
          title="Student Handbook - Elevate for Humanity"
          style={{ width: "100%", maxWidth: 400, borderRadius: 8, margin: "0 auto", display: "block" }}
        />

        <footer style={{ marginTop: 48, textAlign: "center", color: "#888", borderTop: "1px solid #e5e7eb", paddingTop: 24 }}>
          <div style={{ marginBottom: 16 }}>
            <a href="/privacy-policy" style={{ color: "#6b7280", margin: "0 8px" }}>Privacy Policy</a> |{" "}
            <a href="/refund-policy" style={{ color: "#6b7280", margin: "0 8px" }}>Refund Policy</a> |{" "}
            <a href="/terms-of-service" style={{ color: "#6b7280", margin: "0 8px" }}>Terms of Service</a> |{" "}
            <a href="/accessibility" style={{ color: "#6b7280", margin: "0 8px" }}>Accessibility</a> |{" "}
            <a href="/sitemap" style={{ color: "#6b7280", margin: "0 8px" }}>Sitemap</a>
          </div>
          <p style={{ fontSize: "0.9rem", color: "#9ca3af" }}>
            © 2025 Elevate for Humanity. Empowering workforce development through innovative training programs.
          </p>
        </footer>
      </main>
    </>
  );
}