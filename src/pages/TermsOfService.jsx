/*
  Copyright (c) 2025 Elevate for Humanity
  Commercial License. No resale, sublicensing, or redistribution allowed.
  See LICENSE file for details.
*/
import React from 'react';
import { Link } from 'react-router-dom';
import AppLayout from '../layouts/AppLayout';

export default function TermsOfService() {
  return (
    <AppLayout>
      <div style={{ maxWidth: 900, margin: '0 auto', padding: 32 }}>
        <h1 style={{ fontSize: 36, fontWeight: 700, marginBottom: 8 }}>
          Terms of Service
        </h1>
        <p
          style={{
            fontSize: 14,
            color: 'var(--brand-text-muted)',
            marginBottom: 32,
          }}
        >
          Last updated: January 1, 2025
        </p>

        <div style={{ fontSize: 16, lineHeight: 1.8, color: '#333' }}>
          <section style={{ marginBottom: 32 }}>
            <h2 style={{ fontSize: 24, fontWeight: 600, marginBottom: 16 }}>
              1. Agreement to Terms
            </h2>
            <p>
              By accessing or using Elevate for Humanity ("Platform"), you agree
              to be bound by these Terms of Service and all applicable laws and
              regulations. If you do not agree with any of these terms, you are
              prohibited from using or accessing this Platform.
            </p>
          </section>

          <section style={{ marginBottom: 32 }}>
            <h2 style={{ fontSize: 24, fontWeight: 600, marginBottom: 16 }}>
              2. Use License
            </h2>
            <p style={{ marginBottom: 16 }}>
              Permission is granted to temporarily access the materials on
              Elevate for Humanity's Platform for personal, non-commercial use
              only. This is the grant of a license, not a transfer of title, and
              under this license you may not:
            </p>
            <ul style={{ marginBottom: 16, paddingLeft: 24 }}>
              <li>Modify or copy the materials</li>
              <li>Use the materials for any commercial purpose</li>
              <li>Attempt to decompile or reverse engineer any software</li>
              <li>Remove any copyright or proprietary notations</li>
              <li>
                Transfer the materials to another person or "mirror" the
                materials on any other server
              </li>
            </ul>
          </section>

          <section style={{ marginBottom: 32 }}>
            <h2 style={{ fontSize: 24, fontWeight: 600, marginBottom: 16 }}>
              3. User Accounts
            </h2>
            <p style={{ marginBottom: 16 }}>
              When you create an account with us, you must provide accurate,
              complete, and current information. Failure to do so constitutes a
              breach of the Terms.
            </p>
            <p>
              You are responsible for safeguarding your password and for all
              activities that occur under your account. You agree to notify us
              immediately of any unauthorized use of your account.
            </p>
          </section>

          <section style={{ marginBottom: 32 }}>
            <h2 style={{ fontSize: 24, fontWeight: 600, marginBottom: 16 }}>
              4. Course Enrollment and Access
            </h2>
            <p style={{ marginBottom: 16 }}>
              When you enroll in a course, you are granted a limited,
              non-exclusive, non-transferable license to access and view the
              course content for personal, non-commercial use.
            </p>
            <p>
              Course access is subject to availability and may be modified or
              discontinued at any time. We reserve the right to revoke access
              for violation of these Terms.
            </p>
          </section>

          <section style={{ marginBottom: 32 }}>
            <h2 style={{ fontSize: 24, fontWeight: 600, marginBottom: 16 }}>
              5. Intellectual Property
            </h2>
            <p>
              All content on the Platform, including text, graphics, logos,
              images, audio clips, video, data compilations, and software, is
              the property of Elevate for Humanity or its content suppliers and
              is protected by international copyright laws.
            </p>
          </section>

          <section style={{ marginBottom: 32 }}>
            <h2 style={{ fontSize: 24, fontWeight: 600, marginBottom: 16 }}>
              6. User Content
            </h2>
            <p style={{ marginBottom: 16 }}>
              You retain ownership of any content you submit, post, or display
              on the Platform. By submitting content, you grant us a worldwide,
              non-exclusive, royalty-free license to use, reproduce, modify, and
              distribute your content in connection with operating and providing
              the Platform.
            </p>
            <p>
              You represent and warrant that you own or have the necessary
              rights to submit your content and that it does not violate any
              third-party rights.
            </p>
          </section>

          <section style={{ marginBottom: 32 }}>
            <h2 style={{ fontSize: 24, fontWeight: 600, marginBottom: 16 }}>
              7. Prohibited Activities
            </h2>
            <p style={{ marginBottom: 16 }}>
              You agree not to engage in any of the following prohibited
              activities:
            </p>
            <ul style={{ marginBottom: 16, paddingLeft: 24 }}>
              <li>Violating laws or regulations</li>
              <li>Infringing on intellectual property rights</li>
              <li>Transmitting viruses or malicious code</li>
              <li>Harassing, abusing, or harming other users</li>
              <li>Impersonating any person or entity</li>
              <li>Interfering with the Platform's operation</li>
              <li>Collecting user information without consent</li>
              <li>Using automated systems to access the Platform</li>
            </ul>
          </section>

          <section style={{ marginBottom: 32 }}>
            <h2 style={{ fontSize: 24, fontWeight: 600, marginBottom: 16 }}>
              8. Payment Terms
            </h2>
            <p style={{ marginBottom: 16 }}>
              Paid courses require payment before access is granted. All prices
              are in USD unless otherwise stated. We reserve the right to change
              prices at any time.
            </p>
            <p>
              Payment processing is handled by third-party providers. By making
              a purchase, you agree to their terms and conditions.
            </p>
          </section>

          <section style={{ marginBottom: 32 }}>
            <h2 style={{ fontSize: 24, fontWeight: 600, marginBottom: 16 }}>
              9. Refund Policy
            </h2>
            <p>
              Please refer to our{' '}
              <Link to="/refund-policy" style={{ color: 'var(--brand-info)' }}>
                Refund Policy
              </Link>{' '}
              for information about refunds and cancellations.
            </p>
          </section>

          <section style={{ marginBottom: 32 }}>
            <h2 style={{ fontSize: 24, fontWeight: 600, marginBottom: 16 }}>
              10. Disclaimer
            </h2>
            <p>
              The materials on the Platform are provided on an 'as is' basis.
              Elevate for Humanity makes no warranties, expressed or implied,
              and hereby disclaims all other warranties including, without
              limitation, implied warranties of merchantability, fitness for a
              particular purpose, or non-infringement of intellectual property.
            </p>
          </section>

          <section style={{ marginBottom: 32 }}>
            <h2 style={{ fontSize: 24, fontWeight: 600, marginBottom: 16 }}>
              11. Limitations of Liability
            </h2>
            <p>
              In no event shall Elevate for Humanity or its suppliers be liable
              for any damages (including, without limitation, damages for loss
              of data or profit, or due to business interruption) arising out of
              the use or inability to use the Platform.
            </p>
          </section>

          <section style={{ marginBottom: 32 }}>
            <h2 style={{ fontSize: 24, fontWeight: 600, marginBottom: 16 }}>
              12. Termination
            </h2>
            <p>
              We may terminate or suspend your account and access to the
              Platform immediately, without prior notice or liability, for any
              reason, including breach of these Terms. Upon termination, your
              right to use the Platform will immediately cease.
            </p>
          </section>

          <section style={{ marginBottom: 32 }}>
            <h2 style={{ fontSize: 24, fontWeight: 600, marginBottom: 16 }}>
              13. Governing Law
            </h2>
            <p>
              These Terms shall be governed by and construed in accordance with
              the laws of the jurisdiction in which Elevate for Humanity
              operates, without regard to its conflict of law provisions.
            </p>
          </section>

          <section style={{ marginBottom: 32 }}>
            <h2 style={{ fontSize: 24, fontWeight: 600, marginBottom: 16 }}>
              14. Changes to Terms
            </h2>
            <p>
              We reserve the right to modify or replace these Terms at any time.
              We will provide notice of any material changes by posting the new
              Terms on this page. Your continued use of the Platform after such
              changes constitutes acceptance of the new Terms.
            </p>
          </section>

          <section style={{ marginBottom: 32 }}>
            <h2 style={{ fontSize: 24, fontWeight: 600, marginBottom: 16 }}>
              15. Contact Information
            </h2>
            <p style={{ marginBottom: 16 }}>
              If you have any questions about these Terms, please contact us:
            </p>
            <div
              style={{
                padding: 20,
                backgroundColor: '#f8f8f8',
                borderRadius: 6,
              }}
            >
              <p style={{ marginBottom: 8 }}>
                <strong>Email:</strong> legal@elevateforhumanity.org
              </p>
              <p style={{ marginBottom: 8 }}>
                <strong>Address:</strong> 123 Education Street, Learning City,
                LC 12345
              </p>
              <p>
                <strong>Phone:</strong> +1 (555) 123-4567
              </p>
            </div>
          </section>
        </div>

        <div
          style={{
            marginTop: 48,
            paddingTop: 32,
            borderTop: '1px solid var(--brand-border)',
            display: 'flex',
            gap: 24,
            justifyContent: 'center',
          }}
        >
          <Link
            to="/privacy-policy"
            style={{
              color: 'var(--brand-info)',
              textDecoration: 'none',
              fontSize: 14,
              fontWeight: 500,
            }}
          >
            Privacy Policy
          </Link>
          <Link
            to="/refund-policy"
            style={{
              color: 'var(--brand-info)',
              textDecoration: 'none',
              fontSize: 14,
              fontWeight: 500,
            }}
          >
            Refund Policy
          </Link>
          <Link
            to="/support"
            style={{
              color: 'var(--brand-info)',
              textDecoration: 'none',
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
