import React from 'react';

export default function DurableLanding() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-12 px-4">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-12">
          <h1 className="text-5xl font-bold text-gray-900 mb-4">
            Durable Skills for Lasting Success
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Build the foundational skills that employers value most
          </p>
        </div>
        
        <div className="grid md:grid-cols-3 gap-8 mt-12">
          <div className="bg-white p-8 rounded-lg shadow-lg">
            <h3 className="text-2xl font-bold mb-4">Communication</h3>
            <p className="text-gray-600">Master professional communication skills</p>
          </div>
          <div className="bg-white p-8 rounded-lg shadow-lg">
            <h3 className="text-2xl font-bold mb-4">Problem Solving</h3>
            <p className="text-gray-600">Develop critical thinking abilities</p>
          </div>
          <div className="bg-white p-8 rounded-lg shadow-lg">
            <h3 className="text-2xl font-bold mb-4">Teamwork</h3>
            <p className="text-gray-600">Learn to collaborate effectively</p>
          </div>
        </div>
      </div>
    </div>
  );
}
