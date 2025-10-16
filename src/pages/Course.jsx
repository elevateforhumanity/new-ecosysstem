/*
  Copyright (c) 2025 Elevate for Humanity
  Commercial License. No resale, sublicensing, or redistribution allowed.
  See LICENSE file for details.
*/
import React, { useState } from "react";
import { Link } from "react-router-dom";
import AppLayout from "../layouts/AppLayout";

export default function Course() {
  const [activeLesson, setActiveLesson] = useState(1);
  const [completedLessons, setCompletedLessons] = useState([]);
  const [showNotes, setShowNotes] = useState(false);
  const [notes, setNotes] = useState("");

  const course = {
    id: 1,
    title: "Introduction to Web Development",
    instructor: "Dr. Sarah Johnson",
    progress: 45,
    modules: [
      {
        id: 1,
        title: "Getting Started",
        lessons: [
          { id: 1, title: "Welcome to the Course", duration: "5:30", type: "video" },
          { id: 2, title: "Setting Up Your Environment", duration: "12:45", type: "video" },
          { id: 3, title: "Course Resources", duration: "3:20", type: "reading" },
        ],
      },
      {
        id: 2,
        title: "HTML Fundamentals",
        lessons: [
          { id: 4, title: "HTML Basics", duration: "15:20", type: "video" },
          { id: 5, title: "HTML Elements", duration: "18:30", type: "video" },
          { id: 6, title: "HTML Quiz", duration: "10 questions", type: "quiz" },
        ],
      },
      {
        id: 3,
        title: "CSS Styling",
        lessons: [
          { id: 7, title: "CSS Introduction", duration: "14:15", type: "video" },
          { id: 8, title: "CSS Selectors", duration: "16:40", type: "video" },
          { id: 9, title: "Flexbox Layout", duration: "20:10", type: "video" },
          { id: 10, title: "CSS Project", duration: "Assignment", type: "assignment" },
        ],
      },
    ],
  };

  const currentLesson = course.modules
    .flatMap((m) => m.lessons)
    .find((l) => l.id === activeLesson);

  const toggleComplete = (lessonId) => {
    if (completedLessons.includes(lessonId)) {
      setCompletedLessons(completedLessons.filter((id) => id !== lessonId));
    } else {
      setCompletedLessons([...completedLessons, lessonId]);
    }
  };

  const getLessonIcon = (type) => {
    switch (type) {
      case "video":
        return "▶️";
      case "reading":
        return "📄";
      case "quiz":
        return "✍️";
      case "assignment":
        return "📝";
      default:
        return "📚";
    }
  };

  return (
    <AppLayout>
      <div style={{ display: "flex", height: "calc(100vh - 60px)" }}>
        {/* Sidebar - Course Content */}
        <div
          style={{
            width: 320,
            borderRight: "1px solid #e0e0e0",
            overflowY: "auto",
            backgroundColor: "#f8f8f8",
          }}
        >
          {/* Course Header */}
          <div style={{ padding: 20, borderBottom: "1px solid #e0e0e0", backgroundColor: "#fff" }}>
            <Link
              to="/courses"
              style={{
                fontSize: 14,
                color: "#007bff",
                textDecoration: "none",
                marginBottom: 12,
                display: "block",
              }}
            >
              ← Back to Courses
            </Link>
            <h2 style={{ fontSize: 18, fontWeight: 600, marginBottom: 8 }}>
              {course.title}
            </h2>
            <p style={{ fontSize: 13, color: "#666", marginBottom: 12 }}>
              {course.instructor}
            </p>
            <div>
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6 }}>
                <span style={{ fontSize: 12, color: "#666" }}>Course Progress</span>
                <span style={{ fontSize: 12, fontWeight: 600 }}>{course.progress}%</span>
              </div>
              <div
                style={{
                  width: "100%",
                  height: 6,
                  backgroundColor: "#e0e0e0",
                  borderRadius: 3,
                  overflow: "hidden",
                }}
              >
                <div
                  style={{
                    width: `${course.progress}%`,
                    height: "100%",
                    backgroundColor: "#28a745",
                  }}
                />
              </div>
            </div>
          </div>

          {/* Modules & Lessons */}
          <div>
            {course.modules.map((module) => (
              <div key={module.id} style={{ marginBottom: 8 }}>
                <div
                  style={{
                    padding: "12px 20px",
                    backgroundColor: "#fff",
                    borderBottom: "1px solid #e0e0e0",
                    fontWeight: 600,
                    fontSize: 14,
                  }}
                >
                  {module.title}
                </div>
                {module.lessons.map((lesson) => (
                  <div
                    key={lesson.id}
                    onClick={() => setActiveLesson(lesson.id)}
                    style={{
                      padding: "12px 20px",
                      backgroundColor: activeLesson === lesson.id ? "#e3f2fd" : "#fff",
                      borderBottom: "1px solid #f0f0f0",
                      cursor: "pointer",
                      display: "flex",
                      alignItems: "center",
                      gap: 12,
                      transition: "background-color 0.2s",
                    }}
                    onMouseEnter={(e) => {
                      if (activeLesson !== lesson.id) {
                        e.currentTarget.style.backgroundColor = "#f8f8f8";
                      }
                    }}
                    onMouseLeave={(e) => {
                      if (activeLesson !== lesson.id) {
                        e.currentTarget.style.backgroundColor = "#fff";
                      }
                    }}
                  >
                    <input
                      type="checkbox"
                      checked={completedLessons.includes(lesson.id)}
                      onChange={() => toggleComplete(lesson.id)}
                      onClick={(e) => e.stopPropagation()}
                      style={{ cursor: "pointer" }}
                    />
                    <span style={{ fontSize: 16 }}>{getLessonIcon(lesson.type)}</span>
                    <div style={{ flex: 1 }}>
                      <div
                        style={{
                          fontSize: 13,
                          fontWeight: activeLesson === lesson.id ? 600 : 400,
                          marginBottom: 2,
                        }}
                      >
                        {lesson.title}
                      </div>
                      <div style={{ fontSize: 11, color: "#999" }}>{lesson.duration}</div>
                    </div>
                  </div>
                ))}
              </div>
            ))}
          </div>
        </div>

        {/* Main Content Area */}
        <div style={{ flex: 1, display: "flex", flexDirection: "column" }}>
          {/* Video/Content Player */}
          <div
            style={{
              backgroundColor: "#000",
              aspectRatio: "16/9",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              position: "relative",
            }}
          >
            {currentLesson?.type === "video" ? (
              <div style={{ textAlign: "center", color: "#fff" }}>
                <div style={{ fontSize: 64, marginBottom: 16 }}>▶️</div>
                <div style={{ fontSize: 18 }}>Video Player</div>
                <div style={{ fontSize: 14, opacity: 0.7, marginTop: 8 }}>
                  {currentLesson.title}
                </div>
              </div>
            ) : currentLesson?.type === "reading" ? (
              <div style={{ textAlign: "center", color: "#fff" }}>
                <div style={{ fontSize: 64, marginBottom: 16 }}>📄</div>
                <div style={{ fontSize: 18 }}>Reading Material</div>
              </div>
            ) : currentLesson?.type === "quiz" ? (
              <div style={{ textAlign: "center", color: "#fff" }}>
                <div style={{ fontSize: 64, marginBottom: 16 }}>✍️</div>
                <div style={{ fontSize: 18 }}>Quiz</div>
              </div>
            ) : (
              <div style={{ textAlign: "center", color: "#fff" }}>
                <div style={{ fontSize: 64, marginBottom: 16 }}>📝</div>
                <div style={{ fontSize: 18 }}>Assignment</div>
              </div>
            )}
          </div>

          {/* Lesson Info & Tabs */}
          <div style={{ flex: 1, overflowY: "auto", backgroundColor: "#fff" }}>
            <div style={{ padding: 24 }}>
              {/* Lesson Title */}
              <h1 style={{ fontSize: 24, fontWeight: 700, marginBottom: 8 }}>
                {currentLesson?.title}
              </h1>
              <p style={{ fontSize: 14, color: "#666", marginBottom: 24 }}>
                Duration: {currentLesson?.duration}
              </p>

              {/* Tabs */}
              <div
                style={{
                  display: "flex",
                  gap: 24,
                  borderBottom: "2px solid #e0e0e0",
                  marginBottom: 24,
                }}
              >
                <button
                  onClick={() => setShowNotes(false)}
                  style={{
                    padding: "12px 0",
                    backgroundColor: "transparent",
                    color: !showNotes ? "#007bff" : "#666",
                    border: "none",
                    borderBottom: !showNotes ? "2px solid #007bff" : "2px solid transparent",
                    fontSize: 14,
                    fontWeight: 600,
                    cursor: "pointer",
                    marginBottom: -2,
                  }}
                >
                  Overview
                </button>
                <button
                  onClick={() => setShowNotes(true)}
                  style={{
                    padding: "12px 0",
                    backgroundColor: "transparent",
                    color: showNotes ? "#007bff" : "#666",
                    border: "none",
                    borderBottom: showNotes ? "2px solid #007bff" : "2px solid transparent",
                    fontSize: 14,
                    fontWeight: 600,
                    cursor: "pointer",
                    marginBottom: -2,
                  }}
                >
                  Notes
                </button>
              </div>

              {/* Tab Content */}
              {!showNotes ? (
                <div>
                  <h3 style={{ fontSize: 18, fontWeight: 600, marginBottom: 12 }}>
                    Lesson Overview
                  </h3>
                  <p style={{ fontSize: 14, color: "#666", lineHeight: 1.7, marginBottom: 20 }}>
                    This lesson covers the fundamentals of {currentLesson?.title.toLowerCase()}. 
                    You'll learn key concepts, best practices, and practical applications that you 
                    can immediately apply to your projects.
                  </p>

                  <h3 style={{ fontSize: 18, fontWeight: 600, marginBottom: 12 }}>
                    Learning Objectives
                  </h3>
                  <ul style={{ fontSize: 14, color: "#666", lineHeight: 1.7, marginBottom: 20 }}>
                    <li>Understand core concepts and terminology</li>
                    <li>Apply techniques to real-world scenarios</li>
                    <li>Build practical skills through hands-on practice</li>
                    <li>Prepare for the next lesson in the series</li>
                  </ul>

                  <h3 style={{ fontSize: 18, fontWeight: 600, marginBottom: 12 }}>
                    Resources
                  </h3>
                  <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                    <a
                      href="#"
                      style={{
                        padding: 12,
                        backgroundColor: "#f8f8f8",
                        borderRadius: 6,
                        textDecoration: "none",
                        color: "#333",
                        display: "flex",
                        alignItems: "center",
                        gap: 12,
                      }}
                    >
                      <span>📄</span>
                      <span style={{ fontSize: 14 }}>Lesson Slides (PDF)</span>
                    </a>
                    <a
                      href="#"
                      style={{
                        padding: 12,
                        backgroundColor: "#f8f8f8",
                        borderRadius: 6,
                        textDecoration: "none",
                        color: "#333",
                        display: "flex",
                        alignItems: "center",
                        gap: 12,
                      }}
                    >
                      <span>💻</span>
                      <span style={{ fontSize: 14 }}>Code Examples (ZIP)</span>
                    </a>
                    <a
                      href="#"
                      style={{
                        padding: 12,
                        backgroundColor: "#f8f8f8",
                        borderRadius: 6,
                        textDecoration: "none",
                        color: "#333",
                        display: "flex",
                        alignItems: "center",
                        gap: 12,
                      }}
                    >
                      <span>📝</span>
                      <span style={{ fontSize: 14 }}>Practice Exercises</span>
                    </a>
                  </div>
                </div>
              ) : (
                <div>
                  <h3 style={{ fontSize: 18, fontWeight: 600, marginBottom: 12 }}>
                    My Notes
                  </h3>
                  <p style={{ fontSize: 14, color: "#666", marginBottom: 16 }}>
                    Take notes while watching the lesson. Your notes are automatically saved.
                  </p>
                  <textarea
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    placeholder="Start typing your notes here..."
                    style={{
                      width: "100%",
                      minHeight: 300,
                      padding: 12,
                      border: "1px solid #ddd",
                      borderRadius: 6,
                      fontSize: 14,
                      fontFamily: "inherit",
                      resize: "vertical",
                    }}
                  />
                  <button
                    style={{
                      marginTop: 12,
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
                    Save Notes
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Bottom Navigation */}
          <div
            style={{
              padding: 20,
              borderTop: "1px solid #e0e0e0",
              backgroundColor: "#fff",
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
            }}
          >
            <button
              disabled={activeLesson === 1}
              style={{
                padding: "10px 24px",
                backgroundColor: activeLesson === 1 ? "#f0f0f0" : "#fff",
                color: activeLesson === 1 ? "#999" : "#007bff",
                border: "1px solid #ddd",
                borderRadius: 6,
                fontSize: 14,
                fontWeight: 500,
                cursor: activeLesson === 1 ? "not-allowed" : "pointer",
              }}
              onClick={() => activeLesson > 1 && setActiveLesson(activeLesson - 1)}
            >
              ← Previous Lesson
            </button>

            <button
              style={{
                padding: "10px 24px",
                backgroundColor: completedLessons.includes(activeLesson) ? "#28a745" : "#007bff",
                color: "#fff",
                border: "none",
                borderRadius: 6,
                fontSize: 14,
                fontWeight: 500,
                cursor: "pointer",
              }}
              onClick={() => toggleComplete(activeLesson)}
            >
              {completedLessons.includes(activeLesson) ? "✓ Completed" : "Mark as Complete"}
            </button>

            <button
              style={{
                padding: "10px 24px",
                backgroundColor: "#007bff",
                color: "#fff",
                border: "none",
                borderRadius: 6,
                fontSize: 14,
                fontWeight: 500,
                cursor: "pointer",
              }}
              onClick={() => setActiveLesson(activeLesson + 1)}
            >
              Next Lesson →
            </button>
          </div>
        </div>
      </div>
    </AppLayout>
  );
}
