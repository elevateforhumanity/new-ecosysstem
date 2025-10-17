import React, { useState } from 'react';

export function LMS() {
  const [view, setView] = useState('courses');
  const [courses, setCourses] = useState([
    { id: 1, title: 'Introduction to Programming', students: 45, progress: 75, instructor: 'Dr. Smith' },
    { id: 2, title: 'Advanced Mathematics', students: 32, progress: 60, instructor: 'Prof. Johnson' },
    { id: 3, title: 'Creative Writing', students: 28, progress: 85, instructor: 'Ms. Davis' }
  ]);

  return (
    <div style={{ height: '100vh', display: 'flex', flexDirection: 'column', backgroundColor: 'var(--brand-surface)' }}>
      <div style={{ backgroundColor: '#fff', borderBottom: '1px solid var(--brand-border)', padding: '1rem 2rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <h1 style={{ fontSize: '1.5rem', fontWeight: '600' }}>📚 Learning Management System</h1>
          <button style={{ padding: '0.5rem 1.5rem', backgroundColor: 'var(--brand-info)', color: '#fff', border: 'none', borderRadius: '0.375rem', cursor: 'pointer', fontWeight: '600' }}>
            + Create Course
          </button>
        </div>
      </div>

      <div style={{ display: 'flex', flex: 1, overflow: 'hidden' }}>
        <div style={{ width: '250px', backgroundColor: '#fff', borderRight: '1px solid var(--brand-border)', padding: '1rem' }}>
          <button onClick={() => setView('courses')} style={{ width: '100%', padding: '0.75rem', marginBottom: '0.5rem', backgroundColor: view === 'courses' ? 'var(--brand-surface)' : 'transparent', color: view === 'courses' ? 'var(--brand-info)' : '#000', border: 'none', borderRadius: '0.375rem', cursor: 'pointer', textAlign: 'left' }}>
            📚 My Courses
          </button>
          <button onClick={() => setView('assignments')} style={{ width: '100%', padding: '0.75rem', marginBottom: '0.5rem', backgroundColor: view === 'assignments' ? 'var(--brand-surface)' : 'transparent', color: view === 'assignments' ? 'var(--brand-info)' : '#000', border: 'none', borderRadius: '0.375rem', cursor: 'pointer', textAlign: 'left' }}>
            📝 Assignments
          </button>
          <button onClick={() => setView('grades')} style={{ width: '100%', padding: '0.75rem', marginBottom: '0.5rem', backgroundColor: view === 'grades' ? 'var(--brand-surface)' : 'transparent', color: view === 'grades' ? 'var(--brand-info)' : '#000', border: 'none', borderRadius: '0.375rem', cursor: 'pointer', textAlign: 'left' }}>
            📊 Grades
          </button>
          <button onClick={() => setView('students')} style={{ width: '100%', padding: '0.75rem', backgroundColor: view === 'students' ? 'var(--brand-surface)' : 'transparent', color: view === 'students' ? 'var(--brand-info)' : '#000', border: 'none', borderRadius: '0.375rem', cursor: 'pointer', textAlign: 'left' }}>
            👥 Students
          </button>
        </div>

        <div style={{ flex: 1, padding: '2rem', overflowY: 'auto' }}>
          {view === 'courses' && (
            <div>
              <h2 style={{ fontSize: '1.25rem', fontWeight: '600', marginBottom: '1.5rem' }}>My Courses</h2>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '1.5rem' }}>
                {courses.map(course => (
                  <div key={course.id} style={{ backgroundColor: '#fff', padding: '1.5rem', borderRadius: '0.5rem', boxShadow: '0 2px 4px rgba(0,0,0,0.1)' }}>
                    <h3 style={{ fontSize: '1.125rem', fontWeight: '600', marginBottom: '1rem' }}>{course.title}</h3>
                    <div style={{ fontSize: '0.875rem', color: 'var(--brand-text-muted)', marginBottom: '0.5rem' }}>
                      Instructor: {course.instructor}
                    </div>
                    <div style={{ fontSize: '0.875rem', color: 'var(--brand-text-muted)', marginBottom: '1rem' }}>
                      Students: {course.students}
                    </div>
                    <div style={{ marginBottom: '0.5rem' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.875rem', marginBottom: '0.25rem' }}>
                        <span>Progress</span>
                        <span>{course.progress}%</span>
                      </div>
                      <div style={{ height: '8px', backgroundColor: 'var(--brand-border)', borderRadius: '9999px', overflow: 'hidden' }}>
                        <div style={{ height: '100%', width: `${course.progress}%`, backgroundColor: 'var(--brand-info)' }}></div>
                      </div>
                    </div>
                    <button style={{ width: '100%', padding: '0.75rem', marginTop: '1rem', backgroundColor: 'var(--brand-info)', color: '#fff', border: 'none', borderRadius: '0.375rem', cursor: 'pointer', fontWeight: '600' }}>
                      View Course
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {view === 'assignments' && (
            <div style={{ textAlign: 'center', padding: '4rem', color: 'var(--brand-text-muted)' }}>
              <div style={{ fontSize: '4rem', marginBottom: '1rem' }}>📝</div>
              <h2 style={{ fontSize: '1.5rem', marginBottom: '0.5rem' }}>Assignments</h2>
              <p>View and manage course assignments</p>
            </div>
          )}

          {view === 'grades' && (
            <div style={{ textAlign: 'center', padding: '4rem', color: 'var(--brand-text-muted)' }}>
              <div style={{ fontSize: '4rem', marginBottom: '1rem' }}>📊</div>
              <h2 style={{ fontSize: '1.5rem', marginBottom: '0.5rem' }}>Grades</h2>
              <p>Track student performance and grades</p>
            </div>
          )}

          {view === 'students' && (
            <div style={{ textAlign: 'center', padding: '4rem', color: 'var(--brand-text-muted)' }}>
              <div style={{ fontSize: '4rem', marginBottom: '1rem' }}>👥</div>
              <h2 style={{ fontSize: '1.5rem', marginBottom: '0.5rem' }}>Students</h2>
              <p>Manage enrolled students</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default LMS;