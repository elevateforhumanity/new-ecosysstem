import React from "react";

export default function App() {
  // Add some basic global styles
  React.useEffect(() => {
    document.body.style.margin = '0';
    document.body.style.padding = '0';
    document.body.style.fontFamily = 'system-ui, -apple-system, sans-serif';
    document.body.style.lineHeight = '1.6';
    document.body.style.backgroundColor = '#ffffff';
  }, []);

  return (
    <div style={{ padding: '2rem', fontFamily: 'system-ui, -apple-system, sans-serif' }}>
      <h1 style={{ color: 'var(--brand-info)', fontSize: '3rem', textAlign: 'center' }}>
        🚀 Elevate for Humanity
      </h1>
      <p style={{ fontSize: '1.5rem', textAlign: 'center', color: 'var(--brand-text-muted)' }}>
        <strong>Government Contracting • Philanthropy • Elevate Learn2Earn Workforce</strong>
      </p>
      
      <div style={{ maxWidth: '1200px', margin: '0 auto', marginTop: '3rem' }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '2rem' }}>
          <div style={{
            padding: '2rem',
            border: '1px solid var(--brand-border)',
            borderRadius: '8px',
            backgroundColor: 'var(--brand-surface)',
            textAlign: 'center'
          }}>
            <h3 style={{ fontSize: '1.5rem', marginBottom: '1rem', color: 'var(--brand-info)' }}>
              🏛️ Government Contracting Services
            </h3>
            <p style={{ color: 'var(--brand-text-muted)' }}>
              <strong>Veteran-Owned Small Business (VOSB)</strong> providing comprehensive Elevate Learn2Earn Workforce and educational services to federal, state, and local government agencies.
            </p>
          </div>

          <div style={{
            padding: '2rem',
            border: '1px solid var(--brand-border)',
            borderRadius: '8px',
            backgroundColor: 'var(--brand-surface)',
            textAlign: 'center'
          }}>
            <h3 style={{ fontSize: '1.5rem', marginBottom: '1rem', color: 'var(--brand-secondary)' }}>
              💜 Philanthropy & Grant Management
            </h3>
            <p style={{ color: 'var(--brand-text-muted)' }}>
              <strong>Elizabeth L. Greene Foundation</strong> - Creating pathways to prosperity through strategic giving and community partnerships.
            </p>
          </div>

          <div style={{
            padding: '2rem',
            border: '1px solid var(--brand-border)',
            borderRadius: '8px',
            backgroundColor: 'var(--brand-surface)',
            textAlign: 'center'
          }}>
            <h3 style={{ fontSize: '1.5rem', marginBottom: '1rem', color: 'var(--brand-success)' }}>
              ♿ Accessibility & Compliance Leadership
            </h3>
            <p style={{ color: 'var(--brand-text-muted)' }}>
              <strong>WCAG 2.1 AA Compliance</strong> with comprehensive accessibility features ensuring equal access for all users.
            </p>
          </div>
        </div>

        <div style={{ 
          textAlign: 'center', 
          marginTop: '3rem',
          padding: '2rem',
          backgroundColor: 'var(--brand-surface)',
          borderRadius: '8px'
        }}>
          <h2 style={{ fontSize: '2rem', marginBottom: '1rem', color: 'var(--brand-info)' }}>
            Our Impact
          </h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: '2rem', marginTop: '2rem' }}>
            <div>
              <div style={{ fontSize: '2.5rem', fontWeight: 'bold', color: 'var(--brand-info)' }}>1,247</div>
              <div style={{ color: 'var(--brand-text-muted)' }}>Learners Supported</div>
            </div>
            <div>
              <div style={{ fontSize: '2.5rem', fontWeight: 'bold', color: 'var(--brand-success)' }}>87%</div>
              <div style={{ color: 'var(--brand-text-muted)' }}>Graduation Rate</div>
            </div>
            <div>
              <div style={{ fontSize: '2.5rem', fontWeight: 'bold', color: 'var(--brand-secondary)' }}>$2.85M</div>
              <div style={{ color: 'var(--brand-text-muted)' }}>Funding Distributed</div>
            </div>
            <div>
              <div style={{ fontSize: '2.5rem', fontWeight: 'bold', color: 'var(--brand-danger)' }}>82%</div>
              <div style={{ color: 'var(--brand-text-muted)' }}>Job Placement Rate</div>
            </div>
          </div>
        </div>

        <div style={{ 
          textAlign: 'center', 
          marginTop: '3rem',
          padding: '2rem',
          border: '1px solid var(--brand-border)',
          borderRadius: '8px'
        }}>
          <h2>Ready to Partner with Us?</h2>
          <p><strong>Contact our specialized teams for your specific needs:</strong></p>
          <p>
            🏛️ <strong>Government Contracts:</strong> government@elevateforhumanity.org<br/>
            💜 <strong>Philanthropy & Grants:</strong> grants@elevateforhumanity.org<br/>
            ♿ <strong>Accessibility Services:</strong> accessibility@elevateforhumanity.org
          </p>
          <p style={{ marginTop: '20px' }}>
            📞 <strong>Phone:</strong> (555) 123-4567<br/>
            🏢 <strong>CAGE Code:</strong> 9ABC1 | <strong>DUNS:</strong> 123456789
          </p>
          <p style={{ marginTop: '20px', fontSize: '0.9em' }}>
            <strong>Elevate for Humanity</strong> - Veteran-Owned Small Business<br/>
            Creating pathways to prosperity through education, Elevate Learn2Earn Workforce, and community impact.
          </p>
        </div>
      </div>
    </div>
  );
}