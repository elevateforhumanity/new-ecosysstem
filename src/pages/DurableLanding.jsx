import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { SEO } from "../lib/seo/SEO";

export default function DurableLanding() {
  const [currentFeature, setCurrentFeature] = useState(0);
  
  const features = [
    {
      title: "AI-Powered Website Builder",
      description: "Create professional websites in minutes with our intelligent design system",
      icon: "🤖"
    },
    {
      title: "Dynamic Content Management",
      description: "Easily update and manage your content with our intuitive interface",
      icon: "📝"
    },
    {
      title: "SEO Optimization",
      description: "Built-in SEO tools to help your website rank higher in search results",
      icon: "🚀"
    },
    {
      title: "Mobile-First Design",
      description: "Responsive designs that look perfect on all devices",
      icon: "📱"
    }
  ];

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentFeature((prev) => (prev + 1) % features.length);
    }, 4000);
    return () => clearInterval(interval);
  }, [features.length]);

  return (
    <>
      <SEO
        title="Durable - AI-Powered Website Builder"
        description="Create stunning, professional websites in minutes with Durable's AI-powered platform. No coding required."
        canonical={`${import.meta.env.VITE_SITE_URL || ""}/durable`}
      />
      
      <main id="main-content" style={{ minHeight: '100vh' }}>
        {/* Hero Section */}
        <section style={{
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          color: 'white',
          padding: '4rem 2rem',
          textAlign: 'center'
        }}>
          <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
            <h1 style={{ 
              fontSize: 'clamp(2.5rem, 5vw, 4rem)', 
              marginBottom: '1.5rem',
              fontWeight: 'bold',
              lineHeight: '1.2'
            }}>
              Build Your Website with AI in Minutes
            </h1>
            <p style={{ 
              fontSize: 'clamp(1.1rem, 2.5vw, 1.5rem)', 
              marginBottom: '2.5rem',
              opacity: 0.9,
              maxWidth: '600px',
              margin: '0 auto 2.5rem'
            }}>
              Durable's AI-powered platform creates professional websites instantly. 
              No coding, no design skills needed.
            </p>
            
            <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', flexWrap: 'wrap' }}>
              <button style={{
                padding: '1rem 2.5rem',
                fontSize: '1.1rem',
                backgroundColor: '#ff6b6b',
                color: 'white',
                border: 'none',
                borderRadius: '50px',
                cursor: 'pointer',
                fontWeight: 'bold',
                transition: 'transform 0.2s',
                boxShadow: '0 4px 15px rgba(255, 107, 107, 0.3)'
              }}
              onMouseOver={(e) => e.target.style.transform = 'translateY(-2px)'}
              onMouseOut={(e) => e.target.style.transform = 'translateY(0)'}
              >
                Start Building Free
              </button>
              
              <button style={{
                padding: '1rem 2.5rem',
                fontSize: '1.1rem',
                backgroundColor: 'transparent',
                color: 'white',
                border: '2px solid white',
                borderRadius: '50px',
                cursor: 'pointer',
                fontWeight: 'bold',
                transition: 'all 0.2s'
              }}
              onMouseOver={(e) => {
                e.target.style.backgroundColor = 'white';
                e.target.style.color = '#667eea';
              }}
              onMouseOut={(e) => {
                e.target.style.backgroundColor = 'transparent';
                e.target.style.color = 'white';
              }}
              >
                Watch Demo
              </button>
            </div>
          </div>
        </section>

        {/* Dynamic Features Section */}
        <section style={{ padding: '4rem 2rem', backgroundColor: '#f8fafc' }}>
          <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
            <h2 style={{ 
              fontSize: '2.5rem', 
              textAlign: 'center', 
              marginBottom: '3rem',
              color: '#2d3748'
            }}>
              Powerful Features for Modern Websites
            </h2>
            
            <div style={{ 
              display: 'grid', 
              gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', 
              gap: '2rem',
              marginBottom: '3rem'
            }}>
              {features.map((feature, index) => (
                <div 
                  key={index}
                  style={{
                    padding: '2rem',
                    backgroundColor: 'white',
                    borderRadius: '12px',
                    boxShadow: currentFeature === index 
                      ? '0 10px 30px rgba(0,0,0,0.15)' 
                      : '0 4px 15px rgba(0,0,0,0.08)',
                    transform: currentFeature === index ? 'translateY(-5px)' : 'translateY(0)',
                    transition: 'all 0.3s ease',
                    border: currentFeature === index ? '2px solid #667eea' : '2px solid transparent',
                    textAlign: 'center'
                  }}
                >
                  <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>
                    {feature.icon}
                  </div>
                  <h3 style={{ 
                    fontSize: '1.5rem', 
                    marginBottom: '1rem',
                    color: '#2d3748'
                  }}>
                    {feature.title}
                  </h3>
                  <p style={{ color: '#718096', lineHeight: '1.6' }}>
                    {feature.description}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Stats Section */}
        <section style={{ 
          padding: '4rem 2rem', 
          backgroundColor: '#2d3748',
          color: 'white'
        }}>
          <div style={{ maxWidth: '1200px', margin: '0 auto', textAlign: 'center' }}>
            <h2 style={{ fontSize: '2.5rem', marginBottom: '3rem' }}>
              Trusted by Thousands
            </h2>
            
            <div style={{ 
              display: 'grid', 
              gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', 
              gap: '2rem'
            }}>
              <div>
                <div style={{ fontSize: '3rem', fontWeight: 'bold', color: '#ff6b6b' }}>
                  50K+
                </div>
                <div style={{ fontSize: '1.1rem', opacity: 0.8 }}>
                  Websites Created
                </div>
              </div>
              
              <div>
                <div style={{ fontSize: '3rem', fontWeight: 'bold', color: '#4ecdc4' }}>
                  99.9%
                </div>
                <div style={{ fontSize: '1.1rem', opacity: 0.8 }}>
                  Uptime Guarantee
                </div>
              </div>
              
              <div>
                <div style={{ fontSize: '3rem', fontWeight: 'bold', color: '#45b7d1' }}>
                  30s
                </div>
                <div style={{ fontSize: '1.1rem', opacity: 0.8 }}>
                  Average Build Time
                </div>
              </div>
              
              <div>
                <div style={{ fontSize: '3rem', fontWeight: 'bold', color: '#96ceb4' }}>
                  24/7
                </div>
                <div style={{ fontSize: '1.1rem', opacity: 0.8 }}>
                  Support Available
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Pricing Section */}
        <section style={{ padding: '4rem 2rem', backgroundColor: 'white' }}>
          <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
            <h2 style={{ 
              fontSize: '2.5rem', 
              textAlign: 'center', 
              marginBottom: '3rem',
              color: '#2d3748'
            }}>
              Simple, Transparent Pricing
            </h2>
            
            <div style={{ 
              display: 'grid', 
              gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', 
              gap: '2rem',
              maxWidth: '900px',
              margin: '0 auto'
            }}>
              {/* Starter Plan */}
              <div style={{
                padding: '2.5rem',
                border: '2px solid #e2e8f0',
                borderRadius: '12px',
                textAlign: 'center',
                position: 'relative'
              }}>
                <h3 style={{ fontSize: '1.5rem', marginBottom: '1rem', color: '#2d3748' }}>
                  Starter
                </h3>
                <div style={{ fontSize: '3rem', fontWeight: 'bold', color: '#667eea', marginBottom: '1rem' }}>
                  Free
                </div>
                <ul style={{ 
                  listStyle: 'none', 
                  padding: 0, 
                  marginBottom: '2rem',
                  textAlign: 'left'
                }}>
                  <li style={{ padding: '0.5rem 0', color: '#718096' }}>✓ 1 Website</li>
                  <li style={{ padding: '0.5rem 0', color: '#718096' }}>✓ Basic Templates</li>
                  <li style={{ padding: '0.5rem 0', color: '#718096' }}>✓ Durable Subdomain</li>
                  <li style={{ padding: '0.5rem 0', color: '#718096' }}>✓ Community Support</li>
                </ul>
                <button style={{
                  width: '100%',
                  padding: '1rem',
                  backgroundColor: '#e2e8f0',
                  color: '#2d3748',
                  border: 'none',
                  borderRadius: '8px',
                  fontSize: '1.1rem',
                  cursor: 'pointer'
                }}>
                  Get Started
                </button>
              </div>

              {/* Pro Plan */}
              <div style={{
                padding: '2.5rem',
                border: '2px solid #667eea',
                borderRadius: '12px',
                textAlign: 'center',
                position: 'relative',
                backgroundColor: '#f7fafc'
              }}>
                <div style={{
                  position: 'absolute',
                  top: '-12px',
                  left: '50%',
                  transform: 'translateX(-50%)',
                  backgroundColor: '#667eea',
                  color: 'white',
                  padding: '0.5rem 1.5rem',
                  borderRadius: '20px',
                  fontSize: '0.9rem',
                  fontWeight: 'bold'
                }}>
                  Most Popular
                </div>
                
                <h3 style={{ fontSize: '1.5rem', marginBottom: '1rem', color: '#2d3748' }}>
                  Pro
                </h3>
                <div style={{ fontSize: '3rem', fontWeight: 'bold', color: '#667eea', marginBottom: '1rem' }}>
                  $12<span style={{ fontSize: '1rem', color: '#718096' }}>/month</span>
                </div>
                <ul style={{ 
                  listStyle: 'none', 
                  padding: 0, 
                  marginBottom: '2rem',
                  textAlign: 'left'
                }}>
                  <li style={{ padding: '0.5rem 0', color: '#718096' }}>✓ Unlimited Websites</li>
                  <li style={{ padding: '0.5rem 0', color: '#718096' }}>✓ Premium Templates</li>
                  <li style={{ padding: '0.5rem 0', color: '#718096' }}>✓ Custom Domain</li>
                  <li style={{ padding: '0.5rem 0', color: '#718096' }}>✓ Advanced SEO Tools</li>
                  <li style={{ padding: '0.5rem 0', color: '#718096' }}>✓ Priority Support</li>
                </ul>
                <button style={{
                  width: '100%',
                  padding: '1rem',
                  backgroundColor: '#667eea',
                  color: 'white',
                  border: 'none',
                  borderRadius: '8px',
                  fontSize: '1.1rem',
                  cursor: 'pointer',
                  fontWeight: 'bold'
                }}>
                  Start Pro Trial
                </button>
              </div>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section style={{
          padding: '4rem 2rem',
          background: 'linear-gradient(135deg, #ff6b6b 0%, #ee5a24 100%)',
          color: 'white',
          textAlign: 'center'
        }}>
          <div style={{ maxWidth: '800px', margin: '0 auto' }}>
            <h2 style={{ fontSize: '2.5rem', marginBottom: '1.5rem' }}>
              Ready to Build Your Dream Website?
            </h2>
            <p style={{ fontSize: '1.2rem', marginBottom: '2.5rem', opacity: 0.9 }}>
              Join thousands of entrepreneurs and businesses who trust Durable 
              to power their online presence.
            </p>
            
            <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', flexWrap: 'wrap' }}>
              <button style={{
                padding: '1.2rem 3rem',
                fontSize: '1.2rem',
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
                Start Building Now
              </button>
              
              <Link 
                to="/contact" 
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
                onMouseOver={(e) => {
                  e.target.style.backgroundColor = 'white';
                  e.target.style.color = '#ff6b6b';
                }}
                onMouseOut={(e) => {
                  e.target.style.backgroundColor = 'transparent';
                  e.target.style.color = 'white';
                }}
              >
                Contact Sales
              </Link>
            </div>
          </div>
        </section>
      </main>
    </>
  );
}