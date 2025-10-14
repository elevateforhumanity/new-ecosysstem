import React, { useState } from "react";
import { Link } from "react-router-dom";
import { SEO } from "../lib/seo/SEO";
import DurableNav from "../components/DurableNav";

export default function DurableTemplates() {
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [hoveredTemplate, setHoveredTemplate] = useState(null);
  
  const categories = [
    { id: 'all', name: 'All Templates', count: 150 },
    { id: 'business', name: 'Business', count: 45 },
    { id: 'ecommerce', name: 'E-commerce', count: 32 },
    { id: 'portfolio', name: 'Portfolio', count: 28 },
    { id: 'restaurant', name: 'Restaurant', count: 25 },
    { id: 'health', name: 'Health & Wellness', count: 20 }
  ];

  const templates = [
    { id: 1, name: 'Modern Business', category: 'business', color: '#667eea', preview: '🏢' },
    { id: 2, name: 'Online Store', category: 'ecommerce', color: '#ff6b6b', preview: '🛍️' },
    { id: 3, name: 'Creative Portfolio', category: 'portfolio', color: '#4ecdc4', preview: '🎨' },
    { id: 4, name: 'Restaurant Menu', category: 'restaurant', color: '#45b7d1', preview: '🍽️' },
    { id: 5, name: 'Fitness Studio', category: 'health', color: '#96ceb4', preview: '💪' },
    { id: 6, name: 'Tech Startup', category: 'business', color: '#667eea', preview: '🚀' },
    { id: 7, name: 'Fashion Store', category: 'ecommerce', color: '#ff6b6b', preview: '👗' },
    { id: 8, name: 'Photography', category: 'portfolio', color: '#4ecdc4', preview: '📸' },
    { id: 9, name: 'Coffee Shop', category: 'restaurant', color: '#45b7d1', preview: '☕' }
  ];

  const filteredTemplates = selectedCategory === 'all' 
    ? templates 
    : templates.filter(t => t.category === selectedCategory);

  return (
    <>
      <SEO
        title="Durable Templates - Professional Website Templates"
        description="Choose from 150+ professional website templates. Customize any template with AI or start from scratch."
        canonical={`${import.meta.env.VITE_SITE_URL || ""}/durable-templates`}
      />
      
      <main id="main-content" style={{ minHeight: '100vh' }}>
        <DurableNav />

        {/* Hero Section */}
        <section style={{
          background: 'linear-gradient(135deg, #4ecdc4 0%, #44a08d 100%)',
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
              150+ Professional Templates
            </h1>
            <p style={{ 
              fontSize: 'clamp(1.1rem, 2.5vw, 1.5rem)', 
              marginBottom: '2.5rem',
              opacity: 0.9,
              maxWidth: '600px',
              margin: '0 auto 2.5rem'
            }}>
              Start with a beautiful template and customize it with AI, or let AI build 
              from scratch. Every template is mobile-ready and SEO-optimized.
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
                transition: 'transform 0.2s'
              }}
              onMouseOver={(e) => e.target.style.transform = 'translateY(-2px)'}
              onMouseOut={(e) => e.target.style.transform = 'translateY(0)'}
              >
                Browse All Templates
              </button>
              
              <Link 
                to="/durable-ai" 
                style={{
                  display: 'inline-block',
                  padding: '1rem 2.5rem',
                  fontSize: '1.1rem',
                  backgroundColor: 'transparent',
                  color: 'white',
                  border: '2px solid white',
                  borderRadius: '50px',
                  textDecoration: 'none',
                  fontWeight: 'bold',
                  transition: 'all 0.2s'
                }}
              >
                Try AI Builder
              </Link>
            </div>
          </div>
        </section>

        {/* Category Filter */}
        <section style={{ padding: '2rem', backgroundColor: '#f8fafc', borderBottom: '1px solid #e2e8f0' }}>
          <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
            <div style={{ 
              display: 'flex', 
              gap: '1rem', 
              flexWrap: 'wrap',
              justifyContent: 'center'
            }}>
              {categories.map(category => (
                <button
                  key={category.id}
                  onClick={() => setSelectedCategory(category.id)}
                  style={{
                    padding: '0.75rem 1.5rem',
                    border: selectedCategory === category.id ? '2px solid #667eea' : '2px solid #e2e8f0',
                    borderRadius: '25px',
                    backgroundColor: selectedCategory === category.id ? '#667eea' : 'white',
                    color: selectedCategory === category.id ? 'white' : '#666',
                    cursor: 'pointer',
                    fontWeight: selectedCategory === category.id ? 'bold' : 'normal',
                    transition: 'all 0.3s ease'
                  }}
                >
                  {category.name} ({category.count})
                </button>
              ))}
            </div>
          </div>
        </section>

        {/* Templates Grid */}
        <section style={{ padding: '4rem 2rem', backgroundColor: 'white' }}>
          <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
            <div style={{ 
              display: 'grid', 
              gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', 
              gap: '2rem'
            }}>
              {filteredTemplates.map(template => (
                <div
                  key={template.id}
                  onMouseEnter={() => setHoveredTemplate(template.id)}
                  onMouseLeave={() => setHoveredTemplate(null)}
                  style={{
                    border: '1px solid #e2e8f0',
                    borderRadius: '12px',
                    overflow: 'hidden',
                    transition: 'all 0.3s ease',
                    transform: hoveredTemplate === template.id ? 'translateY(-5px)' : 'translateY(0)',
                    boxShadow: hoveredTemplate === template.id 
                      ? '0 10px 30px rgba(0,0,0,0.15)' 
                      : '0 4px 15px rgba(0,0,0,0.08)',
                    cursor: 'pointer'
                  }}
                >
                  {/* Template Preview */}
                  <div style={{
                    height: '200px',
                    background: `linear-gradient(135deg, ${template.color} 0%, ${template.color}dd 100%)`,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '4rem',
                    position: 'relative'
                  }}>
                    {template.preview}
                    {hoveredTemplate === template.id && (
                      <div style={{
                        position: 'absolute',
                        top: 0,
                        left: 0,
                        right: 0,
                        bottom: 0,
                        backgroundColor: 'rgba(0,0,0,0.7)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: 'white',
                        fontSize: '1rem',
                        fontWeight: 'bold'
                      }}>
                        Preview Template
                      </div>
                    )}
                  </div>
                  
                  {/* Template Info */}
                  <div style={{ padding: '1.5rem' }}>
                    <h3 style={{ 
                      fontSize: '1.25rem', 
                      marginBottom: '0.5rem',
                      color: '#2d3748'
                    }}>
                      {template.name}
                    </h3>
                    <p style={{ 
                      color: '#718096', 
                      marginBottom: '1rem',
                      textTransform: 'capitalize'
                    }}>
                      {template.category}
                    </p>
                    
                    <div style={{ display: 'flex', gap: '0.5rem' }}>
                      <button style={{
                        flex: 1,
                        padding: '0.75rem',
                        backgroundColor: template.color,
                        color: 'white',
                        border: 'none',
                        borderRadius: '6px',
                        cursor: 'pointer',
                        fontWeight: 'bold',
                        fontSize: '0.9rem'
                      }}>
                        Use Template
                      </button>
                      <button style={{
                        padding: '0.75rem',
                        backgroundColor: 'transparent',
                        color: template.color,
                        border: `2px solid ${template.color}`,
                        borderRadius: '6px',
                        cursor: 'pointer',
                        fontSize: '0.9rem'
                      }}>
                        Preview
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Template Features */}
        <section style={{ padding: '4rem 2rem', backgroundColor: '#f8fafc' }}>
          <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
            <h2 style={{ fontSize: '2.5rem', textAlign: 'center', marginBottom: '3rem', color: '#2d3748' }}>
              Every Template Includes
            </h2>
            
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '2rem' }}>
              <div style={{ textAlign: 'center', padding: '2rem' }}>
                <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>📱</div>
                <h3 style={{ fontSize: '1.5rem', marginBottom: '1rem', color: '#2d3748' }}>
                  Mobile Responsive
                </h3>
                <p style={{ color: '#718096' }}>
                  Looks perfect on all devices - desktop, tablet, and mobile.
                </p>
              </div>
              
              <div style={{ textAlign: 'center', padding: '2rem' }}>
                <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>🚀</div>
                <h3 style={{ fontSize: '1.5rem', marginBottom: '1rem', color: '#2d3748' }}>
                  SEO Optimized
                </h3>
                <p style={{ color: '#718096' }}>
                  Built-in SEO best practices to help you rank higher in search.
                </p>
              </div>
              
              <div style={{ textAlign: 'center', padding: '2rem' }}>
                <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>⚡</div>
                <h3 style={{ fontSize: '1.5rem', marginBottom: '1rem', color: '#2d3748' }}>
                  Fast Loading
                </h3>
                <p style={{ color: '#718096' }}>
                  Optimized for speed with lightning-fast page load times.
                </p>
              </div>
              
              <div style={{ textAlign: 'center', padding: '2rem' }}>
                <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>🎨</div>
                <h3 style={{ fontSize: '1.5rem', marginBottom: '1rem', color: '#2d3748' }}>
                  Easy Customization
                </h3>
                <p style={{ color: '#718096' }}>
                  Change colors, fonts, images, and content with simple clicks.
                </p>
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
              Can't Find the Perfect Template?
            </h2>
            <p style={{ fontSize: '1.2rem', marginBottom: '2.5rem', opacity: 0.9 }}>
              Let our AI create a custom website just for you in 30 seconds.
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
                Try AI Builder
              </Link>
              
              <Link 
                to="/durable-features" 
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
                View Features
              </Link>
            </div>
          </div>
        </section>
      </main>
    </>
  );
}