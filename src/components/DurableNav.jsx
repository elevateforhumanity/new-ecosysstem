import React from "react";
import { Link, useLocation } from "react-router-dom";

export default function DurableNav() {
  const location = useLocation();
  
  const navItems = [
    { path: '/durable-ai', label: 'AI Builder' },
    { path: '/durable-templates', label: 'Templates' },
    { path: '/durable-features', label: 'Features' },
    { path: '/durable-pricing', label: 'Pricing' }
  ];

  const isActive = (path) => location.pathname === path;

  return (
    <nav style={{ 
      padding: '1rem 2rem', 
      backgroundColor: 'white', 
      boxShadow: '0 2px 10px rgba(0,0,0,0.1)',
      position: 'sticky',
      top: 0,
      zIndex: 100
    }}>
      <div style={{ 
        maxWidth: '1200px', 
        margin: '0 auto', 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center',
        flexWrap: 'wrap',
        gap: '1rem'
      }}>
        {/* Logo */}
        <Link 
          to="/" 
          style={{ 
            fontSize: '1.5rem', 
            fontWeight: 'bold', 
            color: '#667eea', 
            textDecoration: 'none',
            transition: 'color 0.3s ease'
          }}
          onMouseOver={(e) => e.target.style.color = '#5a67d8'}
          onMouseOut={(e) => e.target.style.color = '#667eea'}
        >
          Durable
        </Link>
        
        {/* Navigation Links */}
        <div style={{ 
          display: 'flex', 
          gap: '2rem', 
          alignItems: 'center',
          flexWrap: 'wrap'
        }}>
          {navItems.map((item) => (
            <Link 
              key={item.path}
              to={item.path} 
              style={{ 
                color: isActive(item.path) ? '#667eea' : '#666', 
                textDecoration: 'none',
                fontWeight: isActive(item.path) ? 'bold' : 'normal',
                borderBottom: isActive(item.path) ? '2px solid #667eea' : '2px solid transparent',
                paddingBottom: '0.25rem',
                transition: 'all 0.3s ease',
                position: 'relative'
              }}
              onMouseOver={(e) => {
                if (!isActive(item.path)) {
                  e.target.style.color = '#667eea';
                  e.target.style.borderBottomColor = '#667eea';
                }
              }}
              onMouseOut={(e) => {
                if (!isActive(item.path)) {
                  e.target.style.color = '#666';
                  e.target.style.borderBottomColor = 'transparent';
                }
              }}
            >
              {item.label}
            </Link>
          ))}
          
          {/* CTA Button */}
          <button 
            style={{ 
              padding: '0.5rem 1.5rem', 
              backgroundColor: '#ff6b6b', 
              color: 'white', 
              border: 'none', 
              borderRadius: '25px',
              cursor: 'pointer',
              fontWeight: 'bold',
              fontSize: '0.9rem',
              transition: 'all 0.3s ease',
              boxShadow: '0 2px 8px rgba(255, 107, 107, 0.3)'
            }}
            onMouseOver={(e) => {
              e.target.style.backgroundColor = '#ff5252';
              e.target.style.transform = 'translateY(-1px)';
              e.target.style.boxShadow = '0 4px 12px rgba(255, 107, 107, 0.4)';
            }}
            onMouseOut={(e) => {
              e.target.style.backgroundColor = '#ff6b6b';
              e.target.style.transform = 'translateY(0)';
              e.target.style.boxShadow = '0 2px 8px rgba(255, 107, 107, 0.3)';
            }}
            onClick={() => {
              // You can customize this action
              alert('Redirecting to signup...');
            }}
          >
            Start Free
          </button>
        </div>
      </div>
      
      {/* Mobile Menu Toggle (for future mobile implementation) */}
      <style jsx>{`
        @media (max-width: 768px) {
          nav > div {
            flex-direction: column;
            gap: 1rem;
          }
          
          nav > div > div {
            flex-wrap: wrap;
            justify-content: center;
            gap: 1rem;
          }
        }
      `}</style>
    </nav>
  );
}