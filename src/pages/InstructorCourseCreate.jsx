/*
  Instructor Course Creation Interface
  Allows instructors to create courses that use Google infrastructure
*/

import React, { useState } from "react";
import { SEO } from "../lib/seo/SEO";
import Header from "../components/Header";
import Footer from "../components/Footer";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../components/ui/card";
import { Button } from "../components/ui/button";
import { Plus, Video, FileText, CheckSquare, Upload, Save } from "lucide-react";

export default function InstructorCourseCreate() {
  const [course, setCourse] = useState({
    title: "",
    description: "",
    thumbnail: null,
    modules: []
  });

  const [currentModule, setCurrentModule] = useState({
    title: "",
    lessons: []
  });

  const addModule = () => {
    if (currentModule.title) {
      setCourse({
        ...course,
        modules: [...course.modules, currentModule]
      });
      setCurrentModule({ title: "", lessons: [] });
    }
  };

  const addLesson = (type) => {
    const newLesson = {
      id: Date.now(),
      type: type, // 'video', 'reading', 'assignment', 'quiz'
      title: "",
      content: null
    };
    setCurrentModule({
      ...currentModule,
      lessons: [...currentModule.lessons, newLesson]
    });
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <SEO
        title="Create Course | Instructor Portal"
        description="Create and manage your courses"
      />
      <Header />
      
      <main className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">Create New Course</h1>
          <p className="text-lg text-gray-600">Build your course content and publish to students</p>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Course Details */}
            <Card>
              <CardHeader>
                <CardTitle>Course Information</CardTitle>
                <CardDescription>Basic details about your course</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-2">Course Title</label>
                  <input
                    type="text"
                    className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary"
                    placeholder="e.g., Construction Pre-Apprenticeship"
                    value={course.title}
                    onChange={(e) => setCourse({...course, title: e.target.value})}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Description</label>
                  <textarea
                    className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary"
                    rows="4"
                    placeholder="Describe what students will learn..."
                    value={course.description}
                    onChange={(e) => setCourse({...course, description: e.target.value})}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Course Thumbnail</label>
                  <div className="border-2 border-dashed rounded-lg p-8 text-center">
                    <Upload className="w-12 h-12 mx-auto mb-4 text-gray-400" />
                    <p className="text-sm text-gray-600 mb-2">Click to upload or drag and drop</p>
                    <p className="text-xs text-gray-500">PNG, JPG up to 5MB</p>
                    <input type="file" className="hidden" accept="image/*" />
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Modules */}
            <Card>
              <CardHeader>
                <CardTitle>Course Modules</CardTitle>
                <CardDescription>Organize your content into modules</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Existing Modules */}
                {course.modules.map((module, idx) => (
                  <div key={idx} className="border rounded-lg p-4 bg-white">
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="font-semibold">Module {idx + 1}: {module.title}</h3>
                      <Button variant="ghost" size="sm">Edit</Button>
                    </div>
                    <p className="text-sm text-gray-600">{module.lessons.length} lessons</p>
                  </div>
                ))}

                {/* New Module */}
                <div className="border-2 border-dashed rounded-lg p-6">
                  <input
                    type="text"
                    className="w-full px-4 py-2 border rounded-lg mb-4"
                    placeholder="Module Title (e.g., Introduction to Safety)"
                    value={currentModule.title}
                    onChange={(e) => setCurrentModule({...currentModule, title: e.target.value})}
                  />
                  
                  {/* Add Lesson Buttons */}
                  <div className="flex flex-wrap gap-2 mb-4">
                    <Button variant="outline" size="sm" onClick={() => addLesson('video')}>
                      <Video className="w-4 h-4 mr-2" />
                      Add Video
                    </Button>
                    <Button variant="outline" size="sm" onClick={() => addLesson('reading')}>
                      <FileText className="w-4 h-4 mr-2" />
                      Add Reading
                    </Button>
                    <Button variant="outline" size="sm" onClick={() => addLesson('assignment')}>
                      <Upload className="w-4 h-4 mr-2" />
                      Add Assignment
                    </Button>
                    <Button variant="outline" size="sm" onClick={() => addLesson('quiz')}>
                      <CheckSquare className="w-4 h-4 mr-2" />
                      Add Quiz
                    </Button>
                  </div>

                  {/* Current Module Lessons */}
                  {currentModule.lessons.length > 0 && (
                    <div className="space-y-2 mb-4">
                      {currentModule.lessons.map((lesson, idx) => (
                        <div key={lesson.id} className="flex items-center gap-2 p-2 bg-gray-50 rounded">
                          {lesson.type === 'video' && <Video className="w-4 h-4" />}
                          {lesson.type === 'reading' && <FileText className="w-4 h-4" />}
                          {lesson.type === 'assignment' && <Upload className="w-4 h-4" />}
                          {lesson.type === 'quiz' && <CheckSquare className="w-4 h-4" />}
                          <input
                            type="text"
                            className="flex-1 px-2 py-1 text-sm border rounded"
                            placeholder={`${lesson.type} title...`}
                          />
                          <Button variant="ghost" size="sm">×</Button>
                        </div>
                      ))}
                    </div>
                  )}

                  <Button onClick={addModule} disabled={!currentModule.title}>
                    <Plus className="w-4 h-4 mr-2" />
                    Add Module
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Course Preview */}
            <Card>
              <CardHeader>
                <CardTitle>Course Preview</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="aspect-video bg-gray-200 rounded-lg mb-4 flex items-center justify-center">
                  <p className="text-gray-500">Thumbnail Preview</p>
                </div>
                <h3 className="font-semibold mb-2">
                  {course.title || "Course Title"}
                </h3>
                <p className="text-sm text-gray-600 mb-4">
                  {course.description || "Course description will appear here..."}
                </p>
                <div className="text-sm text-gray-500">
                  <p>{course.modules.length} modules</p>
                  <p>{course.modules.reduce((acc, m) => acc + m.lessons.length, 0)} lessons</p>
                </div>
              </CardContent>
            </Card>

            {/* Actions */}
            <Card>
              <CardHeader>
                <CardTitle>Publish Course</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <Button className="w-full" disabled={!course.title || course.modules.length === 0}>
                  <Save className="w-4 h-4 mr-2" />
                  Save Draft
                </Button>
                <Button className="w-full" variant="outline">
                  Preview Course
                </Button>
                <Button 
                  className="w-full" 
                  variant="default"
                  disabled={!course.title || course.modules.length === 0}
                >
                  Publish Course
                </Button>
              </CardContent>
            </Card>

            {/* Help */}
            <Card>
              <CardHeader>
                <CardTitle>Need Help?</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2 text-sm">
                <p className="text-gray-600">
                  <strong>Videos:</strong> Upload to Google Drive automatically
                </p>
                <p className="text-gray-600">
                  <strong>Assignments:</strong> Students submit through the platform
                </p>
                <p className="text-gray-600">
                  <strong>Quizzes:</strong> Auto-graded with instant feedback
                </p>
                <Button variant="link" size="sm" className="p-0">
                  View Tutorial →
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
