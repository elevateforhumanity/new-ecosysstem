/*
  Copyright (c) 2025 Elevate for Humanity
  Commercial License. No resale, sublicensing, or redistribution allowed.
  See LICENSE file for details.
*/
import React, { useState } from "react";
import { Link } from "react-router-dom";
import AppLayout from "../layouts/AppLayout";

export default function InstructorEdit() {
  const [activeTab, setActiveTab] = useState("details");
  const [saved, setSaved] = useState(false);

  const [courseData, setCourseData] = useState({
    title: "Introduction to Web Development",
    subtitle: "Learn HTML, CSS, and JavaScript from scratch",
    description: "This comprehensive course covers the fundamentals of web development...",
    category: "Technology",
    level: "Beginner",
    language: "English",
    price: "49.99",
    thumbnail: "",
    videoIntro: "",
    published: true,
  });

  const [modules, setModules] = useState([
    {
      id: 1,
      title: "Getting Started",
      lessons: [
        { id: 1, title: "Welcome to the Course", type: "video", duration: "5:30" },
        { id: 2, title: "Setting Up Your Environment", type: "video", duration: "12:45" },
      ],
    },
    {
      id: 2,
      title: "HTML Fundamentals",
      lessons: [
        { id: 3, title: "HTML Basics", type: "video", duration: "15:20" },
        { id: 4, title: "HTML Quiz", type: "quiz", duration: "10 questions" },
      ],
    },
  ]);

  const handleChange = (e) => {
    setCourseData({ ...courseData, [e.target.name]: e.target.value });
  };

  const handleSave = () => {
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  const addModule = () => {
    const newModule = {
      id: modules.length + 1,
      title: "New Module",
      lessons: [],
    };
    setModules([...modules, newModule]);
  };

  const addLesson = (moduleId) => {
    setModules(
      modules.map((module) =>
        module.id === moduleId
          ? {
              ...module,
              lessons: [
                ...module.lessons,
                {
                  id: Date.now(),
                  title: "New Lesson",
                  type: "video",
                  duration: "0:00",
                },
              ],
            }
          : module
      )
    );
  };

  const deleteModule = (moduleId) => {
    setModules(modules.filter((m) => m.id !== moduleId));
  };

  const deleteLesson = (moduleId, lessonId) => {
    setModules(
      modules.map((module) =>
        module.id === moduleId
          ? {
              ...module,
              lessons: module.lessons.filter((l) => l.id !== lessonId),
            }
          : module
      )
    );
  };

  return (
    <AppLayout>
      <div style={{ maxWidth: 1200, margin: "0 auto", padding: 32 }}>
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
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <div>
              <h1 style={{ fontSize: 32, fontWeight: 700, marginBottom: 8 }}>
                Edit Course
              </h1>
              <p style={{ color: "#666", fontSize: 16 }}>
                Update your course content and settings
              </p>
            </div>
            <div style={{ display: "flex", gap: 12 }}>
              <button
                style={{
                  padding: "10px 20px",
                  backgroundColor: "#fff",
                  color: "#666",
                  border: "1px solid #ddd",
                  borderRadius: 6,
                  fontSize: 14,
                  fontWeight: 500,
                  cursor: "pointer",
                }}
              >
                Preview
              </button>
              <button
                onClick={handleSave}
                style={{
                  padding: "10px 20px",
                  backgroundColor: "#007bff",
                  color: "#fff",
                  border: "none",
                  borderRadius: 6,
                  fontSize: 14,
                  fontWeight: 500,
                  cursor: "pointer",
                }}
              >
                Save Changes
              </button>
            </div>
          </div>
        </div>

        {saved && (
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
            ✅ Course saved successfully
          </div>
        )}

        {/* Tabs */}
        <div
          style={{
            display: "flex",
            gap: 24,
            borderBottom: "2px solid #e0e0e0",
            marginBottom: 32,
          }}
        >
          {["details", "curriculum", "pricing", "settings"].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              style={{
                padding: "12px 0",
                backgroundColor: "transparent",
                color: activeTab === tab ? "#007bff" : "#666",
                border: "none",
                borderBottom: activeTab === tab ? "2px solid #007bff" : "2px solid transparent",
                fontSize: 14,
                fontWeight: 600,
                cursor: "pointer",
                marginBottom: -2,
                textTransform: "capitalize",
              }}
            >
              {tab}
            </button>
          ))}
        </div>

        {/* Tab Content */}
        {activeTab === "details" && (
          <div>
            <div
              style={{
                backgroundColor: "#fff",
                padding: 24,
                borderRadius: 8,
                border: "1px solid #e0e0e0",
                marginBottom: 24,
              }}
            >
              <h2 style={{ fontSize: 20, fontWeight: 600, marginBottom: 20 }}>
                Course Details
              </h2>

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
                    Subtitle
                  </label>
                  <input
                    type="text"
                    name="subtitle"
                    value={courseData.subtitle}
                    onChange={handleChange}
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
                    Description *
                  </label>
                  <textarea
                    name="description"
                    value={courseData.description}
                    onChange={handleChange}
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

                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns: "1fr 1fr 1fr",
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
                        padding: "10px 12px",
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
                        padding: "10px 12px",
                        border: "1px solid #ddd",
                        borderRadius: 6,
                        fontSize: 14,
                      }}
                    >
                      <option value="Beginner">Beginner</option>
                      <option value="Intermediate">Intermediate</option>
                      <option value="Advanced">Advanced</option>
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
                      Language *
                    </label>
                    <select
                      name="language"
                      value={courseData.language}
                      onChange={handleChange}
                      style={{
                        width: "100%",
                        padding: "10px 12px",
                        border: "1px solid #ddd",
                        borderRadius: 6,
                        fontSize: 14,
                      }}
                    >
                      <option value="English">English</option>
                      <option value="Spanish">Spanish</option>
                      <option value="French">French</option>
                      <option value="German">German</option>
                    </select>
                  </div>
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
                    Course Thumbnail
                  </label>
                  <div
                    style={{
                      border: "2px dashed #ddd",
                      borderRadius: 6,
                      padding: 40,
                      textAlign: "center",
                      cursor: "pointer",
                    }}
                  >
                    <div style={{ fontSize: 48, marginBottom: 12 }}>📷</div>
                    <div style={{ fontSize: 14, color: "#666", marginBottom: 8 }}>
                      Click to upload or drag and drop
                    </div>
                    <div style={{ fontSize: 12, color: "#999" }}>
                      PNG, JPG up to 5MB (1280x720 recommended)
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === "curriculum" && (
          <div>
            <div
              style={{
                backgroundColor: "#fff",
                padding: 24,
                borderRadius: 8,
                border: "1px solid #e0e0e0",
                marginBottom: 24,
              }}
            >
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
                <h2 style={{ fontSize: 20, fontWeight: 600 }}>
                  Course Curriculum
                </h2>
                <button
                  onClick={addModule}
                  style={{
                    padding: "8px 16px",
                    backgroundColor: "#007bff",
                    color: "#fff",
                    border: "none",
                    borderRadius: 6,
                    fontSize: 14,
                    fontWeight: 500,
                    cursor: "pointer",
                  }}
                >
                  + Add Module
                </button>
              </div>

              <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
                {modules.map((module, moduleIndex) => (
                  <div
                    key={module.id}
                    style={{
                      border: "1px solid #e0e0e0",
                      borderRadius: 6,
                      padding: 16,
                    }}
                  >
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
                      <input
                        type="text"
                        value={module.title}
                        onChange={(e) => {
                          const newModules = [...modules];
                          newModules[moduleIndex].title = e.target.value;
                          setModules(newModules);
                        }}
                        style={{
                          flex: 1,
                          padding: "8px 12px",
                          border: "1px solid #ddd",
                          borderRadius: 6,
                          fontSize: 16,
                          fontWeight: 600,
                        }}
                      />
                      <div style={{ display: "flex", gap: 8, marginLeft: 12 }}>
                        <button
                          onClick={() => addLesson(module.id)}
                          style={{
                            padding: "6px 12px",
                            backgroundColor: "#28a745",
                            color: "#fff",
                            border: "none",
                            borderRadius: 4,
                            fontSize: 12,
                            cursor: "pointer",
                          }}
                        >
                          + Lesson
                        </button>
                        <button
                          onClick={() => deleteModule(module.id)}
                          style={{
                            padding: "6px 12px",
                            backgroundColor: "#dc3545",
                            color: "#fff",
                            border: "none",
                            borderRadius: 4,
                            fontSize: 12,
                            cursor: "pointer",
                          }}
                        >
                          Delete
                        </button>
                      </div>
                    </div>

                    <div style={{ display: "flex", flexDirection: "column", gap: 8, marginLeft: 20 }}>
                      {module.lessons.map((lesson, lessonIndex) => (
                        <div
                          key={lesson.id}
                          style={{
                            display: "flex",
                            alignItems: "center",
                            gap: 12,
                            padding: 12,
                            backgroundColor: "#f8f8f8",
                            borderRadius: 4,
                          }}
                        >
                          <span style={{ fontSize: 16 }}>
                            {lesson.type === "video" ? "▶️" : lesson.type === "quiz" ? "✍️" : "📄"}
                          </span>
                          <input
                            type="text"
                            value={lesson.title}
                            onChange={(e) => {
                              const newModules = [...modules];
                              newModules[moduleIndex].lessons[lessonIndex].title = e.target.value;
                              setModules(newModules);
                            }}
                            style={{
                              flex: 1,
                              padding: "6px 10px",
                              border: "1px solid #ddd",
                              borderRadius: 4,
                              fontSize: 14,
                            }}
                          />
                          <select
                            value={lesson.type}
                            onChange={(e) => {
                              const newModules = [...modules];
                              newModules[moduleIndex].lessons[lessonIndex].type = e.target.value;
                              setModules(newModules);
                            }}
                            style={{
                              padding: "6px 10px",
                              border: "1px solid #ddd",
                              borderRadius: 4,
                              fontSize: 12,
                            }}
                          >
                            <option value="video">Video</option>
                            <option value="quiz">Quiz</option>
                            <option value="reading">Reading</option>
                            <option value="assignment">Assignment</option>
                          </select>
                          <button
                            onClick={() => deleteLesson(module.id, lesson.id)}
                            style={{
                              padding: "6px 12px",
                              backgroundColor: "#dc3545",
                              color: "#fff",
                              border: "none",
                              borderRadius: 4,
                              fontSize: 12,
                              cursor: "pointer",
                            }}
                          >
                            ×
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {activeTab === "pricing" && (
          <div>
            <div
              style={{
                backgroundColor: "#fff",
                padding: 24,
                borderRadius: 8,
                border: "1px solid #e0e0e0",
              }}
            >
              <h2 style={{ fontSize: 20, fontWeight: 600, marginBottom: 20 }}>
                Pricing
              </h2>

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
                    Course Price (USD)
                  </label>
                  <input
                    type="number"
                    name="price"
                    value={courseData.price}
                    onChange={handleChange}
                    step="0.01"
                    style={{
                      width: "100%",
                      maxWidth: 200,
                      padding: "10px 12px",
                      border: "1px solid #ddd",
                      borderRadius: 6,
                      fontSize: 14,
                    }}
                  />
                  <p style={{ fontSize: 12, color: "#666", marginTop: 8 }}>
                    Set to 0 for a free course
                  </p>
                </div>

                <div
                  style={{
                    padding: 16,
                    backgroundColor: "#f8f8f8",
                    borderRadius: 6,
                  }}
                >
                  <h3 style={{ fontSize: 16, fontWeight: 600, marginBottom: 8 }}>
                    Revenue Share
                  </h3>
                  <p style={{ fontSize: 14, color: "#666", marginBottom: 12 }}>
                    Instructors receive 70% of course revenue after platform fees.
                  </p>
                  <div style={{ fontSize: 14 }}>
                    <div style={{ marginBottom: 4 }}>
                      Course Price: <strong>${courseData.price}</strong>
                    </div>
                    <div style={{ marginBottom: 4 }}>
                      Your Earnings: <strong>${(courseData.price * 0.7).toFixed(2)}</strong>
                    </div>
                    <div>
                      Platform Fee: <strong>${(courseData.price * 0.3).toFixed(2)}</strong>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === "settings" && (
          <div>
            <div
              style={{
                backgroundColor: "#fff",
                padding: 24,
                borderRadius: 8,
                border: "1px solid #e0e0e0",
              }}
            >
              <h2 style={{ fontSize: 20, fontWeight: 600, marginBottom: 20 }}>
                Course Settings
              </h2>

              <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    paddingBottom: 16,
                    borderBottom: "1px solid #f0f0f0",
                  }}
                >
                  <div>
                    <div style={{ fontWeight: 500, marginBottom: 4 }}>
                      Published
                    </div>
                    <div style={{ fontSize: 14, color: "#666" }}>
                      Make this course visible to students
                    </div>
                  </div>
                  <label style={{ position: "relative", display: "inline-block", width: 50, height: 24 }}>
                    <input
                      type="checkbox"
                      checked={courseData.published}
                      onChange={() => setCourseData({ ...courseData, published: !courseData.published })}
                      style={{ opacity: 0, width: 0, height: 0 }}
                    />
                    <span
                      style={{
                        position: "absolute",
                        cursor: "pointer",
                        top: 0,
                        left: 0,
                        right: 0,
                        bottom: 0,
                        backgroundColor: courseData.published ? "#007bff" : "#ccc",
                        borderRadius: 24,
                        transition: "0.3s",
                      }}
                    >
                      <span
                        style={{
                          position: "absolute",
                          content: "",
                          height: 18,
                          width: 18,
                          left: courseData.published ? 28 : 3,
                          bottom: 3,
                          backgroundColor: "white",
                          borderRadius: "50%",
                          transition: "0.3s",
                        }}
                      />
                    </span>
                  </label>
                </div>

                <div
                  style={{
                    padding: 16,
                    backgroundColor: "#fff3cd",
                    border: "1px solid #ffc107",
                    borderRadius: 6,
                  }}
                >
                  <h3 style={{ fontSize: 16, fontWeight: 600, marginBottom: 8, color: "#856404" }}>
                    ⚠️ Delete Course
                  </h3>
                  <p style={{ fontSize: 14, color: "#856404", marginBottom: 12 }}>
                    Permanently delete this course and all its content. This action cannot be undone.
                  </p>
                  <button
                    style={{
                      padding: "8px 16px",
                      backgroundColor: "#dc3545",
                      color: "#fff",
                      border: "none",
                      borderRadius: 6,
                      fontSize: 14,
                      fontWeight: 500,
                      cursor: "pointer",
                    }}
                  >
                    Delete Course
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </AppLayout>
  );
}
