import React, { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';

interface Submission {
  id: string;
  student_id: string;
  student_name: string;
  student_email: string;
  coursework_id: string;
  coursework_title: string;
  state: 'NEW' | 'CREATED' | 'TURNED_IN' | 'RETURNED' | 'RECLAIMED_BY_STUDENT';
  late: boolean;
  draft_grade: number | null;
  assigned_grade: number | null;
  max_points: number;
  submission_time: string;
  alternate_link: string;
}

interface Course {
  id: string;
  name: string;
}

interface Coursework {
  id: string;
  title: string;
  max_points: number;
}

export default function GradingInterface() {
  const [courses, setCourses] = useState<Course[]>([]);
  const [selectedCourse, setSelectedCourse] = useState<string>('');
  const [courseworks, setCourseworks] = useState<Coursework[]>([]);
  const [selectedCoursework, setSelectedCoursework] = useState<string>('');
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [loading, setLoading] = useState(false);
  const [grading, setGrading] = useState<Record<string, number>>({});
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Load courses
  useEffect(() => {
    loadCourses();
  }, []);

  // Load courseworks when course changes
  useEffect(() => {
    if (selectedCourse) {
      loadCourseworks(selectedCourse);
    }
  }, [selectedCourse]);

  // Load submissions when coursework changes
  useEffect(() => {
    if (selectedCoursework) {
      loadSubmissions(selectedCoursework);
    }
  }, [selectedCoursework]);

  const loadCourses = async () => {
    const { data, error } = await supabase
      .from('classroom_courses')
      .select('id, name')
      .eq('course_state', 'ACTIVE')
      .order('name');

    if (error) {
      console.error('Error loading courses:', error);
      return;
    }

    setCourses(data || []);
  };

  const loadCourseworks = async (courseId: string) => {
    const { data, error } = await supabase
      .from('classroom_coursework')
      .select('id, title, max_points')
      .eq('course_id', courseId)
      .eq('state', 'PUBLISHED')
      .order('creation_time', { ascending: false });

    if (error) {
      console.error('Error loading courseworks:', error);
      return;
    }

    setCourseworks(data || []);
  };

  const loadSubmissions = async (courseworkId: string) => {
    setLoading(true);

    const { data, error } = await supabase
      .from('classroom_submissions')
      .select(`
        *,
        student:classroom_students!inner(name, email),
        coursework:classroom_coursework!inner(title, max_points)
      `)
      .eq('coursework_id', courseworkId)
      .in('state', ['TURNED_IN', 'RETURNED'])
      .order('submission_time', { ascending: true });

    if (error) {
      console.error('Error loading submissions:', error);
      setLoading(false);
      return;
    }

    const formatted = (data || []).map((sub: any) => ({
      id: sub.id,
      student_id: sub.student_id,
      student_name: sub.student?.name || 'Unknown',
      student_email: sub.student?.email || '',
      coursework_id: sub.coursework_id,
      coursework_title: sub.coursework?.title || 'Unknown',
      state: sub.state,
      late: sub.late,
      draft_grade: sub.draft_grade,
      assigned_grade: sub.assigned_grade,
      max_points: sub.coursework?.max_points || 100,
      submission_time: sub.update_time,
      alternate_link: sub.alternate_link,
    }));

    setSubmissions(formatted);
    setLoading(false);

    // Initialize grading state
    const initialGrades: Record<string, number> = {};
    formatted.forEach(sub => {
      initialGrades[sub.id] = sub.assigned_grade || sub.draft_grade || 0;
    });
    setGrading(initialGrades);
  };

  const handleGradeChange = (submissionId: string, grade: number) => {
    setGrading(prev => ({ ...prev, [submissionId]: grade }));
  };

  const handleGradeSubmit = async (submission: Submission) => {
    const grade = grading[submission.id];

    if (grade < 0 || grade > submission.max_points) {
      setMessage({
        type: 'error',
        text: `Grade must be between 0 and ${submission.max_points}`,
      });
      return;
    }

    try {
      // Queue grading task
      const { error } = await supabase.from('tasks').insert({
        kind: 'gc_grade_submission',
        payload: {
          courseId: selectedCourse,
          courseworkId: submission.coursework_id,
          submissionId: submission.id,
          studentId: submission.student_id,
          grade: grade,
        },
        priority: 8, // High priority for grading
        status: 'pending',
      });

      if (error) throw error;

      setMessage({
        type: 'success',
        text: `Grade queued for ${submission.student_name}`,
      });

      // Update local state
      setSubmissions(prev =>
        prev.map(sub =>
          sub.id === submission.id ? { ...sub, draft_grade: grade } : sub
        )
      );
    } catch (error: any) {
      setMessage({
        type: 'error',
        text: error.message || 'Failed to queue grade',
      });
    }
  };

  const handleBulkGrade = async () => {
    const ungradedSubmissions = submissions.filter(
      sub => !sub.assigned_grade && grading[sub.id] !== undefined
    );

    if (ungradedSubmissions.length === 0) {
      setMessage({
        type: 'error',
        text: 'No ungraded submissions to process',
      });
      return;
    }

    try {
      const tasks = ungradedSubmissions.map(sub => ({
        kind: 'gc_grade_submission',
        payload: {
          courseId: selectedCourse,
          courseworkId: sub.coursework_id,
          submissionId: sub.id,
          studentId: sub.student_id,
          grade: grading[sub.id],
        },
        priority: 8,
        status: 'pending',
      }));

      const { error } = await supabase.from('tasks').insert(tasks);

      if (error) throw error;

      setMessage({
        type: 'success',
        text: `Queued ${ungradedSubmissions.length} grades for processing`,
      });
    } catch (error: any) {
      setMessage({
        type: 'error',
        text: error.message || 'Failed to queue bulk grades',
      });
    }
  };

  const getStateColor = (state: string) => {
    switch (state) {
      case 'TURNED_IN':
        return 'bg-brand-surface text-brand-info';
      case 'RETURNED':
        return 'bg-brand-surface text-brand-success';
      default:
        return 'bg-brand-surface-dark text-brand-text';
    }
  };

  return (
    <div className="max-w-7xl mx-auto p-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Grading Interface</h1>
        <p className="text-brand-text-muted">Grade student submissions for your courses</p>
      </div>

      {message && (
        <div
          className={`mb-6 p-4 rounded-lg ${
            message.type === 'success'
              ? 'bg-green-50 text-brand-success border border-green-200'
              : 'bg-red-50 text-red-800 border border-red-200'
          }`}
        >
          {message.text}
        </div>
      )}

      {/* Course Selection */}
      <div className="bg-white rounded-lg shadow p-6 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-brand-text mb-2">
              Select Course
            </label>
            <select
              value={selectedCourse}
              onChange={e => setSelectedCourse(e.target.value)}
              className="w-full px-4 py-2 border border-brand-border-dark rounded-lg focus:ring-2 focus:ring-brand-focus focus:border-transparent"
            >
              <option value="">Choose a course...</option>
              {courses.map(course => (
                <option key={course.id} value={course.id}>
                  {course.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-brand-text mb-2">
              Select Assignment
            </label>
            <select
              value={selectedCoursework}
              onChange={e => setSelectedCoursework(e.target.value)}
              disabled={!selectedCourse}
              className="w-full px-4 py-2 border border-brand-border-dark rounded-lg focus:ring-2 focus:ring-brand-focus focus:border-transparent disabled:bg-brand-surface-dark"
            >
              <option value="">Choose an assignment...</option>
              {courseworks.map(cw => (
                <option key={cw.id} value={cw.id}>
                  {cw.title} ({cw.max_points} points)
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Submissions List */}
      {loading ? (
        <div className="text-center py-12">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          <p className="mt-4 text-brand-text-muted">Loading submissions...</p>
        </div>
      ) : submissions.length > 0 ? (
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <div className="p-6 border-b border-brand-border flex justify-between items-center">
            <div>
              <h2 className="text-xl font-semibold">
                {submissions.length} Submission{submissions.length !== 1 ? 's' : ''}
              </h2>
              <p className="text-sm text-brand-text-muted mt-1">
                {submissions.filter(s => !s.assigned_grade).length} ungraded
              </p>
            </div>
            <button
              onClick={handleBulkGrade}
              className="px-6 py-2 bg-brand-info text-white rounded-lg hover:bg-brand-info-hover transition-colors"
            >
              Grade All Ungraded
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-brand-surface">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-brand-text-light uppercase tracking-wider">
                    Student
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-brand-text-light uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-brand-text-light uppercase tracking-wider">
                    Submitted
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-brand-text-light uppercase tracking-wider">
                    Grade
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-brand-text-light uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {submissions.map(submission => (
                  <tr key={submission.id} className="hover:bg-brand-surface">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div>
                        <div className="font-medium text-brand-text">
                          {submission.student_name}
                        </div>
                        <div className="text-sm text-brand-text-light">{submission.student_email}</div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span
                        className={`px-2 py-1 text-xs font-semibold rounded-full ${getStateColor(
                          submission.state
                        )}`}
                      >
                        {submission.state}
                      </span>
                      {submission.late && (
                        <span className="ml-2 px-2 py-1 text-xs font-semibold rounded-full bg-brand-surface text-red-800">
                          LATE
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-brand-text-light">
                      {new Date(submission.submission_time).toLocaleString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-2">
                        <input
                          type="number"
                          min="0"
                          max={submission.max_points}
                          value={grading[submission.id] || 0}
                          onChange={e =>
                            handleGradeChange(submission.id, parseFloat(e.target.value))
                          }
                          className="w-20 px-2 py-1 border border-brand-border-dark rounded focus:ring-2 focus:ring-brand-focus focus:border-transparent"
                        />
                        <span className="text-brand-text-light">/ {submission.max_points}</span>
                      </div>
                      {submission.assigned_grade !== null && (
                        <div className="text-xs text-brand-success mt-1">
                          Current: {submission.assigned_grade}
                        </div>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      <div className="flex gap-2">
                        <button
                          onClick={() => handleGradeSubmit(submission)}
                          className="px-3 py-1 bg-brand-info text-white rounded hover:bg-brand-info-hover transition-colors"
                        >
                          Submit Grade
                        </button>
                        <a
                          href={submission.alternate_link}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="px-3 py-1 border border-brand-border-dark rounded hover:bg-brand-surface transition-colors"
                        >
                          View
                        </a>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ) : selectedCoursework ? (
        <div className="text-center py-12 bg-white rounded-lg shadow">
          <p className="text-brand-text-muted">No submissions found for this assignment</p>
        </div>
      ) : (
        <div className="text-center py-12 bg-white rounded-lg shadow">
          <p className="text-brand-text-muted">Select a course and assignment to view submissions</p>
        </div>
      )}
    </div>
  );
}
