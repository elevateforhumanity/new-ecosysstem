/*
  Copyright (c) 2025 Elevate for Humanity
  Commercial License. No resale, sublicensing, or redistribution allowed.
  See LICENSE file for details.
*/
import React, { useState } from "react";
import { Link } from "react-router-dom";
import AppLayout from "../layouts/AppLayout";

export default function Support() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [contactForm, setContactForm] = useState({
    name: "",
    email: "",
    subject: "",
    message: "",
  });
  const [submitted, setSubmitted] = useState(false);

  const categories = ["All", "Getting Started", "Account", "Courses", "Technical", "Billing"];

  const faqs = [
    {
      id: 1,
      category: "Getting Started",
      question: "How do I create an account?",
      answer: "Click the 'Sign Up' button in the top right corner and follow the registration process. You'll need to provide your email address and create a password.",
    },
    {
      id: 2,
      category: "Getting Started",
      question: "What courses are available?",
      answer: "We offer a wide range of courses in technology, business, personal development, and more. Browse our course catalog to see all available options.",
    },
    {
      id: 3,
      category: "Account",
      question: "How do I reset my password?",
      answer: "Click 'Forgot Password' on the login page, enter your email address, and we'll send you instructions to reset your password.",
    },
    {
      id: 4,
      category: "Account",
      question: "Can I change my email address?",
      answer: "Yes, go to Settings > Account Settings and update your email address. You'll need to verify the new email before the change takes effect.",
    },
    {
      id: 5,
      category: "Courses",
      question: "How do I enroll in a course?",
      answer: "Navigate to the course page and click the 'Enroll Now' button. Some courses are free, while others require payment.",
    },
    {
      id: 6,
      category: "Courses",
      question: "Can I download course materials?",
      answer: "Yes, most courses include downloadable resources like PDFs, worksheets, and supplementary materials available in the course dashboard.",
    },
    {
      id: 7,
      category: "Technical",
      question: "What browsers are supported?",
      answer: "We support the latest versions of Chrome, Firefox, Safari, and Edge. For the best experience, keep your browser updated.",
    },
    {
      id: 8,
      category: "Technical",
      question: "Why is my video not playing?",
      answer: "Check your internet connection, clear your browser cache, or try a different browser. If issues persist, contact our support team.",
    },
    {
      id: 9,
      category: "Billing",
      question: "What payment methods do you accept?",
      answer: "We accept major credit cards (Visa, MasterCard, American Express), PayPal, and bank transfers for institutional accounts.",
    },
    {
      id: 10,
      category: "Billing",
      question: "What is your refund policy?",
      answer: "We offer a 30-day money-back guarantee for all paid courses. If you're not satisfied, contact us within 30 days of purchase for a full refund.",
    },
  ];

  const filteredFaqs = faqs.filter((faq) => {
    const matchesCategory = selectedCategory === "All" || faq.category === selectedCategory;
    const matchesSearch = searchQuery === "" || 
      faq.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
      faq.answer.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const handleContactSubmit = (e) => {
    e.preventDefault();
    setSubmitted(true);
    setTimeout(() => {
      setSubmitted(false);
      setContactForm({ name: "", email: "", subject: "", message: "" });
    }, 3000);
  };

  const handleContactChange = (e) => {
    setContactForm({ ...contactForm, [e.target.name]: e.target.value });
  };

  return (
    <AppLayout>
      <div style={{ maxWidth: 1200, margin: "0 auto", padding: 32 }}>
        {/* Header */}
        <div style={{ textAlign: "center", marginBottom: 48 }}>
          <h1 style={{ fontSize: 36, fontWeight: 700, marginBottom: 12 }}>
            How can we help you?
          </h1>
          <p style={{ fontSize: 18, color: "#666", marginBottom: 32 }}>
            Search our knowledge base or contact our support team
          </p>

          {/* Search Bar */}
          <div style={{ maxWidth: 600, margin: "0 auto" }}>
            <input
              type="text"
              placeholder="Search for answers..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              style={{
                width: "100%",
                padding: "16px 20px",
                fontSize: 16,
                border: "2px solid #e0e0e0",
                borderRadius: 8,
                outline: "none",
              }}
              onFocus={(e) => (e.target.style.borderColor = "#007bff")}
              onBlur={(e) => (e.target.style.borderColor = "#e0e0e0")}
            />
          </div>
        </div>

        {/* Quick Links */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))",
            gap: 20,
            marginBottom: 48,
          }}
        >
          <Link
            to="/student-handbook"
            style={{
              backgroundColor: "#fff",
              padding: 24,
              borderRadius: 8,
              border: "1px solid #e0e0e0",
              textDecoration: "none",
              color: "inherit",
              transition: "transform 0.2s, box-shadow 0.2s",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = "translateY(-4px)";
              e.currentTarget.style.boxShadow = "0 4px 12px rgba(0, 0, 0, 0.1)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = "translateY(0)";
              e.currentTarget.style.boxShadow = "none";
            }}
          >
            <div style={{ fontSize: 32, marginBottom: 12 }}>📚</div>
            <h3 style={{ fontSize: 18, fontWeight: 600, marginBottom: 8 }}>
              Student Handbook
            </h3>
            <p style={{ fontSize: 14, color: "#666" }}>
              Complete guide to using the platform
            </p>
          </Link>

          <Link
            to="/courses"
            style={{
              backgroundColor: "#fff",
              padding: 24,
              borderRadius: 8,
              border: "1px solid #e0e0e0",
              textDecoration: "none",
              color: "inherit",
              transition: "transform 0.2s, box-shadow 0.2s",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = "translateY(-4px)";
              e.currentTarget.style.boxShadow = "0 4px 12px rgba(0, 0, 0, 0.1)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = "translateY(0)";
              e.currentTarget.style.boxShadow = "none";
            }}
          >
            <div style={{ fontSize: 32, marginBottom: 12 }}>🎓</div>
            <h3 style={{ fontSize: 18, fontWeight: 600, marginBottom: 8 }}>
              Course Catalog
            </h3>
            <p style={{ fontSize: 14, color: "#666" }}>
              Browse all available courses
            </p>
          </Link>

          <div
            style={{
              backgroundColor: "#fff",
              padding: 24,
              borderRadius: 8,
              border: "1px solid #e0e0e0",
              cursor: "pointer",
              transition: "transform 0.2s, box-shadow 0.2s",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = "translateY(-4px)";
              e.currentTarget.style.boxShadow = "0 4px 12px rgba(0, 0, 0, 0.1)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = "translateY(0)";
              e.currentTarget.style.boxShadow = "none";
            }}
          >
            <div style={{ fontSize: 32, marginBottom: 12 }}>💬</div>
            <h3 style={{ fontSize: 18, fontWeight: 600, marginBottom: 8 }}>
              Live Chat
            </h3>
            <p style={{ fontSize: 14, color: "#666" }}>
              Chat with our support team
            </p>
          </div>

          <a
            href="mailto:support@elevateforhumanity.org"
            style={{
              backgroundColor: "#fff",
              padding: 24,
              borderRadius: 8,
              border: "1px solid #e0e0e0",
              textDecoration: "none",
              color: "inherit",
              transition: "transform 0.2s, box-shadow 0.2s",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = "translateY(-4px)";
              e.currentTarget.style.boxShadow = "0 4px 12px rgba(0, 0, 0, 0.1)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = "translateY(0)";
              e.currentTarget.style.boxShadow = "none";
            }}
          >
            <div style={{ fontSize: 32, marginBottom: 12 }}>📧</div>
            <h3 style={{ fontSize: 18, fontWeight: 600, marginBottom: 8 }}>
              Email Support
            </h3>
            <p style={{ fontSize: 14, color: "#666" }}>
              support@elevateforhumanity.org
            </p>
          </a>
        </div>

        {/* FAQ Section */}
        <div style={{ marginBottom: 48 }}>
          <h2 style={{ fontSize: 28, fontWeight: 700, marginBottom: 24 }}>
            Frequently Asked Questions
          </h2>

          {/* Category Filter */}
          <div
            style={{
              display: "flex",
              gap: 12,
              marginBottom: 24,
              flexWrap: "wrap",
            }}
          >
            {categories.map((category) => (
              <button
                key={category}
                onClick={() => setSelectedCategory(category)}
                style={{
                  padding: "8px 16px",
                  backgroundColor: selectedCategory === category ? "#007bff" : "#fff",
                  color: selectedCategory === category ? "#fff" : "#333",
                  border: "1px solid #e0e0e0",
                  borderRadius: 20,
                  fontSize: 14,
                  fontWeight: 500,
                  cursor: "pointer",
                  transition: "all 0.2s",
                }}
              >
                {category}
              </button>
            ))}
          </div>

          {/* FAQ List */}
          <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
            {filteredFaqs.map((faq) => (
              <details
                key={faq.id}
                style={{
                  backgroundColor: "#fff",
                  border: "1px solid #e0e0e0",
                  borderRadius: 8,
                  padding: 20,
                }}
              >
                <summary
                  style={{
                    fontSize: 16,
                    fontWeight: 600,
                    cursor: "pointer",
                    listStyle: "none",
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                  }}
                >
                  {faq.question}
                  <span style={{ fontSize: 20, color: "#007bff" }}>+</span>
                </summary>
                <div
                  style={{
                    marginTop: 16,
                    paddingTop: 16,
                    borderTop: "1px solid #f0f0f0",
                    fontSize: 14,
                    color: "#666",
                    lineHeight: 1.6,
                  }}
                >
                  {faq.answer}
                </div>
              </details>
            ))}
          </div>

          {filteredFaqs.length === 0 && (
            <div
              style={{
                textAlign: "center",
                padding: 48,
                backgroundColor: "#f8f8f8",
                borderRadius: 8,
              }}
            >
              <p style={{ fontSize: 16, color: "#666" }}>
                No results found. Try a different search term or category.
              </p>
            </div>
          )}
        </div>

        {/* Contact Form */}
        <div
          style={{
            backgroundColor: "#fff",
            border: "1px solid #e0e0e0",
            borderRadius: 8,
            padding: 32,
          }}
        >
          <h2 style={{ fontSize: 24, fontWeight: 700, marginBottom: 8 }}>
            Still need help?
          </h2>
          <p style={{ fontSize: 14, color: "#666", marginBottom: 24 }}>
            Send us a message and we'll get back to you within 24 hours.
          </p>

          {submitted && (
            <div
              style={{
                padding: 16,
                backgroundColor: "#d4edda",
                color: "#155724",
                borderRadius: 8,
                marginBottom: 24,
                border: "1px solid #c3e6cb",
              }}
            >
              ✅ Message sent successfully! We'll respond within 24 hours.
            </div>
          )}

          <form onSubmit={handleContactSubmit}>
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "1fr 1fr",
                gap: 16,
                marginBottom: 16,
              }}
            >
              <div>
                <label
                  style={{
                    display: "block",
                    marginBottom: 8,
                    fontWeight: 500,
                    fontSize: 14,
                  }}
                >
                  Name *
                </label>
                <input
                  type="text"
                  name="name"
                  value={contactForm.name}
                  onChange={handleContactChange}
                  required
                  style={{
                    width: "100%",
                    padding: "10px 12px",
                    border: "1px solid #ddd",
                    borderRadius: 6,
                    fontSize: 14,
                  }}
                />
              </div>

              <div>
                <label
                  style={{
                    display: "block",
                    marginBottom: 8,
                    fontWeight: 500,
                    fontSize: 14,
                  }}
                >
                  Email *
                </label>
                <input
                  type="email"
                  name="email"
                  value={contactForm.email}
                  onChange={handleContactChange}
                  required
                  style={{
                    width: "100%",
                    padding: "10px 12px",
                    border: "1px solid #ddd",
                    borderRadius: 6,
                    fontSize: 14,
                  }}
                />
              </div>
            </div>

            <div style={{ marginBottom: 16 }}>
              <label
                style={{
                  display: "block",
                  marginBottom: 8,
                  fontWeight: 500,
                  fontSize: 14,
                }}
              >
                Subject *
              </label>
              <input
                type="text"
                name="subject"
                value={contactForm.subject}
                onChange={handleContactChange}
                required
                style={{
                  width: "100%",
                  padding: "10px 12px",
                  border: "1px solid #ddd",
                  borderRadius: 6,
                  fontSize: 14,
                }}
              />
            </div>

            <div style={{ marginBottom: 20 }}>
              <label
                style={{
                  display: "block",
                  marginBottom: 8,
                  fontWeight: 500,
                  fontSize: 14,
                }}
              >
                Message *
              </label>
              <textarea
                name="message"
                value={contactForm.message}
                onChange={handleContactChange}
                required
                rows={6}
                style={{
                  width: "100%",
                  padding: "10px 12px",
                  border: "1px solid #ddd",
                  borderRadius: 6,
                  fontSize: 14,
                  fontFamily: "inherit",
                  resize: "vertical",
                }}
              />
            </div>

            <button
              type="submit"
              style={{
                padding: "12px 32px",
                backgroundColor: "#007bff",
                color: "#fff",
                border: "none",
                borderRadius: 6,
                fontSize: 16,
                fontWeight: 600,
                cursor: "pointer",
              }}
            >
              Send Message
            </button>
          </form>
        </div>

        {/* Support Hours */}
        <div
          style={{
            marginTop: 48,
            padding: 24,
            backgroundColor: "#f8f8f8",
            borderRadius: 8,
            textAlign: "center",
          }}
        >
          <h3 style={{ fontSize: 20, fontWeight: 600, marginBottom: 12 }}>
            Support Hours
          </h3>
          <p style={{ fontSize: 14, color: "#666", marginBottom: 8 }}>
            Monday - Friday: 9:00 AM - 6:00 PM EST
          </p>
          <p style={{ fontSize: 14, color: "#666" }}>
            Saturday - Sunday: 10:00 AM - 4:00 PM EST
          </p>
        </div>
      </div>
    </AppLayout>
  );
}
