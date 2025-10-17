/*
  Copyright (c) 2025 Elevate for Humanity
  Commercial License. No resale, sublicensing, or redistribution allowed.
  See LICENSE file for details.
*/

import React from "react";
import { Link } from "react-router-dom";
import AppLayout from "../layouts/AppLayout";
import { useAnalytics } from "../hooks/useAnalytics";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../components/ui/card";
import { Badge } from "../components/ui/badge";
import { Button } from "../components/ui/button";
import { 
  Target, 
  Eye, 
  Heart, 
  GraduationCap, 
  Building2, 
  HandHeart, 
  Users, 
  Award,
  CheckCircle2,
  TrendingUp,
  Shield,
  Sparkles
} from "lucide-react";

export default function About() {
  useAnalytics("About");

  const stats = [
    { number: "1,247+", label: "Students Trained", icon: Users },
    { number: "87%", label: "Graduation Rate", icon: GraduationCap },
    { number: "$2.85M", label: "Funding Distributed", icon: TrendingUp },
    { number: "92%", label: "Job Placement", icon: Award },
  ];

  const values = [
    { icon: Target, title: "Our Mission", description: "To empower learners and communities through innovative, inclusive, and compliant online education that creates pathways to prosperity and meaningful careers.", color: "text-blue-600", bg: "bg-blue-50" },
    { icon: Eye, title: "Our Vision", description: "A world where quality education and workforce training are accessible to all, regardless of background or circumstance, creating thriving communities.", color: "text-green-600", bg: "bg-green-50" },
    { icon: Heart, title: "Our Values", description: "Excellence, accessibility, integrity, innovation, and community impact guide everything we do.", color: "text-purple-600", bg: "bg-purple-50" },
  ];

  const services = [
    { 
      icon: GraduationCap, 
      title: "Education & Training", 
      description: "Comprehensive Learn2Earn Workforce programs, apprenticeships, and skills training designed to meet industry demands.",
      color: "text-blue-600",
      bg: "bg-blue-50"
    },
    { 
      icon: Building2, 
      title: "Government Partnerships", 
      description: "Certified government contractor providing workforce and education services for federal, state, and local agencies.",
      color: "text-purple-600",
      bg: "bg-purple-50"
    },
    { 
      icon: HandHeart, 
      title: "Philanthropy & Grants", 
      description: "Supporting communities through strategic giving, grant programs, and partnerships that create lasting social impact.",
      color: "text-pink-600",
      bg: "bg-pink-50"
    },
    { 
      icon: Users, 
      title: "Community Impact", 
      description: "Building stronger communities through education, mentorship, and workforce initiatives.",
      color: "text-green-600",
      bg: "bg-green-50"
    },
  ];

  const certifications = [
    "DOL Compliant",
    "DWD Certified",
    "DOE Approved",
    "Veteran-Owned Small Business",
    "ETPL Provider",
    "DOL Apprenticeship Sponsor",
    "WIOA Approved",
    "Government Contractor"
  ];

  return (
    <AppLayout title="About Us">
      <div className="min-h-screen bg-background">
        {/* Hero Section */}
        <section className="relative bg-gradient-to-br from-blue-700 via-purple-600 to-purple-700 text-white py-24 px-4 overflow-hidden">
          <div className="absolute inset-0 bg-grid-white/[0.05] bg-[size:20px_20px]" />
          <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent" />
          
          <div className="relative max-w-6xl mx-auto text-center">
            <Badge className="mb-6 text-base px-6 py-2 bg-white/20 backdrop-blur-sm border-white/30 animate-fade-in-down">
              <Sparkles className="h-4 w-4 mr-2" />
              Transforming Lives Since 2020
            </Badge>
            
            <h1 className="text-5xl md:text-7xl font-extrabold mb-6 animate-fade-in-up leading-tight">
              About Elevate<br />
              <span className="text-yellow-300">for Humanity</span>
            </h1>
            
            <p className="text-xl md:text-2xl text-blue-100 mb-12 max-w-3xl mx-auto animate-fade-in-up" style={{ animationDelay: '100ms' }}>
              Transforming lives through accessible education and Learn2Earn Workforce programs
            </p>

            {/* Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6 max-w-5xl mx-auto">
              {stats.map((stat, idx) => (
                <div 
                  key={idx} 
                  className="backdrop-blur-sm bg-white/10 rounded-2xl p-6 border border-white/20 animate-scale-in"
                  style={{ animationDelay: `${200 + idx * 100}ms` }}
                >
                  <stat.icon className="h-8 w-8 mx-auto mb-3 text-yellow-300" />
                  <div className="text-4xl font-bold mb-2">{stat.number}</div>
                  <div className="text-sm text-blue-100">{stat.label}</div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Mission, Vision, Values */}
        <section className="py-20 px-4 bg-brand-surface">
          <div className="max-w-7xl mx-auto">
            <div className="grid md:grid-cols-3 gap-8">
              {values.map((value, idx) => (
                <Card 
                  key={idx} 
                  className="group hover:shadow-2xl transition-all duration-300 hover:-translate-y-2 border-2 animate-fade-in-up"
                  style={{ animationDelay: `${idx * 100}ms` }}
                >
                  <CardHeader>
                    <div className={`w-16 h-16 ${value.bg} rounded-2xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform`}>
                      <value.icon className={`h-8 w-8 ${value.color}`} />
                    </div>
                    <CardTitle className="text-2xl">{value.title}</CardTitle>
                    <CardDescription className="text-base leading-relaxed">
                      {value.description}
                    </CardDescription>
                  </CardHeader>
                </Card>
              ))}
            </div>
          </div>
        </section>

        {/* Story Section */}
        <section className="py-20 px-4 bg-white">
          <div className="max-w-4xl mx-auto">
            <div className="text-center mb-12 animate-fade-in-up">
              <Badge className="mb-4 text-base px-6 py-2">
                Our Story
              </Badge>
              <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
                Building Pathways to Prosperity
              </h2>
            </div>

            <Card className="border-2 shadow-xl animate-fade-in-up" style={{ animationDelay: '200ms' }}>
              <CardContent className="p-8 md:p-12 space-y-6 text-lg leading-relaxed text-gray-700">
                <p>
                  Founded by <strong className="text-blue-600">Elizabeth L. Greene</strong>, Elevate for Humanity emerged from a vision to create meaningful pathways to prosperity through education and Learn2Earn Workforce programs. As a certified <strong>Veteran-Owned Small Business</strong>, we understand the challenges faced by those seeking to transform their lives through education.
                </p>
                <p>
                  In partnership with Selfish Inc. dba, we've built a government-compliant nonprofit dedicated to accessible, high-quality education. We are <strong className="text-green-600">DOL, DWD, and DOE compliant</strong>, committed to transparency, accessibility, and student success.
                </p>
                <p className="text-xl font-semibold text-gray-900">
                  Today, we serve over <span className="text-blue-600">1,247 learners annually</span>, maintain an <span className="text-green-600">87% graduation rate</span>, and have distributed <span className="text-purple-600">$2.85M in funding</span> to support educational opportunities.
                </p>
              </CardContent>
            </Card>
          </div>
        </section>

        {/* What We Do */}
        <section className="py-20 px-4 bg-brand-surface">
          <div className="max-w-7xl mx-auto">
            <div className="text-center mb-16 animate-fade-in-up">
              <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
                What We Do
              </h2>
              <p className="text-xl text-brand-text-muted max-w-3xl mx-auto">
                Comprehensive services designed to empower individuals and strengthen communities
              </p>
            </div>

            <div className="grid md:grid-cols-2 gap-8">
              {services.map((service, idx) => (
                <Card 
                  key={idx} 
                  className="group hover:shadow-2xl transition-all duration-300 hover:-translate-y-1 border-2 animate-slide-in-left"
                  style={{ animationDelay: `${idx * 100}ms` }}
                >
                  <CardHeader>
                    <div className={`w-16 h-16 ${service.bg} rounded-2xl flex items-center justify-center mb-4 group-hover:scale-110 group-hover:rotate-6 transition-all`}>
                      <service.icon className={`h-8 w-8 ${service.color}`} />
                    </div>
                    <CardTitle className="text-2xl">{service.title}</CardTitle>
                    <CardDescription className="text-base leading-relaxed">
                      {service.description}
                    </CardDescription>
                  </CardHeader>
                </Card>
              ))}
            </div>
          </div>
        </section>

        {/* Certifications */}
        <section className="py-20 px-4 bg-white">
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-12 animate-fade-in-up">
              <Shield className="h-16 w-16 text-blue-600 mx-auto mb-4" />
              <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
                Certifications & Compliance
              </h2>
              <p className="text-xl text-brand-text-muted">
                Fully certified and compliant with all regulatory requirements
              </p>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {certifications.map((cert, idx) => (
                <Card 
                  key={idx} 
                  className="text-center hover:shadow-lg transition-all hover:scale-105 animate-bounce-in"
                  style={{ animationDelay: `${idx * 50}ms` }}
                >
                  <CardContent className="p-6">
                    <CheckCircle2 className="h-8 w-8 text-green-600 mx-auto mb-3" />
                    <p className="font-semibold text-gray-900">{cert}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="relative bg-gradient-to-br from-blue-700 via-purple-600 to-purple-700 text-white py-20 px-4 overflow-hidden">
          <div className="absolute inset-0 bg-grid-white/[0.05] bg-[size:20px_20px]" />
          <div className="relative max-w-4xl mx-auto text-center">
            <h2 className="text-4xl md:text-5xl font-bold mb-6 animate-fade-in-up">
              Ready to Transform Your Future?
            </h2>
            <p className="text-xl md:text-2xl mb-10 text-blue-100 animate-fade-in-up" style={{ animationDelay: '100ms' }}>
              Join thousands of students who've already started their journey
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center animate-fade-in-up" style={{ animationDelay: '200ms' }}>
              <Link to="/programs">
                <Button size="lg" className="bg-white text-blue-700 hover:bg-gray-100 text-lg px-10 py-6 rounded-full shadow-2xl">
                  Explore Programs
                </Button>
              </Link>
              <Link to="/connect">
                <Button size="lg" variant="outline" className="bg-transparent border-2 border-white text-white hover:bg-white/10 text-lg px-10 py-6 rounded-full">
                  Partner With Us
                </Button>
              </Link>
            </div>
          </div>
        </section>
      </div>
    </AppLayout>
  );
}
