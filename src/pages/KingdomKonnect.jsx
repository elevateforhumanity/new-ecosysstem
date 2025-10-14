import React from 'react';
import { Link } from 'react-router-dom';

export function KingdomKonnect() {
  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#fff' }}>
      {/* Hero Section */}
      <div style={{ background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', color: '#fff', padding: '4rem 2rem', textAlign: 'center' }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
          <h1 style={{ fontSize: '3rem', fontWeight: '700', marginBottom: '1rem' }}>
            ✝️ Kingdom Konnect
          </h1>
          <p style={{ fontSize: '1.5rem', marginBottom: '2rem', opacity: 0.9 }}>
            Faith-Based Community Development & Spiritual Workforce Empowerment
          </p>
          <p style={{ fontSize: '1.125rem', marginBottom: '2rem', maxWidth: '800px', margin: '0 auto 2rem' }}>
            Connecting faith communities with Elevate Learn2Earn Workforce opportunities through spiritual guidance and practical training
          </p>
          <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', flexWrap: 'wrap' }}>
            <Link to="/kingdom-konnect/programs" style={{ padding: '1rem 2rem', backgroundColor: '#fff', color: '#667eea', borderRadius: '0.5rem', fontWeight: '600', textDecoration: 'none', fontSize: '1.125rem' }}>
              View Programs
            </Link>
            <Link to="/kingdom-konnect/events" style={{ padding: '1rem 2rem', backgroundColor: 'rgba(255,255,255,0.2)', color: '#fff', border: '2px solid #fff', borderRadius: '0.5rem', fontWeight: '600', textDecoration: 'none', fontSize: '1.125rem' }}>
              Upcoming Events
            </Link>
          </div>
        </div>
      </div>

      {/* Features Section */}
      <div style={{ padding: '4rem 2rem', backgroundColor: '#f9fafb' }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
          <h2 style={{ fontSize: '2rem', fontWeight: '700', textAlign: 'center', marginBottom: '3rem' }}>
            Our Mission & Services
          </h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '2rem' }}>
            <div style={{ backgroundColor: '#fff', padding: '2rem', borderRadius: '0.5rem', boxShadow: '0 4px 6px rgba(0,0,0,0.1)' }}>
              <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>🙏</div>
              <h3 style={{ fontSize: '1.5rem', fontWeight: '600', marginBottom: '1rem' }}>Spiritual Guidance</h3>
              <p style={{ color: '#6b7280', lineHeight: '1.6' }}>
                Faith-based mentorship and spiritual development programs that integrate biblical principles with workforce training
              </p>
            </div>
            <div style={{ backgroundColor: '#fff', padding: '2rem', borderRadius: '0.5rem', boxShadow: '0 4px 6px rgba(0,0,0,0.1)' }}>
              <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>👥</div>
              <h3 style={{ fontSize: '1.5rem', fontWeight: '600', marginBottom: '1rem' }}>Community Building</h3>
              <p style={{ color: '#6b7280', lineHeight: '1.6' }}>
                Connect with faith communities and build lasting relationships while developing professional skills
              </p>
            </div>
            <div style={{ backgroundColor: '#fff', padding: '2rem', borderRadius: '0.5rem', boxShadow: '0 4px 6px rgba(0,0,0,0.1)' }}>
              <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>💼</div>
              <h3 style={{ fontSize: '1.5rem', fontWeight: '600', marginBottom: '1rem' }}>Elevate Learn2Earn Workforce</h3>
              <p style={{ color: '#6b7280', lineHeight: '1.6' }}>
                Practical job training and career development programs aligned with Christian values and ethics
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Programs Section */}
      <div style={{ padding: '4rem 2rem' }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
          <h2 style={{ fontSize: '2rem', fontWeight: '700', textAlign: 'center', marginBottom: '3rem' }}>
            Featured Programs
          </h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(350px, 1fr))', gap: '2rem' }}>
            <div style={{ border: '1px solid #e5e7eb', borderRadius: '0.5rem', overflow: 'hidden' }}>
              <div style={{ padding: '2rem' }}>
                <h3 style={{ fontSize: '1.5rem', fontWeight: '600', marginBottom: '1rem' }}>Faith & Work Integration</h3>
                <p style={{ color: '#6b7280', marginBottom: '1.5rem', lineHeight: '1.6' }}>
                  Learn how to integrate your faith with your professional life through biblical principles and practical application
                </p>
                <Link to="/kingdom-konnect/programs" style={{ color: '#667eea', fontWeight: '600', textDecoration: 'none' }}>
                  Learn More →
                </Link>
              </div>
            </div>
            <div style={{ border: '1px solid #e5e7eb', borderRadius: '0.5rem', overflow: 'hidden' }}>
              <div style={{ padding: '2rem' }}>
                <h3 style={{ fontSize: '1.5rem', fontWeight: '600', marginBottom: '1rem' }}>Ministry Leadership Training</h3>
                <p style={{ color: '#6b7280', marginBottom: '1.5rem', lineHeight: '1.6' }}>
                  Develop leadership skills for ministry and community service while building professional competencies
                </p>
                <Link to="/kingdom-konnect/programs" style={{ color: '#667eea', fontWeight: '600', textDecoration: 'none' }}>
                  Learn More →
                </Link>
              </div>
            </div>
            <div style={{ border: '1px solid #e5e7eb', borderRadius: '0.5rem', overflow: 'hidden' }}>
              <div style={{ padding: '2rem' }}>
                <h3 style={{ fontSize: '1.5rem', fontWeight: '600', marginBottom: '1rem' }}>Community Outreach</h3>
                <p style={{ color: '#6b7280', marginBottom: '1.5rem', lineHeight: '1.6' }}>
                  Engage in community service projects that combine faith-based values with workforce skill development
                </p>
                <Link to="/kingdom-konnect/programs" style={{ color: '#667eea', fontWeight: '600', textDecoration: 'none' }}>
                  Learn More →
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* CTA Section */}
      <div style={{ background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', color: '#fff', padding: '4rem 2rem', textAlign: 'center' }}>
        <div style={{ maxWidth: '800px', margin: '0 auto' }}>
          <h2 style={{ fontSize: '2rem', fontWeight: '700', marginBottom: '1rem' }}>
            Join Our Faith Community
          </h2>
          <p style={{ fontSize: '1.125rem', marginBottom: '2rem', opacity: 0.9 }}>
            Connect with us today and start your journey of faith-based Elevate Learn2Earn Workforce
          </p>
          <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', flexWrap: 'wrap' }}>
            <Link to="/kingdom-konnect/mission" style={{ padding: '1rem 2rem', backgroundColor: '#fff', color: '#667eea', borderRadius: '0.5rem', fontWeight: '600', textDecoration: 'none', fontSize: '1.125rem' }}>
              Our Mission
            </Link>
            <a href="mailto:info@kingdomkonnect.org" style={{ padding: '1rem 2rem', backgroundColor: 'rgba(255,255,255,0.2)', color: '#fff', border: '2px solid #fff', borderRadius: '0.5rem', fontWeight: '600', textDecoration: 'none', fontSize: '1.125rem' }}>
              Contact Us
            </a>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div style={{ backgroundColor: '#1f2937', color: '#fff', padding: '2rem', textAlign: 'center' }}>
        <p style={{ marginBottom: '0.5rem' }}>© 2025 Kingdom Konnect. All rights reserved.</p>
        <p style={{ fontSize: '0.875rem', color: '#9ca3af' }}>
          Part of the Elevate for Humanity Network
        </p>
      </div>
    </div>
  );
}

export default KingdomKonnect;
