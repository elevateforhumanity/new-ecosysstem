import React from 'react';
import { Link } from 'react-router-dom';

export default function DurableAI() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-pink-100">
      <div className="max-w-7xl mx-auto px-4 py-16">
        <div className="text-center mb-16">
          <h1 className="text-6xl font-bold text-gray-900 mb-6">
            AI-Powered Learning Platform
          </h1>
          <p className="text-2xl text-gray-600 max-w-3xl mx-auto mb-8">
            Personalized education powered by artificial intelligence
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-8 mb-16">
          <div className="bg-white p-8 rounded-xl shadow-lg">
            <div className="text-5xl mb-4">🤖</div>
            <h3 className="text-2xl font-bold mb-4">AI Tutor</h3>
            <p className="text-gray-600 mb-4">Get instant help from our AI tutor, available 24/7 to answer questions and provide guidance</p>
            <Link to="/ai-tutor" className="text-brand-info font-semibold hover:text-brand-info">
              Try AI Tutor →
            </Link>
          </div>
          <div className="bg-white p-8 rounded-xl shadow-lg">
            <div className="text-5xl mb-4">🎯</div>
            <h3 className="text-2xl font-bold mb-4">Adaptive Learning</h3>
            <p className="text-gray-600 mb-4">AI adjusts content difficulty and pace based on your performance and learning style</p>
            <Link to="/courses" className="text-brand-info font-semibold hover:text-brand-info">
              Start Learning →
            </Link>
          </div>
          <div className="bg-white p-8 rounded-xl shadow-lg">
            <div className="text-5xl mb-4">📊</div>
            <h3 className="text-2xl font-bold mb-4">Smart Analytics</h3>
            <p className="text-gray-600 mb-4">Track your progress with AI-powered insights and personalized recommendations</p>
            <Link to="/dashboard" className="text-brand-info font-semibold hover:text-brand-info">
              View Dashboard →
            </Link>
          </div>
          <div className="bg-white p-8 rounded-xl shadow-lg">
            <div className="text-5xl mb-4">✨</div>
            <h3 className="text-2xl font-bold mb-4">Content Generation</h3>
            <p className="text-gray-600 mb-4">AI creates custom practice problems and study materials tailored to your needs</p>
            <Link to="/lms" className="text-brand-info font-semibold hover:text-brand-info">
              Access LMS →
            </Link>
          </div>
        </div>

        <div className="bg-white p-12 rounded-xl shadow-lg text-center">
          <h2 className="text-4xl font-bold mb-6">Experience the Future of Learning</h2>
          <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
            Join thousands of learners who are achieving their goals faster with AI-powered education
          </p>
          <Link to="/get-started" className="bg-brand-info text-white px-8 py-4 rounded-lg font-semibold hover:bg-brand-info-hover transition inline-block">
            Get Started Free
          </Link>
        </div>
      </div>
    </div>
  );
}
