import React, { useState } from "react";
import { Link } from "react-router-dom";
import { SEO } from "../lib/seo/SEO";
import DurableNav from "../components/DurableNav";

export default function DurablePricing() {
  const [billingCycle, setBillingCycle] = useState('monthly');
  const [selectedPlan, setSelectedPlan] = useState('pro');
  
  const plans = {
    starter: {
      name: 'Starter',
      monthly: 0,
      yearly: 0,
      description: 'Perfect for getting started',
      features: [
        '1 Website',
        'Basic Templates',
        'Durable Subdomain',
        'Mobile Responsive',
        'Basic SEO Tools',
        'Community Support'
      ],
      cta: 'Get Started Free',
      popular: false
    },
    pro: {
      name: 'Pro',
      monthly: 12,
      yearly: 120,
      description: 'Best for growing businesses',
      features: [
        'Unlimited Websites',
        'Premium Templates',
        'Custom Domain',
        'Advanced SEO Tools',
        'E-commerce Store',
        'Email Marketing',
        'Analytics Dashboard',
        'Priority Support'
      ],
      cta: 'Start Pro Trial',
      popular: true
    },
    business: {
      name: 'Business',
      monthly: 25,
      yearly: 250,
      description: 'For established businesses',
      features: [
        'Everything in Pro',
        'Advanced E-commerce',
        'Team Collaboration',
        'White-label Options',
        'API Access',
        'Custom Integrations',
        'Dedicated Support',
        'Advanced Analytics'
      ],
      cta: 'Start Business Trial',
      popular: false
    }
  };

  const addOns = [
    { name: 'Professional Email', price: 5, description: 'Custom email addresses with your domain' },
    { name: 'Advanced Analytics', price: 10, description: 'Detailed visitor insights and conversion tracking' },
    { name: 'Priority Support', price: 15, description: '24/7 phone and chat support with 1-hour response' },
    { name: 'Custom Development', price: 50, description: 'Custom features and integrations by our team' }
  ];

  return (
    <>
      <SEO
        title="Durable Pricing - Simple, Transparent Plans"
        description="Choose the perfect plan for your business. Start free or upgrade to Pro for advanced features. No hidden fees, cancel anytime."
        canonical={`${import.meta.env.VITE_SITE_URL || ""}/durable-pricing`}
      />
      
      <main id="main-content" style={{ minHeight: '100vh' }}>
        <DurableNav />

        {/* Hero Section */}
        <section style={{
          background: 'linear-gradient(135deg, #45b7d1 0%, #96ceb4 100%)',
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
              Simple, Transparent Pricing
            </h1>
            <p style={{ 
              fontSize: 'clamp(1.1rem, 2.5vw, 1.5rem)', 
              marginBottom: '2.5rem',
              opacity: 0.9,
              maxWidth: '600px',
              margin: '0 auto 2.5rem'
            }}>
              Start free and upgrade as you grow. No hidden fees, no surprises. 
              Cancel anytime with 30-day money-back guarantee.
            </p>
            
            {/* Billing Toggle */}
            <div style={{ 
              display: 'inline-flex', 
              backgroundColor: 'rgba(255,255,255,0.2)', 
              borderRadius: '50px',
              padding: '0.5rem',
              marginBottom: '2rem'
            }}>
              <button
                onClick={() => setBillingCycle('monthly')}
                style={{
                  padding: '0.75rem 2rem',
                  border: 'none',
                  borderRadius: '25px',
                  backgroundColor: billingCycle === 'monthly' ? 'white' : 'transparent',
                  color: billingCycle === 'monthly' ? '#45b7d1' : 'white',
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
                  backgroundColor: billingCycle === 'yearly' ? 'white' : 'transparent',
                  color: billingCycle === 'yearly' ? '#45b7d1' : 'white',
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
        </section>

        {/* Pricing Plans */}
        <section style={{ padding: '4rem 2rem', backgroundColor: '#f8fafc' }}>
          <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
            <div style={{ 
              display: 'grid', 
              gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', 
              gap: '2rem',
              alignItems: 'stretch'
            }}>
              {Object.entries(plans).map(([key, plan]) => (
                <div
                  key={key}
                  style={{
                    padding: '2.5rem',
                    backgroundColor: 'white',
                    borderRadius: '12px',
                    border: plan.popular ? '3px solid #667eea' : '1px solid #e2e8f0',
                    position: 'relative',
                    transform: plan.popular ? 'scale(1.05)' : 'scale(1)',
                    boxShadow: plan.popular 
                      ? '0 10px 30px rgba(102, 126, 234, 0.2)' 
                      : '0 4px 15px rgba(0,0,0,0.08)',
                    transition: 'all 0.3s ease',
                    textAlign: 'center'
                  }}
                  onMouseOver={(e) => {
                    if (!plan.popular) {
                      e.currentTarget.style.transform = 'translateY(-5px)';
                      e.currentTarget.style.boxShadow = '0 10px 25px rgba(0,0,0,0.15)';
                    }
                  }}
                  onMouseOut={(e) => {
                    if (!plan.popular) {
                      e.currentTarget.style.transform = 'translateY(0)';
                      e.currentTarget.style.boxShadow = '0 4px 15px rgba(0,0,0,0.08)';
                    }
                  }}
                >
                  {plan.popular && (
                    <div style={{
                      position: 'absolute',
                      top: '-15px',
                      left: '50%',
                      transform: 'translateX(-50%)',
                      backgroundColor: '#667eea',
                      color: 'white',
                      padding: '0.5rem 2rem',
                      borderRadius: '25px',
                      fontSize: '0.9rem',
                      fontWeight: 'bold'
                    }}>
                      Most Popular
                    </div>
                  )}
                  
                  <h3 style={{ 
                    fontSize: '1.8rem', 
                    marginBottom: '0.5rem',
                    color: '#2d3748'
                  }}>
                    {plan.name}
                  </h3>
                  
                  <p style={{ 
                    color: '#718096', 
                    marginBottom: '2rem',
                    fontSize: '1rem'
                  }}>
                    {plan.description}
                  </p>
                  
                  <div style={{ marginBottom: '2rem' }}>
                    <span style={{ 
                      fontSize: '3.5rem', 
                      fontWeight: 'bold',
                      color: plan.popular ? '#667eea' : '#2d3748'
                    }}>
                      ${billingCycle === 'monthly' ? plan.monthly : Math.floor(plan.yearly / 12)}
                    </span>
                    <span style={{ 
                      fontSize: '1rem', 
                      color: '#718096',
                      marginLeft: '0.5rem'
                    }}>
                      /month
                    </span>
                    {billingCycle === 'yearly' && plan.yearly > 0 && (
                      <div style={{ 
                        fontSize: '0.9rem', 
                        color: '#718096',
                        marginTop: '0.5rem'
                      }}>
                        Billed ${plan.yearly} yearly
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
                        alignItems: 'center'
                      }}>
                        <span style={{ 
                          color: plan.popular ? '#667eea' : '#4ecdc4', 
                          marginRight: '0.75rem',
                          fontWeight: 'bold'
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
                      padding: '1rem',
                      backgroundColor: plan.popular ? '#667eea' : '#e2e8f0',
                      color: plan.popular ? 'white' : '#2d3748',
                      border: 'none',
                      borderRadius: '8px',
                      fontSize: '1.1rem',
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
                    }}
                    onMouseOut={(e) => {
                      if (plan.popular) {
                        e.target.style.backgroundColor = '#667eea';
                      } else {
                        e.target.style.backgroundColor = '#e2e8f0';
                        e.target.style.color = '#2d3748';
                      }
                    }}
                  >
                    {plan.cta}
                  </button>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Add-ons */}
        <section style={{ padding: '4rem 2rem', backgroundColor: 'white' }}>
          <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
            <h2 style={{ fontSize: '2.5rem', textAlign: 'center', marginBottom: '3rem', color: '#2d3748' }}>
              Optional Add-ons
            </h2>
            
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '2rem' }}>
              {addOns.map((addon, index) => (
                <div key={index} style={{
                  padding: '2rem',
                  border: '1px solid #e2e8f0',
                  borderRadius: '12px',
                  transition: 'all 0.3s ease'
                }}
                onMouseOver={(e) => {
                  e.currentTarget.style.transform = 'translateY(-3px)';
                  e.currentTarget.style.boxShadow = '0 8px 20px rgba(0,0,0,0.1)';
                }}
                onMouseOut={(e) => {
                  e.currentTarget.style.transform = 'translateY(0)';
                  e.currentTarget.style.boxShadow = 'none';
                }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                    <h3 style={{ fontSize: '1.25rem', color: '#2d3748', margin: 0 }}>
                      {addon.name}
                    </h3>
                    <span style={{ 
                      fontSize: '1.5rem', 
                      fontWeight: 'bold',
                      color: '#667eea'
                    }}>
                      ${addon.price}/mo
                    </span>
                  </div>
                  <p style={{ color: '#718096', marginBottom: '1.5rem' }}>
                    {addon.description}
                  </p>
                  <button style={{
                    width: '100%',
                    padding: '0.75rem',
                    backgroundColor: 'transparent',
                    color: '#667eea',
                    border: '2px solid #667eea',
                    borderRadius: '6px',
                    cursor: 'pointer',
                    fontWeight: 'bold',
                    transition: 'all 0.3s ease'
                  }}
                  onMouseOver={(e) => {
                    e.target.style.backgroundColor = '#667eea';
                    e.target.style.color = 'white';
                  }}
                  onMouseOut={(e) => {
                    e.target.style.backgroundColor = 'transparent';
                    e.target.style.color = '#667eea';
                  }}
                  >
                    Add to Plan
                  </button>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* FAQ */}
        <section style={{ padding: '4rem 2rem', backgroundColor: '#f8fafc' }}>
          <div style={{ maxWidth: '800px', margin: '0 auto' }}>
            <h2 style={{ fontSize: '2.5rem', textAlign: 'center', marginBottom: '3rem', color: '#2d3748' }}>
              Frequently Asked Questions
            </h2>
            
            <div style={{ display: 'grid', gap: '1.5rem' }}>
              {[
                {
                  q: "Can I change plans anytime?",
                  a: "Yes! You can upgrade or downgrade your plan at any time. Changes take effect immediately and we'll prorate the billing."
                },
                {
                  q: "Is there a free trial?",
                  a: "Yes, all paid plans come with a 14-day free trial. No credit card required to start."
                },
                {
                  q: "What's included in the money-back guarantee?",
                  a: "If you're not satisfied within 30 days, we'll refund your money, no questions asked."
                },
                {
                  q: "Do you offer discounts for nonprofits?",
                  a: "Yes! We offer 50% off all plans for verified nonprofit organizations. Contact support for details."
                }
              ].map((faq, index) => (
                <div key={index} style={{
                  padding: '2rem',
                  backgroundColor: 'white',
                  borderRadius: '8px',
                  border: '1px solid #e2e8f0'
                }}>
                  <h3 style={{ fontSize: '1.25rem', marginBottom: '1rem', color: '#2d3748' }}>
                    {faq.q}
                  </h3>
                  <p style={{ color: '#718096', margin: 0 }}>
                    {faq.a}
                  </p>
                </div>
              ))}
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
              Ready to Get Started?
            </h2>
            <p style={{ fontSize: '1.2rem', marginBottom: '2.5rem', opacity: 0.9 }}>
              Join thousands of businesses building their online presence with Durable.
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
                Start Free Trial
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
                View All Features
              </Link>
            </div>
          </div>
        </section>
      </main>
    </>
  );
}