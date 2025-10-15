/*
  Copyright (c) 2025 Elevate for Humanity
  Commercial License. No resale, sublicensing, or redistribution allowed.
  See LICENSE file for details.
*/
import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import AppLayout from "../layouts/AppLayout";
import { supabase } from "../lib/supabase";

export default function Certificates() {
  const [filter, setFilter] = useState("all");
  const [certificates, setCertificates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 12,
    total: 0,
    totalPages: 0
  });
  const [selectedCertificate, setSelectedCertificate] = useState(null);

  useEffect(() => {
    fetchCertificates();
  }, [pagination.page]);

  const fetchCertificates = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) {
        window.location.href = '/login';
        return;
      }

      const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:3001';
      const response = await fetch(
        `${apiUrl}/api/v1/certificates?page=${pagination.page}&limit=${pagination.limit}`,
        {
          headers: {
            'Authorization': `Bearer ${session.access_token}`,
            'Content-Type': 'application/json'
          }
        }
      );

      if (!response.ok) {
        throw new Error('Failed to fetch certificates');
      }

      const result = await response.json();
      
      if (result.success) {
        setCertificates(result.data || []);
        setPagination(result.pagination);
      } else {
        throw new Error(result.error || 'Failed to fetch certificates');
      }
    } catch (err) {
      console.error('Error fetching certificates:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const downloadCertificate = async (certificate) => {
    // In production, this would generate/download a PDF
    alert(`Downloading certificate: ${certificate.certificate_number}`);
  };

  const shareCertificate = async (certificate) => {
    const shareUrl = `${window.location.origin}/certificates/${certificate.id}`;
    
    if (navigator.share) {
      try {
        await navigator.share({
          title: `Certificate - ${certificate.courses.title}`,
          text: `I earned a certificate for completing ${certificate.courses.title}!`,
          url: shareUrl
        });
      } catch (error) {
        console.log('Error sharing:', error);
      }
    } else {
      // Fallback: copy to clipboard
      navigator.clipboard.writeText(shareUrl);
      alert('Certificate link copied to clipboard!');
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const filteredCertificates = certificates;
  const issuedCount = certificates.length;
  const inProgressCount = 0;

  if (loading) {
    return (
      <AppLayout>
        <div style={{ maxWidth: 1200, margin: "0 auto", padding: 32, textAlign: 'center' }}>
          <div style={{ fontSize: 18, color: '#666' }}>Loading certificates...</div>
        </div>
      </AppLayout>
    );
  }

  if (error) {
    return (
      <AppLayout>
        <div style={{ maxWidth: 1200, margin: "0 auto", padding: 32 }}>
          <div style={{ 
            backgroundColor: '#fee', 
            padding: 20, 
            borderRadius: 8, 
            border: '1px solid #fcc',
            color: '#c00'
          }}>
            Error: {error}
          </div>
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <div style={{ maxWidth: 1200, margin: "0 auto", padding: 32 }}>
        {/* Header */}
        <div style={{ marginBottom: 32 }}>
          <h1 style={{ fontSize: 32, fontWeight: 700, marginBottom: 8 }}>
            My Certificates
          </h1>
          <p style={{ color: "#666", fontSize: 16 }}>
            View, download, and share your earned certificates
          </p>
        </div>

        {/* Stats */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
            gap: 20,
            marginBottom: 32,
          }}
        >
          <div
            style={{
              backgroundColor: "#fff",
              padding: 24,
              borderRadius: 8,
              border: "1px solid #e0e0e0",
            }}
          >
            <div style={{ fontSize: 32, fontWeight: 700, color: "#007bff", marginBottom: 8 }}>
              {issuedCount}
            </div>
            <div style={{ fontSize: 14, color: "#666" }}>Certificates Earned</div>
          </div>

          <div
            style={{
              backgroundColor: "#fff",
              padding: 24,
              borderRadius: 8,
              border: "1px solid #e0e0e0",
            }}
          >
            <div style={{ fontSize: 32, fontWeight: 700, color: "#28a745", marginBottom: 8 }}>
              {inProgressCount}
            </div>
            <div style={{ fontSize: 14, color: "#666" }}>In Progress</div>
          </div>

          <div
            style={{
              backgroundColor: "#fff",
              padding: 24,
              borderRadius: 8,
              border: "1px solid #e0e0e0",
            }}
          >
            <div style={{ fontSize: 32, fontWeight: 700, color: "#ffc107", marginBottom: 8 }}>
              {certificates.reduce((acc, cert) => acc + (cert.skills?.length || 0), 0)}
            </div>
            <div style={{ fontSize: 14, color: "#666" }}>Skills Acquired</div>
          </div>
        </div>

        {/* Filter Tabs */}
        <div
          style={{
            display: "flex",
            gap: 12,
            marginBottom: 24,
            borderBottom: "2px solid #e0e0e0",
          }}
        >
          <button
            onClick={() => setFilter("all")}
            style={{
              padding: "12px 24px",
              backgroundColor: "transparent",
              color: filter === "all" ? "#007bff" : "#666",
              border: "none",
              borderBottom: filter === "all" ? "2px solid #007bff" : "2px solid transparent",
              fontSize: 14,
              fontWeight: 600,
              cursor: "pointer",
              marginBottom: -2,
            }}
          >
            All ({certificates.length})
          </button>
          <button
            onClick={() => setFilter("issued")}
            style={{
              padding: "12px 24px",
              backgroundColor: "transparent",
              color: filter === "issued" ? "#007bff" : "#666",
              border: "none",
              borderBottom: filter === "issued" ? "2px solid #007bff" : "2px solid transparent",
              fontSize: 14,
              fontWeight: 600,
              cursor: "pointer",
              marginBottom: -2,
            }}
          >
            Issued ({issuedCount})
          </button>
          <button
            onClick={() => setFilter("in-progress")}
            style={{
              padding: "12px 24px",
              backgroundColor: "transparent",
              color: filter === "in-progress" ? "#007bff" : "#666",
              border: "none",
              borderBottom: filter === "in-progress" ? "2px solid #007bff" : "2px solid transparent",
              fontSize: 14,
              fontWeight: 600,
              cursor: "pointer",
              marginBottom: -2,
            }}
          >
            In Progress ({inProgressCount})
          </button>
        </div>

        {/* Certificates List */}
        <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
          {filteredCertificates.map((cert) => (
            <div
              key={cert.id}
              style={{
                backgroundColor: "#fff",
                border: "1px solid #e0e0e0",
                borderRadius: 8,
                padding: 24,
                transition: "box-shadow 0.2s",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.boxShadow = "0 4px 12px rgba(0, 0, 0, 0.1)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.boxShadow = "none";
              }}
            >
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                <div style={{ flex: 1 }}>
                  {/* Course Name & Status */}
                  <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 8 }}>
                    <h3 style={{ fontSize: 20, fontWeight: 600, margin: 0 }}>
                      {cert.courses?.title || 'Unknown Course'}
                    </h3>
                    <span
                      style={{
                        padding: "4px 12px",
                        backgroundColor: "#d4edda",
                        color: "#155724",
                        borderRadius: 12,
                        fontSize: 12,
                        fontWeight: 500,
                      }}
                    >
                      Issued
                    </span>
                  </div>

                  {/* Description */}
                  <p style={{ fontSize: 14, color: "#666", marginBottom: 12 }}>
                    {cert.courses?.description || ''}
                  </p>

                  {/* Details Grid */}
                  <div
                    style={{
                      display: "grid",
                      gridTemplateColumns: "repeat(auto-fit, minmax(150px, 1fr))",
                      gap: 16,
                      marginBottom: 16,
                    }}
                  >
                    <div>
                      <div style={{ fontSize: 12, color: "#999", marginBottom: 4 }}>
                        Issue Date
                      </div>
                      <div style={{ fontSize: 14, fontWeight: 500 }}>
                        {formatDate(cert.issued_at)}
                      </div>
                    </div>

                    <div>
                      <div style={{ fontSize: 12, color: "#999", marginBottom: 4 }}>
                        Certificate ID
                      </div>
                      <div style={{ fontSize: 14, fontWeight: 500, fontFamily: "monospace" }}>
                        {cert.certificate_number}
                      </div>
                    </div>

                    {cert.expires_at && (
                      <div>
                        <div style={{ fontSize: 12, color: "#999", marginBottom: 4 }}>
                          Expires
                        </div>
                        <div style={{ fontSize: 14, fontWeight: 500 }}>
                          {formatDate(cert.expires_at)}
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Skills - removed as not in API response */}
                  {false && (
                    <div>
                      <div style={{ fontSize: 12, color: "#999", marginBottom: 8 }}>
                        Skills Covered
                      </div>
                      <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                        {cert.skills.map((skill, index) => (
                          <span
                            key={index}
                            style={{
                              padding: "4px 12px",
                              backgroundColor: "#f0f0f0",
                              borderRadius: 12,
                              fontSize: 12,
                              color: "#333",
                            }}
                          >
                            {skill}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                {/* Certificate Preview */}
                <div
                  style={{
                    width: 120,
                    height: 90,
                    backgroundColor: cert.status === "issued" ? "#f8f8f8" : "#e0e0e0",
                    borderRadius: 4,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    marginLeft: 24,
                    border: "1px solid #ddd",
                  }}
                >
                  <span style={{ fontSize: 32 }}>
                    {cert.status === "issued" ? "🏆" : "⏳"}
                  </span>
                </div>
              </div>

              {/* Actions */}
              <div
                style={{
                  display: "flex",
                  gap: 12,
                  marginTop: 20,
                  paddingTop: 20,
                  borderTop: "1px solid #f0f0f0",
                }}
              >
                <button
                  onClick={() => downloadCertificate(cert)}
                  style={{
                    padding: "8px 20px",
                    backgroundColor: "#007bff",
                    color: "#fff",
                    border: "none",
                    borderRadius: 6,
                    fontSize: 14,
                    fontWeight: 500,
                    cursor: "pointer",
                  }}
                >
                  Download PDF
                </button>
                <button
                  onClick={() => shareCertificate(cert)}
                  style={{
                    padding: "8px 20px",
                    backgroundColor: "#fff",
                    color: "#007bff",
                    border: "1px solid #007bff",
                    borderRadius: 6,
                    fontSize: 14,
                    fontWeight: 500,
                    cursor: "pointer",
                  }}
                >
                  Share
                </button>
                <Link
                  to={`/verify-certificate?id=${cert.id}`}
                  style={{
                    padding: "8px 20px",
                    backgroundColor: "#fff",
                    color: "#666",
                    border: "1px solid #ddd",
                    borderRadius: 6,
                    fontSize: 14,
                    fontWeight: 500,
                    cursor: "pointer",
                    textDecoration: 'none',
                    display: 'inline-block'
                  }}
                >
                  Verify Certificate
                </Link>
              </div>

              {false && (
                <div
                  style={{
                    marginTop: 20,
                    paddingTop: 20,
                    borderTop: "1px solid #f0f0f0",
                  }}
                >
                  <Link
                    to={`/course/${cert.id}`}
                    style={{
                      display: "inline-block",
                      padding: "8px 20px",
                      backgroundColor: "#28a745",
                      color: "#fff",
                      border: "none",
                      borderRadius: 6,
                      fontSize: 14,
                      fontWeight: 500,
                      textDecoration: "none",
                    }}
                  >
                    Continue Course
                  </Link>
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Pagination */}
        {pagination.totalPages > 1 && (
          <div style={{ 
            display: 'flex', 
            justifyContent: 'center', 
            alignItems: 'center',
            gap: 12,
            marginTop: 32 
          }}>
            <button
              onClick={() => setPagination(prev => ({ ...prev, page: prev.page - 1 }))}
              disabled={pagination.page === 1}
              style={{
                padding: "8px 16px",
                backgroundColor: pagination.page === 1 ? "#f0f0f0" : "#007bff",
                color: pagination.page === 1 ? "#999" : "#fff",
                border: "none",
                borderRadius: 6,
                fontSize: 14,
                fontWeight: 500,
                cursor: pagination.page === 1 ? "not-allowed" : "pointer",
              }}
            >
              Previous
            </button>
            <span style={{ fontSize: 14, color: '#666' }}>
              Page {pagination.page} of {pagination.totalPages}
            </span>
            <button
              onClick={() => setPagination(prev => ({ ...prev, page: prev.page + 1 }))}
              disabled={pagination.page === pagination.totalPages}
              style={{
                padding: "8px 16px",
                backgroundColor: pagination.page === pagination.totalPages ? "#f0f0f0" : "#007bff",
                color: pagination.page === pagination.totalPages ? "#999" : "#fff",
                border: "none",
                borderRadius: 6,
                fontSize: 14,
                fontWeight: 500,
                cursor: pagination.page === pagination.totalPages ? "not-allowed" : "pointer",
              }}
            >
              Next
            </button>
          </div>
        )}

        {filteredCertificates.length === 0 && (
          <div
            style={{
              textAlign: "center",
              padding: 48,
              backgroundColor: "#f8f8f8",
              borderRadius: 8,
            }}
          >
            <div style={{ fontSize: 48, marginBottom: 16 }}>📜</div>
            <h3 style={{ fontSize: 20, fontWeight: 600, marginBottom: 8 }}>
              No certificates yet
            </h3>
            <p style={{ fontSize: 14, color: "#666", marginBottom: 24 }}>
              Complete courses to earn certificates and showcase your skills
            </p>
            <Link
              to="/lms"
              style={{
                display: "inline-block",
                padding: "12px 24px",
                backgroundColor: "#007bff",
                color: "#fff",
                borderRadius: 6,
                fontSize: 14,
                fontWeight: 600,
                textDecoration: "none",
              }}
            >
              Browse Courses
            </Link>
          </div>
        )}

        {/* Certificate Verification Info */}
        <div
          style={{
            marginTop: 48,
            padding: 24,
            backgroundColor: "#f8f8f8",
            borderRadius: 8,
          }}
        >
          <h3 style={{ fontSize: 18, fontWeight: 600, marginBottom: 12 }}>
            Certificate Verification
          </h3>
          <p style={{ fontSize: 14, color: "#666", marginBottom: 16, lineHeight: 1.6 }}>
            All certificates include a unique verification code. Employers or institutions can verify the authenticity of your certificate by entering the certificate ID on our verification page.
          </p>
          <Link
            to="/verify-certificate"
            style={{
              color: "#007bff",
              textDecoration: "none",
              fontSize: 14,
              fontWeight: 500,
            }}
          >
            Verify a Certificate →
          </Link>
        </div>
      </div>
    </AppLayout>
  );
}
