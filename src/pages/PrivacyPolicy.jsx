/*
  Copyright (c) 2025 Elevate for Humanity
  Commercial License. No resale, sublicensing, or redistribution allowed.
  See LICENSE file for details.
*/
import React from "react";
import { Link } from "react-router-dom";
import AppLayout from "../layouts/AppLayout";

export default function PrivacyPolicy() {
  return (
    <AppLayout>
      <div style={{ maxWidth: 900, margin: "0 auto", padding: 32 }}>
        <h1 style={{ fontSize: 36, fontWeight: 700, marginBottom: 8 }}>
          Privacy Policy
        </h1>
        <p style={{ fontSize: 14, color: "#666", marginBottom: 32 }}>
          Last updated: January 1, 2025
        </p>

        <div style={{ fontSize: 16, lineHeight: 1.8, color: "#333" }}>
          <section style={{ marginBottom: 32 }}>
            <h2 style={{ fontSize: 24, fontWeight: 600, marginBottom: 16 }}>
              1. Introduction
            </h2>
            <p style={{ marginBottom: 16 }}>
              Welcome to Elevate for Humanity ("we," "our," or "us"). We are committed to protecting your personal information and your right to privacy. This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you use our platform.
            </p>
            <p>
              Please read this privacy policy carefully. If you do not agree with the terms of this privacy policy, please do not access the platform.
            </p>
          </section>

          <section style={{ marginBottom: 32 }}>
            <h2 style={{ fontSize: 24, fontWeight: 600, marginBottom: 16 }}>
              2. Information We Collect
            </h2>
            <h3 style={{ fontSize: 18, fontWeight: 600, marginBottom: 12 }}>
              Personal Information
            </h3>
            <p style={{ marginBottom: 16 }}>
              We collect personal information that you voluntarily provide to us when you register on the platform, express an interest in obtaining information about us or our products and services, or otherwise contact us.
            </p>
            <p style={{ marginBottom: 16 }}>
              The personal information we collect may include:
            </p>
            <ul style={{ marginBottom: 16, paddingLeft: 24 }}>
              <li>Name and contact data (email address, phone number)</li>
              <li>Account credentials (username, password)</li>
              <li>Payment information (processed securely through third-party providers)</li>
              <li>Profile information (photo, bio, interests)</li>
              <li>Course progress and completion data</li>
            </ul>

            <h3 style={{ fontSize: 18, fontWeight: 600, marginBottom: 12 }}>
              Automatically Collected Information
            </h3>
            <p style={{ marginBottom: 16 }}>
              We automatically collect certain information when you visit, use, or navigate the platform. This information may include:
            </p>
            <ul style={{ marginBottom: 16, paddingLeft: 24 }}>
              <li>Device and usage information (IP address, browser type, operating system)</li>
              <li>Log data (access times, pages viewed, referring URLs)</li>
              <li>Cookies and similar tracking technologies</li>
            </ul>
          </section>

          <section style={{ marginBottom: 32 }}>
            <h2 style={{ fontSize: 24, fontWeight: 600, marginBottom: 16 }}>
              3. How We Use Your Information
            </h2>
            <p style={{ marginBottom: 16 }}>
              We use the information we collect or receive:
            </p>
            <ul style={{ marginBottom: 16, paddingLeft: 24 }}>
              <li>To facilitate account creation and authentication</li>
              <li>To provide and maintain our services</li>
              <li>To process your transactions and manage your orders</li>
              <li>To send administrative information and updates</li>
              <li>To personalize your experience and deliver relevant content</li>
              <li>To improve our platform and develop new features</li>
              <li>To monitor and analyze usage patterns and trends</li>
              <li>To protect against fraudulent or illegal activity</li>
              <li>To comply with legal obligations</li>
            </ul>
          </section>

          <section style={{ marginBottom: 32 }}>
            <h2 style={{ fontSize: 24, fontWeight: 600, marginBottom: 16 }}>
              4. Sharing Your Information
            </h2>
            <p style={{ marginBottom: 16 }}>
              We may share your information in the following situations:
            </p>
            <ul style={{ marginBottom: 16, paddingLeft: 24 }}>
              <li><strong>Service Providers:</strong> We may share your data with third-party vendors who perform services on our behalf (payment processing, data analysis, email delivery)</li>
              <li><strong>Business Transfers:</strong> We may share or transfer your information in connection with a merger, sale, or acquisition</li>
              <li><strong>Legal Requirements:</strong> We may disclose your information if required by law or in response to valid requests by public authorities</li>
              <li><strong>With Your Consent:</strong> We may share your information for any other purpose with your consent</li>
            </ul>
            <p>
              We do not sell your personal information to third parties.
            </p>
          </section>

          <section style={{ marginBottom: 32 }}>
            <h2 style={{ fontSize: 24, fontWeight: 600, marginBottom: 16 }}>
              5. Cookies and Tracking Technologies
            </h2>
            <p style={{ marginBottom: 16 }}>
              We use cookies and similar tracking technologies to track activity on our platform and store certain information. You can instruct your browser to refuse all cookies or to indicate when a cookie is being sent. However, if you do not accept cookies, you may not be able to use some portions of our platform.
            </p>
          </section>

          <section style={{ marginBottom: 32 }}>
            <h2 style={{ fontSize: 24, fontWeight: 600, marginBottom: 16 }}>
              6. Data Security
            </h2>
            <p style={{ marginBottom: 16 }}>
              We implement appropriate technical and organizational security measures to protect your personal information. However, no electronic transmission over the internet or information storage technology can be guaranteed to be 100% secure. While we strive to protect your personal information, we cannot guarantee its absolute security.
            </p>
          </section>

          <section style={{ marginBottom: 32 }}>
            <h2 style={{ fontSize: 24, fontWeight: 600, marginBottom: 16 }}>
              7. Your Privacy Rights
            </h2>
            <p style={{ marginBottom: 16 }}>
              Depending on your location, you may have the following rights regarding your personal information:
            </p>
            <ul style={{ marginBottom: 16, paddingLeft: 24 }}>
              <li>The right to access and receive a copy of your personal data</li>
              <li>The right to rectify or update inaccurate personal data</li>
              <li>The right to erase your personal data</li>
              <li>The right to restrict processing of your personal data</li>
              <li>The right to data portability</li>
              <li>The right to object to processing of your personal data</li>
              <li>The right to withdraw consent</li>
            </ul>
            <p>
              To exercise these rights, please contact us using the information provided below.
            </p>
          </section>

          <section style={{ marginBottom: 32 }}>
            <h2 style={{ fontSize: 24, fontWeight: 600, marginBottom: 16 }}>
              8. Data Retention
            </h2>
            <p>
              We will retain your personal information only for as long as necessary to fulfill the purposes outlined in this Privacy Policy, unless a longer retention period is required or permitted by law.
            </p>
          </section>

          <section style={{ marginBottom: 32 }}>
            <h2 style={{ fontSize: 24, fontWeight: 600, marginBottom: 16 }}>
              9. Children's Privacy
            </h2>
            <p>
              Our platform is not intended for children under the age of 13. We do not knowingly collect personal information from children under 13. If you become aware that a child has provided us with personal information, please contact us immediately.
            </p>
          </section>

          <section style={{ marginBottom: 32 }}>
            <h2 style={{ fontSize: 24, fontWeight: 600, marginBottom: 16 }}>
              10. International Data Transfers
            </h2>
            <p>
              Your information may be transferred to and maintained on computers located outside of your state, province, country, or other governmental jurisdiction where data protection laws may differ. By using our platform, you consent to such transfers.
            </p>
          </section>

          <section style={{ marginBottom: 32 }}>
            <h2 style={{ fontSize: 24, fontWeight: 600, marginBottom: 16 }}>
              11. Updates to This Policy
            </h2>
            <p>
              We may update this Privacy Policy from time to time. We will notify you of any changes by posting the new Privacy Policy on this page and updating the "Last updated" date. You are advised to review this Privacy Policy periodically for any changes.
            </p>
          </section>

          <section style={{ marginBottom: 32 }}>
            <h2 style={{ fontSize: 24, fontWeight: 600, marginBottom: 16 }}>
              12. Contact Us
            </h2>
            <p style={{ marginBottom: 16 }}>
              If you have questions or comments about this Privacy Policy, please contact us:
            </p>
            <div
              style={{
                padding: 20,
                backgroundColor: "#f8f8f8",
                borderRadius: 6,
              }}
            >
              <p style={{ marginBottom: 8 }}>
                <strong>Email:</strong> privacy@elevateforhumanity.org
              </p>
              <p style={{ marginBottom: 8 }}>
                <strong>Address:</strong> 123 Education Street, Learning City, LC 12345
              </p>
              <p>
                <strong>Phone:</strong> +1 (555) 123-4567
              </p>
            </div>
          </section>
        </div>

        {/* Related Links */}
        <div
          style={{
            marginTop: 48,
            paddingTop: 32,
            borderTop: "1px solid #e0e0e0",
            display: "flex",
            gap: 24,
            justifyContent: "center",
          }}
        >
          <Link
            to="/terms-of-service"
            style={{
              color: "#007bff",
              textDecoration: "none",
              fontSize: 14,
              fontWeight: 500,
            }}
          >
            Terms of Service
          </Link>
          <Link
            to="/refund-policy"
            style={{
              color: "#007bff",
              textDecoration: "none",
              fontSize: 14,
              fontWeight: 500,
            }}
          >
            Refund Policy
          </Link>
          <Link
            to="/support"
            style={{
              color: "#007bff",
              textDecoration: "none",
              fontSize: 14,
              fontWeight: 500,
            }}
          >
            Contact Support
          </Link>
        </div>
      </div>
    </AppLayout>
  );
}
