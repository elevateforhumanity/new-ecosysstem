/*
  Programs Page - Matching Durable.co Design
  Colors: #4D4B37 (olive), #FFFFFF (white), #000000 (black)
*/

import React, { useState } from "react";
import { Link } from "react-router-dom";
import { SEO } from "../components/SEO";
import Header from "../components/Header";
import Footer from "../components/Footer";

const programs = [
  {
    name: "Construction Pre-Apprenticeship",
    description: "Comprehensive training program preparing students for careers in construction trades with industry-recognized certifications.",
    duration: "12-16 weeks",
    credentials: ["OSHA 10", "NCCER Core", "First Aid/CPR", "Forklift Certification"],
    funding: ["WIOA", "WRG", "OJT", "WEX", "JRI"],
    category: "trades",
    icon: "🏗️"
  },
  {
    name: "Phlebotomy Technician",
    description: "Medical training program for aspiring phlebotomists with hands-on clinical experience and certification preparation.",
    duration: "8-10 weeks",
    credentials: ["Phlebotomy Certification", "Bloodborne Pathogens", "HIPAA"],
    funding: ["WIOA", "WRG", "OJT", "WEX"],
    category: "healthcare",
    icon: "🩺"
  },
  {
    name: "CPR Instructor",
    description: "Become a certified CPR instructor and teach life-saving skills in your community.",
    duration: "4-6 weeks",
    credentials: ["CPR Instructor Certification", "First Aid", "AED Training"],
    funding: ["WIOA", "WRG", "OJT"],
    category: "healthcare",
    icon: "❤️"
  },
  {
    name: "OTR Truck Driving",
    description: "Professional truck driving program leading to CDL Class A certification and career placement assistance.",
    duration: "4-8 weeks",
    credentials: ["CDL Class A", "DOT Safety", "Logistics Basics"],
    funding: ["WIOA", "WRG", "OJT", "WEX"],
    category: "transportation",
    icon: "🚛"
  },
  {
    name: "Drug Testing Collector",
    description: "Specialized training for DOT-compliant drug and alcohol testing collection procedures.",
    duration: "2-4 weeks",
    credentials: ["DOT Collector Certification", "Chain of Custody Training"],
    funding: ["WIOA", "WRG", "OJT"],
    category: "healthcare",
    icon: "🧪"
  },
  {
    name: "Financial Literacy",
    description: "Essential money management skills including budgeting, credit, and financial planning for personal and professional success.",
    duration: "6-8 weeks",
    credentials: ["Financial Literacy Certificate", "Budgeting Basics", "Credit Management"],
    funding: ["WIOA", "WRG", "WEX"],
    category: "business",
    icon: "💰"
  }
];

export default function ProgramsDurable() {
  const [filter, setFilter] = useState("all");

  const categories = [
    { value: "all", label: "All Programs" },
    { value: "trades", label: "Trades & Construction" },
    { value: "healthcare", label: "Healthcare" },
    { value: "transportation", label: "Transportation" },
    { value: "business", label: "Business & Finance" }
  ];

  const filteredPrograms = filter === "all" 
    ? programs 
    : programs.filter(p => p.category === filter);

  return (
    <div style={{ minHeight: '100vh', background: '#FFFFFF' }}>
      <SEO
        title="Training Programs | Elevate for Humanity"
        description="Browse 15+ WIOA-funded training programs including healthcare, technology, skilled trades, and business management. 12-20 week programs with 95% job placement rate in Marion County, IN."
        canonical={`${import.meta.env.VITE_SITE_URL || ""}/programs`}
      />
      <Header />
      
      <main>
        {/* Hero Section - Matching Durable Style */}
        <section style={{ 
          padding: '4rem 2rem',
          maxWidth: '1200px',
          margin: '0 auto'
        }}>
          <div style={{ textAlign: 'center', marginBottom: '3rem' }}>
            <h1 style={{ 
              fontSize: 'clamp(2rem, 5vw, 3.5rem)',
              marginBottom: '1rem',
              color: '#000000',
              fontWeight: '700',
              lineHeight: '1.2'
            }}>
              Stackable Credential Programs
            </h1>
            <p style={{ 
              fontSize: '1.25rem',
              color: '#666666',
              maxWidth: '800px',
              margin: '0 auto',
              lineHeight: '1.6'
            }}>
              Industry-recognized training programs designed to build your skills and advance your career in Marion County, IN
            </p>
          </div>

          {/* Filter Tabs - Durable Style */}
          <div style={{ 
            display: 'flex',
            gap: '0.5rem',
            marginBottom: '3rem',
            flexWrap: 'wrap',
            justifyContent: 'center'
          }}>
            {categories.map(cat => (
              <button
                key={cat.value}
                onClick={() => setFilter(cat.value)}
                style={{
                  padding: '0.75rem 1.5rem',
                  backgroundColor: filter === cat.value ? '#4D4B37' : '#FFFFFF',
                  color: filter === cat.value ? '#FFFFFF' : '#000000',
                  border: `2px solid ${filter === cat.value ? '#4D4B37' : '#E5E5E5'}`,
                  borderRadius: '8px',
                  cursor: 'pointer',
                  fontWeight: '500',
                  fontSize: '1rem',
                  transition: 'all 0.2s'
                }}
              >
                {cat.label}
              </button>
            ))}
          </div>

          {/* Programs Grid - Durable Style */}
          <div style={{ 
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(350px, 1fr))',
            gap: '2rem',
            marginBottom: '3rem'
          }}>
            {filteredPrograms.map((program, idx) => (
              <div 
                key={idx}
                style={{
                  background: '#FFFFFF',
                  border: '1px solid #E5E5E5',
                  borderRadius: '8px',
                  padding: '2rem',
                  transition: 'all 0.2s'
                }}
              >
                <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>{program.icon}</div>
                <h3 style={{ 
                  fontSize: '1.5rem',
                  marginBottom: '0.75rem',
                  color: '#000000',
                  fontWeight: '600'
                }}>
                  {program.name}
                </h3>
                <p style={{ 
                  color: '#666666',
                  marginBottom: '1rem',
                  lineHeight: '1.6'
                }}>
                  {program.description}
                </p>
                <div style={{ marginBottom: '1rem' }}>
                  <p style={{ 
                    fontSize: '0.9rem',
                    color: '#4D4B37',
                    fontWeight: '600',
                    marginBottom: '0.5rem'
                  }}>
                    Duration: {program.duration}
                  </p>
                  <p style={{ 
                    fontSize: '0.85rem',
                    color: '#666666',
                    marginBottom: '0.5rem'
                  }}>
                    <strong>Credentials:</strong> {program.credentials.join(", ")}
                  </p>
                  <p style={{ 
                    fontSize: '0.85rem',
                    color: '#666666'
                  }}>
                    <strong>Funding:</strong> {program.funding.join(", ")}
                  </p>
                </div>
                <Link 
                  to="/get-started"
                  style={{
                    display: 'inline-block',
                    padding: '0.75rem 1.5rem',
                    backgroundColor: '#4D4B37',
                    color: '#FFFFFF',
                    textDecoration: 'none',
                    borderRadius: '8px',
                    fontWeight: '500',
                    border: '2px solid #4D4B37',
                    transition: 'all 0.2s'
                  }}
                >
                  Apply Now
                </Link>
              </div>
            ))}
          </div>

          {/* Funding Information - Durable Style */}
          <section style={{ 
            background: '#F9F9F9',
            padding: '3rem',
            borderRadius: '8px',
            marginTop: '4rem'
          }}>
            <h2 style={{ 
              fontSize: '2rem',
              marginBottom: '1.5rem',
              color: '#000000',
              textAlign: 'center',
              fontWeight: '600'
            }}>
              100% Funded Training
            </h2>
            <p style={{ 
              fontSize: '1.125rem',
              color: '#666666',
              textAlign: 'center',
              maxWidth: '800px',
              margin: '0 auto 2rem',
              lineHeight: '1.6'
            }}>
              All programs are funded through WIOA, WRG, OJT, WEX, JRI, and other workforce development initiatives. No cost to eligible participants.
            </p>
            <div style={{ textAlign: 'center' }}>
              <Link 
                to="/get-started"
                style={{
                  display: 'inline-block',
                  padding: '1rem 2rem',
                  backgroundColor: '#4D4B37',
                  color: '#FFFFFF',
                  textDecoration: 'none',
                  borderRadius: '8px',
                  fontWeight: '600',
                  fontSize: '1.125rem',
                  border: '2px solid #4D4B37'
                }}
              >
                Check Your Eligibility
              </Link>
            </div>
          </section>
        </section>
      </main>

      <Footer />
    </div>
  );
}
