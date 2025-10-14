import React from 'react'

import { BookOpen, Clock, Award, Play } from 'lucide-react'


export { Page }

function Page() {
  const courses = [
    {
      id: 'digital-drawing',
      title: 'Digital Drawing & Illustration Specialist',
      duration: '24 weeks • 600 hours',
      credentials: 'Adobe, Google, Canva credentials',
      enrolled: true,
      progress: 45
    },
    {
      id: 'ai-fundamentals',
      title: 'AI Fundamentals & Machine Learning',
      duration: '48 hours • 12 modules',
      credentials: 'Industry certification',
      enrolled: true,
      progress: 65
    },
    {
      id: 'data-science',
      title: 'Data Science & Analytics',
      duration: '64 hours • 16 modules',
      credentials: 'Professional certificate',
      enrolled: false,
      progress: 0
    },
    {
      id: 'cybersecurity',
      title: 'Cybersecurity Specialist',
      duration: '80 hours • 20 modules',
      credentials: 'CISSP preparation',
      enrolled: true,
      progress: 25
    }
  ]

  const stats = {
    totalHours: 156,
    completedModules: 28,
    certificates: 3,
    projects: 8
  }

  return (
    <>
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-4xl font-bold text-gray-900 mb-2">Learning Management System</h1>
        <p className="text-lg text-gray-600">Your personalized learning journey with federal compliance tracking</p>
      </div>

      <div className="grid lg:grid-cols-3 gap-8">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Continue Learning */}
          <div className="bg-gradient-to-r from-blue-500 to-purple-600 rounded-xl p-6 text-white">
            <h2 className="text-2xl font-bold mb-2">Continue Learning</h2>
            <p className="text-blue-100 mb-4">AI Fundamentals & Machine Learning</p>
            <div className="bg-white/20 rounded-full h-3 mb-2">
              <div className="bg-white rounded-full h-3" style={{ width: '65%' }}></div>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm">65% Complete</span>
              <button className="bg-white text-blue-600 px-6 py-2 rounded-lg font-semibold hover:bg-blue-50 transition-colors">
                Continue →
              </button>
            </div>
          </div>

          {/* My Courses */}
          <div className="bg-white rounded-xl border-2 border-gray-100 p-6">
            <h2 className="text-2xl font-bold mb-4">My Courses</h2>
            <div className="space-y-4">
              {courses.map((course) => (
                <div key={course.id} className="border-2 border-gray-100 rounded-xl p-5 hover:border-blue-200 transition-colors">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <h3 className="font-semibold text-lg">{course.title}</h3>
                        {course.enrolled && (
                          <span className="bg-green-100 text-green-800 px-2 py-1 rounded text-xs font-medium">
                            Enrolled
                          </span>
                        )}
                      </div>
                      <div className="flex items-center gap-4 text-sm text-gray-600 mb-2">
                        <span className="flex items-center gap-1">
                          <Clock className="h-4 w-4" />
                          {course.duration}
                        </span>
                        <span className="flex items-center gap-1">
                          <Award className="h-4 w-4" />
                          {course.credentials}
                        </span>
                      </div>
                      {course.enrolled && course.progress > 0 && (
                        <div>
                          <div className="bg-gray-200 rounded-full h-2 mb-1">
                            <div 
                              className="bg-blue-600 rounded-full h-2" 
                              style={{ width: `${course.progress}%` }}
                            ></div>
                          </div>
                          <p className="text-xs text-gray-600">{course.progress}% Complete</p>
                        </div>
                      )}
                    </div>
                    <div className="ml-4">
                      {course.enrolled ? (
                        <button className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors font-medium">
                          Continue
                        </button>
                      ) : (
                        <a href="/get-started">
                          <button className="bg-white text-blue-600 border-2 border-blue-600 px-4 py-2 rounded-lg hover:bg-blue-50 transition-colors font-medium">
                            Enroll
                          </button>
                        </a>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Google Career Certificates */}
          <div className="bg-white rounded-xl border-2 border-gray-100 p-6">
            <h3 className="text-xl font-semibold mb-4 flex items-center gap-2">
              <BookOpen className="w-5 h-5 text-blue-500" />
              Google Career Certificates - Available for Enrollment
            </h3>
            <div className="grid md:grid-cols-2 gap-4">
              {[
                { title: 'Google Data Analytics Certificate', duration: '6 months', price: '$1,200' },
                { title: 'Digital Marketing & E-commerce', duration: '6 months', price: '$1,000' },
                { title: 'Google Ads Certification', duration: '4-6 weeks', price: '$599' },
                { title: 'Google Analytics Certification', duration: '3-4 weeks', price: '$499' },
              ].map((cert) => (
                <div key={cert.title} className="border-2 border-gray-100 rounded-lg p-4 hover:border-blue-200 transition-colors">
                  <h4 className="font-medium mb-1">{cert.title}</h4>
                  <p className="text-sm text-gray-600 mb-3">{cert.duration} • {cert.price} with career coaching</p>
                  <a href="/programs">
                    <button className="text-blue-600 hover:text-blue-700 text-sm font-medium">
                      Enroll Now →
                    </button>
                  </a>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Digital Binder Stats */}
          <div className="bg-white rounded-xl border-2 border-gray-100 p-6">
            <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <Award className="h-5 w-5 text-blue-600" />
              Digital Learning Binder
            </h3>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-gray-600">Total Learning Hours</span>
                <span className="font-semibold">{stats.totalHours}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Completed Modules</span>
                <span className="font-semibold">{stats.completedModules}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Certificates Earned</span>
                <span className="font-semibold">{stats.certificates}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Projects Completed</span>
                <span className="font-semibold">{stats.projects}</span>
              </div>
            </div>
            <button className="w-full mt-4 bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 transition-colors font-medium">
              Download Transcript
            </button>
          </div>

          {/* Progress Badge */}
          <div className="bg-gradient-to-br from-yellow-50 to-orange-50 rounded-xl border-2 border-yellow-200 p-6 text-center">
            <div className="text-4xl mb-2">🏆</div>
            <h4 className="font-semibold mb-1">Overall Progress</h4>
            <div className="text-3xl font-bold text-orange-600 mb-2">45%</div>
            <p className="text-sm text-gray-600">Keep going! You're doing great.</p>
          </div>
        </div>
      </div>
    </>
  )
}

