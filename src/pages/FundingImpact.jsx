/*
  Copyright (c) 2025 Elevate for Humanity
  Commercial License. No resale, sublicensing, or redistribution allowed.
  See LICENSE file for details.
*/

import React from 'react';

export default function FundingImpact() {
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 mb-6">Funding Impact Dashboard</h1>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* Total Funding Card */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-semibold text-gray-800 mb-2">Total Funding</h2>
            <p className="text-3xl font-bold text-green-600">$245,750</p>
            <p className="text-sm text-gray-500 mt-1">Across all programs</p>
          </div>

          {/* Programs Funded Card */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-semibold text-gray-800 mb-2">Programs Funded</h2>
            <p className="text-3xl font-bold text-blue-600">23</p>
            <p className="text-sm text-gray-500 mt-1">Active programs</p>
          </div>

          {/* Lives Impacted Card */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-semibold text-gray-800 mb-2">Lives Impacted</h2>
            <p className="text-3xl font-bold text-purple-600">1,247</p>
            <p className="text-sm text-gray-500 mt-1">Individuals served</p>
          </div>
        </div>

        {/* Recent Activity */}
        <div className="mt-8 bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-semibold text-gray-800 mb-4">Recent Funding Activity</h2>
          <div className="space-y-4">
            <div className="border-l-4 border-green-500 pl-4">
              <h3 className="font-medium text-gray-900">Tech Skills Training</h3>
              <p className="text-sm text-gray-600">$25,000 funding approved</p>
              <p className="text-xs text-gray-500">2 days ago</p>
            </div>
            <div className="border-l-4 border-blue-500 pl-4">
              <h3 className="font-medium text-gray-900">Youth Leadership Program</h3>
              <p className="text-sm text-gray-600">$15,500 funding approved</p>
              <p className="text-xs text-gray-500">1 week ago</p>
            </div>
            <div className="border-l-4 border-purple-500 pl-4">
              <h3 className="font-medium text-gray-900">Small Business Incubator</h3>
              <p className="text-sm text-gray-600">$45,000 funding approved</p>
              <p className="text-xs text-gray-500">2 weeks ago</p>
            </div>
          </div>
        </div>

        {/* Impact Metrics */}
        <div className="mt-8 bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-semibold text-gray-800 mb-4">Impact Metrics</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h3 className="font-medium text-gray-900 mb-2">Program Completion Rate</h3>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div className="bg-green-600 h-2 rounded-full" style={{ width: '87%' }}></div>
              </div>
              <p className="text-sm text-gray-600 mt-1">87% completion rate</p>
            </div>
            <div>
              <h3 className="font-medium text-gray-900 mb-2">Employment Success Rate</h3>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div className="bg-blue-600 h-2 rounded-full" style={{ width: '74%' }}></div>
              </div>
              <p className="text-sm text-gray-600 mt-1">74% employment success</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}