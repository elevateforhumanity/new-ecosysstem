/*
  Copyright (c) 2025 Elevate for Humanity
  Commercial License. No resale, sublicensing, or redistribution allowed.
  See LICENSE file for details.
*/

import React, { useState, useEffect } from 'react';

export default function Philanthropy() {
  const [philanthropyData, setPhilanthropyData] = useState(null);
  const [impactData, setImpactData] = useState(null);
  const [givingData, setGivingData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [overviewRes, impactRes, givingRes] = await Promise.all([
          fetch('/api/philanthropy/overview'),
          fetch('/api/philanthropy/impact'),
          fetch('/api/philanthropy/giving')
        ]);

        const [overview, impact, giving] = await Promise.all([
          overviewRes.json(),
          impactRes.json(),
          givingRes.json()
        ]);

        setPhilanthropyData(overview);
        setImpactData(impact);
        setGivingData(giving);
      } catch (error) {
        console.error('Error fetching philanthropy data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  if (loading) {
    return (
      <div style={{ padding: '2rem', textAlign: 'center' }}>
        <div>Loading philanthropy information...</div>
      </div>
    );
  }

  const tabs = [
    { id: 'overview', label: 'Overview' },
    { id: 'grants', label: 'Grants' },
    { id: 'impact', label: 'Impact' },
    { id: 'giving', label: 'Give' }
  ];

  return (
    <main id="main-content" style={{ padding: '2rem', maxWidth: '1200px', margin: '0 auto' }}>
      <header style={{ marginBottom: '3rem', textAlign: 'center' }}>
        <h1 style={{ fontSize: '2.5rem', marginBottom: '1rem', color: 'var(--brand-secondary)' }}>
          Elevate for Humanity Foundation
        </h1>
        <p style={{ fontSize: '1.2rem', color: 'var(--brand-text-muted)', maxWidth: '800px', margin: '0 auto' }}>
          {philanthropyData?.mission || 'Empowering communities through education, Elevate Learn2Earn Workforce, and social impact initiatives.'}
        </p>
      </header>

      {/* Tab Navigation */}
      <div style={{ 
        display: 'flex', 
        borderBottom: '2px solid var(--brand-border)', 
        marginBottom: '2rem',
        justifyContent: 'center',
        flexWrap: 'wrap'
      }}>
        {tabs.map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            style={{
              padding: '1rem 2rem',
              border: 'none',
              backgroundColor: 'transparent',
              cursor: 'pointer',
              fontSize: '1rem',
              fontWeight: activeTab === tab.id ? 'bold' : 'normal',
              color: activeTab === tab.id ? 'var(--brand-secondary)' : 'var(--brand-text-muted)',
              borderBottom: activeTab === tab.id ? '3px solid var(--brand-secondary)' : '3px solid transparent'
            }}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Overview Tab */}
      {activeTab === 'overview' && (
        <div>
          {/* Founder Section */}
          <section style={{ marginBottom: '3rem', textAlign: 'center' }}>
            <h2 style={{ fontSize: '2rem', marginBottom: '1rem', color: 'var(--brand-text)' }}>
              Founded by Elizabeth L. Greene
            </h2>
            <p style={{ fontSize: '1.1rem', color: 'var(--brand-text-muted)', maxWidth: '700px', margin: '0 auto' }}>
              {philanthropyData?.founder?.bio || 'A visionary leader committed to creating pathways to prosperity through education and Elevate Learn2Earn Workforce.'}
            </p>
          </section>

          {/* Priority Areas */}
          <section style={{ marginBottom: '3rem' }}>
            <h2 style={{ fontSize: '2rem', marginBottom: '1.5rem', color: 'var(--brand-text)', textAlign: 'center' }}>
              Our Priority Areas
            </h2>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '1.5rem' }}>
              {philanthropyData?.priorities?.map((priority, index) => (
                <div key={index} style={{
                  padding: '1.5rem',
                  border: '1px solid var(--brand-border)',
                  borderRadius: '8px',
                  backgroundColor: '#fafafa',
                  textAlign: 'center'
                }}>
                  <div style={{ fontSize: '2rem', marginBottom: '1rem' }}>
                    {priority.icon}
                  </div>
                  <h3 style={{ fontSize: '1.25rem', marginBottom: '0.5rem', color: 'var(--brand-text)' }}>
                    {priority.title}
                  </h3>
                  <p style={{ color: 'var(--brand-text-muted)', fontSize: '0.9rem' }}>
                    {priority.description}
                  </p>
                </div>
              ))}
            </div>
          </section>

          {/* Quick Stats */}
          <section style={{ 
            backgroundColor: '#f3f4f6', 
            padding: '2rem', 
            borderRadius: '8px',
            marginBottom: '2rem'
          }}>
            <h3 style={{ fontSize: '1.5rem', marginBottom: '1.5rem', color: 'var(--brand-text)', textAlign: 'center' }}>
              Impact at a Glance
            </h3>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: '1rem' }}>
              {philanthropyData?.quickStats?.map((stat, index) => (
                <div key={index} style={{ textAlign: 'center' }}>
                  <div style={{ fontSize: '2rem', fontWeight: 'bold', color: 'var(--brand-secondary)' }}>
                    {stat.value}
                  </div>
                  <div style={{ fontSize: '0.875rem', color: 'var(--brand-text-muted)' }}>
                    {stat.label}
                  </div>
                </div>
              ))}
            </div>
          </section>
        </div>
      )}

      {/* Grants Tab */}
      {activeTab === 'grants' && (
        <div>
          <section style={{ marginBottom: '3rem' }}>
            <h2 style={{ fontSize: '2rem', marginBottom: '1.5rem', color: 'var(--brand-text)' }}>
              Grant Opportunities
            </h2>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(350px, 1fr))', gap: '2rem' }}>
              {philanthropyData?.grantTypes?.map((grant, index) => (
                <div key={index} style={{
                  padding: '2rem',
                  border: '1px solid var(--brand-border)',
                  borderRadius: '8px',
                  backgroundColor: '#ffffff'
                }}>
                  <h3 style={{ fontSize: '1.5rem', marginBottom: '1rem', color: 'var(--brand-secondary)' }}>
                    {grant.title}
                  </h3>
                  <div style={{ marginBottom: '1rem' }}>
                    <strong style={{ color: 'var(--brand-text)' }}>Funding Range:</strong>
                    <span style={{ color: 'var(--brand-success)', fontSize: '1.1rem', marginLeft: '0.5rem' }}>
                      {grant.fundingRange}
                    </span>
                  </div>
                  <p style={{ color: 'var(--brand-text-muted)', marginBottom: '1rem' }}>
                    {grant.description}
                  </p>
                  <div style={{ marginBottom: '1rem' }}>
                    <strong style={{ color: 'var(--brand-text)' }}>Eligible Recipients:</strong>
                    <ul style={{ marginTop: '0.5rem', paddingLeft: '1rem' }}>
                      {grant.eligibleRecipients.map((recipient, idx) => (
                        <li key={idx} style={{ color: 'var(--brand-text-muted)', fontSize: '0.9rem' }}>
                          {recipient}
                        </li>
                      ))}
                    </ul>
                  </div>
                  <button style={{
                    padding: '0.75rem 1.5rem',
                    backgroundColor: 'var(--brand-secondary)',
                    color: 'white',
                    border: 'none',
                    borderRadius: '6px',
                    cursor: 'pointer',
                    width: '100%'
                  }}>
                    Apply Now
                  </button>
                </div>
              ))}
            </div>
          </section>
        </div>
      )}

      {/* Impact Tab */}
      {activeTab === 'impact' && (
        <div>
          <section style={{ marginBottom: '3rem' }}>
            <h2 style={{ fontSize: '2rem', marginBottom: '1.5rem', color: 'var(--brand-text)' }}>
              Our Impact
            </h2>
            
            {/* Key Metrics */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem', marginBottom: '2rem' }}>
              {impactData?.metrics?.map((metric, index) => (
                <div key={index} style={{
                  padding: '1.5rem',
                  backgroundColor: 'var(--brand-surface)',
                  borderRadius: '8px',
                  textAlign: 'center',
                  border: '1px solid #bfdbfe'
                }}>
                  <div style={{ fontSize: '2rem', fontWeight: 'bold', color: 'var(--brand-info)', marginBottom: '0.5rem' }}>
                    {metric.value}
                  </div>
                  <div style={{ fontSize: '0.875rem', color: 'var(--brand-text)', fontWeight: '500' }}>
                    {metric.label}
                  </div>
                </div>
              ))}
            </div>

            {/* Success Stories */}
            <h3 style={{ fontSize: '1.5rem', marginBottom: '1rem', color: 'var(--brand-text)' }}>
              Success Stories
            </h3>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '1.5rem' }}>
              {impactData?.stories?.map((story, index) => (
                <div key={index} style={{
                  padding: '1.5rem',
                  border: '1px solid var(--brand-border)',
                  borderRadius: '8px',
                  backgroundColor: '#fafafa'
                }}>
                  <h4 style={{ fontSize: '1.25rem', marginBottom: '0.5rem', color: 'var(--brand-text)' }}>
                    {story.title}
                  </h4>
                  <p style={{ color: 'var(--brand-text-muted)', fontSize: '0.9rem', fontStyle: 'italic', marginBottom: '1rem' }}>
                    "{story.quote}"
                  </p>
                  <div style={{ fontSize: '0.875rem', color: 'var(--brand-text)' }}>
                    <strong>{story.participant}</strong> - {story.program}
                  </div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--brand-text-muted)', marginTop: '0.5rem' }}>
                    Outcome: {story.outcome}
                  </div>
                </div>
              ))}
            </div>
          </section>
        </div>
      )}

      {/* Giving Tab */}
      {activeTab === 'giving' && (
        <div>
          <section style={{ marginBottom: '3rem' }}>
            <h2 style={{ fontSize: '2rem', marginBottom: '1.5rem', color: 'var(--brand-text)' }}>
              Ways to Give
            </h2>
            
            {/* Giving Options */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '2rem', marginBottom: '3rem' }}>
              {givingData?.options?.map((option, index) => (
                <div key={index} style={{
                  padding: '2rem',
                  border: '2px solid var(--brand-border)',
                  borderRadius: '8px',
                  backgroundColor: '#ffffff',
                  textAlign: 'center'
                }}>
                  <div style={{ fontSize: '2rem', marginBottom: '1rem' }}>
                    {option.icon}
                  </div>
                  <h3 style={{ fontSize: '1.5rem', marginBottom: '1rem', color: 'var(--brand-secondary)' }}>
                    {option.title}
                  </h3>
                  <p style={{ color: 'var(--brand-text-muted)', marginBottom: '1.5rem' }}>
                    {option.description}
                  </p>
                  <div style={{ marginBottom: '1.5rem' }}>
                    <div style={{ fontSize: '1.25rem', fontWeight: 'bold', color: 'var(--brand-success)' }}>
                      {option.amount}
                    </div>
                    <div style={{ fontSize: '0.875rem', color: 'var(--brand-text-muted)' }}>
                      {option.impact}
                    </div>
                  </div>
                  <button style={{
                    padding: '0.75rem 2rem',
                    backgroundColor: 'var(--brand-secondary)',
                    color: 'white',
                    border: 'none',
                    borderRadius: '6px',
                    cursor: 'pointer',
                    fontSize: '1rem'
                  }}>
                    {option.buttonText}
                  </button>
                </div>
              ))}
            </div>

            {/* Recognition Levels */}
            <div style={{ 
              backgroundColor: 'var(--brand-surface)', 
              padding: '2rem', 
              borderRadius: '8px',
              marginBottom: '2rem'
            }}>
              <h3 style={{ fontSize: '1.5rem', marginBottom: '1rem', color: 'var(--brand-text)', textAlign: 'center' }}>
                Donor Recognition
              </h3>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem' }}>
                {givingData?.recognition?.map((level, index) => (
                  <div key={index} style={{
                    padding: '1rem',
                    backgroundColor: 'white',
                    borderRadius: '6px',
                    textAlign: 'center',
                    border: '1px solid var(--brand-border)'
                  }}>
                    <div style={{ fontSize: '1.5rem', marginBottom: '0.5rem' }}>
                      {level.icon}
                    </div>
                    <h4 style={{ fontSize: '1rem', marginBottom: '0.25rem', color: 'var(--brand-text)' }}>
                      {level.title}
                    </h4>
                    <div style={{ fontSize: '0.875rem', color: 'var(--brand-success)', fontWeight: 'bold' }}>
                      {level.amount}
                    </div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--brand-text-muted)', marginTop: '0.5rem' }}>
                      {level.benefits}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Corporate Partnerships */}
            <div style={{
              backgroundColor: '#fef3c7',
              padding: '2rem',
              borderRadius: '8px',
              textAlign: 'center'
            }}>
              <h3 style={{ fontSize: '1.5rem', marginBottom: '1rem', color: '#92400e' }}>
                Corporate Partnerships
              </h3>
              <p style={{ color: '#92400e', marginBottom: '1.5rem' }}>
                Partner with us to create meaningful impact while achieving your corporate social responsibility goals.
              </p>
              <button style={{
                padding: '0.75rem 2rem',
                backgroundColor: '#92400e',
                color: 'white',
                border: 'none',
                borderRadius: '6px',
                cursor: 'pointer',
                fontSize: '1rem'
              }}>
                Explore Partnerships
              </button>
            </div>
          </section>
        </div>
      )}
    </main>
  );
}