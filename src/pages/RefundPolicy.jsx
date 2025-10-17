/*
  Copyright (c) 2025 Elevate for Humanity
  Commercial License. No resale, sublicensing, or redistribution allowed.
  See LICENSE file for details.
*/
import React from 'react';
import { Link } from 'react-router-dom';
import AppLayout from '../layouts/AppLayout';

export default function RefundPolicy() {
  return (
    <AppLayout>
      <div style={{ maxWidth: 900, margin: '0 auto', padding: 32 }}>
        <h1 style={{ fontSize: 36, fontWeight: 700, marginBottom: 8 }}>
          Refund Policy
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
              30-Day Money-Back Guarantee
            </h2>
            <p>
              We stand behind the quality of our courses. If you're not
              satisfied with your purchase, we offer a 30-day money-back
              guarantee for all paid courses. No questions asked.
            </p>
          </section>

          <section style={{ marginBottom: 32 }}>
            <h2 style={{ fontSize: 24, fontWeight: 600, marginBottom: 16 }}>
              Eligibility
            </h2>
            <p style={{ marginBottom: 16 }}>
              To be eligible for a refund, you must meet the following criteria:
            </p>
            <ul style={{ marginBottom: 16, paddingLeft: 24 }}>
              <li>Request must be made within 30 days of purchase</li>
              <li>You have completed less than 30% of the course content</li>
              <li>
                You have not previously received a refund for the same course
              </li>
              <li>
                The course was not purchased as part of a bundle or subscription
              </li>
            </ul>
          </section>

          <section style={{ marginBottom: 32 }}>
            <h2 style={{ fontSize: 24, fontWeight: 600, marginBottom: 16 }}>
              How to Request a Refund
            </h2>
            <p style={{ marginBottom: 16 }}>
              To request a refund, please follow these steps:
            </p>
            <ol style={{ marginBottom: 16, paddingLeft: 24 }}>
              <li style={{ marginBottom: 8 }}>Log in to your account</li>
              <li style={{ marginBottom: 8 }}>Navigate to "My Courses"</li>
              <li style={{ marginBottom: 8 }}>
                Find the course you wish to refund
              </li>
              <li style={{ marginBottom: 8 }}>Click "Request Refund"</li>
              <li style={{ marginBottom: 8 }}>
                Provide a brief reason (optional)
              </li>
              <li>Submit your request</li>
            </ol>
            <p>
              Alternatively, you can contact our support team at{' '}
              <a
                href="mailto:refunds@elevateforhumanity.org"
                style={{ color: 'var(--brand-info)' }}
              >
                refunds@elevateforhumanity.org
              </a>
            </p>
          </section>

          <section style={{ marginBottom: 32 }}>
            <h2 style={{ fontSize: 24, fontWeight: 600, marginBottom: 16 }}>
              Processing Time
            </h2>
            <p>
              Refund requests are typically processed within 5-7 business days.
              Once approved, the refund will be credited to your original
              payment method within 10-14 business days, depending on your
              financial institution.
            </p>
          </section>

          <section style={{ marginBottom: 32 }}>
            <h2 style={{ fontSize: 24, fontWeight: 600, marginBottom: 16 }}>
              Exceptions
            </h2>
            <p style={{ marginBottom: 16 }}>
              The following purchases are not eligible for refunds:
            </p>
            <ul style={{ marginBottom: 16, paddingLeft: 24 }}>
              <li>Free courses</li>
              <li>Courses completed more than 30%</li>
              <li>Courses purchased more than 30 days ago</li>
              <li>
                Subscription renewals (must be cancelled before renewal date)
              </li>
              <li>Certificates of completion</li>
              <li>
                Promotional or discounted courses (unless otherwise stated)
              </li>
            </ul>
          </section>

          <section style={{ marginBottom: 32 }}>
            <h2 style={{ fontSize: 24, fontWeight: 600, marginBottom: 16 }}>
              Subscription Cancellations
            </h2>
            <p style={{ marginBottom: 16 }}>For subscription-based services:</p>
            <ul style={{ marginBottom: 16, paddingLeft: 24 }}>
              <li>You may cancel your subscription at any time</li>
              <li>
                Cancellation takes effect at the end of the current billing
                period
              </li>
              <li>No refunds are provided for partial subscription periods</li>
              <li>You will retain access until the end of your paid period</li>
            </ul>
          </section>

          <section style={{ marginBottom: 32 }}>
            <h2 style={{ fontSize: 24, fontWeight: 600, marginBottom: 16 }}>
              Course Access After Refund
            </h2>
            <p>
              Once a refund is processed, you will immediately lose access to
              the course content, including any downloaded materials,
              certificates, and progress data. This action cannot be undone.
            </p>
          </section>

          <section style={{ marginBottom: 32 }}>
            <h2 style={{ fontSize: 24, fontWeight: 600, marginBottom: 16 }}>
              Abuse Policy
            </h2>
            <p>
              We reserve the right to deny refund requests if we detect patterns
              of abuse, including but not limited to: repeatedly purchasing and
              refunding courses, downloading all course materials before
              requesting a refund, or violating our Terms of Service.
            </p>
          </section>

          <section style={{ marginBottom: 32 }}>
            <h2 style={{ fontSize: 24, fontWeight: 600, marginBottom: 16 }}>
              Contact Us
            </h2>
            <p style={{ marginBottom: 16 }}>
              If you have questions about our refund policy, please contact us:
            </p>
            <div
              style={{
                padding: 20,
                backgroundColor: '#f8f8f8',
                borderRadius: 6,
              }}
            >
              <p style={{ marginBottom: 8 }}>
                <strong>Email:</strong> refunds@elevateforhumanity.org
              </p>
              <p style={{ marginBottom: 8 }}>
                <strong>Support:</strong>{' '}
                <Link to="/support" style={{ color: 'var(--brand-info)' }}>
                  Visit Support Center
                </Link>
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
            to="/terms-of-service"
            style={{
              color: 'var(--brand-info)',
              textDecoration: 'none',
              fontSize: 14,
              fontWeight: 500,
            }}
          >
            Terms of Service
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
