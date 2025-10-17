/*
  Copyright (c) 2025 Elevate for Humanity
  Commercial License. No resale, sublicensing, or redistribution allowed.
  See LICENSE file for details.
*/
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Badge } from '../components/ui/badge';
import { Input } from '../components/ui/input';
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '../components/ui/tabs';
import { Search, Clock, Users, Star, BookOpen, TrendingUp } from 'lucide-react';

const demoCourses = [
  {
    id: 'construction-pre-apprentice',
    title: 'Construction Pre-Apprenticeship',
    category: 'Construction',
    coverUrl: '/images/construction.jpg',
    description:
      'Get certified in construction fundamentals with OSHA 10, NCCER Core, and Forklift certification.',
    duration: '12-16 weeks',
    students: 247,
    rating: 4.8,
    level: 'Beginner',
    instructor: 'Mike Rodriguez',
    featured: true,
  },
  {
    id: 'phlebotomy-tech',
    title: 'Phlebotomy Technician',
    category: 'Healthcare',
    coverUrl: '/images/phlebotomy.jpg',
    description:
      'Become a certified phlebotomy technician with hands-on training and national certification prep.',
    duration: '8-10 weeks',
    students: 189,
    rating: 4.9,
    level: 'Beginner',
    instructor: 'Dr. Sarah Chen',
    featured: true,
  },
  {
    id: 'cdl-truck-driving',
    title: 'CDL Truck Driving',
    category: 'Transportation',
    coverUrl: '/images/cdl.jpg',
    description:
      'Earn your CDL Class A license with comprehensive training and job placement assistance.',
    duration: '4-8 weeks',
    students: 312,
    rating: 4.7,
    level: 'Beginner',
    instructor: 'James Wilson',
    featured: true,
  },
  {
    id: 'workforce-readiness',
    title: 'Workforce Readiness 101',
    category: 'Professional Development',
    coverUrl: '/images/workforce.jpg',
    description:
      'Prepare for the modern workforce with essential skills including resume writing and interview prep.',
    duration: '6 weeks',
    students: 456,
    rating: 4.6,
    level: 'Beginner',
    instructor: 'Lisa Martinez',
  },
  {
    id: 'financial-literacy',
    title: 'Financial Literacy Basics',
    category: 'Professional Development',
    coverUrl: '/images/finance.jpg',
    description:
      'Master personal finance, budgeting, credit management, and investment fundamentals.',
    duration: '6-8 weeks',
    students: 298,
    rating: 4.8,
    level: 'Beginner',
    instructor: 'David Thompson',
  },
  {
    id: 'cpr-instructor',
    title: 'CPR Instructor Certification',
    category: 'Healthcare',
    coverUrl: '/images/cpr.jpg',
    description:
      'Become an AHA-certified CPR instructor and teach life-saving skills to others.',
    duration: '4-6 weeks',
    students: 134,
    rating: 4.9,
    level: 'Intermediate',
    instructor: 'Emily Johnson',
  },
];

export default function CourseCatalog() {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');

  const categories = ['all', ...new Set(demoCourses.map((c) => c.category))];

  const filteredCourses = demoCourses.filter((course) => {
    const matchesSearch =
      course.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      course.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory =
      selectedCategory === 'all' || course.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const featuredCourses = demoCourses.filter((c) => c.featured);

  return (
    <div className="min-h-screen bg-brand-surface">
      {/* Hero Section */}
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white py-16 px-4">
        <div className="max-w-7xl mx-auto">
          <h1 className="text-4xl md:text-5xl font-bold mb-4">
            Course Catalog
          </h1>
          <p className="text-xl text-blue-100 mb-8 max-w-2xl">
            Explore our comprehensive training programs designed to launch your
            career
          </p>

          {/* Search Bar */}
          <div className="relative max-w-2xl">
            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
            <Input
              type="text"
              placeholder="Search courses..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-12 h-14 text-lg bg-white"
            />
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-12">
        {/* Featured Courses */}
        {searchTerm === '' && selectedCategory === 'all' && (
          <section className="mb-16">
            <div className="flex items-center gap-3 mb-6">
              <TrendingUp className="h-6 w-6 text-brand-info" />
              <h2 className="text-3xl font-bold text-brand-text">
                Featured Courses
              </h2>
            </div>
            <div className="grid md:grid-cols-3 gap-6">
              {featuredCourses.map((course) => (
                <Card
                  key={course.id}
                  className="group hover:shadow-2xl transition-all duration-300 border-2 hover:border-blue-300"
                >
                  <div className="relative h-48 bg-gradient-to-br from-blue-500 to-purple-600 rounded-t-lg overflow-hidden">
                    <div className="absolute inset-0 flex items-center justify-center">
                      <BookOpen className="h-20 w-20 text-white/30" />
                    </div>
                    <Badge className="absolute top-4 right-4 bg-yellow-500 text-white border-0">
                      Featured
                    </Badge>
                  </div>
                  <CardHeader>
                    <div className="flex items-center justify-between mb-2">
                      <Badge variant="secondary">{course.category}</Badge>
                      <div className="flex items-center gap-1 text-sm">
                        <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                        <span className="font-semibold">{course.rating}</span>
                      </div>
                    </div>
                    <CardTitle className="text-xl group-hover:text-brand-info transition-colors">
                      {course.title}
                    </CardTitle>
                    <CardDescription className="text-base line-clamp-2">
                      {course.description}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center justify-between text-sm text-brand-text-muted">
                      <div className="flex items-center gap-1">
                        <Clock className="h-4 w-4" />
                        <span>{course.duration}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Users className="h-4 w-4" />
                        <span>{course.students} students</span>
                      </div>
                    </div>
                    <div className="mt-3 text-sm text-brand-text-muted">
                      Instructor:{' '}
                      <span className="font-semibold">{course.instructor}</span>
                    </div>
                  </CardContent>
                  <CardFooter>
                    <Button
                      className="w-full"
                      size="lg"
                      onClick={() => navigate(`/course/${course.id}`)}
                    >
                      View Course Details
                    </Button>
                  </CardFooter>
                </Card>
              ))}
            </div>
          </section>
        )}

        {/* All Courses with Tabs */}
        <section>
          <h2 className="text-3xl font-bold text-brand-text mb-6">
            {searchTerm
              ? `Search Results (${filteredCourses.length})`
              : 'All Courses'}
          </h2>

          <Tabs
            defaultValue="all"
            className="w-full"
            onValueChange={setSelectedCategory}
          >
            <TabsList className="mb-6">
              {categories.map((cat) => (
                <TabsTrigger key={cat} value={cat} className="capitalize">
                  {cat === 'all' ? 'All Courses' : cat}
                </TabsTrigger>
              ))}
            </TabsList>

            <TabsContent value={selectedCategory} className="mt-0">
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredCourses.map((course) => (
                  <Card
                    key={course.id}
                    className="group hover:shadow-xl transition-all duration-300 hover:-translate-y-1"
                  >
                    <div className="relative h-40 bg-gradient-to-br from-slate-200 to-slate-300 rounded-t-lg overflow-hidden">
                      <div className="absolute inset-0 flex items-center justify-center">
                        <BookOpen className="h-16 w-16 text-slate-400" />
                      </div>
                      <Badge
                        className="absolute top-3 left-3"
                        variant="secondary"
                      >
                        {course.level}
                      </Badge>
                    </div>
                    <CardHeader>
                      <div className="flex items-center justify-between mb-2">
                        <Badge variant="outline">{course.category}</Badge>
                        <div className="flex items-center gap-1 text-sm">
                          <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                          <span className="font-semibold">{course.rating}</span>
                        </div>
                      </div>
                      <CardTitle className="text-lg group-hover:text-brand-info transition-colors">
                        {course.title}
                      </CardTitle>
                      <CardDescription className="line-clamp-2">
                        {course.description}
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-2 text-sm text-brand-text-muted">
                        <div className="flex items-center gap-2">
                          <Clock className="h-4 w-4" />
                          <span>{course.duration}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Users className="h-4 w-4" />
                          <span>{course.students} students enrolled</span>
                        </div>
                      </div>
                    </CardContent>
                    <CardFooter>
                      <Button
                        className="w-full"
                        variant="outline"
                        onClick={() => navigate(`/course/${course.id}`)}
                      >
                        Learn More
                      </Button>
                    </CardFooter>
                  </Card>
                ))}
              </div>

              {filteredCourses.length === 0 && (
                <div className="text-center py-16">
                  <BookOpen className="h-16 w-16 text-slate-300 mx-auto mb-4" />
                  <h3 className="text-xl font-semibold text-brand-text-muted mb-2">
                    No courses found
                  </h3>
                  <p className="text-brand-text-light">
                    Try adjusting your search or filters
                  </p>
                </div>
              )}
            </TabsContent>
          </Tabs>
        </section>
      </div>
    </div>
  );
}
