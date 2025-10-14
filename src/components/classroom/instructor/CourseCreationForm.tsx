import { useState } from 'react';
import { supabase } from '@/lib/supabase';

interface CourseFormData {
  name: string;
  section: string;
  description: string;
  room: string;
  descriptionHeading: string;
  ownerId?: string;
  courseState: 'PROVISIONED' | 'ACTIVE' | 'ARCHIVED' | 'DECLINED';
}

export default function CourseCreationForm() {
  const [formData, setFormData] = useState<CourseFormData>({
    name: '',
    section: '',
    description: '',
    room: '',
    descriptionHeading: 'Course Description',
    courseState: 'ACTIVE',
  });

  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const handleChange = (field: keyof CourseFormData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage(null);

    try {
      // Validate required fields
      if (!formData.name.trim()) {
        throw new Error('Course name is required');
      }

      // Queue task in Supabase
      const { data, error } = await supabase
        .from('tasks')
        .insert({
          kind: 'gc_create_course',
          payload: {
            name: formData.name,
            section: formData.section || undefined,
            description: formData.description || undefined,
            room: formData.room || undefined,
            descriptionHeading: formData.descriptionHeading,
            ownerId: formData.ownerId || undefined,
            courseState: formData.courseState,
          },
          priority: 7, // High priority for course creation
          status: 'pending',
        })
        .select()
        .single();

      if (error) throw error;

      setMessage({
        type: 'success',
        text: `Course creation queued! Task ID: ${data.id}. The course will be created within a few minutes.`,
      });

      // Reset form
      setFormData({
        name: '',
        section: '',
        description: '',
        room: '',
        descriptionHeading: 'Course Description',
        courseState: 'ACTIVE',
      });
    } catch (error: any) {
      setMessage({
        type: 'error',
        text: error.message || 'Failed to queue course creation',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto p-6">
      <div className="bg-white rounded-lg shadow-lg p-8">
        <div className="mb-6">
          <h1 className="text-3xl font-bold mb-2">Create New Course</h1>
          <p className="text-gray-600">
            Create a new Google Classroom course. The course will be created automatically by the autopilot system.
          </p>
        </div>

        {message && (
          <div
            className={`mb-6 p-4 rounded-lg ${
              message.type === 'success'
                ? 'bg-green-50 text-green-800 border border-green-200'
                : 'bg-red-50 text-red-800 border border-red-200'
            }`}
          >
            {message.text}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Course Name */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Course Name <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={formData.name}
              onChange={e => handleChange('name', e.target.value)}
              placeholder="e.g., CNA Training Fall 2025"
              required
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
            <p className="mt-1 text-sm text-gray-500">
              The name of the course (e.g., "CNA Training Fall 2025")
            </p>
          </div>

          {/* Section */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Section
            </label>
            <input
              type="text"
              value={formData.section}
              onChange={e => handleChange('section', e.target.value)}
              placeholder="e.g., Section A, Morning Class"
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
            <p className="mt-1 text-sm text-gray-500">
              Optional section identifier (e.g., "Section A", "Morning Class")
            </p>
          </div>

          {/* Room */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Room
            </label>
            <input
              type="text"
              value={formData.room}
              onChange={e => handleChange('room', e.target.value)}
              placeholder="e.g., Room 301, Building A"
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
            <p className="mt-1 text-sm text-gray-500">
              Optional room location (e.g., "Room 301", "Building A")
            </p>
          </div>

          {/* Description Heading */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Description Heading
            </label>
            <input
              type="text"
              value={formData.descriptionHeading}
              onChange={e => handleChange('descriptionHeading', e.target.value)}
              placeholder="e.g., Course Description, About This Course"
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
            <p className="mt-1 text-sm text-gray-500">
              Heading for the course description section
            </p>
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Course Description
            </label>
            <textarea
              value={formData.description}
              onChange={e => handleChange('description', e.target.value)}
              placeholder="Enter a detailed description of the course, including objectives, requirements, and expectations..."
              rows={6}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
            <p className="mt-1 text-sm text-gray-500">
              Detailed description of the course content and objectives
            </p>
          </div>

          {/* Course State */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Course State
            </label>
            <select
              value={formData.courseState}
              onChange={e => handleChange('courseState', e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="PROVISIONED">Provisioned (Draft)</option>
              <option value="ACTIVE">Active (Published)</option>
              <option value="ARCHIVED">Archived</option>
              <option value="DECLINED">Declined</option>
            </select>
            <p className="mt-1 text-sm text-gray-500">
              <strong>Active:</strong> Course is published and visible to students<br />
              <strong>Provisioned:</strong> Course is in draft mode
            </p>
          </div>

          {/* Submit Button */}
          <div className="flex gap-4 pt-4">
            <button
              type="submit"
              disabled={loading}
              className="flex-1 bg-blue-600 text-white py-3 px-6 rounded-lg font-semibold hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                  </svg>
                  Creating Course...
                </span>
              ) : (
                '📚 Create Course'
              )}
            </button>
            <button
              type="button"
              onClick={() => {
                setFormData({
                  name: '',
                  section: '',
                  description: '',
                  room: '',
                  descriptionHeading: 'Course Description',
                  courseState: 'ACTIVE',
                });
                setMessage(null);
              }}
              className="px-6 py-3 border border-gray-300 rounded-lg font-semibold hover:bg-gray-50 transition-colors"
            >
              Clear Form
            </button>
          </div>
        </form>

        {/* Help Section */}
        <div className="mt-8 p-4 bg-blue-50 rounded-lg border border-blue-200">
          <h3 className="font-semibold text-blue-900 mb-2">💡 Tips</h3>
          <ul className="text-sm text-blue-800 space-y-1">
            <li>• Course creation is processed by the autopilot system within 5-10 minutes</li>
            <li>• You'll receive the Course ID once it's created (check task status)</li>
            <li>• Start with "Provisioned" state to review before publishing</li>
            <li>• You can update course details later through the Google Classroom interface</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
