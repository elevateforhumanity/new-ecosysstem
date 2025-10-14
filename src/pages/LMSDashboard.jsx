/*
  Professional LMS Dashboard with Shadcn/ui
*/

import React from "react";
import { Link } from "react-router-dom";
import { SEO } from "../lib/seo/SEO";
import Header from "../components/Header";
import Footer from "../components/Footer";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../components/ui/card";
import { Button } from "../components/ui/button";
import { BookOpen, Video, FileText, Award, Calendar, Users, BarChart, Settings } from "lucide-react";

export default function LMSDashboard() {
  const courses = [
    {
      title: "Construction Pre-Apprenticeship",
      progress: 65,
      nextLesson: "OSHA 10 Safety Module 3",
      dueDate: "Oct 20, 2025"
    },
    {
      title: "Phlebotomy Technician",
      progress: 40,
      nextLesson: "Venipuncture Techniques",
      dueDate: "Oct 18, 2025"
    },
    {
      title: "CPR Instructor Certification",
      progress: 85,
      nextLesson: "Final Assessment",
      dueDate: "Oct 15, 2025"
    }
  ];

  const quickActions = [
    { icon: BookOpen, label: "My Courses", href: "/lms/courses", color: "text-blue-600" },
    { icon: Video, label: "Live Classes", href: "/meet", color: "text-purple-600" },
    { icon: FileText, label: "Assignments", href: "/lms/assignments", color: "text-green-600" },
    { icon: Award, label: "Certificates", href: "/certificates", color: "text-yellow-600" },
    { icon: Calendar, label: "Schedule", href: "/calendar", color: "text-red-600" },
    { icon: Users, label: "Study Groups", href: "/community", color: "text-indigo-600" },
    { icon: BarChart, label: "Progress", href: "/lms/progress", color: "text-pink-600" },
    { icon: Settings, label: "Settings", href: "/settings", color: "text-gray-600" }
  ];

  const upcomingEvents = [
    { title: "Construction Safety Webinar", date: "Oct 15, 2:00 PM", type: "Live Class" },
    { title: "Phlebotomy Lab Session", date: "Oct 16, 10:00 AM", type: "In-Person" },
    { title: "CPR Final Exam", date: "Oct 18, 9:00 AM", type: "Assessment" }
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      <SEO
        title="LMS Dashboard | Elevate for Humanity"
        description="Access your courses, assignments, and learning materials"
        canonical={`${import.meta.env.VITE_SITE_URL || ""}/lms`}
      />
      <Header />
      
      <main className="container mx-auto px-4 py-8">
        {/* Welcome Section */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">Welcome back, Student!</h1>
          <p className="text-lg text-gray-600">Continue your learning journey</p>
        </div>

        {/* Quick Actions Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          {quickActions.map((action, idx) => (
            <Link key={idx} to={action.href}>
              <Card className="hover:shadow-lg transition-shadow cursor-pointer">
                <CardContent className="flex flex-col items-center justify-center p-6">
                  <action.icon className={`w-8 h-8 mb-2 ${action.color}`} />
                  <span className="text-sm font-medium text-center">{action.label}</span>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Main Content - Courses */}
          <div className="lg:col-span-2 space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>My Courses</CardTitle>
                <CardDescription>Continue where you left off</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {courses.map((course, idx) => (
                  <div key={idx} className="border rounded-lg p-4 hover:bg-gray-50 transition-colors">
                    <div className="flex justify-between items-start mb-2">
                      <h3 className="font-semibold text-lg">{course.title}</h3>
                      <span className="text-sm text-gray-500">{course.progress}%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2 mb-3">
                      <div 
                        className="bg-primary h-2 rounded-full transition-all"
                        style={{ width: `${course.progress}%` }}
                      />
                    </div>
                    <div className="flex justify-between items-center">
                      <div>
                        <p className="text-sm text-gray-600">Next: {course.nextLesson}</p>
                        <p className="text-xs text-gray-500">Due: {course.dueDate}</p>
                      </div>
                      <Button size="sm">Continue</Button>
                    </div>
                  </div>
                ))}
                <Button variant="outline" className="w-full">
                  <BookOpen className="w-4 h-4 mr-2" />
                  Browse All Courses
                </Button>
              </CardContent>
            </Card>

            {/* Assignments */}
            <Card>
              <CardHeader>
                <CardTitle>Upcoming Assignments</CardTitle>
                <CardDescription>Stay on track with your deadlines</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex items-center justify-between p-3 border rounded-lg">
                    <div>
                      <p className="font-medium">OSHA 10 Quiz</p>
                      <p className="text-sm text-gray-500">Due Oct 17, 2025</p>
                    </div>
                    <Button size="sm" variant="outline">Start</Button>
                  </div>
                  <div className="flex items-center justify-between p-3 border rounded-lg">
                    <div>
                      <p className="font-medium">Phlebotomy Lab Report</p>
                      <p className="text-sm text-gray-500">Due Oct 19, 2025</p>
                    </div>
                    <Button size="sm" variant="outline">Start</Button>
                  </div>
                  <div className="flex items-center justify-between p-3 border rounded-lg">
                    <div>
                      <p className="font-medium">CPR Practice Video</p>
                      <p className="text-sm text-gray-500">Due Oct 20, 2025</p>
                    </div>
                    <Button size="sm" variant="outline">Start</Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Upcoming Events */}
            <Card>
              <CardHeader>
                <CardTitle>Upcoming Events</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {upcomingEvents.map((event, idx) => (
                  <div key={idx} className="border-l-4 border-primary pl-3 py-2">
                    <p className="font-medium text-sm">{event.title}</p>
                    <p className="text-xs text-gray-500">{event.date}</p>
                    <span className="inline-block mt-1 text-xs bg-primary/10 text-primary px-2 py-1 rounded">
                      {event.type}
                    </span>
                  </div>
                ))}
                <Button variant="outline" size="sm" className="w-full mt-2">
                  <Calendar className="w-4 h-4 mr-2" />
                  View Full Calendar
                </Button>
              </CardContent>
            </Card>

            {/* Achievements */}
            <Card>
              <CardHeader>
                <CardTitle>Recent Achievements</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-yellow-100 rounded-full flex items-center justify-center">
                    <Award className="w-6 h-6 text-yellow-600" />
                  </div>
                  <div>
                    <p className="font-medium text-sm">Perfect Attendance</p>
                    <p className="text-xs text-gray-500">Earned Oct 10, 2025</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                    <Award className="w-6 h-6 text-blue-600" />
                  </div>
                  <div>
                    <p className="font-medium text-sm">Quick Learner</p>
                    <p className="text-xs text-gray-500">Earned Oct 8, 2025</p>
                  </div>
                </div>
                <Button variant="outline" size="sm" className="w-full mt-2">
                  View All Achievements
                </Button>
              </CardContent>
            </Card>

            {/* Support */}
            <Card>
              <CardHeader>
                <CardTitle>Need Help?</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <Button variant="outline" size="sm" className="w-full justify-start">
                  <FileText className="w-4 h-4 mr-2" />
                  Student Handbook
                </Button>
                <Button variant="outline" size="sm" className="w-full justify-start">
                  <Users className="w-4 h-4 mr-2" />
                  Contact Support
                </Button>
                <Button variant="outline" size="sm" className="w-full justify-start">
                  <Video className="w-4 h-4 mr-2" />
                  Tutorial Videos
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
