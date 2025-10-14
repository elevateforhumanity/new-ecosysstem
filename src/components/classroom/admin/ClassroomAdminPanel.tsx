import React, { useState } from 'react';
import { supabase } from '@/lib/supabase';

interface TaskTemplate {
  id: string;
  name: string;
  description: string;
  kind: string;
  icon: string;
  fields: Array<{
    name: string;
    label: string;
    type: 'text' | 'textarea' | 'date' | 'select';
    required: boolean;
    options?: string[];
  }>;
}

const TASK_TEMPLATES: TaskTemplate[] = [
  {
    id: 'create_course',
    name: 'Create Course',
    description: 'Create a new Google Classroom course',
    kind: 'gc_create_course',
    icon: '📚',
    fields: [
      { name: 'name', label: 'Course Name', type: 'text', required: true },
      { name: 'section', label: 'Section', type: 'text', required: false },
      { name: 'description', label: 'Description', type: 'textarea', required: false },
      { name: 'room', label: 'Room', type: 'text', required: false },
    ],
  },
  {
    id: 'invite_student',
    name: 'Invite Student',
    description: 'Invite a student to a course',
    kind: 'gc_invite_student',
    icon: '👨‍🎓',
    fields: [
      { name: 'courseId', label: 'Course ID', type: 'text', required: true },
      { name: 'email', label: 'Student Email', type: 'text', required: true },
    ],
  },
  {
    id: 'create_assignment',
    name: 'Create Assignment',
    description: 'Create a new assignment in a course',
    kind: 'gc_create_coursework',
    icon: '📝',
    fields: [
      { name: 'courseId', label: 'Course ID', type: 'text', required: true },
      { name: 'title', label: 'Assignment Title', type: 'text', required: true },
      { name: 'description', label: 'Description', type: 'textarea', required: false },
      { name: 'dueDate', label: 'Due Date', type: 'date', required: false },
      { name: 'maxPoints', label: 'Max Points', type: 'text', required: false },
    ],
  },
  {
    id: 'create_announcement',
    name: 'Post Announcement',
    description: 'Post an announcement to a course',
    kind: 'gc_create_announcement',
    icon: '📢',
    fields: [
      { name: 'courseId', label: 'Course ID', type: 'text', required: true },
      { name: 'text', label: 'Announcement Text', type: 'textarea', required: true },
    ],
  },
  {
    id: 'sync_roster',
    name: 'Sync Roster',
    description: 'Sync course roster with Supabase',
    kind: 'gc_sync_roster',
    icon: '🔄',
    fields: [
      { name: 'courseId', label: 'Course ID', type: 'text', required: true },
    ],
  },
  {
    id: 'export_grades',
    name: 'Export Grades',
    description: 'Export course grades to Supabase',
    kind: 'gc_export_grades',
    icon: '📊',
    fields: [
      { name: 'courseId', label: 'Course ID', type: 'text', required: true },
    ],
  },
];

export default function ClassroomAdminPanel() {
  const [selectedTemplate, setSelectedTemplate] = useState<TaskTemplate | null>(null);
  const [formData, setFormData] = useState<Record<string, string>>({});
  const [priority, setPriority] = useState(5);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const handleFieldChange = (fieldName: string, value: string) => {
    setFormData(prev => ({ ...prev, [fieldName]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedTemplate) return;

    setLoading(true);
    setMessage(null);

    try {
      // Build payload
      const payload: Record<string, any> = {};
      
      selectedTemplate.fields.forEach(field => {
        const value = formData[field.name];
        
        if (field.required && !value) {
          throw new Error(`${field.label} is required`);
        }
        
        if (value) {
          // Handle date fields
          if (field.type === 'date') {
            const date = new Date(value);
            payload[field.name] = {
              year: date.getFullYear(),
              month: date.getMonth() + 1,
              day: date.getDate(),
            };
          } else {
            payload[field.name] = value;
          }
        }
      });

      // Insert task into Supabase
      const { data, error } = await supabase
        .from('tasks')
        .insert({
          kind: selectedTemplate.kind,
          payload,
          priority,
          status: 'pending',
        })
        .select()
        .single();

      if (error) throw error;

      setMessage({
        type: 'success',
        text: `Task queued successfully! Task ID: ${data.id}`,
      });

      // Reset form
      setFormData({});
      setSelectedTemplate(null);
    } catch (error: any) {
      setMessage({
        type: 'error',
        text: error.message || 'Failed to queue task',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-6xl mx-auto p-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Google Classroom Admin Panel</h1>
        <p className="text-gray-600">Queue tasks for Google Classroom autopilot</p>
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

      {!selectedTemplate ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {TASK_TEMPLATES.map(template => (
            <button
              key={template.id}
              onClick={() => setSelectedTemplate(template)}
              className="p-6 bg-white rounded-lg shadow hover:shadow-lg transition-shadow text-left border border-gray-200"
            >
              <div className="text-4xl mb-3">{template.icon}</div>
              <h3 className="text-lg font-semibold mb-2">{template.name}</h3>
              <p className="text-sm text-gray-600">{template.description}</p>
            </button>
          ))}
        </div>
      ) : (
        <div className="bg-white rounded-lg shadow-lg p-6">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <span className="text-4xl">{selectedTemplate.icon}</span>
              <div>
                <h2 className="text-2xl font-bold">{selectedTemplate.name}</h2>
                <p className="text-gray-600">{selectedTemplate.description}</p>
              </div>
            </div>
            <button
              onClick={() => {
                setSelectedTemplate(null);
                setFormData({});
                setMessage(null);
              }}
              className="text-gray-500 hover:text-gray-700"
            >
              ✕
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {selectedTemplate.fields.map(field => (
              <div key={field.name}>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  {field.label}
                  {field.required && <span className="text-red-500 ml-1">*</span>}
                </label>
                {field.type === 'textarea' ? (
                  <textarea
                    value={formData[field.name] || ''}
                    onChange={e => handleFieldChange(field.name, e.target.value)}
                    required={field.required}
                    rows={4}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                ) : field.type === 'select' ? (
                  <select
                    value={formData[field.name] || ''}
                    onChange={e => handleFieldChange(field.name, e.target.value)}
                    required={field.required}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="">Select...</option>
                    {field.options?.map(option => (
                      <option key={option} value={option}>
                        {option}
                      </option>
                    ))}
                  </select>
                ) : (
                  <input
                    type={field.type}
                    value={formData[field.name] || ''}
                    onChange={e => handleFieldChange(field.name, e.target.value)}
                    required={field.required}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                )}
              </div>
            ))}

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Priority (1-10, higher = more urgent)
              </label>
              <input
                type="number"
                min="1"
                max="10"
                value={priority}
                onChange={e => setPriority(parseInt(e.target.value))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            <div className="flex gap-3 pt-4">
              <button
                type="submit"
                disabled={loading}
                className="flex-1 bg-blue-600 text-white py-3 rounded-lg font-semibold hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {loading ? 'Queueing...' : 'Queue Task'}
              </button>
              <button
                type="button"
                onClick={() => {
                  setSelectedTemplate(null);
                  setFormData({});
                  setMessage(null);
                }}
                className="px-6 py-3 border border-gray-300 rounded-lg font-semibold hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
