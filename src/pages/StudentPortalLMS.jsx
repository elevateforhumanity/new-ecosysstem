/*
  Copyright (c) 2025 Elevate for Humanity
  Commercial License. No resale, sublicensing, or redistribution allowed.
  See LICENSE file for details.
*/

import { useState } from 'react'

export default function StudentPortalLMS() {
  const [activeTab, setActiveTab] = useState('enrollment')

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Portal Header */}
      <div className="bg-gradient-to-r from-blue-800 to-blue-600 text-white py-8 text-center">
        <div className="max-w-7xl mx-auto px-8">
          <h1 className="text-4xl font-bold mb-2">🎓 Student Portal</h1>
          <p className="text-lg">Elevate for Humanity Career & Training Institute</p>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="bg-white shadow-md mb-8">
        <div className="max-w-7xl mx-auto px-8">
          <div className="flex flex-wrap justify-center gap-4 py-4">
            <button 
              onClick={() => setActiveTab('enrollment')}
              className={`px-6 py-3 rounded-lg font-semibold transition ${
                activeTab === 'enrollment' 
                  ? 'bg-blue-800 text-white' 
                  : 'bg-gray-100 text-gray-700 hover:bg-blue-600 hover:text-white'
              }`}
            >
              📝 Enrollment
            </button>
            <button 
              onClick={() => setActiveTab('dashboard')}
              className={`px-6 py-3 rounded-lg font-semibold transition ${
                activeTab === 'dashboard' 
                  ? 'bg-blue-800 text-white' 
                  : 'bg-gray-100 text-gray-700 hover:bg-blue-600 hover:text-white'
              }`}
            >
              📊 Dashboard
            </button>
            <button 
              onClick={() => setActiveTab('courses')}
              className={`px-6 py-3 rounded-lg font-semibold transition ${
                activeTab === 'courses' 
                  ? 'bg-blue-800 text-white' 
                  : 'bg-gray-100 text-gray-700 hover:bg-blue-600 hover:text-white'
              }`}
            >
              📚 My Courses
            </button>
            <button 
              onClick={() => setActiveTab('certificates')}
              className={`px-6 py-3 rounded-lg font-semibold transition ${
                activeTab === 'certificates' 
                  ? 'bg-blue-800 text-white' 
                  : 'bg-gray-100 text-gray-700 hover:bg-blue-600 hover:text-white'
              }`}
            >
              🏆 Certificates
            </button>
            <button 
              onClick={() => setActiveTab('profile')}
              className={`px-6 py-3 rounded-lg font-semibold transition ${
                activeTab === 'profile' 
                  ? 'bg-blue-800 text-white' 
                  : 'bg-gray-100 text-gray-700 hover:bg-blue-600 hover:text-white'
              }`}
            >
              👤 Profile
            </button>
            <button 
              onClick={() => setActiveTab('support')}
              className={`px-6 py-3 rounded-lg font-semibold transition ${
                activeTab === 'support' 
                  ? 'bg-blue-800 text-white' 
                  : 'bg-gray-100 text-gray-700 hover:bg-blue-600 hover:text-white'
              }`}
            >
              💬 Support
            </button>
          </div>
        </div>
      </div>

      {/* Tab Content */}
      <div className="max-w-7xl mx-auto px-8 pb-16">
        
        {/* Enrollment Tab */}
        {activeTab === 'enrollment' && (
          <div className="bg-white p-8 rounded-xl shadow-sm">
            <h2 className="text-3xl font-bold mb-4">📝 Course Enrollment</h2>
            <p className="text-gray-600 mb-8">
              Select and enroll in professional certification programs. All courses include hybrid learning with online modules and hands-on skills validation.
            </p>
            
            <form className="space-y-6">
              <div>
                <label className="block mb-2 font-semibold text-gray-700">Select Training Program *</label>
                <select className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500">
                  <option value="">Choose a program...</option>
                  <optgroup label="Healthcare & Public Safety">
                    <option value="hha">Home Health Aide (HHA) Training - $299</option>
                    <option value="cpr">CPR & OSHA Safety Technician - $89</option>
                    <option value="dsp">Direct Support Professional (DSP) - $199</option>
                  </optgroup>
                  <optgroup label="Technology & Digital Tools">
                    <option value="microsoft">Microsoft Office Specialist - $149</option>
                    <option value="google">Google Workspace Productivity - $99</option>
                    <option value="digital-literacy">Digital Literacy & IC3 - $129</option>
                  </optgroup>
                  <optgroup label="Food Service & Business">
                    <option value="servsafe">ServSafe Food Handler - $69</option>
                    <option value="servsafe-manager">ServSafe Manager - $149</option>
                    <option value="entrepreneurship">Youth Entrepreneurship - $199</option>
                  </optgroup>
                </select>
              </div>
              
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <label className="block mb-2 font-semibold text-gray-700">First Name *</label>
                  <input type="text" className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500" />
                </div>
                <div>
                  <label className="block mb-2 font-semibold text-gray-700">Last Name *</label>
                  <input type="text" className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500" />
                </div>
              </div>
              
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <label className="block mb-2 font-semibold text-gray-700">Email Address *</label>
                  <input type="email" className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500" />
                </div>
                <div>
                  <label className="block mb-2 font-semibold text-gray-700">Phone Number *</label>
                  <input type="tel" className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500" />
                </div>
              </div>
              
              <div>
                <label className="block mb-2 font-semibold text-gray-700">Funding Source</label>
                <select className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500">
                  <option value="">Select funding source...</option>
                  <option value="self-pay">Self Pay</option>
                  <option value="wioa">WIOA (Workforce Innovation)</option>
                  <option value="employer">Employer Sponsored</option>
                  <option value="grant">Grant/Scholarship</option>
                  <option value="va-benefits">VA Benefits</option>
                </select>
              </div>
              
              <button type="submit" className="w-full bg-blue-800 hover:bg-blue-900 text-white px-8 py-4 rounded-lg font-semibold transition">
                Submit Enrollment Application
              </button>
            </form>
          </div>
        )}

        {/* Dashboard Tab */}
        {activeTab === 'dashboard' && (
          <div>
            <div className="bg-green-50 border border-green-200 text-green-800 p-4 rounded-lg mb-8">
              <strong>Welcome back, Student!</strong> You have 2 active courses and 1 completed certification.
            </div>
            
            <div className="grid md:grid-cols-2 gap-8 mb-8">
              <div className="bg-gray-50 border border-gray-200 rounded-xl p-6">
                <h3 className="text-xl font-semibold text-blue-800 mb-4">Overall Progress</h3>
                <div className="bg-gray-200 rounded-full h-5 mb-3 overflow-hidden">
                  <div className="bg-gradient-to-r from-green-600 to-green-500 h-full rounded-full" style={{width: '68%'}}></div>
                </div>
                <p className="text-gray-700">68% Complete - 2 of 3 courses finished</p>
              </div>
              
              <div className="bg-gray-50 border border-gray-200 rounded-xl p-6">
                <h3 className="text-xl font-semibold text-blue-800 mb-4">Quick Stats</h3>
                <p className="text-gray-700"><strong>Enrolled Courses:</strong> 3</p>
                <p className="text-gray-700"><strong>Completed:</strong> 1</p>
                <p className="text-gray-700"><strong>Certificates Earned:</strong> 1</p>
                <p className="text-gray-700"><strong>Next Deadline:</strong> March 15, 2024</p>
              </div>
            </div>
            
            <div className="bg-white p-8 rounded-xl shadow-sm">
              <h3 className="text-2xl font-bold mb-4">Recent Activity</h3>
              <div className="space-y-3">
                <p className="text-gray-700"><strong>March 10:</strong> Completed CPR Skills Assessment</p>
                <p className="text-gray-700"><strong>March 8:</strong> Submitted Module 3 Assignment - Microsoft Excel</p>
                <p className="text-gray-700"><strong>March 5:</strong> Started OSHA 10 Hour Training</p>
                <p className="text-gray-700"><strong>March 1:</strong> Earned ServSafe Food Handler Certificate</p>
              </div>
            </div>
          </div>
        )}

        {/* Courses Tab */}
        {activeTab === 'courses' && (
          <div className="space-y-6">
            <h2 className="text-3xl font-bold mb-6">📚 My Courses</h2>
            
            <div className="bg-gray-50 border border-gray-200 rounded-xl p-6">
              <div className="flex justify-between items-start mb-4">
                <h3 className="text-xl font-semibold text-blue-800">CPR & OSHA Safety Technician</h3>
                <span className="bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm font-semibold">Completed</span>
              </div>
              <div className="bg-gray-200 rounded-full h-5 mb-3 overflow-hidden">
                <div className="bg-gradient-to-r from-green-600 to-green-500 h-full rounded-full" style={{width: '100%'}}></div>
              </div>
              <p className="text-gray-700 mb-2"><strong>Completion Date:</strong> February 28, 2024</p>
              <p className="text-gray-700 mb-4"><strong>Grade:</strong> 94% (Pass)</p>
              <button className="bg-green-600 hover:bg-green-700 text-white px-6 py-2 rounded-lg font-semibold transition">
                View Certificate
              </button>
            </div>
            
            <div className="bg-gray-50 border border-gray-200 rounded-xl p-6">
              <div className="flex justify-between items-start mb-4">
                <h3 className="text-xl font-semibold text-blue-800">Microsoft Office Specialist</h3>
                <span className="bg-yellow-100 text-yellow-800 px-3 py-1 rounded-full text-sm font-semibold">In Progress</span>
              </div>
              <div className="bg-gray-200 rounded-full h-5 mb-3 overflow-hidden">
                <div className="bg-gradient-to-r from-green-600 to-green-500 h-full rounded-full" style={{width: '75%'}}></div>
              </div>
              <p className="text-gray-700 mb-2"><strong>Progress:</strong> 75% Complete</p>
              <p className="text-gray-700 mb-2"><strong>Next Module:</strong> PowerPoint Advanced Features</p>
              <p className="text-gray-700 mb-4"><strong>Due Date:</strong> March 15, 2024</p>
              <button className="bg-blue-800 hover:bg-blue-900 text-white px-6 py-2 rounded-lg font-semibold transition">
                Continue Course
              </button>
            </div>
            
            <div className="bg-gray-50 border border-gray-200 rounded-xl p-6">
              <div className="flex justify-between items-start mb-4">
                <h3 className="text-xl font-semibold text-blue-800">OSHA 10 Hour Certification</h3>
                <span className="bg-yellow-100 text-yellow-800 px-3 py-1 rounded-full text-sm font-semibold">In Progress</span>
              </div>
              <div className="bg-gray-200 rounded-full h-5 mb-3 overflow-hidden">
                <div className="bg-gradient-to-r from-green-600 to-green-500 h-full rounded-full" style={{width: '30%'}}></div>
              </div>
              <p className="text-gray-700 mb-2"><strong>Progress:</strong> 30% Complete</p>
              <p className="text-gray-700 mb-2"><strong>Next Module:</strong> Hazard Recognition</p>
              <p className="text-gray-700 mb-4"><strong>Due Date:</strong> March 30, 2024</p>
              <button className="bg-blue-800 hover:bg-blue-900 text-white px-6 py-2 rounded-lg font-semibold transition">
                Continue Course
              </button>
            </div>
          </div>
        )}

        {/* Certificates Tab */}
        {activeTab === 'certificates' && (
          <div>
            <h2 className="text-3xl font-bold mb-6">🏆 My Certificates</h2>
            
            <div className="bg-gradient-to-br from-green-50 to-green-100 border-2 border-green-600 rounded-xl p-8 text-center">
              <h3 className="text-2xl font-bold text-green-700 mb-4">🏥 CPR & OSHA Safety Technician</h3>
              <p className="text-gray-700 mb-2"><strong>Issued:</strong> February 28, 2024</p>
              <p className="text-gray-700 mb-2"><strong>Expires:</strong> February 28, 2026</p>
              <p className="text-gray-700 mb-6"><strong>Certificate ID:</strong> EFH-CPR-2024-001247</p>
              <div className="flex gap-4 justify-center">
                <button className="bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded-lg font-semibold transition">
                  Download PDF
                </button>
                <button className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-semibold transition">
                  Share Certificate
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Profile Tab */}
        {activeTab === 'profile' && (
          <div className="bg-white p-8 rounded-xl shadow-sm">
            <h2 className="text-3xl font-bold mb-6">👤 My Profile</h2>
            <div className="space-y-4">
              <div>
                <label className="block mb-2 font-semibold text-gray-700">Full Name</label>
                <input type="text" defaultValue="John Doe" className="w-full p-3 border border-gray-300 rounded-lg" />
              </div>
              <div>
                <label className="block mb-2 font-semibold text-gray-700">Email</label>
                <input type="email" defaultValue="john.doe@example.com" className="w-full p-3 border border-gray-300 rounded-lg" />
              </div>
              <div>
                <label className="block mb-2 font-semibold text-gray-700">Phone</label>
                <input type="tel" defaultValue="(555) 123-4567" className="w-full p-3 border border-gray-300 rounded-lg" />
              </div>
              <button className="bg-blue-800 hover:bg-blue-900 text-white px-8 py-3 rounded-lg font-semibold transition">
                Update Profile
              </button>
            </div>
          </div>
        )}

        {/* Support Tab */}
        {activeTab === 'support' && (
          <div className="bg-white p-8 rounded-xl shadow-sm">
            <h2 className="text-3xl font-bold mb-6">💬 Support</h2>
            <div className="space-y-6">
              <div className="bg-blue-50 border border-blue-200 p-6 rounded-lg">
                <h3 className="text-xl font-semibold text-blue-800 mb-2">Need Help?</h3>
                <p className="text-gray-700 mb-4">Our support team is here to assist you Monday-Friday, 9 AM - 5 PM EST</p>
                <p className="text-gray-700"><strong>Email:</strong> support@elevateforhumanity.org</p>
                <p className="text-gray-700"><strong>Phone:</strong> (555) 123-4567</p>
              </div>
              
              <div>
                <h3 className="text-xl font-semibold mb-4">Submit a Support Ticket</h3>
                <form className="space-y-4">
                  <div>
                    <label className="block mb-2 font-semibold text-gray-700">Subject</label>
                    <input type="text" className="w-full p-3 border border-gray-300 rounded-lg" />
                  </div>
                  <div>
                    <label className="block mb-2 font-semibold text-gray-700">Message</label>
                    <textarea rows="5" className="w-full p-3 border border-gray-300 rounded-lg"></textarea>
                  </div>
                  <button className="bg-blue-800 hover:bg-blue-900 text-white px-8 py-3 rounded-lg font-semibold transition">
                    Submit Ticket
                  </button>
                </form>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
