import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { SEO } from "../lib/seo/SEO";
import DurableNav from "../components/DurableNav";

export default function DurableAI() {
  const [currentDemo, setCurrentDemo] = useState(0);
  
  const demos = [
    { title: "E-commerce Store", time: "30 seconds", industry: "Retail" },
    { title: "Restaurant Website", time: "25 seconds", industry: "Food & Beverage" },
    { title: "Professional Services", time: "35 seconds", industry: "Consulting" },
    { title: "Portfolio Site", time: "20 seconds", industry: "Creative" }
  ];

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentDemo((prev) => (prev + 1) % demos.length);
    }, 3000);
    return () => clearInterval(interval);
  }, [demos.length]);

  return (
    <>
      <SEO
        title="Durable AI - Build Websites in 30 Seconds"
        description="Revolutionary AI website builder that creates professional websites in under 30 seconds. No coding, no design skills needed."
        canonical={`${import.meta.env.VITE_SITE_URL || ""}/durable-ai`}
      />
      
      <main id="main-content" style={{ minHeight: '100vh' }}>
        <DurableNav />

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
              fontWeight: 'bold'
            }}>
              AI Builds Your Website in 30 Seconds
            </h1>
            <p style={{ 
              fontSize: 'clamp(1.1rem, 2.5vw, 1.5rem)', 
              marginBottom: '2.5rem',
              opacity: 0.9,
              maxWidth: '600px',
              margin: '0 auto 2.5rem'
            }}>
              Just tell our AI what kind of business you have, and watch it create 
              a professional website instantly.
            </p>
            
            <div style={{ 
              backgroundColor: 'rgba(255,255,255,0.1)', 
              padding: '2rem', 
              borderRadius: '15px',
              marginBottom: '2rem',
              backdropFilter: 'blur(10px)'
            }}>
              <h3 style={{ marginBottom: '1rem' }}>Currently Building:</h3>
              <div style={{ 
                fontSize: '1.5rem', 
                fontWeight: 'bold',
                color: '#ff6b6b'
              }}>
                {demos[currentDemo].title}
              </div>
              <div style={{ opacity: 0.8, marginTop: '0.5rem' }}>
                {demos[currentDemo].industry} • {demos[currentDemo].time}
              </div>
              <div style={{ 
                width: '100%', 
                height: '4px', 
                backgroundColor: 'rgba(255,255,255,0.3)', 
                borderRadius: '2px',
                marginTop: '1rem',
                overflow: 'hidden'
              }}>
                <div style={{ 
                  width: '100%', 
                  height: '100%', 
                  backgroundColor: '#ff6b6b',
                  animation: 'progress 3s linear infinite'
                }}></div>
              </div>
            </div>
            
            <button style={{
              padding: '1.2rem 3rem',
              fontSize: '1.2rem',
              backgroundColor: '#ff6b6b',
              color: 'white',
              border: 'none',
              borderRadius: '50px',
              cursor: 'pointer',
              fontWeight: 'bold',
              boxShadow: '0 4px 15px rgba(255, 107, 107, 0.3)',
              transition: 'transform 0.2s'
            }}
            onMouseOver={(e) => e.target.style.transform = 'translateY(-2px)'}
            onMouseOut={(e) => e.target.style.transform = 'translateY(0)'}
            >
              Try AI Builder Free
            </button>
          </div>
        </section>

        {/* How It Works */}
        <section style={{ padding: '4rem 2rem', backgroundColor: '#f8fafc' }}>
          <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
            <h2 style={{ fontSize: '2.5rem', textAlign: 'center', marginBottom: '3rem', color: '#2d3748' }}>
              How AI Creates Your Website
            </h2>
            
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '2rem' }}>
              <div style={{ textAlign: 'center', padding: '2rem' }}>
                <div style={{ 
                  width: '80px', 
                  height: '80px', 
                  backgroundColor: '#667eea', 
                  borderRadius: '50%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  margin: '0 auto 1.5rem',
                  fontSize: '2rem'
                }}>
                  🤖
                </div>
                <h3 style={{ fontSize: '1.5rem', marginBottom: '1rem', color: '#2d3748' }}>
                  1. Tell AI About Your Business
                </h3>
                <p style={{ color: '#718096' }}>
                  Simply describe your business type, industry, and goals. Our AI understands context.
                </p>
              </div>
              
              <div style={{ textAlign: 'center', padding: '2rem' }}>
                <div style={{ 
                  width: '80px', 
                  height: '80px', 
                  backgroundColor: '#ff6b6b', 
                  borderRadius: '50%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  margin: '0 auto 1.5rem',
                  fontSize: '2rem'
                }}>
                  ⚡
                </div>
                <h3 style={{ fontSize: '1.5rem', marginBottom: '1rem', color: '#2d3748' }}>
                  2. AI Generates Everything
                </h3>
                <p style={{ color: '#718096' }}>
                  Content, images, layout, colors, and functionality - all created automatically.
                </p>
              </div>
              
              <div style={{ textAlign: 'center', padding: '2rem' }}>
                <div style={{ 
                  width: '80px', 
                  height: '80px', 
                  backgroundColor: '#4ecdc4', 
                  borderRadius: '50%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  margin: '0 auto 1.5rem',
                  fontSize: '2rem'
                }}>
                  🎨
                </div>
                <h3 style={{ fontSize: '1.5rem', marginBottom: '1rem', color: '#2d3748' }}>
                  3. Customize & Launch
                </h3>
                <p style={{ color: '#718096' }}>
                  Fine-tune your site with our editor, then publish with one click.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* AI Capabilities */}
        <section style={{ padding: '4rem 2rem', backgroundColor: 'white' }}>
          <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
            <h2 style={{ fontSize: '2.5rem', textAlign: 'center', marginBottom: '3rem', color: '#2d3748' }}>
              What Our AI Can Do
            </h2>
            
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '2rem' }}>
              <div style={{ 
                padding: '2rem', 
                border: '1px solid #e2e8f0', 
                borderRadius: '12px',
                transition: 'transform 0.3s ease'
              }}
              onMouseOver={(e) => e.currentTarget.style.transform = 'translateY(-5px)'}
              onMouseOut={(e) => e.currentTarget.style.transform = 'translateY(0)'}
              >
                <h3 style={{ fontSize: '1.5rem', marginBottom: '1rem', color: '#667eea' }}>
                  📝 Smart Content Generation
                </h3>
                <p style={{ color: '#718096', marginBottom: '1rem' }}>
                  AI writes compelling copy, headlines, and descriptions tailored to your industry.
                </p>
                <ul style={{ color: '#718096', paddingLeft: '1.5rem' }}>
                  <li>Industry-specific content</li>
                  <li>SEO-optimized text</li>
                  <li>Call-to-action optimization</li>
                </ul>
              </div>
              
              <div style={{ 
                padding: '2rem', 
                border: '1px solid #e2e8f0', 
                borderRadius: '12px',
                transition: 'transform 0.3s ease'
              }}
              onMouseOver={(e) => e.currentTarget.style.transform = 'translateY(-5px)'}
              onMouseOut={(e) => e.currentTarget.style.transform = 'translateY(0)'}
              >
                <h3 style={{ fontSize: '1.5rem', marginBottom: '1rem', color: '#ff6b6b' }}>
                  🎨 Intelligent Design
                </h3>
                <p style={{ color: '#718096', marginBottom: '1rem' }}>
                  AI selects colors, fonts, and layouts that convert based on your business type.
                </p>
                <ul style={{ color: '#718096', paddingLeft: '1.5rem' }}>
                  <li>Brand-appropriate colors</li>
                  <li>Professional layouts</li>
                  <li>Mobile-optimized design</li>
                </ul>
              </div>
              
              <div style={{ 
                padding: '2rem', 
                border: '1px solid #e2e8f0', 
                borderRadius: '12px',
                transition: 'transform 0.3s ease'
              }}
              onMouseOver={(e) => e.currentTarget.style.transform = 'translateY(-5px)'}
              onMouseOut={(e) => e.currentTarget.style.transform = 'translateY(0)'}
              >
                <h3 style={{ fontSize: '1.5rem', marginBottom: '1rem', color: '#4ecdc4' }}>
                  🔧 Feature Integration
                </h3>
                <p style={{ color: '#718096', marginBottom: '1rem' }}>
                  AI adds the right features for your business - forms, galleries, booking systems.
                </p>
                <ul style={{ color: '#718096', paddingLeft: '1.5rem' }}>
                  <li>Contact forms</li>
                  <li>Image galleries</li>
                  <li>Business-specific tools</li>
                </ul>
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
              Ready to See AI in Action?
            </h2>
            <p style={{ fontSize: '1.2rem', marginBottom: '2.5rem', opacity: 0.9 }}>
              Join over 50,000 businesses who've built their websites with AI in under a minute.
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
                transition: 'transform 0.2s'
              }}
              onMouseOver={(e) => e.target.style.transform = 'translateY(-2px)'}
              onMouseOut={(e) => e.target.style.transform = 'translateY(0)'}
              >
                Start Building with AI
              </button>
              
              <Link 
                to="/durable-templates" 
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
                Browse Templates
              </Link>
            </div>
          </div>
        </section>
      </main>
      
      <style jsx>{`
        @keyframes progress {
          0% { transform: translateX(-100%); }
          100% { transform: translateX(100%); }
        }
      `}</style>
    </>
  );
}