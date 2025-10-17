import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { SEO } from "../lib/seo/SEO";
import Header from "../components/Header";
import Footer from "../components/Footer";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "../components/ui/card";
import { Button } from "../components/ui/button";
import { Badge } from "../components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../components/ui/tabs";
import { 
  HardHat, 
  Stethoscope, 
  Truck, 
  Heart, 
  TestTube, 
  DollarSign, 
  Music,
  Clock,
  Users,
  Award,
  TrendingUp,
  CheckCircle2,
  ArrowRight,
  Sparkles
} from 'lucide-react';

export default function Programs() {
  const [selectedCategory, setSelectedCategory] = useState('all');

  const programs = [
    {
      id: 'construction',
      title: 'Construction Pre-Apprenticeship',
      category: 'Construction',
      icon: HardHat,
      description: 'Get certified in construction fundamentals with hands-on training and industry-recognized credentials.',
      duration: '12-16 weeks',
      credentials: 'OSHA 10, NCCER Core, Forklift',
      placement: '95%',
      students: 247,
      level: 'Beginner',
      color: 'text-orange-600',
      bg: 'bg-orange-50',
      featured: true
    },
    {
      id: 'phlebotomy',
      title: 'Phlebotomy Technician',
      category: 'Healthcare',
      icon: Stethoscope,
      description: 'Become a certified phlebotomy technician with comprehensive training and national certification prep.',
      duration: '8-10 weeks',
      credentials: 'National Certification',
      placement: '92%',
      students: 189,
      level: 'Beginner',
      color: 'text-blue-600',
      bg: 'bg-blue-50',
      featured: true
    },
    {
      id: 'cdl',
      title: 'CDL Truck Driving',
      category: 'Transportation',
      icon: Truck,
      description: 'Earn your CDL Class A license with comprehensive behind-the-wheel training and job placement.',
      duration: '4-8 weeks',
      credentials: 'CDL Class A',
      placement: '98%',
      students: 312,
      level: 'Beginner',
      color: 'text-green-600',
      bg: 'bg-green-50',
      featured: true
    },
    {
      id: 'cpr',
      title: 'CPR Instructor Certification',
      category: 'Healthcare',
      icon: Heart,
      description: 'Become an AHA-certified CPR instructor and teach life-saving skills to others.',
      duration: '4-6 weeks',
      credentials: 'AHA Certification',
      placement: '90%',
      students: 134,
      level: 'Intermediate',
      color: 'text-red-600',
      bg: 'bg-red-50'
    },
    {
      id: 'drug-testing',
      title: 'Drug Testing Collector',
      category: 'Healthcare',
      icon: TestTube,
      description: 'Get DOT certified as a drug and alcohol testing collector for workplace compliance.',
      duration: '2-4 weeks',
      credentials: 'DOT Certified',
      placement: '88%',
      students: 98,
      level: 'Beginner',
      color: 'text-purple-600',
      bg: 'bg-purple-50'
    },
    {
      id: 'financial',
      title: 'Financial Literacy',
      category: 'Professional Development',
      icon: DollarSign,
      description: 'Master personal finance, budgeting, credit management, and investment fundamentals.',
      duration: '6-8 weeks',
      credentials: 'Certificate',
      placement: '85%',
      students: 298,
      level: 'Beginner',
      color: 'text-yellow-600',
      bg: 'bg-yellow-50'
    },
    {
      id: 'arts',
      title: 'Music & Dance Arts',
      category: 'Arts',
      icon: Music,
      description: 'Develop your artistic talents with professional instruction in music and dance.',
      duration: '12-16 weeks',
      credentials: 'Arts Certificate',
      placement: '82%',
      students: 156,
      level: 'All Levels',
      color: 'text-pink-600',
      bg: 'bg-pink-50'
    },
  ];

  const categories = ['all', ...new Set(programs.map(p => p.category))];
  const filteredPrograms = selectedCategory === 'all' 
    ? programs 
    : programs.filter(p => p.category === selectedCategory);
  const featuredPrograms = programs.filter(p => p.featured);

  return (
    <div className="min-h-screen bg-background">
      <SEO
        title="Training Programs - Elevate for Humanity"
        description="FREE job training programs in Construction, Healthcare, CDL, and more. 100% funded by WIOA, DOL, and state grants. Marion County, IN."
        canonical={`${import.meta.env.VITE_SITE_URL || ""}/programs`}
      />
      <Header />

      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-blue-700 via-purple-600 to-purple-700 text-white py-24 px-4 overflow-hidden">
        <div className="absolute inset-0 bg-grid-white/[0.05] bg-[size:20px_20px]" />
        <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent" />
        
        <div className="relative max-w-6xl mx-auto text-center">
          <Badge className="mb-6 text-base px-6 py-2 bg-white/20 backdrop-blur-sm border-white/30 animate-fade-in-down">
            <Sparkles className="h-4 w-4 mr-2" />
            100% FREE • Fully Funded
          </Badge>
          
          <h1 className="text-5xl md:text-7xl font-extrabold mb-6 animate-fade-in-up leading-tight">
            Launch Your<br />
            <span className="text-yellow-300">Dream Career</span>
          </h1>
          
          <p className="text-xl md:text-2xl text-blue-100 mb-12 max-w-3xl mx-auto animate-fade-in-up" style={{ animationDelay: '100ms' }}>
            Get certified in high-demand careers. Funded by WIOA, DOL, and state grants. You pay nothing.
          </p>

          {/* Quick Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 max-w-4xl mx-auto">
            <div className="backdrop-blur-sm bg-white/10 rounded-2xl p-6 border border-white/20 animate-scale-in" style={{ animationDelay: '200ms' }}>
              <div className="text-4xl font-bold mb-2">7</div>
              <div className="text-sm text-blue-100">Programs</div>
            </div>
            <div className="backdrop-blur-sm bg-white/10 rounded-2xl p-6 border border-white/20 animate-scale-in" style={{ animationDelay: '300ms' }}>
              <div className="text-4xl font-bold mb-2">92%</div>
              <div className="text-sm text-blue-100">Job Placement</div>
            </div>
            <div className="backdrop-blur-sm bg-white/10 rounded-2xl p-6 border border-white/20 animate-scale-in" style={{ animationDelay: '400ms' }}>
              <div className="text-4xl font-bold mb-2">$0</div>
              <div className="text-sm text-blue-100">Cost to You</div>
            </div>
            <div className="backdrop-blur-sm bg-white/10 rounded-2xl p-6 border border-white/20 animate-scale-in" style={{ animationDelay: '500ms' }}>
              <div className="text-4xl font-bold mb-2">1,247</div>
              <div className="text-sm text-blue-100">Students Trained</div>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Programs */}
      <section className="py-20 px-4 bg-brand-surface">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12 animate-fade-in-up">
            <div className="flex items-center justify-center gap-3 mb-4">
              <TrendingUp className="h-8 w-8 text-blue-600" />
              <h2 className="text-4xl md:text-5xl font-bold text-gray-900">Featured Programs</h2>
            </div>
            <p className="text-xl text-brand-text-muted">Our most popular career training programs</p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {featuredPrograms.map((program, idx) => (
              <Card 
                key={program.id} 
                className="group hover:shadow-2xl transition-all duration-300 hover:-translate-y-2 border-2 hover:border-blue-300 animate-fade-in-up"
                style={{ animationDelay: `${idx * 100}ms` }}
              >
                <CardHeader>
                  <div className={`w-20 h-20 ${program.bg} rounded-2xl flex items-center justify-center mb-4 group-hover:scale-110 group-hover:rotate-6 transition-all`}>
                    <program.icon className={`h-10 w-10 ${program.color}`} />
                  </div>
                  <div className="flex items-center justify-between mb-2">
                    <Badge variant="secondary">{program.category}</Badge>
                    <Badge className="bg-brand-surface text-brand-success border-0">
                      {program.placement} Placement
                    </Badge>
                  </div>
                  <CardTitle className="text-2xl group-hover:text-blue-600 transition-colors">
                    {program.title}
                  </CardTitle>
                  <CardDescription className="text-base leading-relaxed">
                    {program.description}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex items-center gap-2 text-sm text-brand-text-muted">
                      <Clock className="h-4 w-4" />
                      <span>Duration: <strong>{program.duration}</strong></span>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-brand-text-muted">
                      <Award className="h-4 w-4" />
                      <span>Earn: <strong>{program.credentials}</strong></span>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-brand-text-muted">
                      <Users className="h-4 w-4" />
                      <span><strong>{program.students}</strong> students enrolled</span>
                    </div>
                  </div>
                </CardContent>
                <CardFooter>
                  <Link to="/get-started" className="w-full">
                    <Button className="w-full" size="lg">
                      Apply Now <ArrowRight className="ml-2 h-4 w-4" />
                    </Button>
                  </Link>
                </CardFooter>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* All Programs with Tabs */}
      <section className="py-20 px-4 bg-white">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12 animate-fade-in-up">
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
              All Training Programs
            </h2>
            <p className="text-xl text-brand-text-muted">
              Choose the career path that's right for you
            </p>
          </div>

          <Tabs defaultValue="all" className="w-full" onValueChange={setSelectedCategory}>
            <TabsList className="mb-8 flex-wrap h-auto">
              {categories.map(cat => (
                <TabsTrigger key={cat} value={cat} className="capitalize">
                  {cat === 'all' ? 'All Programs' : cat}
                </TabsTrigger>
              ))}
            </TabsList>

            <TabsContent value={selectedCategory} className="mt-0">
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
                {filteredPrograms.map((program, idx) => (
                  <Card 
                    key={program.id} 
                    className="group hover:shadow-xl transition-all duration-300 hover:-translate-y-1 animate-fade-in-up"
                    style={{ animationDelay: `${idx * 50}ms` }}
                  >
                    <CardHeader>
                      <div className={`w-16 h-16 ${program.bg} rounded-2xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform`}>
                        <program.icon className={`h-8 w-8 ${program.color}`} />
                      </div>
                      <div className="flex items-center justify-between mb-2">
                        <Badge variant="outline">{program.level}</Badge>
                        <Badge className="bg-brand-surface text-brand-success border-0 text-xs">
                          {program.placement}
                        </Badge>
                      </div>
                      <CardTitle className="text-xl group-hover:text-blue-600 transition-colors">
                        {program.title}
                      </CardTitle>
                      <CardDescription className="line-clamp-2">
                        {program.description}
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-2 text-sm text-brand-text-muted">
                        <div className="flex items-center gap-2">
                          <Clock className="h-4 w-4" />
                          <span>{program.duration}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Award className="h-4 w-4" />
                          <span>{program.credentials}</span>
                        </div>
                      </div>
                    </CardContent>
                    <CardFooter>
                      <Link to="/get-started" className="w-full">
                        <Button variant="outline" className="w-full">
                          Learn More
                        </Button>
                      </Link>
                    </CardFooter>
                  </Card>
                ))}
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </section>

      {/* Funding Section */}
      <section className="py-20 px-4 bg-yellow-50">
        <div className="max-w-4xl mx-auto text-center">
          <div className="animate-fade-in-up">
            <DollarSign className="h-16 w-16 text-yellow-600 mx-auto mb-6" />
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
              100% Funded Programs
            </h2>
            <p className="text-xl text-gray-700 mb-8">
              Programs funded by: <strong>WIOA • WRG • OJT • WEX • JRI • DOL • State Grants</strong>
            </p>
            <div className="inline-block bg-yellow-900 text-yellow-100 px-12 py-6 rounded-full font-bold text-2xl shadow-xl">
              You Pay: $0.00
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="relative bg-gradient-to-br from-blue-700 via-purple-600 to-purple-700 text-white py-20 px-4 overflow-hidden">
        <div className="absolute inset-0 bg-grid-white/[0.05] bg-[size:20px_20px]" />
        <div className="relative max-w-4xl mx-auto text-center">
          <h2 className="text-4xl md:text-5xl font-bold mb-6 animate-fade-in-up">
            Ready to Start Your Training?
          </h2>
          <p className="text-xl md:text-2xl mb-10 text-blue-100 animate-fade-in-up" style={{ animationDelay: '100ms' }}>
            Apply now and start your journey to a better career
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center animate-fade-in-up" style={{ animationDelay: '200ms' }}>
            <Link to="/get-started">
              <Button size="lg" className="bg-white text-blue-700 hover:bg-gray-100 text-lg px-10 py-6 rounded-full shadow-2xl">
                Apply Now <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </Link>
            <Link to="/connect">
              <Button size="lg" variant="outline" className="bg-transparent border-2 border-white text-white hover:bg-white/10 text-lg px-10 py-6 rounded-full">
                Contact Us
              </Button>
            </Link>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
