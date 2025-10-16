/**
 * Learning Management System Service
 * Handles courses, enrollments, progress tracking, and certifications
 */

class LMSService {
  constructor() {
    this.courses = new Map();
    this.enrollments = new Map();
    this.progress = new Map();
  }

  async createCourse(courseData) {
    const course = {
      id: `course_${Date.now()}`,
      ...courseData,
      createdAt: new Date(),
      modules: courseData.modules || [],
      status: 'published'
    };
    this.courses.set(course.id, course);
    return course;
  }

  async enrollStudent(studentId, courseId) {
    const course = this.courses.get(courseId);
    if (!course) throw new Error('Course not found');

    const enrollment = {
      id: `enrollment_${Date.now()}`,
      studentId,
      courseId,
      enrolledAt: new Date(),
      status: 'active',
      progress: 0
    };
    
    this.enrollments.set(enrollment.id, enrollment);
    return enrollment;
  }

  async updateProgress(enrollmentId, moduleId, completed) {
    const enrollment = this.enrollments.get(enrollmentId);
    if (!enrollment) throw new Error('Enrollment not found');

    const progressKey = `${enrollmentId}_${moduleId}`;
    this.progress.set(progressKey, {
      completed,
      completedAt: completed ? new Date() : null
    });

    enrollment.progress = this.calculateCourseProgress(enrollment);
    return enrollment;
  }

  calculateCourseProgress(enrollment) {
    const course = this.courses.get(enrollment.courseId);
    if (!course || !course.modules.length) return 0;

    const completedModules = course.modules.filter(module => {
      const progressKey = `${enrollment.id}_${module.id}`;
      const progress = this.progress.get(progressKey);
      return progress?.completed;
    }).length;

    return (completedModules / course.modules.length) * 100;
  }

  async issueCertificate(enrollmentId) {
    const enrollment = this.enrollments.get(enrollmentId);
    if (!enrollment) throw new Error('Enrollment not found');
    if (enrollment.progress < 100) throw new Error('Course not completed');

    const certificate = {
      id: `cert_${Date.now()}`,
      enrollmentId,
      studentId: enrollment.studentId,
      courseId: enrollment.courseId,
      issuedAt: new Date(),
      verificationCode: this.generateVerificationCode()
    };

    return certificate;
  }

  generateVerificationCode() {
    return `CERT-${Date.now()}-${Math.random().toString(36).substr(2, 9).toUpperCase()}`;
  }
}

module.exports = new LMSService();
