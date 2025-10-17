/*
  Copyright (c) 2025 Elevate for Humanity
  Commercial License. No resale, sublicensing, or redistribution allowed.
  See LICENSE file for details.
*/

import React from 'react';
import { Link } from 'react-router-dom';
import { SEO } from '../lib/seo/SEO';
import { Button } from '../components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '../components/ui/card';
import { Badge } from '../components/ui/badge';
import {
  BookOpen,
  FileText,
  BarChart3,
  MessageSquare,
  Video,
  FolderOpen,
  Calendar,
  Award,
  Users,
  GraduationCap,
  ArrowRight,
  CheckCircle2,
} from 'lucide-react';

export default function LMSLanding() {
  const features = [
    {
      icon: BookOpen,
      title: 'Course Management',
      description: 'Create, organize, and deliver engaging course content',
      color: 'text-brand-info',
    },
    {
      icon: FileText,
      title: 'Assignments & Quizzes',
      description: 'Build assessments with automatic grading',
      color: 'text-brand-success',
    },
    {
      icon: BarChart3,
      title: 'Grade Book',
      description: 'Track student progress and performance',
      color: 'text-purple-600',
    },
    {
      icon: MessageSquare,
      title: 'Discussion Forums',
      description: 'Foster collaboration and peer learning',
      color: 'text-orange-600',
    },
    {
      icon: Video,
      title: 'Video Lectures',
      description: 'Upload and stream course videos',
      color: 'text-red-600',
    },
    {
      icon: FolderOpen,
      title: 'Document Library',
      description: 'Share course materials and resources',
      color: 'text-yellow-600',
    },
    {
      icon: Calendar,
      title: 'Calendar & Deadlines',
      description: 'Keep students on track with due dates',
      color: 'text-pink-600',
    },
    {
      icon: Award,
      title: 'Certificates',
      description: 'Award completion certificates automatically',
      color: 'text-brand-info',
    },
  ];

  const stats = [
    { number: '1,247', label: 'Active Students', icon: Users },
    { number: '68', label: 'Courses Available', icon: BookOpen },
    { number: '42', label: 'Instructors', icon: GraduationCap },
    { number: '87%', label: 'Completion Rate', icon: CheckCircle2 },
  ];

  return (
    <div className="min-h-screen bg-background">
      <SEO
        title="Learning Management System - Elevate for Humanity"
        description="Access courses, assignments, grades, and learning resources. Professional LMS platform for students and instructors."
        canonical={`${import.meta.env.VITE_SITE_URL || ''}/lms`}
      />

      {/* Header */}
      <header className="bg-gradient-to-r from-blue-700 to-blue-500 text-white shadow-lg sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 py-4 flex justify-between items-center">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-white/20 backdrop-blur-sm rounded-xl flex items-center justify-center">
              <GraduationCap className="h-7 w-7" />
            </div>
            <div>
              <h1 className="text-2xl font-bold">Elevate LMS</h1>
              <div className="text-sm text-blue-100">
                Learning Management System
              </div>
            </div>
          </div>
          <div className="flex gap-3">
            <Link to="/login">
              <Button variant="secondary" size="lg">
                Student Login
              </Button>
            </Link>
            <Link to="/instructor">
              <Button
                variant="outline"
                size="lg"
                className="bg-white/10 border-white text-white hover:bg-white/20"
              >
                Instructor Login
              </Button>
            </Link>
          </div>
        </div>
      </header>

      <main>
        {/* Hero Section */}
        <section className="relative bg-gradient-to-b from-blue-50 to-white py-20 px-4 text-center overflow-hidden">
          <div className="absolute inset-0 bg-grid-slate-100 [mask-image:linear-gradient(0deg,white,rgba(255,255,255,0.6))] bg-[size:20px_20px]" />
          <div className="relative max-w-6xl mx-auto">
            <Badge className="mb-6 text-base px-6 py-2">
              <CheckCircle2 className="h-4 w-4 mr-2" />
              Trusted by 1,247+ Students
            </Badge>

            <h2 className="text-5xl md:text-6xl font-extrabold mb-6 text-brand-text leading-tight">
              Your Complete
              <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-purple-600">
                Learning Platform
              </span>
            </h2>

            <p className="text-xl md:text-2xl text-brand-text-muted mb-12 max-w-3xl mx-auto">
              Access courses, submit assignments, track your progress, and
              connect with instructors—all in one place.
            </p>

            {/* Quick Access Cards */}
            <div className="grid md:grid-cols-3 gap-6 max-w-5xl mx-auto">
              <Link to="/student-dashboard">
                <Card className="group hover:shadow-2xl hover:scale-105 transition-all duration-300 border-2 hover:border-blue-500 cursor-pointer h-full">
                  <CardHeader className="text-center">
                    <div className="w-16 h-16 bg-brand-surface rounded-2xl flex items-center justify-center mx-auto mb-4 group-hover:bg-blue-500 transition-colors">
                      <Users className="h-8 w-8 text-brand-info group-hover:text-white transition-colors" />
                    </div>
                    <CardTitle className="text-2xl">Student Portal</CardTitle>
                    <CardDescription className="text-base">
                      Access your courses, assignments, and grades
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="text-center">
                    <Button variant="ghost" className="group-hover:bg-blue-50">
                      Enter Portal <ArrowRight className="ml-2 h-4 w-4" />
                    </Button>
                  </CardContent>
                </Card>
              </Link>

              <Link to="/instructor">
                <Card className="group hover:shadow-2xl hover:scale-105 transition-all duration-300 border-2 hover:border-purple-500 cursor-pointer h-full">
                  <CardHeader className="text-center">
                    <div className="w-16 h-16 bg-brand-surface rounded-2xl flex items-center justify-center mx-auto mb-4 group-hover:bg-purple-500 transition-colors">
                      <GraduationCap className="h-8 w-8 text-purple-600 group-hover:text-white transition-colors" />
                    </div>
                    <CardTitle className="text-2xl">
                      Instructor Portal
                    </CardTitle>
                    <CardDescription className="text-base">
                      Manage courses, grade assignments, track students
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="text-center">
                    <Button
                      variant="ghost"
                      className="group-hover:bg-purple-50"
                    >
                      Enter Portal <ArrowRight className="ml-2 h-4 w-4" />
                    </Button>
                  </CardContent>
                </Card>
              </Link>

              <Link to="/course-catalog">
                <Card className="group hover:shadow-2xl hover:scale-105 transition-all duration-300 border-2 hover:border-green-500 cursor-pointer h-full">
                  <CardHeader className="text-center">
                    <div className="w-16 h-16 bg-brand-surface rounded-2xl flex items-center justify-center mx-auto mb-4 group-hover:bg-green-500 transition-colors">
                      <BookOpen className="h-8 w-8 text-brand-success group-hover:text-white transition-colors" />
                    </div>
                    <CardTitle className="text-2xl">Course Catalog</CardTitle>
                    <CardDescription className="text-base">
                      Browse and enroll in available courses
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="text-center">
                    <Button variant="ghost" className="group-hover:bg-green-50">
                      Browse Courses <ArrowRight className="ml-2 h-4 w-4" />
                    </Button>
                  </CardContent>
                </Card>
              </Link>
            </div>
          </div>
        </section>

        {/* Stats Section */}
        <section className="py-16 px-4 bg-brand-surface">
          <div className="max-w-6xl mx-auto">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
              {stats.map((stat, idx) => (
                <Card key={idx} className="text-center border-0 shadow-lg">
                  <CardContent className="pt-6">
                    <stat.icon className="h-10 w-10 mx-auto mb-4 text-brand-info" />
                    <div className="text-4xl font-extrabold text-brand-info mb-2">
                      {stat.number}
                    </div>
                    <div className="text-sm font-semibold text-brand-text-muted uppercase tracking-wide">
                      {stat.label}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section className="py-20 px-4 bg-white">
          <div className="max-w-7xl mx-auto">
            <div className="text-center mb-16">
              <h2 className="text-4xl md:text-5xl font-bold text-brand-text mb-4">
                Everything You Need to Learn & Teach
              </h2>
              <p className="text-xl text-brand-text-muted max-w-3xl mx-auto">
                Powerful tools for students and instructors to succeed
              </p>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
              {features.map((feature, idx) => (
                <Card
                  key={idx}
                  className="group hover:shadow-xl hover:-translate-y-1 transition-all duration-300 border-2 hover:border-blue-200"
                >
                  <CardHeader>
                    <div
                      className={`w-14 h-14 rounded-xl bg-brand-surface-dark flex items-center justify-center mb-4 group-hover:scale-110 transition-transform`}
                    >
                      <feature.icon className={`h-7 w-7 ${feature.color}`} />
                    </div>
                    <CardTitle className="text-xl">{feature.title}</CardTitle>
                    <CardDescription className="text-base leading-relaxed">
                      {feature.description}
                    </CardDescription>
                  </CardHeader>
                </Card>
              ))}
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="relative bg-gradient-to-br from-blue-700 via-purple-600 to-purple-700 text-white py-20 px-4 text-center overflow-hidden">
          <div className="absolute inset-0 bg-grid-white/[0.05] bg-[size:20px_20px]" />
          <div className="relative max-w-4xl mx-auto">
            <h2 className="text-4xl md:text-5xl font-bold mb-6">
              Ready to Start Learning?
            </h2>
            <p className="text-xl md:text-2xl mb-10 text-blue-100">
              Join thousands of students advancing their education through our
              platform
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link to="/login">
                <Button
                  size="lg"
                  className="bg-white text-brand-info hover:bg-brand-surface-dark text-lg px-10 py-6 rounded-full shadow-2xl"
                >
                  Access Student Portal
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
              </Link>
              <Link to="/programs">
                <Button
                  size="lg"
                  variant="outline"
                  className="bg-transparent border-2 border-white text-white hover:bg-white/10 text-lg px-10 py-6 rounded-full"
                >
                  Browse Programs
                </Button>
              </Link>
            </div>
          </div>
        </section>

        {/* Support Section */}
        <section className="py-16 px-4 bg-brand-surface">
          <div className="max-w-5xl mx-auto">
            <h3 className="text-3xl md:text-4xl font-bold text-brand-text mb-12 text-center">
              Need Help Getting Started?
            </h3>
            <div className="grid md:grid-cols-3 gap-8">
              <Card className="text-center hover:shadow-xl transition-shadow">
                <CardHeader>
                  <div className="w-16 h-16 bg-brand-surface rounded-2xl flex items-center justify-center mx-auto mb-4">
                    <BookOpen className="h-8 w-8 text-brand-info" />
                  </div>
                  <CardTitle className="text-xl">Student Guide</CardTitle>
                  <CardDescription className="text-base">
                    Learn how to navigate courses and submit assignments
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Link to="/student-handbook">
                    <Button
                      variant="link"
                      className="text-brand-info font-semibold"
                    >
                      View Guide <ArrowRight className="ml-2 h-4 w-4" />
                    </Button>
                  </Link>
                </CardContent>
              </Card>

              <Card className="text-center hover:shadow-xl transition-shadow">
                <CardHeader>
                  <div className="w-16 h-16 bg-brand-surface rounded-2xl flex items-center justify-center mx-auto mb-4">
                    <MessageSquare className="h-8 w-8 text-brand-success" />
                  </div>
                  <CardTitle className="text-xl">Technical Support</CardTitle>
                  <CardDescription className="text-base">
                    Get help with login issues or technical problems
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Link to="/connect">
                    <Button
                      variant="link"
                      className="text-brand-info font-semibold"
                    >
                      Contact Support <ArrowRight className="ml-2 h-4 w-4" />
                    </Button>
                  </Link>
                </CardContent>
              </Card>

              <Card className="text-center hover:shadow-xl transition-shadow">
                <CardHeader>
                  <div className="w-16 h-16 bg-brand-surface rounded-2xl flex items-center justify-center mx-auto mb-4">
                    <FileText className="h-8 w-8 text-purple-600" />
                  </div>
                  <CardTitle className="text-xl">FAQs</CardTitle>
                  <CardDescription className="text-base">
                    Find answers to common questions
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Link to="/support">
                    <Button
                      variant="link"
                      className="text-brand-info font-semibold"
                    >
                      View FAQs <ArrowRight className="ml-2 h-4 w-4" />
                    </Button>
                  </Link>
                </CardContent>
              </Card>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}
