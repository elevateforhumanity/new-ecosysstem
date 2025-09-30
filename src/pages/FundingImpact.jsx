/*
  Copyright (c) 2025 Elevate for Humanity
  Commercial License. No resale, sublicensing, or redistribution allowed.
  See LICENSE file for details.
*/

import React from 'react';

export default function FundingImpact() {
  return (
    <div className="max-w-4xl mx-auto p-6">
      <h1 className="text-3xl font-bold mb-6">Funding Impact</h1>
      <div className="bg-white rounded-lg shadow-lg p-6">
        <h2 className="text-2xl font-semibold mb-4">Making a Difference</h2>
        <p className="text-gray-700 mb-4">
          Our funding initiatives create lasting impact in communities across the globe.
          Every dollar invested goes directly toward education, skill development, and
          empowerment programs.
        </p>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-6">
          <div className="bg-blue-50 p-4 rounded-lg">
            <h3 className="text-lg font-semibold text-blue-800 mb-2">Education Programs</h3>
            <p className="text-blue-700">
              Supporting learners with comprehensive educational resources and mentorship.
            </p>
          </div>
          <div className="bg-green-50 p-4 rounded-lg">
            <h3 className="text-lg font-semibold text-green-800 mb-2">Skill Development</h3>
            <p className="text-green-700">
              Providing hands-on training and certification programs for career advancement.
            </p>
          </div>
          <div className="bg-purple-50 p-4 rounded-lg">
            <h3 className="text-lg font-semibold text-purple-800 mb-2">Community Outreach</h3>
            <p className="text-purple-700">
              Building bridges between learners and opportunities in their local communities.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}