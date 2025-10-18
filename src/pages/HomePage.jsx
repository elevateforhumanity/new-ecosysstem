import React from 'react';
import { Link } from 'react-router-dom';

export default function HomePage() {
  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="bg-gradient-to-r from-blue-600 to-indigo-700 text-white py-20 px-4">
        <div className="max-w-7xl mx-auto text-center">
          <h1 className="text-6xl font-bold mb-6">
            Elevate for Humanity
          </h1>
          <p className="text-2xl mb-8 max-w-3xl mx-auto">
            Empowering individuals through workforce development and education
          </p>
          <div className="flex gap-4 justify-center">
            <Link to="/programs" className="bg-white text-blue-600 px-8 py-3 rounded-lg font-semibold hover:bg-gray-100 transition">
              Explore Programs
            </Link>
            <Link to="/get-started" className="bg-transparent border-2 border-white px-8 py-3 rounded-lg font-semibold hover:bg-white hover:text-blue-600 transition">
              Get Started
            </Link>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 px-4">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-4xl font-bold text-center mb-12">Why Choose Us</h2>
          <div className="grid md:grid-cols-3 gap-8">
            <div className="text-center p-6">
              <div className="text-5xl mb-4">🎓</div>
              <h3 className="text-2xl font-bold mb-2">Quality Education</h3>
              <p className="text-gray-600">Industry-leading curriculum designed by experts</p>
            </div>
            <div className="text-center p-6">
              <div className="text-5xl mb-4">💼</div>
              <h3 className="text-2xl font-bold mb-2">Career Support</h3>
              <p className="text-gray-600">Job placement assistance and career guidance</p>
            </div>
            <div className="text-center p-6">
              <div className="text-5xl mb-4">🤝</div>
              <h3 className="text-2xl font-bold mb-2">Community</h3>
              <p className="text-gray-600">Join a supportive network of learners</p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
