import React from 'react';
import { Link } from 'react-router-dom';

export default function DurableTemplates() {
  const templates = [
    { name: 'Career Development', icon: '💼', courses: 12 },
    { name: 'Technical Skills', icon: '💻', courses: 18 },
    { name: 'Leadership', icon: '👔', courses: 8 },
    { name: 'Communication', icon: '💬', courses: 10 },
    { name: 'Project Management', icon: '📊', courses: 15 },
    { name: 'Entrepreneurship', icon: '🚀', courses: 9 },
  ];

  return (
    <div className="min-h-screen bg-gray-50 py-16">
      <div className="max-w-7xl mx-auto px-4">
        <div className="text-center mb-16">
          <h1 className="text-5xl font-bold text-gray-900 mb-4">
            Program Templates
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Pre-built learning paths designed by industry experts
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8">
          {templates.map((template, index) => (
            <div key={index} className="bg-white p-8 rounded-xl shadow-lg hover:shadow-xl transition">
              <div className="text-6xl mb-4">{template.icon}</div>
              <h3 className="text-2xl font-bold mb-2">{template.name}</h3>
              <p className="text-gray-600 mb-4">{template.courses} courses included</p>
              <Link to="/courses" className="text-brand-info font-semibold hover:text-brand-info">
                View Template →
              </Link>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
