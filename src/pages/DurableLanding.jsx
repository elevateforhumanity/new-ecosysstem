import React from 'react';
import { Link } from 'react-router-dom';

export default function DurableLanding() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="max-w-7xl mx-auto px-4 py-16">
        <div className="text-center mb-16">
          <h1 className="text-6xl font-bold text-gray-900 mb-6">
            Build Durable Skills for the Future
          </h1>
          <p className="text-2xl text-gray-600 max-w-3xl mx-auto mb-8">
            Master the essential skills that employers value most and build a lasting career
          </p>
          <div className="flex gap-4 justify-center">
            <Link to="/courses" className="bg-brand-info text-white px-8 py-4 rounded-lg font-semibold hover:bg-brand-info-hover transition">
              Explore Programs
            </Link>
            <Link to="/get-started" className="bg-white text-brand-info px-8 py-4 rounded-lg font-semibold border-2 border-indigo-600 hover:bg-brand-surface transition">
              Get Started Free
            </Link>
          </div>
        </div>

        <div className="grid md:grid-cols-3 gap-8 mb-16">
          <div className="bg-white p-8 rounded-xl shadow-lg">
            <div className="text-5xl mb-4">💬</div>
            <h3 className="text-2xl font-bold mb-4">Communication</h3>
            <p className="text-gray-600">Master professional communication, presentation, and interpersonal skills</p>
          </div>
          <div className="bg-white p-8 rounded-xl shadow-lg">
            <div className="text-5xl mb-4">🧠</div>
            <h3 className="text-2xl font-bold mb-4">Critical Thinking</h3>
            <p className="text-gray-600">Develop problem-solving and analytical thinking abilities</p>
          </div>
          <div className="bg-white p-8 rounded-xl shadow-lg">
            <div className="text-5xl mb-4">🤝</div>
            <h3 className="text-2xl font-bold mb-4">Collaboration</h3>
            <p className="text-gray-600">Learn to work effectively in teams and lead projects</p>
          </div>
        </div>

        <div className="bg-white p-12 rounded-xl shadow-lg">
          <h2 className="text-4xl font-bold mb-6 text-center">Why Durable Skills Matter</h2>
          <div className="grid md:grid-cols-2 gap-8">
            <div>
              <h3 className="text-xl font-semibold mb-3">🎯 Career Resilience</h3>
              <p className="text-gray-600">Skills that remain valuable regardless of technological changes</p>
            </div>
            <div>
              <h3 className="text-xl font-semibold mb-3">📈 Higher Earning Potential</h3>
              <p className="text-gray-600">Professionals with strong durable skills earn 20% more on average</p>
            </div>
            <div>
              <h3 className="text-xl font-semibold mb-3">🌟 Leadership Opportunities</h3>
              <p className="text-gray-600">Essential for advancing into management and leadership roles</p>
            </div>
            <div>
              <h3 className="text-xl font-semibold mb-3">🔄 Adaptability</h3>
              <p className="text-gray-600">Easily transition between industries and roles</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
