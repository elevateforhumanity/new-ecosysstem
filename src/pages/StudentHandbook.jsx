/*
  Copyright (c) 2025 Elevate for Humanity
  Commercial License. No resale, sublicensing, or redistribution allowed.
  See LICENSE file for details.
*/
import React, { useState } from "react";
import { Link } from "react-router-dom";
import AppLayout from "../layouts/AppLayout";

export default function StudentHandbook() {
  const [activeSection, setActiveSection] = useState("getting-started");

  const sections = [
    { id: "getting-started", title: "Getting Started", icon: "🚀" },
    { id: "navigation", title: "Platform Navigation", icon: "🧭" },
    { id: "courses", title: "Taking Courses", icon: "📚" },
    { id: "assessments", title: "Assessments & Quizzes", icon: "✍️" },
    { id: "certificates", title: "Certificates", icon: "🏆" },
    { id: "community", title: "Community Guidelines", icon: "👥" },
    { id: "technical", title: "Technical Requirements", icon: "💻" },
    { id: "policies", title: "Policies & Support", icon: "📋" },
  ];

  const content = {
    "getting-started": {
      title: "Getting Started",
      sections: [
        {
          heading: "Welcome to Elevate for Humanity",
          content: "Thank you for joining our learning community! This handbook will guide you through everything you need to know to make the most of your learning experience.",
        },
        {
          heading: "Creating Your Account",
          content: "To get started, click the 'Sign Up' button and provide your email address, create a password, and complete your profile. You'll receive a verification email to activate your account.",
        },
        {
          heading: "Setting Up Your Profile",
          content: "Complete your profile by adding your name, photo, bio, and learning interests. This helps us personalize your experience and connect you with relevant courses and communities.",
        },
        {
          heading: "Exploring the Platform",
          content: "Take a tour of the platform to familiarize yourself with the dashboard, course catalog, and available resources. Use the search function to find courses that match your interests.",
        },
      ],
    },
    "navigation": {
      title: "Platform Navigation",
      sections: [
        {
          heading: "Dashboard",
          content: "Your dashboard is your home base. Here you'll find your enrolled courses, progress tracking, upcoming assignments, and personalized recommendations.",
        },
        {
          heading: "Course Catalog",
          content: "Browse all available courses by category, difficulty level, or instructor. Use filters to narrow down your search and find the perfect course for your goals.",
        },
        {
          heading: "My Courses",
          content: "Access all your enrolled courses in one place. Track your progress, resume where you left off, and manage your learning schedule.",
        },
        {
          heading: "Account Settings",
          content: "Manage your profile, notification preferences, privacy settings, and payment methods. Customize your learning experience to suit your needs.",
        },
      ],
    },
    "courses": {
      title: "Taking Courses",
      sections: [
        {
          heading: "Enrolling in a Course",
          content: "Click 'Enroll Now' on any course page. Some courses are free, while others require payment. Once enrolled, you'll have immediate access to all course materials.",
        },
        {
          heading: "Course Structure",
          content: "Courses are organized into modules and lessons. Each lesson may include videos, readings, quizzes, and assignments. Complete lessons in order to track your progress.",
        },
        {
          heading: "Video Playback",
          content: "Watch course videos at your own pace. Use playback controls to adjust speed, enable subtitles, or download videos for offline viewing (where available).",
        },
        {
          heading: "Downloadable Resources",
          content: "Many courses include supplementary materials like PDFs, worksheets, and templates. Download these resources from the course materials section.",
        },
        {
          heading: "Discussion Forums",
          content: "Engage with instructors and fellow students in course discussion forums. Ask questions, share insights, and collaborate on projects.",
        },
      ],
    },
    "assessments": {
      title: "Assessments & Quizzes",
      sections: [
        {
          heading: "Types of Assessments",
          content: "Courses may include quizzes, assignments, projects, and peer reviews. Each assessment type helps reinforce your learning and measure your progress.",
        },
        {
          heading: "Taking Quizzes",
          content: "Quizzes test your understanding of course material. You may have multiple attempts, and your highest score will be recorded. Review feedback to improve your understanding.",
        },
        {
          heading: "Submitting Assignments",
          content: "Follow assignment instructions carefully and submit your work by the deadline. You'll receive feedback from instructors or peers within the specified timeframe.",
        },
        {
          heading: "Grading and Feedback",
          content: "View your grades and feedback in the course gradebook. Use instructor feedback to improve your understanding and performance in future assessments.",
        },
      ],
    },
    "certificates": {
      title: "Certificates",
      sections: [
        {
          heading: "Earning Certificates",
          content: "Complete all course requirements with a passing grade to earn a certificate of completion. Requirements vary by course and are listed on the course page.",
        },
        {
          heading: "Downloading Certificates",
          content: "Once earned, certificates are available in your account under 'My Certificates'. Download them as PDF files to share with employers or on social media.",
        },
        {
          heading: "Certificate Verification",
          content: "All certificates include a unique verification code. Employers or institutions can verify your certificate authenticity on our verification page.",
        },
        {
          heading: "Sharing Your Achievement",
          content: "Share your certificates on LinkedIn, add them to your resume, or display them in your professional portfolio. Celebrate your accomplishments!",
        },
      ],
    },
    "community": {
      title: "Community Guidelines",
      sections: [
        {
          heading: "Code of Conduct",
          content: "Treat all community members with respect and kindness. Harassment, discrimination, or inappropriate behavior will not be tolerated.",
        },
        {
          heading: "Discussion Etiquette",
          content: "Stay on topic, be constructive in your feedback, and help create a positive learning environment. Avoid spam, self-promotion, or off-topic posts.",
        },
        {
          heading: "Academic Integrity",
          content: "Complete all work honestly and independently unless collaboration is explicitly allowed. Plagiarism or cheating will result in course removal.",
        },
        {
          heading: "Reporting Issues",
          content: "If you encounter inappropriate behavior or technical issues, report them to our support team immediately. We're here to help maintain a safe learning environment.",
        },
      ],
    },
    "technical": {
      title: "Technical Requirements",
      sections: [
        {
          heading: "Supported Browsers",
          content: "We support the latest versions of Chrome, Firefox, Safari, and Edge. For the best experience, keep your browser updated to the latest version.",
        },
        {
          heading: "Internet Connection",
          content: "A stable internet connection is required for video streaming. We recommend a minimum speed of 5 Mbps for HD video playback.",
        },
        {
          heading: "Device Compatibility",
          content: "Access courses on desktop, laptop, tablet, or mobile devices. Our platform is fully responsive and optimized for all screen sizes.",
        },
        {
          heading: "Accessibility Features",
          content: "We're committed to accessibility. Features include keyboard navigation, screen reader support, closed captions, and adjustable text sizes.",
        },
        {
          heading: "Troubleshooting",
          content: "If you experience technical issues, try clearing your browser cache, disabling browser extensions, or switching browsers. Contact support if problems persist.",
        },
      ],
    },
    "policies": {
      title: "Policies & Support",
      sections: [
        {
          heading: "Privacy Policy",
          content: "We take your privacy seriously. Review our privacy policy to understand how we collect, use, and protect your personal information.",
        },
        {
          heading: "Terms of Service",
          content: "By using our platform, you agree to our terms of service. These terms outline your rights and responsibilities as a user.",
        },
        {
          heading: "Refund Policy",
          content: "We offer a 30-day money-back guarantee for all paid courses. If you're not satisfied, contact us within 30 days of purchase for a full refund.",
        },
        {
          heading: "Getting Help",
          content: "Need assistance? Visit our Support Center, browse FAQs, or contact our support team via email or live chat. We're here to help!",
        },
      ],
    },
  };

  return (
    <AppLayout>
      <div style={{ display: "flex", maxWidth: 1400, margin: "0 auto" }}>
        {/* Sidebar Navigation */}
        <div
          style={{
            width: 280,
            padding: 32,
            borderRight: "1px solid #e0e0e0",
            position: "sticky",
            top: 0,
            height: "100vh",
            overflowY: "auto",
          }}
        >
          <h2 style={{ fontSize: 20, fontWeight: 700, marginBottom: 24 }}>
            Student Handbook
          </h2>
          <nav>
            {sections.map((section) => (
              <button
                key={section.id}
                onClick={() => setActiveSection(section.id)}
                style={{
                  width: "100%",
                  padding: "12px 16px",
                  marginBottom: 8,
                  backgroundColor: activeSection === section.id ? "#f0f7ff" : "transparent",
                  color: activeSection === section.id ? "#007bff" : "#333",
                  border: "none",
                  borderRadius: 6,
                  fontSize: 14,
                  fontWeight: activeSection === section.id ? 600 : 400,
                  cursor: "pointer",
                  textAlign: "left",
                  display: "flex",
                  alignItems: "center",
                  gap: 12,
                  transition: "all 0.2s",
                }}
                onMouseEnter={(e) => {
                  if (activeSection !== section.id) {
                    e.target.style.backgroundColor = "#f8f8f8";
                  }
                }}
                onMouseLeave={(e) => {
                  if (activeSection !== section.id) {
                    e.target.style.backgroundColor = "transparent";
                  }
                }}
              >
                <span style={{ fontSize: 20 }}>{section.icon}</span>
                {section.title}
              </button>
            ))}
          </nav>

          {/* Quick Links */}
          <div
            style={{
              marginTop: 32,
              paddingTop: 24,
              borderTop: "1px solid #e0e0e0",
            }}
          >
            <h3 style={{ fontSize: 14, fontWeight: 600, marginBottom: 16, color: "#666" }}>
              Quick Links
            </h3>
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              <Link
                to="/support"
                style={{
                  fontSize: 14,
                  color: "#007bff",
                  textDecoration: "none",
                }}
              >
                Support Center
              </Link>
              <Link
                to="/courses"
                style={{
                  fontSize: 14,
                  color: "#007bff",
                  textDecoration: "none",
                }}
              >
                Course Catalog
              </Link>
              <Link
                to="/certificates"
                style={{
                  fontSize: 14,
                  color: "#007bff",
                  textDecoration: "none",
                }}
              >
                My Certificates
              </Link>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div style={{ flex: 1, padding: 48 }}>
          <div style={{ maxWidth: 800 }}>
            {/* Header */}
            <div style={{ marginBottom: 40 }}>
              <div style={{ fontSize: 48, marginBottom: 16 }}>
                {sections.find((s) => s.id === activeSection)?.icon}
              </div>
              <h1 style={{ fontSize: 32, fontWeight: 700, marginBottom: 12 }}>
                {content[activeSection].title}
              </h1>
            </div>

            {/* Content Sections */}
            <div style={{ display: "flex", flexDirection: "column", gap: 32 }}>
              {content[activeSection].sections.map((section, index) => (
                <div key={index}>
                  <h2
                    style={{
                      fontSize: 20,
                      fontWeight: 600,
                      marginBottom: 12,
                      color: "#333",
                    }}
                  >
                    {section.heading}
                  </h2>
                  <p
                    style={{
                      fontSize: 16,
                      lineHeight: 1.7,
                      color: "#666",
                    }}
                  >
                    {section.content}
                  </p>
                </div>
              ))}
            </div>

            {/* Help CTA */}
            <div
              style={{
                marginTop: 48,
                padding: 24,
                backgroundColor: "#f8f8f8",
                borderRadius: 8,
                textAlign: "center",
              }}
            >
              <h3 style={{ fontSize: 18, fontWeight: 600, marginBottom: 8 }}>
                Still have questions?
              </h3>
              <p style={{ fontSize: 14, color: "#666", marginBottom: 16 }}>
                Our support team is here to help you succeed.
              </p>
              <Link
                to="/support"
                style={{
                  display: "inline-block",
                  padding: "10px 24px",
                  backgroundColor: "#007bff",
                  color: "#fff",
                  borderRadius: 6,
                  fontSize: 14,
                  fontWeight: 600,
                  textDecoration: "none",
                }}
              >
                Contact Support
              </Link>
            </div>

            {/* Download Handbook */}
            <div
              style={{
                marginTop: 24,
                padding: 20,
                border: "1px solid #e0e0e0",
                borderRadius: 8,
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
              }}
            >
              <div>
                <h4 style={{ fontSize: 16, fontWeight: 600, marginBottom: 4 }}>
                  Download PDF Version
                </h4>
                <p style={{ fontSize: 14, color: "#666" }}>
                  Take the handbook with you for offline reference
                </p>
              </div>
              <a
                href="/student-handbook.pdf"
                download
                style={{
                  padding: "10px 20px",
                  backgroundColor: "#fff",
                  color: "#007bff",
                  border: "1px solid #007bff",
                  borderRadius: 6,
                  fontSize: 14,
                  fontWeight: 600,
                  textDecoration: "none",
                  whiteSpace: "nowrap",
                }}
              >
                Download PDF
              </a>
            </div>
          </div>
        </div>
      </div>
    </AppLayout>
  );
}
