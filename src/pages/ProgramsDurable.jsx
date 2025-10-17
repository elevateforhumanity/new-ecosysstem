import React from 'react';
import { Link } from 'react-router-dom';

export default function ProgramsDurable() {
  const programs = [
    {
      title: 'Workforce Development',
      description:
        'Comprehensive training for career advancement and job readiness',
      duration: '12 weeks',
      level: 'All Levels',
      students: '2,500+',
      image: '💼',
    },
    {
      title: 'Digital Skills Bootcamp',
      description:
        'Master essential digital tools and technologies for the modern workplace',
      duration: '8 weeks',
      level: 'Beginner',
      students: '1,800+',
      image: '💻',
    },
    {
      title: 'Leadership Academy',
      description:
        'Develop leadership skills and advance into management roles',
      duration: '10 weeks',
      level: 'Intermediate',
      students: '1,200+',
      image: '👔',
    },
    {
      title: 'Entrepreneurship Program',
      description: 'Learn to start and grow your own business',
      duration: '16 weeks',
      level: 'All Levels',
      students: '900+',
      image: '🚀',
    },
  ];

  return (
    <div className="min-h-screen bg-white py-16">
      <div className="max-w-7xl mx-auto px-4">
        <div className="text-center mb-16">
          <h1 className="text-5xl font-bold text-brand-text mb-4">
            Durable Skills Programs
          </h1>
          <p className="text-xl text-brand-text-muted max-w-2xl mx-auto">
            Comprehensive programs designed to build lasting career skills
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-8">
          {programs.map((program, index) => (
            <div
              key={index}
              className="bg-brand-surface p-8 rounded-xl hover:shadow-lg transition"
            >
              <div className="text-6xl mb-4">{program.image}</div>
              <h3 className="text-2xl font-bold mb-3">{program.title}</h3>
              <p className="text-brand-text-muted mb-6">
                {program.description}
              </p>
              <div className="flex gap-4 mb-6 text-sm text-brand-text-light">
                <span>⏱️ {program.duration}</span>
                <span>📊 {program.level}</span>
                <span>👥 {program.students}</span>
              </div>
              <Link
                to="/courses"
                className="inline-block bg-brand-info text-white px-6 py-3 rounded-lg font-semibold hover:bg-brand-info-hover transition"
              >
                View Program
              </Link>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
