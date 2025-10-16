import React, { useState } from "react";
import { Link } from "react-router-dom";
import { SEO } from "../lib/seo/SEO";
import DurableNav from "../components/DurableNav";

export default function DurableFeatures() {
  const [activeFeature, setActiveFeature] = useState(0);
  
  const features = [
    {
      title: "AI Website Builder",
      description: "Create professional websites in 30 seconds with AI",
      icon: "🤖",
      details: [
        "Intelligent content generation",
        "Smart design recommendations", 
        "Industry-specific templates",
        "SEO optimization"
      ]
    },
    {
      title: "Drag & Drop Editor",
      description: "Customize your site with our intuitive visual editor",
      icon: "🎨",
      details: [
        "Visual page builder",
        "Real-time preview",
        "Mobile responsive editing",
        "Custom CSS support"
      ]
    },
    {
      title: "E-commerce Ready",
      description: "Sell products online with built-in store features",
      icon: "🛍️",
      details: [
        "Product catalog",
        "Shopping cart",
        "Payment processing",
        "Inventory management"
      ]
    },
    {
      title: "SEO & Analytics",
      description: "Get found online with powerful SEO and tracking tools",
      icon: "📊",
      details: [
        "SEO optimization",
        "Google Analytics",
        "Search console integration",
        "Performance tracking"
      ]
    }
  ];

  return (
    <>
      <SEO
        title="Durable Features - Everything You Need to Build & Grow"
        description="Discover all the powerful features that make Durable the best website builder. AI creation, drag & drop editing, e-commerce, SEO tools and more."
        canonical={`${import.meta.env.VITE_SITE_URL || ""}/durable-features`}
      />
      
      <main id="main-content" style={{ minHeight: '100vh' }}>
        <DurableNav />

        {/* Hero Section */}
        <section style={{
          background: 'linear-gradient(135deg, #ff6b6b 0%, #ee5a24 100%)',
          color: 'white',
          padding: '4rem 2rem',
          textAlign: 'center'
        }}>
          <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
            <h1 style={{ 
              fontSize: 'clamp(2.5rem, 5vw, 4rem)', 
              marginBottom: '1.5rem',
              fontWeight: 'bold'
            }}>
              Everything You Need to Succeed Online
            </h1>
            <p style={{ 
              fontSize: 'clamp(1.1rem, 2.5vw, 1.5rem)', 
              marginBottom: '2.5rem',
              opacity: 0.9,
              maxWidth: '600px',
              margin: '0 auto 2.5rem'
            }}>
              From AI-powered creation to advanced e-commerce, Durable has all the tools 
              to build, launch, and grow your online presence.
            </p>
            
            <button style={{
              padding: '1rem 2.5rem',
              fontSize: '1.1rem',
              backgroundColor: 'white',
              color: '#ff6b6b',
              border: 'none',
              borderRadius: '50px',
              cursor: 'pointer',
              fontWeight: 'bold',
              transition: 'transform 0.2s',
              boxShadow: '0 4px 15px rgba(0,0,0,0.1)'
            }}
            onMouseOver={(e) => e.target.style.transform = 'translateY(-2px)'}
            onMouseOut={(e) => e.target.style.transform = 'translateY(0)'}
            >
              Explore All Features
            </button>
          </div>
        </section>

        {/* Interactive Features */}
        <section style={{ padding: '4rem 2rem', backgroundColor: '#f8fafc' }}>
          <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
            <h2 style={{ fontSize: '2.5rem', textAlign: 'center', marginBottom: '3rem', color: '#2d3748' }}>
              Core Features
            </h2>
            
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '3rem', alignItems: 'center' }}>
              {/* Feature List */}
              <div>
                {features.map((feature, index) => (
                  <div
                    key={index}
                    onClick={() => setActiveFeature(index)}
                    style={{
                      padding: '1.5rem',
                      marginBottom: '1rem',
                      backgroundColor: activeFeature === index ? 'white' : 'transparent',
                      border: activeFeature === index ? '2px solid #667eea' : '2px solid transparent',
                      borderRadius: '12px',
                      cursor: 'pointer',
                      transition: 'all 0.3s ease',
                      boxShadow: activeFeature === index ? '0 4px 15px rgba(0,0,0,0.1)' : 'none'
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', marginBottom: '0.5rem' }}>
                      <span style={{ fontSize: '2rem', marginRight: '1rem' }}>{feature.icon}</span>
                      <h3 style={{ 
                        fontSize: '1.5rem', 
                        color: activeFeature === index ? '#667eea' : '#2d3748',
                        margin: 0
                      }}>
                        {feature.title}
                      </h3>
                    </div>
                    <p style={{ color: '#718096', margin: 0 }}>
                      {feature.description}
                    </p>
                  </div>
                ))}
              </div>
              
              {/* Feature Details */}
              <div style={{
                padding: '2rem',
                backgroundColor: 'white',
                borderRadius: '12px',
                boxShadow: '0 4px 15px rgba(0,0,0,0.1)',
                minHeight: '400px'
              }}>
                <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
                  <span style={{ fontSize: '4rem' }}>{features[activeFeature].icon}</span>
                  <h3 style={{ fontSize: '2rem', color: '#2d3748', marginBottom: '1rem' }}>
                    {features[activeFeature].title}
                  </h3>
                  <p style={{ fontSize: '1.1rem', color: '#718096' }}>
                    {features[activeFeature].description}
                  </p>
                </div>
                
                <ul style={{ listStyle: 'none', padding: 0 }}>
                  {features[activeFeature].details.map((detail, index) => (
                    <li key={index} style={{ 
                      padding: '0.75rem 0', 
                      borderBottom: '1px solid #e2e8f0',
                      color: '#2d3748',
                      display: 'flex',
                      alignItems: 'center'
                    }}>
                      <span style={{ color: '#667eea', marginRight: '0.5rem' }}>✓</span>
                      {detail}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </section>

        {/* All Features Grid */}
        <section style={{ padding: '4rem 2rem', backgroundColor: 'white' }}>
          <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
            <h2 style={{ fontSize: '2.5rem', textAlign: 'center', marginBottom: '3rem', color: '#2d3748' }}>
              Complete Feature Set
            </h2>
            
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '2rem' }}>
              {/* Website Building */}
              <div style={{ padding: '2rem', border: '1px solid #e2e8f0', borderRadius: '12px' }}>
                <h3 style={{ fontSize: '1.5rem', marginBottom: '1.5rem', color: '#667eea', display: 'flex', alignItems: 'center' }}>
                  <span style={{ marginRight: '0.5rem' }}>🏗️</span>
                  Website Building
                </h3>
                <ul style={{ listStyle: 'none', padding: 0, color: '#718096' }}>
                  <li style={{ padding: '0.5rem 0' }}>✓ AI-powered creation</li>
                  <li style={{ padding: '0.5rem 0' }}>✓ Drag & drop editor</li>
                  <li style={{ padding: '0.5rem 0' }}>✓ 150+ templates</li>
                  <li style={{ padding: '0.5rem 0' }}>✓ Mobile responsive</li>
                  <li style={{ padding: '0.5rem 0' }}>✓ Custom domains</li>
                </ul>
              </div>

              {/* E-commerce */}
              <div style={{ padding: '2rem', border: '1px solid #e2e8f0', borderRadius: '12px' }}>
                <h3 style={{ fontSize: '1.5rem', marginBottom: '1.5rem', color: '#ff6b6b', display: 'flex', alignItems: 'center' }}>
                  <span style={{ marginRight: '0.5rem' }}>🛒</span>
                  E-commerce
                </h3>
                <ul style={{ listStyle: 'none', padding: 0, color: '#718096' }}>
                  <li style={{ padding: '0.5rem 0' }}>✓ Online store</li>
                  <li style={{ padding: '0.5rem 0' }}>✓ Payment processing</li>
                  <li style={{ padding: '0.5rem 0' }}>✓ Inventory management</li>
                  <li style={{ padding: '0.5rem 0' }}>✓ Order tracking</li>
                  <li style={{ padding: '0.5rem 0' }}>✓ Tax calculations</li>
                </ul>
              </div>

              {/* Marketing */}
              <div style={{ padding: '2rem', border: '1px solid #e2e8f0', borderRadius: '12px' }}>
                <h3 style={{ fontSize: '1.5rem', marginBottom: '1.5rem', color: '#4ecdc4', display: 'flex', alignItems: 'center' }}>
                  <span style={{ marginRight: '0.5rem' }}>📈</span>
                  Marketing
                </h3>
                <ul style={{ listStyle: 'none', padding: 0, color: '#718096' }}>
                  <li style={{ padding: '0.5rem 0' }}>✓ SEO optimization</li>
                  <li style={{ padding: '0.5rem 0' }}>✓ Email marketing</li>
                  <li style={{ padding: '0.5rem 0' }}>✓ Social media integration</li>
                  <li style={{ padding: '0.5rem 0' }}>✓ Analytics & tracking</li>
                  <li style={{ padding: '0.5rem 0' }}>✓ Lead generation</li>
                </ul>
              </div>

              {/* Business Tools */}
              <div style={{ padding: '2rem', border: '1px solid #e2e8f0', borderRadius: '12px' }}>
                <h3 style={{ fontSize: '1.5rem', marginBottom: '1.5rem', color: '#45b7d1', display: 'flex', alignItems: 'center' }}>
                  <span style={{ marginRight: '0.5rem' }}>⚙️</span>
                  Business Tools
                </h3>
                <ul style={{ listStyle: 'none', padding: 0, color: '#718096' }}>
                  <li style={{ padding: '0.5rem 0' }}>✓ Contact forms</li>
                  <li style={{ padding: '0.5rem 0' }}>✓ Appointment booking</li>
                  <li style={{ padding: '0.5rem 0' }}>✓ Customer reviews</li>
                  <li style={{ padding: '0.5rem 0' }}>✓ Live chat</li>
                  <li style={{ padding: '0.5rem 0' }}>✓ Team collaboration</li>
                </ul>
              </div>

              {/* Security & Performance */}
              <div style={{ padding: '2rem', border: '1px solid #e2e8f0', borderRadius: '12px' }}>
                <h3 style={{ fontSize: '1.5rem', marginBottom: '1.5rem', color: '#96ceb4', display: 'flex', alignItems: 'center' }}>
                  <span style={{ marginRight: '0.5rem' }}>🔒</span>
                  Security & Performance
                </h3>
                <ul style={{ listStyle: 'none', padding: 0, color: '#718096' }}>
                  <li style={{ padding: '0.5rem 0' }}>✓ SSL certificates</li>
                  <li style={{ padding: '0.5rem 0' }}>✓ CDN hosting</li>
                  <li style={{ padding: '0.5rem 0' }}>✓ Automatic backups</li>
                  <li style={{ padding: '0.5rem 0' }}>✓ 99.9% uptime</li>
                  <li style={{ padding: '0.5rem 0' }}>✓ DDoS protection</li>
                </ul>
              </div>

              {/* Support */}
              <div style={{ padding: '2rem', border: '1px solid #e2e8f0', borderRadius: '12px' }}>
                <h3 style={{ fontSize: '1.5rem', marginBottom: '1.5rem', color: '#9b59b6', display: 'flex', alignItems: 'center' }}>
                  <span style={{ marginRight: '0.5rem' }}>🎧</span>
                  Support
                </h3>
                <ul style={{ listStyle: 'none', padding: 0, color: '#718096' }}>
                  <li style={{ padding: '0.5rem 0' }}>✓ 24/7 customer support</li>
                  <li style={{ padding: '0.5rem 0' }}>✓ Video tutorials</li>
                  <li style={{ padding: '0.5rem 0' }}>✓ Knowledge base</li>
                  <li style={{ padding: '0.5rem 0' }}>✓ Community forum</li>
                  <li style={{ padding: '0.5rem 0' }}>✓ Priority support</li>
                </ul>
              </div>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section style={{
          padding: '4rem 2rem',
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          color: 'white',
          textAlign: 'center'
        }}>
          <div style={{ maxWidth: '800px', margin: '0 auto' }}>
            <h2 style={{ fontSize: '2.5rem', marginBottom: '1.5rem' }}>
              Ready to Experience All These Features?
            </h2>
            <p style={{ fontSize: '1.2rem', marginBottom: '2.5rem', opacity: 0.9 }}>
              Start building your website today and discover why thousands of businesses choose Durable.
            </p>
            
            <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', flexWrap: 'wrap' }}>
              <Link 
                to="/durable-ai"
                style={{
                  display: 'inline-block',
                  padding: '1.2rem 3rem',
                  fontSize: '1.2rem',
                  backgroundColor: '#ff6b6b',
                  color: 'white',
                  border: 'none',
                  borderRadius: '50px',
                  textDecoration: 'none',
                  fontWeight: 'bold',
                  transition: 'transform 0.2s'
                }}
              >
                Start Building Free
              </Link>
              
              <Link 
                to="/durable-pricing" 
                style={{
                  display: 'inline-block',
                  padding: '1.2rem 3rem',
                  fontSize: '1.2rem',
                  backgroundColor: 'transparent',
                  color: 'white',
                  border: '2px solid white',
                  borderRadius: '50px',
                  textDecoration: 'none',
                  fontWeight: 'bold',
                  transition: 'all 0.2s'
                }}
              >
                View Pricing
              </Link>
            </div>
          </div>
        </section>
      </main>
    </>
  );
}