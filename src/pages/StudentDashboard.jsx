import React, { useState, useMemo } from "react";
import { Link } from "react-router-dom";
import AppLayout from "../layouts/AppLayout";
import { useAnalytics } from "../hooks/useAnalytics";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../components/ui/card";
import { Button } from "../components/ui/button";
import { Progress } from "../components/ui/progress";
import { Badge } from "../components/ui/badge";
import { Avatar, AvatarFallback } from "../components/ui/avatar";
import { BookOpen, Calendar, Award, TrendingUp, Clock, Video, FileText, Users } from "lucide-react";

export default function StudentDashboard() {
  useAnalytics("Dashboard");
  const [courses] = useState([
    { 
      id: 1, 
      title: "Workforce Readiness 101", 
      progress: 65, 
      updatedAt: "2025-09-01",
      nextLesson: "Resume Writing Workshop",
      dueDate: "Oct 20, 2025",
      instructor: "Sarah Johnson"
    },
    { 
      id: 2, 
      title: "Financial Literacy Basics", 
      progress: 20, 
      updatedAt: "2025-09-05",
      nextLesson: "Budgeting Fundamentals",
      dueDate: "Oct 18, 2025",
      instructor: "Michael Chen"
    }
  ]);

  const avgProgress = useMemo(
    () => (courses.length ? Math.round(courses.reduce((s, c) => s + c.progress, 0) / courses.length) : 0),
    [courses]
  );

  const quickActions = [
    { icon: BookOpen, label: "My Courses", href: "/course-catalog", color: "text-brand-info" },
    { icon: Video, label: "Live Classes", href: "/meet", color: "text-purple-600" },
    { icon: FileText, label: "Assignments", href: "/assignment", color: "text-brand-success" },
    { icon: Award, label: "Certificates", href: "/certificates", color: "text-yellow-600" },
  ];

  const upcomingEvents = [
    { title: "Resume Workshop", date: "Oct 15, 2:00 PM", type: "Live Class" },
    { title: "Financial Planning Quiz", date: "Oct 16, 10:00 AM", type: "Assessment" },
  ];

  return (
    <AppLayout title="Dashboard">
      <div className="min-h-screen bg-brand-surface">
        <div className="max-w-7xl mx-auto p-6 space-y-6">
          {/* Welcome Header */}
          <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl p-8 text-white">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-bold mb-2">Welcome back, Student!</h1>
                <p className="text-blue-100">Continue your learning journey</p>
              </div>
              <Avatar className="h-16 w-16 border-4 border-white/30">
                <AvatarFallback className="bg-white/20 text-white text-xl font-bold">ST</AvatarFallback>
              </Avatar>
            </div>
          </div>

          {/* Stats Overview */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Enrolled Courses</p>
                    <p className="text-3xl font-bold">{courses.length}</p>
                  </div>
                  <BookOpen className="h-8 w-8 text-brand-info" />
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Average Progress</p>
                    <p className="text-3xl font-bold">{avgProgress}%</p>
                  </div>
                  <TrendingUp className="h-8 w-8 text-brand-success" />
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Certificates</p>
                    <p className="text-3xl font-bold">0</p>
                  </div>
                  <Award className="h-8 w-8 text-yellow-600" />
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Study Hours</p>
                    <p className="text-3xl font-bold">24</p>
                  </div>
                  <Clock className="h-8 w-8 text-purple-600" />
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Quick Actions */}
          <Card>
            <CardHeader>
              <CardTitle>Quick Actions</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {quickActions.map((action, idx) => (
                  <Link key={idx} to={action.href}>
                    <Button variant="outline" className="w-full h-24 flex flex-col items-center justify-center gap-2 hover:bg-brand-surface">
                      <action.icon className={`h-6 w-6 ${action.color}`} />
                      <span className="text-sm font-medium">{action.label}</span>
                    </Button>
                  </Link>
                ))}
              </div>
            </CardContent>
          </Card>

          <div className="grid lg:grid-cols-3 gap-6">
            {/* My Courses */}
            <div className="lg:col-span-2">
              <Card>
                <CardHeader>
                  <CardTitle>My Courses</CardTitle>
                  <CardDescription>Continue where you left off</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  {courses.map((course) => (
                    <div key={course.id} className="border rounded-lg p-4 hover:bg-brand-surface transition-colors">
                      <div className="flex justify-between items-start mb-3">
                        <div>
                          <h3 className="font-semibold text-lg mb-1">{course.title}</h3>
                          <p className="text-sm text-muted-foreground">Instructor: {course.instructor}</p>
                        </div>
                        <Badge variant="secondary">{course.progress}%</Badge>
                      </div>
                      <Progress value={course.progress} className="mb-3" />
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-muted-foreground">Next: {course.nextLesson}</span>
                        <span className="text-muted-foreground flex items-center gap-1">
                          <Calendar className="h-4 w-4" />
                          Due {course.dueDate}
                        </span>
                      </div>
                      <Button className="w-full mt-3" size="sm">Continue Learning</Button>
                    </div>
                  ))}
                  <Link to="/course-catalog">
                    <Button variant="outline" className="w-full">Browse More Courses</Button>
                  </Link>
                </CardContent>
              </Card>
            </div>

            {/* Upcoming Events */}
            <div>
              <Card>
                <CardHeader>
                  <CardTitle>Upcoming Events</CardTitle>
                  <CardDescription>Don't miss these</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  {upcomingEvents.map((event, idx) => (
                    <div key={idx} className="flex items-start gap-3 p-3 border rounded-lg">
                      <Calendar className="h-5 w-5 text-brand-info mt-0.5" />
                      <div className="flex-1">
                        <p className="font-medium text-sm">{event.title}</p>
                        <p className="text-xs text-muted-foreground">{event.date}</p>
                        <Badge variant="outline" className="mt-2 text-xs">{event.type}</Badge>
                      </div>
                    </div>
                  ))}
                  <Button variant="outline" className="w-full" size="sm">
                    <Calendar className="h-4 w-4 mr-2" />
                    View Full Calendar
                  </Button>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </AppLayout>
  );
}