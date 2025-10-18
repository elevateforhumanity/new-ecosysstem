import React from 'react';

export default function DurableAI() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-pink-100 py-12 px-4">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-12">
          <h1 className="text-5xl font-bold text-gray-900 mb-4">
            AI-Powered Learning
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Personalized education powered by artificial intelligence
          </p>
        </div>
        
        <div className="bg-white p-8 rounded-lg shadow-xl">
          <h2 className="text-3xl font-bold mb-6">Features</h2>
          <ul className="space-y-4 text-lg">
            <li>✨ Adaptive learning paths</li>
            <li>🎯 Personalized recommendations</li>
            <li>📊 Real-time progress tracking</li>
            <li>🤖 AI tutoring assistance</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
