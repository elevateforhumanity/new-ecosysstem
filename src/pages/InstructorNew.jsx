/*
  Copyright (c) 2025 Elevate for Humanity
  Commercial License. No resale, sublicensing, or redistribution allowed.
  See LICENSE file for details.
*/
import React, { useState } from "react";
import { Link } from "react-router-dom";
import AppLayout from "../layouts/AppLayout";

export default function InstructorNew() {
  const [step, setStep] = useState(1);
  const [courseData, setCourseData] = useState({
    title: "",
    subtitle: "",
    description: "",
    category: "Technology",
    level: "Beginner",
    language: "English",
    price: "0",
  });

  const handleChange = (e) => {
    setCourseData({ ...courseData, [e.target.name]: e.target.value });
  };

  const handleNext = () => {
    if (step < 4) setStep(step + 1);
  };

  const handleBack = () => {
    if (step > 1) setStep(step - 1);
  };

  const handleCreate = () => {
    console.log("Creating course:", courseData);
  };

  const isStepValid = () => {
    switch (step) {
      case 1:
        return courseData.title.trim() !== "";
      case 2:
        return courseData.description.trim() !== "";
      case 3:
        return true;
      case 4:
        return true;
      default:
        return false;
    }
  };

  return (
    <AppLayout>
      <div style={{ maxWidth: 900, margin: "0 auto", padding: 32 }}>
        {/* Header */}
        <div style={{ marginBottom: 32 }}>
          <Link
            to="/instructor/courses"
            style={{
              fontSize: 14,
              color: "#007bff",
              textDecoration: "none",
              marginBottom: 12,
              display: "block",
            }}
          >
            ← Back to My Courses
          </Link>
          <h1 style={{ fontSize: 32, fontWeight: 700, marginBottom: 8 }}>
            Create New Course
          </h1>
          <p style={{ color: "#666", fontSize: 16 }}>
            Follow the steps to create your course
          </p>
        </div>

        {/* Progress Steps */}
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            marginBottom: 40,
            position: "relative",
          }}
        >
          {/* Progress Line */}
          <div
            style={{
              position: "absolute",
              top: 20,
              left: "12.5%",
              right: "12.5%",
              height: 2,
              backgroundColor: "#e0e0e0",
              zIndex: 0,
            }}
          >
            <div
              style={{
                height: "100%",
                backgroundColor: "#007bff",
                width: `${((step - 1) / 3) * 100}%`,
                transition: "width 0.3s",
              }}
            />
          </div>

          {[
            { num: 1, label: "Basic Info" },
            { num: 2, label: "Description" },
            { num: 3, label: "Settings" },
            { num: 4, label: "Review" },
          ].map((s) => (
            <div
              key={s.num}
              style={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                zIndex: 1,
              }}
            >
              <div
                style={{
                  width: 40,
                  height: 40,
                  borderRadius: "50%",
                  backgroundColor: step >= s.num ? "#007bff" : "#e0e0e0",
                  color: step >= s.num ? "#fff" : "#999",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontWeight: 600,
                  marginBottom: 8,
                  transition: "all 0.3s",
                }}
              >
                {s.num}
              </div>
              <div
                style={{
                  fontSize: 12,
                  color: step >= s.num ? "#007bff" : "#999",
                  fontWeight: step === s.num ? 600 : 400,
                }}
              >
                {s.label}
              </div>
            </div>
          ))}
        </div>

        {/* Step Content */}
        <div
          style={{
            backgroundColor: "#fff",
            padding: 32,
            borderRadius: 8,
            border: "1px solid #e0e0e0",
            marginBottom: 24,
          }}
        >
          {step === 1 && (
            <div>
              <h2 style={{ fontSize: 24, fontWeight: 600, marginBottom: 8 }}>
                Basic Information
              </h2>
              <p style={{ fontSize: 14, color: "#666", marginBottom: 24 }}>
                Let's start with the basics. What's your course about?
              </p>

              <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
                <div>
                  <label
                    style={{
                      display: "block",
                      marginBottom: 8,
                      fontWeight: 500,
                      fontSize: 14,
                    }}
                  >
                    Course Title *
                  </label>
                  <input
                    type="text"
                    name="title"
                    value={courseData.title}
                    onChange={handleChange}
                    placeholder="e.g., Introduction to Web Development"
                    style={{
                      width: "100%",
                      padding: "12px 14px",
                      border: "1px solid #ddd",
                      borderRadius: 6,
                      fontSize: 14,
                    }}
                  />
                  <p style={{ fontSize: 12, color: "#666", marginTop: 6 }}>
                    Choose a clear, descriptive title that tells students what they'll learn
                  </p>
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
                    Subtitle
                  </label>
                  <input
                    type="text"
                    name="subtitle"
                    value={courseData.subtitle}
                    onChange={handleChange}
                    placeholder="e.g., Learn HTML, CSS, and JavaScript from scratch"
                    style={{
                      width: "100%",
                      padding: "12px 14px",
                      border: "1px solid #ddd",
                      borderRadius: 6,
                      fontSize: 14,
                    }}
                  />
                </div>

                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns: "1fr 1fr",
                    gap: 16,
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
                      Category *
                    </label>
                    <select
                      name="category"
                      value={courseData.category}
                      onChange={handleChange}
                      style={{
                        width: "100%",
                        padding: "12px 14px",
                        border: "1px solid #ddd",
                        borderRadius: 6,
                        fontSize: 14,
                      }}
                    >
                      <option value="Technology">Technology</option>
                      <option value="Business">Business</option>
                      <option value="Design">Design</option>
                      <option value="Marketing">Marketing</option>
                      <option value="Personal Development">Personal Development</option>
                      <option value="Health & Wellness">Health & Wellness</option>
                    </select>
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
                      Level *
                    </label>
                    <select
                      name="level"
                      value={courseData.level}
                      onChange={handleChange}
                      style={{
                        width: "100%",
                        padding: "12px 14px",
                        border: "1px solid #ddd",
                        borderRadius: 6,
                        fontSize: 14,
                      }}
                    >
                      <option value="Beginner">Beginner</option>
                      <option value="Intermediate">Intermediate</option>
                      <option value="Advanced">Advanced</option>
                      <option value="All Levels">All Levels</option>
                    </select>
                  </div>
                </div>
              </div>
            </div>
          )}

          {step === 2 && (
            <div>
              <h2 style={{ fontSize: 24, fontWeight: 600, marginBottom: 8 }}>
                Course Description
              </h2>
              <p style={{ fontSize: 14, color: "#666", marginBottom: 24 }}>
                Describe what students will learn and why they should take your course
              </p>

              <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
                <div>
                  <label
                    style={{
                      display: "block",
                      marginBottom: 8,
                      fontWeight: 500,
                      fontSize: 14,
                    }}
                  >
                    Course Description *
                  </label>
                  <textarea
                    name="description"
                    value={courseData.description}
                    onChange={handleChange}
                    placeholder="Describe your course in detail. What will students learn? What skills will they gain?"
                    rows={8}
                    style={{
                      width: "100%",
                      padding: "12px 14px",
                      border: "1px solid #ddd",
                      borderRadius: 6,
                      fontSize: 14,
                      fontFamily: "inherit",
                      resize: "vertical",
                    }}
                  />
                  <p style={{ fontSize: 12, color: "#666", marginTop: 6 }}>
                    Minimum 200 characters recommended
                  </p>
                </div>

                <div
                  style={{
                    padding: 16,
                    backgroundColor: "#f0f7ff",
                    borderRadius: 6,
                    border: "1px solid #b3d9ff",
                  }}
                >
                  <h3 style={{ fontSize: 14, fontWeight: 600, marginBottom: 8, color: "#0056b3" }}>
                    💡 Tips for a great description
                  </h3>
                  <ul style={{ fontSize: 13, color: "#0056b3", margin: 0, paddingLeft: 20 }}>
                    <li>Start with what students will achieve</li>
                    <li>List key learning outcomes</li>
                    <li>Mention any prerequisites</li>
                    <li>Explain who the course is for</li>
                  </ul>
                </div>
              </div>
            </div>
          )}

          {step === 3 && (
            <div>
              <h2 style={{ fontSize: 24, fontWeight: 600, marginBottom: 8 }}>
                Course Settings
              </h2>
              <p style={{ fontSize: 14, color: "#666", marginBottom: 24 }}>
                Configure language and pricing for your course
              </p>

              <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
                <div>
                  <label
                    style={{
                      display: "block",
                      marginBottom: 8,
                      fontWeight: 500,
                      fontSize: 14,
                    }}
                  >
                    Language *
                  </label>
                  <select
                    name="language"
                    value={courseData.language}
                    onChange={handleChange}
                    style={{
                      width: "100%",
                      maxWidth: 300,
                      padding: "12px 14px",
                      border: "1px solid #ddd",
                      borderRadius: 6,
                      fontSize: 14,
                    }}
                  >
                    <option value="English">English</option>
                    <option value="Spanish">Spanish</option>
                    <option value="French">French</option>
                    <option value="German">German</option>
                    <option value="Portuguese">Portuguese</option>
                    <option value="Chinese">Chinese</option>
                  </select>
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
                    Course Price (USD)
                  </label>
                  <input
                    type="number"
                    name="price"
                    value={courseData.price}
                    onChange={handleChange}
                    step="0.01"
                    min="0"
                    style={{
                      width: "100%",
                      maxWidth: 200,
                      padding: "12px 14px",
                      border: "1px solid #ddd",
                      borderRadius: 6,
                      fontSize: 14,
                    }}
                  />
                  <p style={{ fontSize: 12, color: "#666", marginTop: 6 }}>
                    Set to 0 for a free course. You can change this later.
                  </p>
                </div>

                {parseFloat(courseData.price) > 0 && (
                  <div
                    style={{
                      padding: 16,
                      backgroundColor: "#f8f8f8",
                      borderRadius: 6,
                    }}
                  >
                    <h3 style={{ fontSize: 16, fontWeight: 600, marginBottom: 8 }}>
                      Revenue Breakdown
                    </h3>
                    <div style={{ fontSize: 14 }}>
                      <div style={{ marginBottom: 4 }}>
                        Course Price: <strong>${courseData.price}</strong>
                      </div>
                      <div style={{ marginBottom: 4 }}>
                        Your Earnings (70%): <strong>${(courseData.price * 0.7).toFixed(2)}</strong>
                      </div>
                      <div>
                        Platform Fee (30%): <strong>${(courseData.price * 0.3).toFixed(2)}</strong>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {step === 4 && (
            <div>
              <h2 style={{ fontSize: 24, fontWeight: 600, marginBottom: 8 }}>
                Review & Create
              </h2>
              <p style={{ fontSize: 14, color: "#666", marginBottom: 24 }}>
                Review your course details before creating
              </p>

              <div
                style={{
                  border: "1px solid #e0e0e0",
                  borderRadius: 6,
                  padding: 20,
                  marginBottom: 20,
                }}
              >
                <div style={{ marginBottom: 16 }}>
                  <div style={{ fontSize: 12, color: "#999", marginBottom: 4 }}>
                    Course Title
                  </div>
                  <div style={{ fontSize: 18, fontWeight: 600 }}>
                    {courseData.title || "Untitled Course"}
                  </div>
                </div>

                {courseData.subtitle && (
                  <div style={{ marginBottom: 16 }}>
                    <div style={{ fontSize: 12, color: "#999", marginBottom: 4 }}>
                      Subtitle
                    </div>
                    <div style={{ fontSize: 14 }}>{courseData.subtitle}</div>
                  </div>
                )}

                <div style={{ marginBottom: 16 }}>
                  <div style={{ fontSize: 12, color: "#999", marginBottom: 4 }}>
                    Description
                  </div>
                  <div style={{ fontSize: 14, lineHeight: 1.6 }}>
                    {courseData.description || "No description provided"}
                  </div>
                </div>

                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns: "repeat(auto-fit, minmax(150px, 1fr))",
                    gap: 16,
                    paddingTop: 16,
                    borderTop: "1px solid #f0f0f0",
                  }}
                >
                  <div>
                    <div style={{ fontSize: 12, color: "#999", marginBottom: 4 }}>
                      Category
                    </div>
                    <div style={{ fontSize: 14, fontWeight: 500 }}>
                      {courseData.category}
                    </div>
                  </div>

                  <div>
                    <div style={{ fontSize: 12, color: "#999", marginBottom: 4 }}>
                      Level
                    </div>
                    <div style={{ fontSize: 14, fontWeight: 500 }}>
                      {courseData.level}
                    </div>
                  </div>

                  <div>
                    <div style={{ fontSize: 12, color: "#999", marginBottom: 4 }}>
                      Language
                    </div>
                    <div style={{ fontSize: 14, fontWeight: 500 }}>
                      {courseData.language}
                    </div>
                  </div>

                  <div>
                    <div style={{ fontSize: 12, color: "#999", marginBottom: 4 }}>
                      Price
                    </div>
                    <div style={{ fontSize: 14, fontWeight: 500 }}>
                      {parseFloat(courseData.price) === 0 ? "Free" : `$${courseData.price}`}
                    </div>
                  </div>
                </div>
              </div>

              <div
                style={{
                  padding: 16,
                  backgroundColor: "#f0f7ff",
                  borderRadius: 6,
                  border: "1px solid #b3d9ff",
                }}
              >
                <h3 style={{ fontSize: 14, fontWeight: 600, marginBottom: 8, color: "#0056b3" }}>
                  📝 Next Steps
                </h3>
                <p style={{ fontSize: 13, color: "#0056b3", margin: 0 }}>
                  After creating your course, you'll be able to add curriculum, upload videos, 
                  create quizzes, and publish when ready.
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Navigation Buttons */}
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <button
            onClick={handleBack}
            disabled={step === 1}
            style={{
              padding: "12px 24px",
              backgroundColor: step === 1 ? "#f0f0f0" : "#fff",
              color: step === 1 ? "#999" : "#333",
              border: "1px solid #ddd",
              borderRadius: 6,
              fontSize: 14,
              fontWeight: 500,
              cursor: step === 1 ? "not-allowed" : "pointer",
            }}
          >
            ← Back
          </button>

          {step < 4 ? (
            <button
              onClick={handleNext}
              disabled={!isStepValid()}
              style={{
                padding: "12px 24px",
                backgroundColor: isStepValid() ? "#007bff" : "#ccc",
                color: "#fff",
                border: "none",
                borderRadius: 6,
                fontSize: 14,
                fontWeight: 500,
                cursor: isStepValid() ? "pointer" : "not-allowed",
              }}
            >
              Next →
            </button>
          ) : (
            <button
              onClick={handleCreate}
              style={{
                padding: "12px 32px",
                backgroundColor: "#28a745",
                color: "#fff",
                border: "none",
                borderRadius: 6,
                fontSize: 14,
                fontWeight: 600,
                cursor: "pointer",
              }}
            >
              Create Course
            </button>
          )}
        </div>
      </div>
    </AppLayout>
  );
}
