import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { SEO } from "../lib/seo/SEO";

export default function MainLanding() {
  const [currentFeature, setCurrentFeature] = useState(0);
  const [currentDemo, setCurrentDemo] = useState(0);
  const [selectedPlan, setSelectedPlan] = useState('pro');
  const [billingCycle, setBillingCycle] = useState('monthly');
  
  const features = [
    {
      title: "Philanthropy Portal",
      description: "Complete foundation management with grant tracking, donor engagement, and impact measurement",
      icon: "📊",
      color: "var(--brand-success)",
      sector: "Foundations",
      page: "/philanthropy"
    },
    {
      title: "Government Training Platform",
      description: "DOL-approved Elevate Learn2Earn Workforce with WIA compliance, apprenticeships, and job placement tracking",
      icon: "🏛️",
      color: "var(--brand-info)",
      sector: "Government",
      page: "/government"
    },
    {
      title: "LMS Learning Management",
      description: "Enterprise-grade training delivery with certifications, assessments, and progress analytics",
      icon: "🎓",
      color: "var(--brand-secondary)",
      sector: "Education",
      page: "/lms"
    },
    {
      title: "Programs & Training Hub",
      description: "Comprehensive program management with apprenticeships, skills tracking, and career pathways",
      icon: "🚀",
      color: "var(--brand-danger)",
      sector: "Workforce",
      page: "/programs"
    },
    {
      title: "Ecosystem Integration",
      description: "Connect all stakeholders with unified dashboards, reporting, and community impact measurement",
      icon: "🌍",
      color: "var(--brand-warning)",
      sector: "Community",
      page: "/ecosystem"
    },
    {
      title: "Analytics & Compliance",
      description: "Real-time reporting, compliance tracking, and performance analytics for all programs",
      icon: "📈",
      color: "#06b6d4",
      sector: "Operations",
      page: "/analytics"
    }
  ];

  const demos = [
    { title: "FREE Apprenticeship Programs", time: "Enrolling Now", industry: "Skilled Trades", icon: "🔧", impact: "95% Job Placement", page: "/programs" },
    { title: "Digital Skills Bootcamp", time: "Starting Soon", industry: "Technology", icon: "💻", impact: "$65K Avg Salary", page: "/lms" },
    { title: "Healthcare Training Academy", time: "Open Enrollment", industry: "Medical", icon: "🏥", impact: "100% Certification", page: "/programs" },
    { title: "Green Energy Workforce", time: "New Program", industry: "Renewable Energy", icon: "⚡", impact: "Future-Ready Jobs", page: "/ecosystem" }
  ];

  const plans = {
    foundation: {
      name: 'Foundation',
      monthly: 499,
      yearly: 4990,
      description: 'Grant management & compliance',
      features: ['Grant Application Portal', 'Compliance Tracking', 'Impact Measurement', 'Donor Dashboard', 'Audit Trail', 'SOC 2 Compliance'],
      cta: 'Request Demo',
      popular: false,
      sector: '📊 Granters',
      badge: 'Most Trusted'
    },
    workforce: {
      name: 'Workforce Pro',
      monthly: 399,
      yearly: 3990,
      description: 'Skills development & placement',
      features: ['Training Management', 'Skills Assessment', 'Employer Portal', 'Job Placement Tracking', 'Outcome Analytics', 'State Reporting'],
      cta: 'Start Trial',
      popular: true,
      sector: '🎓 Workforce',
      badge: 'Most Popular'
    },
    healthcare: {
      name: 'Healthcare Enterprise',
      monthly: 799,
      yearly: 7990,
      description: 'HIPAA-compliant patient engagement',
      features: ['Patient Portal', 'Appointment Scheduling', 'Medical Forms', 'HIPAA Compliance', 'EHR Integration', 'Telehealth Ready'],
      cta: 'Schedule Demo',
      popular: false,
      sector: '🏥 Healthcare',
      badge: 'Enterprise Grade'
    },
    enterprise: {
      name: 'Enterprise',
      monthly: 'Custom',
      yearly: 'Custom',
      description: 'Multi-sector platform solution',
      features: ['All Platform Features', 'Custom Integrations', 'Dedicated Support', 'SLA Guarantee', 'White Label', 'Multi-Tenant'],
      cta: 'Contact Sales',
      popular: false,
      sector: '🌟 All Sectors',
      badge: '$3B Platform'
    }
  };

  useEffect(() => {
    const featureInterval = setInterval(() => {
      setCurrentFeature((prev) => (prev + 1) % features.length);
    }, 4000);

    const demoInterval = setInterval(() => {
      setCurrentDemo((prev) => (prev + 1) % demos.length);
    }, 3000);

    return () => {
      clearInterval(featureInterval);
      clearInterval(demoInterval);
    };
  }, [features.length, demos.length]);

  return (
    <>
      <SEO
        title="Durable - AI-Powered Website Builder | Create Websites in 30 Seconds"
        description="Build professional websites instantly with Durable's AI. Choose from 150+ templates, get advanced features, and transparent pricing. No coding required."
        canonical={`${import.meta.env.VITE_SITE_URL || ""}/main-landing`}
      />
      
      <main id="main-content" style={{ minHeight: '100vh' }}>
        {/* Hero Section */}
        <section style={{
          background: 'linear-gradient(135deg, #ff6b6b 0%, #ee5a24 100%)',
          color: 'white',
          padding: '4rem 2rem',
          textAlign: 'center',
          minHeight: '100vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center'
        }}>
          <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
            {/* Enterprise Valuation Badge */}
            <div style={{
              backgroundColor: 'rgba(255,255,255,0.1)',
              border: '2px solid rgba(255,255,255,0.3)',
              borderRadius: '50px',
              padding: '0.5rem 2rem',
              marginBottom: '2rem',
              display: 'inline-block',
              animation: 'fadeInUp 1s ease-out'
            }}>
              <span style={{ fontSize: '0.9rem', opacity: 0.8 }}>🏆 Enterprise Platform • </span>
              <span style={{ fontSize: '1rem', fontWeight: 'bold' }}>$3B+ Market Valuation</span>
            </div>

            <h1 style={{ 
              fontSize: 'clamp(3rem, 6vw, 5rem)', 
              marginBottom: '1.5rem',
              fontWeight: 'bold',
              lineHeight: '1.1',
              animation: 'fadeInUp 1s ease-out 0.1s both'
            }}>
              America's Leading Education & Training Platform
            </h1>
            <p style={{ 
              fontSize: 'clamp(1.2rem, 3vw, 1.8rem)', 
              marginBottom: '1.5rem',
              opacity: 0.9,
              maxWidth: '950px',
              margin: '0 auto 1.5rem',
              animation: 'fadeInUp 1s ease-out 0.2s both'
            }}>
              Powering FREE job training programs, apprenticeships, and educational initiatives 
              that transform lives and build careers. DOL-approved, state-funded, community-focused.
            </p>

            {/* Education Impact Metrics */}
            <div style={{
              display: 'flex',
              justifyContent: 'center',
              gap: '3rem',
              marginBottom: '2rem',
              flexWrap: 'wrap',
              animation: 'fadeInUp 1s ease-out 0.25s both'
            }}>
              <div style={{ textAlign: 'center' }}>
                <div style={{ fontSize: '2.5rem', fontWeight: 'bold', color: '#ffd700' }}>15K+</div>
                <div style={{ fontSize: '0.9rem', opacity: 0.8 }}>Program Graduates</div>
              </div>
              <div style={{ textAlign: 'center' }}>
                <div style={{ fontSize: '2.5rem', fontWeight: 'bold', color: '#ffd700' }}>89%</div>
                <div style={{ fontSize: '0.9rem', opacity: 0.8 }}>Job Placement Rate</div>
              </div>
              <div style={{ textAlign: 'center' }}>
                <div style={{ fontSize: '2.5rem', fontWeight: 'bold', color: '#ffd700' }}>FREE</div>
                <div style={{ fontSize: '0.9rem', opacity: 0.8 }}>Training Programs</div>
              </div>
              <div style={{ textAlign: 'center' }}>
                <div style={{ fontSize: '2.5rem', fontWeight: 'bold', color: '#ffd700' }}>500+</div>
                <div style={{ fontSize: '0.9rem', opacity: 0.8 }}>Education Partners</div>
              </div>
            </div>
            
            {/* Government Agency Recognition */}
            <div style={{ 
              display: 'flex', 
              flexWrap: 'wrap', 
              justifyContent: 'center', 
              gap: '0.8rem',
              marginBottom: '2rem',
              animation: 'fadeInUp 1s ease-out 0.3s both'
            }}>
              <span style={{
                backgroundColor: 'rgba(59, 130, 246, 0.95)',
                color: 'white',
                padding: '0.8rem 1.5rem',
                borderRadius: '35px',
                fontSize: '1rem',
                fontWeight: '800',
                border: '3px solid rgba(255,255,255,0.3)',
                backdropFilter: 'blur(15px)',
                textShadow: '0 1px 2px rgba(0,0,0,0.3)'
              }}>
                🏛️ DOL Approved
              </span>
              <span style={{
                backgroundColor: 'rgba(16, 185, 129, 0.95)',
                color: 'white',
                padding: '0.8rem 1.5rem',
                borderRadius: '35px',
                fontSize: '1rem',
                fontWeight: '800',
                border: '3px solid rgba(255,255,255,0.3)',
                backdropFilter: 'blur(15px)',
                textShadow: '0 1px 2px rgba(0,0,0,0.3)'
              }}>
                📋 WIA Certified
              </span>
              <span style={{
                backgroundColor: 'rgba(139, 92, 246, 0.95)',
                color: 'white',
                padding: '0.8rem 1.5rem',
                borderRadius: '35px',
                fontSize: '1rem',
                fontWeight: '800',
                border: '3px solid rgba(255,255,255,0.3)',
                backdropFilter: 'blur(15px)',
                textShadow: '0 1px 2px rgba(0,0,0,0.3)'
              }}>
                🎯 DWD Partner
              </span>
              <span style={{
                backgroundColor: 'rgba(245, 158, 11, 0.95)',
                color: 'white',
                padding: '0.8rem 1.5rem',
                borderRadius: '35px',
                fontSize: '1rem',
                fontWeight: '800',
                border: '3px solid rgba(255,255,255,0.3)',
                backdropFilter: 'blur(15px)',
                textShadow: '0 1px 2px rgba(0,0,0,0.3)'
              }}>
                📚 DOE Aligned
              </span>
            </div>

            {/* Secondary Government Badges */}
            <div style={{ 
              display: 'flex', 
              flexWrap: 'wrap', 
              justifyContent: 'center', 
              gap: '0.8rem',
              marginBottom: '3rem',
              animation: 'fadeInUp 1s ease-out 0.35s both'
            }}>
              <span style={{
                backgroundColor: 'rgba(239, 68, 68, 0.95)',
                color: 'white',
                padding: '0.6rem 1.2rem',
                borderRadius: '30px',
                fontSize: '0.9rem',
                fontWeight: '700',
                border: '2px solid rgba(255,255,255,0.3)',
                backdropFilter: 'blur(10px)'
              }}>
                🔗 WRG Integrated
              </span>
              <span style={{
                backgroundColor: 'rgba(99, 102, 241, 0.95)',
                color: 'white',
                padding: '0.6rem 1.2rem',
                borderRadius: '30px',
                fontSize: '0.9rem',
                fontWeight: '700',
                border: '2px solid rgba(255,255,255,0.3)',
                backdropFilter: 'blur(10px)'
              }}>
                ⚖️ JRI Compliant
              </span>
              <span style={{
                backgroundColor: 'rgba(34, 197, 94, 0.95)',
                color: 'white',
                padding: '0.6rem 1.2rem',
                borderRadius: '30px',
                fontSize: '0.9rem',
                fontWeight: '700',
                border: '2px solid rgba(255,255,255,0.3)',
                backdropFilter: 'blur(10px)'
              }}>
                💼 WEX Connected
              </span>
              <span style={{
                backgroundColor: 'rgba(168, 85, 247, 0.95)',
                color: 'white',
                padding: '0.6rem 1.2rem',
                borderRadius: '30px',
                fontSize: '0.9rem',
                fontWeight: '700',
                border: '2px solid rgba(255,255,255,0.3)',
                backdropFilter: 'blur(10px)'
              }}>
                🎯 OTG Verified
              </span>
            </div>
            
            {/* State & Federal Program Highlights */}
            <div style={{ 
              backgroundColor: 'rgba(255,255,255,0.15)', 
              padding: '3rem', 
              borderRadius: '25px',
              marginBottom: '3rem',
              backdropFilter: 'blur(15px)',
              border: '3px solid rgba(255,215,0,0.4)',
              animation: 'fadeInUp 1s ease-out 0.4s both'
            }}>
              <h3 style={{ marginBottom: '2rem', fontSize: '2rem', fontWeight: 'bold', textAlign: 'center' }}>
                🏆 STATE & FEDERAL PROGRAM HIGHLIGHTS
              </h3>
              
              {/* Featured Program Showcase */}
              <div style={{ 
                fontSize: '2.5rem', 
                fontWeight: 'bold',
                color: '#ffd700',
                marginBottom: '1rem',
                textAlign: 'center'
              }}>
                {demos[currentDemo].icon} {demos[currentDemo].title}
              </div>
              <div style={{ opacity: 0.9, fontSize: '1.4rem', marginBottom: '1.5rem', textAlign: 'center' }}>
                {demos[currentDemo].industry} • {demos[currentDemo].time}
              </div>
              
              {/* Program Benefits Grid */}
              <div style={{ 
                display: 'grid', 
                gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', 
                gap: '1.5rem',
                marginBottom: '2rem'
              }}>
                <div style={{ 
                  backgroundColor: 'rgba(16, 185, 129, 0.2)',
                  padding: '1.5rem',
                  borderRadius: '15px',
                  textAlign: 'center',
                  border: '2px solid rgba(16, 185, 129, 0.4)'
                }}>
                  <div style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>💰</div>
                  <div style={{ fontWeight: 'bold', fontSize: '1.1rem', marginBottom: '0.5rem' }}>EARN TO LEARN</div>
                  <div style={{ fontSize: '0.9rem', opacity: 0.9 }}>Get paid while you train - up to $20/hour during apprenticeships</div>
                </div>
                
                <div style={{ 
                  backgroundColor: 'rgba(139, 92, 246, 0.2)',
                  padding: '1.5rem',
                  borderRadius: '15px',
                  textAlign: 'center',
                  border: '2px solid rgba(139, 92, 246, 0.4)'
                }}>
                  <div style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>👨‍🏫</div>
                  <div style={{ fontWeight: 'bold', fontSize: '1.1rem', marginBottom: '0.5rem' }}>TRAIN THE TRAINER</div>
                  <div style={{ fontSize: '0.9rem', opacity: 0.9 }}>Become a certified instructor - multiply your impact in the community</div>
                </div>
                
                <div style={{ 
                  backgroundColor: 'rgba(59, 130, 246, 0.2)',
                  padding: '1.5rem',
                  borderRadius: '15px',
                  textAlign: 'center',
                  border: '2px solid rgba(59, 130, 246, 0.4)'
                }}>
                  <div style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>🎯</div>
                  <div style={{ fontWeight: 'bold', fontSize: '1.1rem', marginBottom: '0.5rem' }}>FEDERAL FUNDING</div>
                  <div style={{ fontSize: '0.9rem', opacity: 0.9 }}>100% federally funded - no cost to participants or employers</div>
                </div>
              </div>
              
              <div style={{ 
                fontSize: '1.2rem', 
                color: '#4ade80', 
                fontWeight: '700',
                backgroundColor: 'rgba(74, 222, 128, 0.2)',
                padding: '1rem 2rem',
                borderRadius: '20px',
                display: 'inline-block',
                textAlign: 'center',
                width: '100%',
                border: '2px solid rgba(74, 222, 128, 0.4)'
              }}>
                ✅ {demos[currentDemo].impact} • DOL Approved • State Certified
              </div>
              <div style={{ 
                width: '100%', 
                height: '6px', 
                backgroundColor: 'rgba(255,255,255,0.3)', 
                borderRadius: '3px',
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
            
            <div style={{ 
              display: 'flex', 
              gap: '1.5rem', 
              justifyContent: 'center', 
              flexWrap: 'wrap',
              animation: 'fadeInUp 1s ease-out 0.6s both'
            }}>
              {/* Primary CTA - Enroll Now */}
              <button style={{
                padding: '2rem 5rem',
                fontSize: '1.6rem',
                background: 'linear-gradient(135deg, var(--brand-success) 0%, var(--brand-success) 100%)',
                color: 'white',
                border: '4px solid rgba(255,255,255,0.4)',
                borderRadius: '60px',
                cursor: 'pointer',
                fontWeight: 'bold',
                transition: 'all 0.3s ease',
                boxShadow: '0 10px 40px rgba(16, 185, 129, 0.5)',
                backdropFilter: 'blur(15px)',
                position: 'relative',
                overflow: 'hidden'
              }}
              onMouseOver={(e) => {
                e.target.style.transform = 'translateY(-6px) scale(1.05)';
                e.target.style.boxShadow = '0 15px 50px rgba(16, 185, 129, 0.7)';
                e.target.style.background = 'linear-gradient(135deg, var(--brand-success) 0%, #047857 100%)';
              }}
              onMouseOut={(e) => {
                e.target.style.transform = 'translateY(0) scale(1)';
                e.target.style.boxShadow = '0 10px 40px rgba(16, 185, 129, 0.5)';
                e.target.style.background = 'linear-gradient(135deg, var(--brand-success) 0%, var(--brand-success) 100%)';
              }}
              >
                🎓 ENROLL NOW - FREE TRAINING
              </button>
              
              {/* Secondary CTA - Pay/Upgrade */}
              <button style={{
                padding: '2rem 5rem',
                fontSize: '1.6rem',
                background: 'linear-gradient(135deg, #ff6b6b 0%, #ee5a24 100%)',
                color: 'white',
                border: '4px solid rgba(255,255,255,0.4)',
                borderRadius: '60px',
                cursor: 'pointer',
                fontWeight: 'bold',
                transition: 'all 0.3s ease',
                boxShadow: '0 10px 40px rgba(255, 107, 107, 0.5)',
                backdropFilter: 'blur(15px)'
              }}
              onMouseOver={(e) => {
                e.target.style.transform = 'translateY(-6px) scale(1.05)';
                e.target.style.boxShadow = '0 15px 50px rgba(255, 107, 107, 0.7)';
                e.target.style.background = 'linear-gradient(135deg, #ee5a24 0%, var(--brand-danger) 100%)';
              }}
              onMouseOut={(e) => {
                e.target.style.transform = 'translateY(0) scale(1)';
                e.target.style.boxShadow = '0 10px 40px rgba(255, 107, 107, 0.5)';
                e.target.style.background = 'linear-gradient(135deg, #ff6b6b 0%, #ee5a24 100%)';
              }}
              >
                💳 UPGRADE TO ENTERPRISE
              </button>
              
              {/* Tertiary CTA - Demo */}
              <Link 
                to="/government"
                style={{
                  display: 'inline-block',
                  padding: '2rem 5rem',
                  fontSize: '1.6rem',
                  background: 'linear-gradient(135deg, var(--brand-info) 0%, var(--brand-info) 100%)',
                  color: 'white',
                  border: '4px solid rgba(255,255,255,0.4)',
                  borderRadius: '60px',
                  textDecoration: 'none',
                  fontWeight: 'bold',
                  transition: 'all 0.3s ease',
                  backdropFilter: 'blur(15px)',
                  boxShadow: '0 10px 40px rgba(59, 130, 246, 0.5)'
                }}
                onMouseOver={(e) => {
                  e.target.style.transform = 'translateY(-6px) scale(1.05)';
                  e.target.style.boxShadow = '0 15px 50px rgba(59, 130, 246, 0.7)';
                  e.target.style.background = 'linear-gradient(135deg, var(--brand-info) 0%, var(--brand-info-hover) 100%)';
                }}
                onMouseOut={(e) => {
                  e.target.style.transform = 'translateY(0) scale(1)';
                  e.target.style.boxShadow = '0 10px 40px rgba(59, 130, 246, 0.5)';
                  e.target.style.background = 'linear-gradient(135deg, var(--brand-info) 0%, var(--brand-info) 100%)';
                }}
              >
                🏛️ GOVERNMENT DEMO
              </Link>
            </div>

            {/* Urgency Strip */}
            <div style={{
              marginTop: '3rem',
              padding: '1.5rem',
              backgroundColor: 'rgba(255, 215, 0, 0.2)',
              border: '2px solid rgba(255, 215, 0, 0.5)',
              borderRadius: '20px',
              textAlign: 'center',
              animation: 'pulse 2s infinite'
            }}>
              <div style={{ fontSize: '1.2rem', fontWeight: 'bold', color: '#ffd700', marginBottom: '0.5rem' }}>
                ⚡ LIMITED TIME: Only 50 Enterprise Spots Available This Quarter
              </div>
              <div style={{ fontSize: '1rem', opacity: 0.9 }}>
                Join 500+ organizations already transforming lives • Apply before spots fill up
              </div>
            </div>
          </div>
        </section>

        {/* Dynamic Features Showcase */}
        <section style={{ padding: '5rem 2rem', backgroundColor: 'var(--brand-surface)' }}>
          <div style={{ maxWidth: '1400px', margin: '0 auto' }}>
            <h2 style={{ 
              fontSize: '3rem', 
              textAlign: 'center', 
              marginBottom: '4rem',
              color: '#2d3748'
            }}>
              Everything You Need to Succeed Online
            </h2>
            
            <div style={{ 
              display: 'grid', 
              gridTemplateColumns: 'repeat(auto-fit, minmax(350px, 1fr))', 
              gap: '2rem'
            }}>
              {features.map((feature, index) => (
                <div 
                  key={index}
                  style={{
                    padding: '3rem',
                    backgroundColor: 'white',
                    borderRadius: '20px',
                    boxShadow: currentFeature === index 
                      ? `0 15px 40px ${feature.color}30` 
                      : '0 8px 25px rgba(0,0,0,0.1)',
                    transform: currentFeature === index ? 'translateY(-10px) scale(1.02)' : 'translateY(0) scale(1)',
                    transition: 'all 0.4s ease',
                    border: currentFeature === index ? `3px solid ${feature.color}` : '3px solid transparent',
                    textAlign: 'center',
                    cursor: 'pointer'
                  }}
                  onClick={() => setCurrentFeature(index)}
                >
                  <div style={{ 
                    fontSize: '4rem', 
                    marginBottom: '1.5rem',
                    filter: currentFeature === index ? 'none' : 'grayscale(0.3)'
                  }}>
                    {feature.icon}
                  </div>
                  <h3 style={{ 
                    fontSize: '1.8rem', 
                    marginBottom: '1rem',
                    color: currentFeature === index ? feature.color : '#2d3748'
                  }}>
                    {feature.title}
                  </h3>
                  <p style={{ 
                    color: '#718096', 
                    lineHeight: '1.7',
                    fontSize: '1.1rem'
                  }}>
                    {feature.description}
                  </p>
                  
                  {currentFeature === index && (
                    <div style={{ marginTop: '1.5rem', display: 'flex', gap: '1rem', flexWrap: 'wrap', justifyContent: 'center' }}>
                      <Link 
                        to={feature.page || `/durable-${feature.title.toLowerCase().split(' ')[0]}`}
                        style={{
                          display: 'inline-block',
                          padding: '1rem 2.5rem',
                          background: `linear-gradient(135deg, ${feature.color} 0%, ${feature.color}dd 100%)`,
                          color: 'white',
                          textDecoration: 'none',
                          borderRadius: '30px',
                          fontWeight: 'bold',
                          fontSize: '1.1rem',
                          transition: 'all 0.3s ease',
                          boxShadow: `0 5px 20px ${feature.color}40`,
                          border: '2px solid rgba(255,255,255,0.2)'
                        }}
                        onMouseOver={(e) => {
                          e.target.style.transform = 'translateY(-3px) scale(1.05)';
                          e.target.style.boxShadow = `0 8px 30px ${feature.color}60`;
                        }}
                        onMouseOut={(e) => {
                          e.target.style.transform = 'translateY(0) scale(1)';
                          e.target.style.boxShadow = `0 5px 20px ${feature.color}40`;
                        }}
                      >
                        🚀 EXPLORE {feature.sector.toUpperCase()}
                      </Link>
                      
                      <button style={{
                        padding: '1rem 2.5rem',
                        background: 'linear-gradient(135deg, #ffd700 0%, var(--brand-warning) 100%)',
                        color: '#1a202c',
                        border: '2px solid rgba(255,255,255,0.3)',
                        borderRadius: '30px',
                        fontWeight: 'bold',
                        fontSize: '1.1rem',
                        cursor: 'pointer',
                        transition: 'all 0.3s ease',
                        boxShadow: '0 5px 20px rgba(255, 215, 0, 0.4)'
                      }}
                      onMouseOver={(e) => {
                        e.target.style.transform = 'translateY(-3px) scale(1.05)';
                        e.target.style.boxShadow = '0 8px 30px rgba(255, 215, 0, 0.6)';
                      }}
                      onMouseOut={(e) => {
                        e.target.style.transform = 'translateY(0) scale(1)';
                        e.target.style.boxShadow = '0 5px 20px rgba(255, 215, 0, 0.4)';
                      }}
                      >
                        💳 START TRIAL
                      </button>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Stats Section */}
        <section style={{ 
          padding: '4rem 2rem', 
          background: 'linear-gradient(135deg, #2d3748 0%, #1a202c 100%)',
          color: 'white'
        }}>
          <div style={{ maxWidth: '1200px', margin: '0 auto', textAlign: 'center' }}>
            <h2 style={{ fontSize: '2.5rem', marginBottom: '3rem' }}>
              Trusted by Thousands Worldwide
            </h2>
            
            <div style={{ 
              display: 'grid', 
              gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', 
              gap: '3rem'
            }}>
              <div style={{ animation: 'countUp 2s ease-out' }}>
                <div style={{ fontSize: '4rem', fontWeight: 'bold', color: '#ff6b6b', marginBottom: '0.5rem' }}>
                  50K+
                </div>
                <div style={{ fontSize: '1.2rem', opacity: 0.8 }}>
                  Websites Created
                </div>
              </div>
              
              <div style={{ animation: 'countUp 2s ease-out 0.2s both' }}>
                <div style={{ fontSize: '4rem', fontWeight: 'bold', color: '#4ecdc4', marginBottom: '0.5rem' }}>
                  99.9%
                </div>
                <div style={{ fontSize: '1.2rem', opacity: 0.8 }}>
                  Uptime Guarantee
                </div>
              </div>
              
              <div style={{ animation: 'countUp 2s ease-out 0.4s both' }}>
                <div style={{ fontSize: '4rem', fontWeight: 'bold', color: '#45b7d1', marginBottom: '0.5rem' }}>
                  30s
                </div>
                <div style={{ fontSize: '1.2rem', opacity: 0.8 }}>
                  Average Build Time
                </div>
              </div>
              
              <div style={{ animation: 'countUp 2s ease-out 0.6s both' }}>
                <div style={{ fontSize: '4rem', fontWeight: 'bold', color: '#96ceb4', marginBottom: '0.5rem' }}>
                  24/7
                </div>
                <div style={{ fontSize: '1.2rem', opacity: 0.8 }}>
                  Support Available
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* PHENOMENAL PLATFORM SHOWCASE - ALL LANDING PAGES */}
        <section style={{ 
          padding: '6rem 2rem', 
          background: 'linear-gradient(135deg, #1a202c 0%, #2d3748 50%, #4a5568 100%)',
          color: 'white',
          position: 'relative'
        }}>
          <div style={{ maxWidth: '1400px', margin: '0 auto' }}>
            <h2 style={{ 
              fontSize: '3.5rem', 
              textAlign: 'center', 
              marginBottom: '1rem',
              color: 'white',
              fontWeight: 'bold'
            }}>
              🌟 THE COMPLETE PLATFORM ECOSYSTEM
            </h2>
            <p style={{ 
              fontSize: '1.4rem', 
              textAlign: 'center', 
              marginBottom: '4rem',
              color: '#e2e8f0',
              maxWidth: '900px',
              margin: '0 auto 4rem'
            }}>
              Every landing page, every solution, every pathway to success - all integrated into one phenomenal platform
            </p>
            
            {/* Primary Platform Solutions */}
            <div style={{ 
              display: 'grid', 
              gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))', 
              gap: '2rem',
              marginBottom: '4rem'
            }}>
              {/* Philanthropy Portal */}
              <div style={{
                background: 'linear-gradient(135deg, var(--brand-success) 0%, var(--brand-success) 100%)',
                padding: '2.5rem',
                borderRadius: '20px',
                boxShadow: '0 15px 40px rgba(16, 185, 129, 0.3)',
                border: '2px solid rgba(255,255,255,0.2)',
                transform: 'translateY(0)',
                transition: 'all 0.3s ease'
              }}>
                <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>📊</div>
                <h3 style={{ fontSize: '1.8rem', marginBottom: '1rem', fontWeight: 'bold' }}>Philanthropy Portal</h3>
                <p style={{ fontSize: '1.1rem', marginBottom: '1.5rem', opacity: 0.9 }}>
                  Foundation management, grant tracking, donor engagement, impact measurement
                </p>
                <div style={{ 
                  backgroundColor: 'rgba(255,255,255,0.2)',
                  padding: '0.5rem 1rem',
                  borderRadius: '15px',
                  fontSize: '0.9rem',
                  fontWeight: 'bold'
                }}>
                  /philanthropy • $2.4B+ Managed
                </div>
              </div>

              {/* Government Training */}
              <div style={{
                background: 'linear-gradient(135deg, var(--brand-info) 0%, var(--brand-info) 100%)',
                padding: '2.5rem',
                borderRadius: '20px',
                boxShadow: '0 15px 40px rgba(59, 130, 246, 0.3)',
                border: '2px solid rgba(255,255,255,0.2)',
                transform: 'translateY(0)',
                transition: 'all 0.3s ease'
              }}>
                <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>🏛️</div>
                <h3 style={{ fontSize: '1.8rem', marginBottom: '1rem', fontWeight: 'bold' }}>Government Training</h3>
                <p style={{ fontSize: '1.1rem', marginBottom: '1.5rem', opacity: 0.9 }}>
                  DOL-approved Elevate Learn2Earn Workforce, WIA compliance, apprenticeships
                </p>
                <div style={{ 
                  backgroundColor: 'rgba(255,255,255,0.2)',
                  padding: '0.5rem 1rem',
                  borderRadius: '15px',
                  fontSize: '0.9rem',
                  fontWeight: 'bold'
                }}>
                  /government • 89% Job Placement
                </div>
              </div>

              {/* LMS Platform */}
              <div style={{
                background: 'linear-gradient(135deg, var(--brand-secondary) 0%, var(--brand-secondary) 100%)',
                padding: '2.5rem',
                borderRadius: '20px',
                boxShadow: '0 15px 40px rgba(139, 92, 246, 0.3)',
                border: '2px solid rgba(255,255,255,0.2)',
                transform: 'translateY(0)',
                transition: 'all 0.3s ease'
              }}>
                <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>🎓</div>
                <h3 style={{ fontSize: '1.8rem', marginBottom: '1rem', fontWeight: 'bold' }}>LMS Learning Platform</h3>
                <p style={{ fontSize: '1.1rem', marginBottom: '1.5rem', opacity: 0.9 }}>
                  Enterprise training delivery, certifications, assessments, analytics
                </p>
                <div style={{ 
                  backgroundColor: 'rgba(255,255,255,0.2)',
                  padding: '0.5rem 1rem',
                  borderRadius: '15px',
                  fontSize: '0.9rem',
                  fontWeight: 'bold'
                }}>
                  /lms • 15K+ Graduates
                </div>
              </div>

              {/* Programs Hub */}
              <div style={{
                background: 'linear-gradient(135deg, var(--brand-danger) 0%, var(--brand-danger) 100%)',
                padding: '2.5rem',
                borderRadius: '20px',
                boxShadow: '0 15px 40px rgba(239, 68, 68, 0.3)',
                border: '2px solid rgba(255,255,255,0.2)',
                transform: 'translateY(0)',
                transition: 'all 0.3s ease'
              }}>
                <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>🚀</div>
                <h3 style={{ fontSize: '1.8rem', marginBottom: '1rem', fontWeight: 'bold' }}>Programs & Training</h3>
                <p style={{ fontSize: '1.1rem', marginBottom: '1.5rem', opacity: 0.9 }}>
                  Comprehensive program management, apprenticeships, career pathways
                </p>
                <div style={{ 
                  backgroundColor: 'rgba(255,255,255,0.2)',
                  padding: '0.5rem 1rem',
                  borderRadius: '15px',
                  fontSize: '0.9rem',
                  fontWeight: 'bold'
                }}>
                  /programs • FREE Training
                </div>
              </div>
            </div>

            {/* Secondary Platform Features */}
            <div style={{ 
              display: 'grid', 
              gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', 
              gap: '1.5rem',
              marginBottom: '3rem'
            }}>
              {[
                { name: 'Ecosystem Dashboard', icon: '🌍', path: '/ecosystem', desc: 'Community impact measurement' },
                { name: 'Analytics & Compliance', icon: '📈', path: '/analytics', desc: 'Real-time reporting & tracking' },
                { name: 'Student Portal', icon: '👨‍🎓', path: '/student', desc: 'Learner dashboard & progress' },
                { name: 'Instructor Hub', icon: '👨‍🏫', path: '/instructor', desc: 'Teaching tools & resources' },
                { name: 'Community Connect', icon: '🤝', path: '/community', desc: 'Stakeholder collaboration' },
                { name: 'Mobile Learning', icon: '📱', path: '/mobile-app', desc: 'Learn anywhere, anytime' },
                { name: 'E-commerce Integration', icon: '🛒', path: '/ecommerce', desc: 'Monetize your programs' },
                { name: 'Funding & Impact', icon: '💰', path: '/funding-impact', desc: 'Grant management & ROI' }
              ].map((feature, index) => (
                <div key={index} style={{
                  backgroundColor: 'rgba(255,255,255,0.1)',
                  padding: '1.5rem',
                  borderRadius: '15px',
                  border: '1px solid rgba(255,255,255,0.2)',
                  backdropFilter: 'blur(10px)',
                  textAlign: 'center',
                  transition: 'all 0.3s ease'
                }}>
                  <div style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>{feature.icon}</div>
                  <h4 style={{ fontSize: '1.2rem', marginBottom: '0.5rem', fontWeight: 'bold' }}>{feature.name}</h4>
                  <p style={{ fontSize: '0.9rem', opacity: 0.8, marginBottom: '0.5rem' }}>{feature.desc}</p>
                  <div style={{ 
                    fontSize: '0.8rem', 
                    color: '#ffd700',
                    fontWeight: 'bold'
                  }}>
                    {feature.path}
                  </div>
                </div>
              ))}
            </div>

            {/* Platform Integration Message */}
            <div style={{
              backgroundColor: 'rgba(255, 215, 0, 0.1)',
              border: '3px solid rgba(255, 215, 0, 0.3)',
              borderRadius: '20px',
              padding: '2rem',
              textAlign: 'center'
            }}>
              <h3 style={{ fontSize: '2rem', marginBottom: '1rem', color: '#ffd700' }}>
                🏆 ONE PLATFORM. INFINITE POSSIBILITIES.
              </h3>
              <p style={{ fontSize: '1.2rem', opacity: 0.9 }}>
                Every landing page seamlessly integrated. Every solution working together. 
                Every pathway leading to success. This is what $3 billion in platform development delivers.
              </p>
            </div>
          </div>
        </section>

        {/* Enterprise Testimonials Section */}
        <section style={{ 
          padding: '5rem 2rem', 
          background: 'linear-gradient(135deg, var(--brand-surface) 0%, #e2e8f0 100%)',
          position: 'relative'
        }}>
          <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
            <h2 style={{ 
              fontSize: '3rem', 
              textAlign: 'center', 
              marginBottom: '1rem',
              color: '#2d3748',
              fontWeight: 'bold'
            }}>
              Trusted by Industry Leaders
            </h2>
            <p style={{ 
              fontSize: '1.3rem', 
              textAlign: 'center', 
              marginBottom: '4rem',
              color: '#718096',
              maxWidth: '700px',
              margin: '0 auto 4rem'
            }}>
              See how Fortune 500 organizations achieve measurable impact with our enterprise platform
            </p>
            
            <div style={{ 
              display: 'grid', 
              gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))', 
              gap: '3rem'
            }}>
              {/* Healthcare Testimonial */}
              <div style={{
                backgroundColor: 'white',
                padding: '3rem',
                borderRadius: '20px',
                boxShadow: '0 10px 30px rgba(0,0,0,0.1)',
                border: '2px solid var(--brand-info)',
                position: 'relative'
              }}>
                <div style={{ 
                  position: 'absolute',
                  top: '-15px',
                  left: '30px',
                  backgroundColor: 'var(--brand-info)',
                  color: 'white',
                  padding: '0.5rem 1.5rem',
                  borderRadius: '20px',
                  fontSize: '0.9rem',
                  fontWeight: 'bold'
                }}>
                  🏥 Healthcare System
                </div>
                <div style={{ fontSize: '1.2rem', lineHeight: '1.7', marginBottom: '2rem', color: '#4a5568' }}>
                  "Reduced patient onboarding time by 75% while maintaining full HIPAA compliance. 
                  The platform handles 50,000+ patient interactions monthly with zero security incidents."
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                  <div style={{ 
                    width: '60px', 
                    height: '60px', 
                    borderRadius: '50%', 
                    backgroundColor: 'var(--brand-info)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: 'white',
                    fontSize: '1.5rem',
                    fontWeight: 'bold'
                  }}>
                    DR
                  </div>
                  <div>
                    <div style={{ fontWeight: 'bold', color: '#2d3748' }}>Dr. Sarah Chen</div>
                    <div style={{ color: '#718096' }}>CTO, Regional Medical Center</div>
                    <div style={{ color: 'var(--brand-info)', fontSize: '0.9rem', fontWeight: '600' }}>$2.8B Healthcare Network</div>
                  </div>
                </div>
              </div>

              {/* Elevate Learn2Earn Workforce Testimonial */}
              <div style={{
                backgroundColor: 'white',
                padding: '3rem',
                borderRadius: '20px',
                boxShadow: '0 10px 30px rgba(0,0,0,0.1)',
                border: '2px solid var(--brand-secondary)',
                position: 'relative'
              }}>
                <div style={{ 
                  position: 'absolute',
                  top: '-15px',
                  left: '30px',
                  backgroundColor: 'var(--brand-secondary)',
                  color: 'white',
                  padding: '0.5rem 1.5rem',
                  borderRadius: '20px',
                  fontSize: '0.9rem',
                  fontWeight: 'bold'
                }}>
                  🎓 Elevate Learn2Earn Workforce
                </div>
                <div style={{ fontSize: '1.2rem', lineHeight: '1.7', marginBottom: '2rem', color: '#4a5568' }}>
                  "Achieved 89% job placement rate across 15,000 participants. Real-time analytics 
                  help us optimize programs and demonstrate ROI to state funders."
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                  <div style={{ 
                    width: '60px', 
                    height: '60px', 
                    borderRadius: '50%', 
                    backgroundColor: 'var(--brand-secondary)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: 'white',
                    fontSize: '1.5rem',
                    fontWeight: 'bold'
                  }}>
                    MJ
                  </div>
                  <div>
                    <div style={{ fontWeight: 'bold', color: '#2d3748' }}>Maria Johnson</div>
                    <div style={{ color: '#718096' }}>Executive Director, Skills Alliance</div>
                    <div style={{ color: 'var(--brand-secondary)', fontSize: '0.9rem', fontWeight: '600' }}>$450M State Program</div>
                  </div>
                </div>
              </div>

              {/* Grant Management Testimonial */}
              <div style={{
                backgroundColor: 'white',
                padding: '3rem',
                borderRadius: '20px',
                boxShadow: '0 10px 30px rgba(0,0,0,0.1)',
                border: '2px solid var(--brand-success)',
                position: 'relative'
              }}>
                <div style={{ 
                  position: 'absolute',
                  top: '-15px',
                  left: '30px',
                  backgroundColor: 'var(--brand-success)',
                  color: 'white',
                  padding: '0.5rem 1.5rem',
                  borderRadius: '20px',
                  fontSize: '0.9rem',
                  fontWeight: 'bold'
                }}>
                  📊 Foundation
                </div>
                <div style={{ fontSize: '1.2rem', lineHeight: '1.7', marginBottom: '2rem', color: '#4a5568' }}>
                  "Streamlined our grant distribution process, reducing administrative overhead by 60%. 
                  We've distributed $2.4B through the platform with complete audit compliance."
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                  <div style={{ 
                    width: '60px', 
                    height: '60px', 
                    borderRadius: '50%', 
                    backgroundColor: 'var(--brand-success)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: 'white',
                    fontSize: '1.5rem',
                    fontWeight: 'bold'
                  }}>
                    RT
                  </div>
                  <div>
                    <div style={{ fontWeight: 'bold', color: '#2d3748' }}>Robert Thompson</div>
                    <div style={{ color: '#718096' }}>VP Operations, Community Foundation</div>
                    <div style={{ color: 'var(--brand-success)', fontSize: '0.9rem', fontWeight: '600' }}>$3.2B Foundation Assets</div>
                  </div>
                </div>
              </div>

              {/* Enterprise ROI Card */}
              <div style={{
                backgroundColor: 'linear-gradient(135deg, #ff6b6b 0%, #ee5a24 100%)',
                background: 'linear-gradient(135deg, #ff6b6b 0%, #ee5a24 100%)',
                color: 'white',
                padding: '3rem',
                borderRadius: '20px',
                boxShadow: '0 10px 30px rgba(255, 107, 107, 0.3)',
                position: 'relative',
                textAlign: 'center'
              }}>
                <h3 style={{ fontSize: '2rem', marginBottom: '1.5rem', fontWeight: 'bold' }}>
                  Enterprise ROI
                </h3>
                <div style={{ fontSize: '3rem', fontWeight: 'bold', marginBottom: '1rem' }}>
                  340%
                </div>
                <div style={{ fontSize: '1.2rem', marginBottom: '2rem', opacity: 0.9 }}>
                  Average ROI within 12 months
                </div>
                <div style={{ 
                  backgroundColor: 'rgba(255,255,255,0.2)',
                  padding: '1rem',
                  borderRadius: '15px',
                  fontSize: '1rem'
                }}>
                  Based on independent study of 500+ enterprise deployments
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Pricing Section */}
        <section style={{ padding: '5rem 2rem', backgroundColor: 'white' }}>
          <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
            <h2 style={{ 
              fontSize: '3rem', 
              textAlign: 'center', 
              marginBottom: '2rem',
              color: '#2d3748',
              fontWeight: 'bold'
            }}>
              Enterprise-Grade Pricing
            </h2>
            <p style={{ 
              fontSize: '1.3rem', 
              textAlign: 'center', 
              marginBottom: '1.5rem',
              color: '#718096',
              maxWidth: '800px',
              margin: '0 auto 1.5rem'
            }}>
              Sector-specific solutions with enterprise SLAs, compliance guarantees, and dedicated support.
            </p>
            <div style={{
              textAlign: 'center',
              marginBottom: '3rem',
              padding: '1rem',
              backgroundColor: '#f0fff4',
              borderRadius: '15px',
              border: '2px solid var(--brand-success)',
              maxWidth: '600px',
              margin: '0 auto 3rem'
            }}>
              <span style={{ color: 'var(--brand-success)', fontWeight: 'bold', fontSize: '1.1rem' }}>
                🏆 Trusted by 500+ Enterprise Organizations • $2.4B+ Managed
              </span>
            </div>
            
            {/* Billing Toggle */}
            <div style={{ 
              display: 'flex', 
              justifyContent: 'center',
              marginBottom: '3rem'
            }}>
              <div style={{ 
                display: 'inline-flex', 
                backgroundColor: '#f7fafc', 
                borderRadius: '50px',
                padding: '0.5rem',
                border: '1px solid #e2e8f0'
              }}>
                <button
                  onClick={() => setBillingCycle('monthly')}
                  style={{
                    padding: '0.75rem 2rem',
                    border: 'none',
                    borderRadius: '25px',
                    backgroundColor: billingCycle === 'monthly' ? '#ff6b6b' : 'transparent',
                    color: billingCycle === 'monthly' ? 'white' : '#ff6b6b',
                    cursor: 'pointer',
                    fontWeight: 'bold',
                    transition: 'all 0.3s ease'
                  }}
                >
                  Monthly
                </button>
                <button
                  onClick={() => setBillingCycle('yearly')}
                  style={{
                    padding: '0.75rem 2rem',
                    border: 'none',
                    borderRadius: '25px',
                    backgroundColor: billingCycle === 'yearly' ? '#ff6b6b' : 'transparent',
                    color: billingCycle === 'yearly' ? 'white' : '#ff6b6b',
                    cursor: 'pointer',
                    fontWeight: 'bold',
                    transition: 'all 0.3s ease',
                    position: 'relative'
                  }}
                >
                  Yearly
                  <span style={{
                    position: 'absolute',
                    top: '-8px',
                    right: '-8px',
                    backgroundColor: '#ff6b6b',
                    color: 'white',
                    fontSize: '0.7rem',
                    padding: '0.2rem 0.5rem',
                    borderRadius: '10px'
                  }}>
                    Save 20%
                  </span>
                </button>
              </div>
            </div>
            
            <div style={{ 
              display: 'grid', 
              gridTemplateColumns: 'repeat(auto-fit, minmax(350px, 1fr))', 
              gap: '2rem',
              maxWidth: '1100px',
              margin: '0 auto'
            }}>
              {Object.entries(plans).map(([key, plan]) => (
                <div
                  key={key}
                  style={{
                    padding: '3rem',
                    backgroundColor: plan.popular ? '#f7fafc' : 'white',
                    borderRadius: '20px',
                    border: plan.popular ? '3px solid #667eea' : '1px solid #e2e8f0',
                    position: 'relative',
                    transform: plan.popular ? 'scale(1.05)' : 'scale(1)',
                    boxShadow: plan.popular 
                      ? '0 15px 40px rgba(102, 126, 234, 0.2)' 
                      : '0 8px 25px rgba(0,0,0,0.08)',
                    transition: 'all 0.3s ease',
                    textAlign: 'center'
                  }}
                >
                  {/* Sector Badge */}
                  <div style={{
                    position: 'absolute',
                    top: '-15px',
                    left: '50%',
                    transform: 'translateX(-50%)',
                    backgroundColor: plan.popular ? 'var(--brand-secondary)' : 'var(--brand-info)',
                    color: 'white',
                    padding: '0.5rem 1.5rem',
                    borderRadius: '25px',
                    fontSize: '0.9rem',
                    fontWeight: 'bold'
                  }}>
                    {plan.badge || plan.sector}
                  </div>
                  
                  <h3 style={{ 
                    fontSize: '2rem', 
                    marginBottom: '0.5rem',
                    color: '#2d3748'
                  }}>
                    {plan.name}
                  </h3>
                  
                  <p style={{ 
                    color: '#718096', 
                    marginBottom: '2rem',
                    fontSize: '1.1rem'
                  }}>
                    {plan.description}
                  </p>
                  
                  <div style={{ marginBottom: '2rem' }}>
                    <div style={{ fontSize: '1rem', color: '#718096', marginBottom: '0.5rem' }}>
                      {plan.sector}
                    </div>
                    <span style={{ 
                      fontSize: plan.monthly === 'Custom' ? '2.5rem' : '4rem', 
                      fontWeight: 'bold',
                      color: plan.popular ? 'var(--brand-secondary)' : '#2d3748'
                    }}>
                      {plan.monthly === 'Custom' ? 'Custom' : `$${billingCycle === 'monthly' ? plan.monthly : Math.floor(plan.yearly / 12)}`}
                    </span>
                    {plan.monthly !== 'Custom' && (
                      <span style={{ 
                        fontSize: '1.2rem', 
                        color: '#718096',
                        marginLeft: '0.5rem'
                      }}>
                        /month
                      </span>
                    )}
                    {billingCycle === 'yearly' && plan.yearly !== 'Custom' && plan.yearly > 0 && (
                      <div style={{ 
                        fontSize: '1rem', 
                        color: '#718096',
                        marginTop: '0.5rem'
                      }}>
                        Billed ${plan.yearly} yearly
                      </div>
                    )}
                    {plan.monthly === 'Custom' && (
                      <div style={{ 
                        fontSize: '1rem', 
                        color: '#718096',
                        marginTop: '0.5rem'
                      }}>
                        Enterprise pricing based on scale
                      </div>
                    )}
                  </div>
                  
                  <ul style={{ 
                    listStyle: 'none', 
                    padding: 0, 
                    marginBottom: '2rem',
                    textAlign: 'left'
                  }}>
                    {plan.features.map((feature, index) => (
                      <li key={index} style={{ 
                        padding: '0.75rem 0', 
                        color: '#2d3748',
                        display: 'flex',
                        alignItems: 'center',
                        fontSize: '1.1rem'
                      }}>
                        <span style={{ 
                          color: plan.popular ? '#667eea' : '#4ecdc4', 
                          marginRight: '1rem',
                          fontWeight: 'bold',
                          fontSize: '1.2rem'
                        }}>
                          ✓
                        </span>
                        {feature}
                      </li>
                    ))}
                  </ul>
                  
                  <button
                    onClick={() => setSelectedPlan(key)}
                    style={{
                      width: '100%',
                      padding: '1.2rem',
                      backgroundColor: plan.popular ? '#667eea' : '#f7fafc',
                      color: plan.popular ? 'white' : '#667eea',
                      border: plan.popular ? 'none' : '2px solid #667eea',
                      borderRadius: '12px',
                      fontSize: '1.2rem',
                      cursor: 'pointer',
                      fontWeight: 'bold',
                      transition: 'all 0.3s ease'
                    }}
                    onMouseOver={(e) => {
                      if (plan.popular) {
                        e.target.style.backgroundColor = '#5a67d8';
                      } else {
                        e.target.style.backgroundColor = '#667eea';
                        e.target.style.color = 'white';
                      }
                      e.target.style.transform = 'translateY(-2px)';
                    }}
                    onMouseOut={(e) => {
                      if (plan.popular) {
                        e.target.style.backgroundColor = '#667eea';
                      } else {
                        e.target.style.backgroundColor = '#f7fafc';
                        e.target.style.color = '#667eea';
                      }
                      e.target.style.transform = 'translateY(0)';
                    }}
                  >
                    {plan.cta}
                  </button>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Final CTA Section */}
        <section style={{
          padding: '5rem 2rem',
          background: 'linear-gradient(135deg, #ff6b6b 0%, #ee5a24 100%)',
          color: 'white',
          textAlign: 'center'
        }}>
          <div style={{ maxWidth: '900px', margin: '0 auto' }}>
            <h2 style={{ fontSize: '3rem', marginBottom: '1.5rem' }}>
              Ready to Build Your Dream Website?
            </h2>
            <p style={{ fontSize: '1.3rem', marginBottom: '3rem', opacity: 0.9 }}>
              Join thousands of entrepreneurs and businesses who trust Durable 
              to power their online presence. Start building today!
            </p>
            
            <div style={{ display: 'flex', gap: '1.5rem', justifyContent: 'center', flexWrap: 'wrap' }}>
              <button style={{
                padding: '1.5rem 3rem',
                fontSize: '1.3rem',
                backgroundColor: 'white',
                color: '#ff6b6b',
                border: 'none',
                borderRadius: '50px',
                cursor: 'pointer',
                fontWeight: 'bold',
                transition: 'all 0.3s ease',
                boxShadow: '0 6px 20px rgba(0,0,0,0.1)'
              }}
              onMouseOver={(e) => {
                e.target.style.transform = 'translateY(-3px)';
                e.target.style.boxShadow = '0 8px 25px rgba(0,0,0,0.15)';
              }}
              onMouseOut={(e) => {
                e.target.style.transform = 'translateY(0)';
                e.target.style.boxShadow = '0 6px 20px rgba(0,0,0,0.1)';
              }}
              >
                🚀 Start Building Now
              </button>
              
              <Link 
                to="/durable-features" 
                style={{
                  display: 'inline-block',
                  padding: '1.5rem 3rem',
                  fontSize: '1.3rem',
                  backgroundColor: 'transparent',
                  color: 'white',
                  border: '3px solid white',
                  borderRadius: '50px',
                  textDecoration: 'none',
                  fontWeight: 'bold',
                  transition: 'all 0.3s ease'
                }}
                onMouseOver={(e) => {
                  e.target.style.backgroundColor = 'white';
                  e.target.style.color = '#ff6b6b';
                  e.target.style.transform = 'translateY(-3px)';
                }}
                onMouseOut={(e) => {
                  e.target.style.backgroundColor = 'transparent';
                  e.target.style.color = 'white';
                  e.target.style.transform = 'translateY(0)';
                }}
              >
                🔍 Explore Features
              </Link>
            </div>
          </div>
        </section>
      </main>
      
      <style jsx>{`
        @keyframes fadeInUp {
          from {
            opacity: 0;
            transform: translateY(30px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        
        @keyframes progress {
          0% { transform: translateX(-100%); }
          100% { transform: translateX(100%); }
        }
        
        @keyframes countUp {
          from {
            opacity: 0;
            transform: scale(0.5);
          }
          to {
            opacity: 1;
            transform: scale(1);
          }
        }
      `}</style>
    </>
  );
}