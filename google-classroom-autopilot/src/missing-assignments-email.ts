/**
 * Missing Assignments Weekly Email Generator
 * 
 * Generates and sends weekly reports to:
 * - Students with missing assignments
 * - Guardians of students with missing work
 * - Instructors with summary of class performance
 */

import { createClient } from '@supabase/supabase-js';
import { emailService } from './email-providers';
import {
  filterGuardianEmails,
  addUnsubscribeFooter,
  getGuardianPreferences,
} from './guardian-preferences';
import { generateCorrelationId } from './email-correlation';

const supabase = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

interface MissingAssignment {
  courseId: string;
  courseName: string;
  courseworkId: string;
  title: string;
  dueDate: Date;
  maxPoints: number;
  studentId: string;
  studentName: string;
  studentEmail: string;
}

interface StudentReport {
  studentId: string;
  studentName: string;
  studentEmail: string;
  guardianEmails: string[];
  missingAssignments: MissingAssignment[];
  totalMissing: number;
  totalPoints: number;
}

interface InstructorReport {
  instructorEmail: string;
  courses: Array<{
    courseId: string;
    courseName: string;
    totalStudents: number;
    studentsWithMissing: number;
    totalMissingAssignments: number;
    students: Array<{
      name: string;
      email: string;
      missingCount: number;
    }>;
  }>;
}

/**
 * Get all missing assignments from synced data
 */
async function getMissingAssignments(): Promise<MissingAssignment[]> {
  const { data: submissions, error } = await supabase
    .from('classroom_submissions')
    .select(`
      *,
      coursework:classroom_coursework(*),
      student:classroom_students(*)
    `)
    .eq('state', 'NEW')
    .lt('coursework.due_date', new Date().toISOString());

  if (error) {
    console.error('Error fetching missing assignments:', error);
    return [];
  }

  return (submissions || []).map((sub: any) => ({
    courseId: sub.course_id,
    courseName: sub.coursework?.course_name || 'Unknown Course',
    courseworkId: sub.coursework_id,
    title: sub.coursework?.title || 'Unknown Assignment',
    dueDate: new Date(sub.coursework?.due_date),
    maxPoints: sub.coursework?.max_points || 0,
    studentId: sub.student_id,
    studentName: sub.student?.name || 'Unknown Student',
    studentEmail: sub.student?.email || '',
  }));
}

/**
 * Group missing assignments by student
 */
function groupByStudent(assignments: MissingAssignment[]): Map<string, StudentReport> {
  const studentMap = new Map<string, StudentReport>();

  for (const assignment of assignments) {
    if (!studentMap.has(assignment.studentId)) {
      studentMap.set(assignment.studentId, {
        studentId: assignment.studentId,
        studentName: assignment.studentName,
        studentEmail: assignment.studentEmail,
        guardianEmails: [],
        missingAssignments: [],
        totalMissing: 0,
        totalPoints: 0,
      });
    }

    const report = studentMap.get(assignment.studentId)!;
    report.missingAssignments.push(assignment);
    report.totalMissing++;
    report.totalPoints += assignment.maxPoints;
  }

  return studentMap;
}

/**
 * Get guardian emails for students
 */
async function getGuardianEmails(studentIds: string[]): Promise<Map<string, string[]>> {
  const { data: guardians } = await supabase
    .from('classroom_guardians')
    .select('student_id, guardian_email')
    .in('student_id', studentIds)
    .eq('invitation_state', 'COMPLETED');

  const guardianMap = new Map<string, string[]>();

  for (const guardian of guardians || []) {
    if (!guardianMap.has(guardian.student_id)) {
      guardianMap.set(guardian.student_id, []);
    }
    guardianMap.get(guardian.student_id)!.push(guardian.guardian_email);
  }

  return guardianMap;
}

/**
 * Generate student email HTML
 */
function generateStudentEmail(report: StudentReport): string {
  const sortedAssignments = report.missingAssignments.sort(
    (a, b) => a.dueDate.getTime() - b.dueDate.getTime()
  );

  return `
<!DOCTYPE html>
<html>
<head>
  <style>
    body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
    .container { max-width: 600px; margin: 0 auto; padding: 20px; }
    .header { background: #4285f4; color: white; padding: 20px; border-radius: 8px 8px 0 0; }
    .content { background: #f9f9f9; padding: 20px; border-radius: 0 0 8px 8px; }
    .assignment { background: white; padding: 15px; margin: 10px 0; border-left: 4px solid #ea4335; border-radius: 4px; }
    .assignment-title { font-weight: bold; color: #ea4335; }
    .due-date { color: #666; font-size: 14px; }
    .points { color: #f4b400; font-weight: bold; }
    .footer { text-align: center; padding: 20px; color: #666; font-size: 12px; }
    .cta-button { display: inline-block; background: #4285f4; color: white; padding: 12px 24px; text-decoration: none; border-radius: 4px; margin: 20px 0; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>📚 Missing Assignments Report</h1>
      <p>Hi ${report.studentName},</p>
    </div>
    <div class="content">
      <p>You have <strong>${report.totalMissing}</strong> missing assignment${report.totalMissing !== 1 ? 's' : ''} worth <strong>${report.totalPoints}</strong> points total.</p>
      
      <p>Please complete these assignments as soon as possible:</p>
      
      ${sortedAssignments
        .map(
          assignment => `
        <div class="assignment">
          <div class="assignment-title">${assignment.title}</div>
          <div>Course: ${assignment.courseName}</div>
          <div class="due-date">Due: ${assignment.dueDate.toLocaleDateString()}</div>
          <div class="points">Points: ${assignment.maxPoints}</div>
        </div>
      `
        )
        .join('')}
      
      <center>
        <a href="https://classroom.google.com" class="cta-button">Go to Google Classroom</a>
      </center>
      
      <p><strong>Need help?</strong> Contact your instructor or visit office hours.</p>
    </div>
    <div class="footer">
      <p>This is an automated message from Elevate for Humanity LMS</p>
      <p>If you have questions, contact: info@elevateforhumanity.org</p>
    </div>
  </div>
</body>
</html>
  `;
}

/**
 * Generate guardian email HTML
 */
function generateGuardianEmail(report: StudentReport): string {
  return `
<!DOCTYPE html>
<html>
<head>
  <style>
    body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
    .container { max-width: 600px; margin: 0 auto; padding: 20px; }
    .header { background: #34a853; color: white; padding: 20px; border-radius: 8px 8px 0 0; }
    .content { background: #f9f9f9; padding: 20px; border-radius: 0 0 8px 8px; }
    .summary { background: white; padding: 15px; margin: 15px 0; border-radius: 4px; border-left: 4px solid #ea4335; }
    .assignment-list { background: white; padding: 15px; margin: 10px 0; border-radius: 4px; }
    .footer { text-align: center; padding: 20px; color: #666; font-size: 12px; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>📧 Student Progress Update</h1>
      <p>Weekly Report for ${report.studentName}</p>
    </div>
    <div class="content">
      <div class="summary">
        <h2>Missing Assignments Summary</h2>
        <p><strong>${report.totalMissing}</strong> assignment${report.totalMissing !== 1 ? 's' : ''} past due</p>
        <p><strong>${report.totalPoints}</strong> points at risk</p>
      </div>
      
      <div class="assignment-list">
        <h3>Assignments:</h3>
        <ul>
          ${report.missingAssignments
            .map(
              a => `
            <li>
              <strong>${a.title}</strong> (${a.courseName})<br>
              Due: ${a.dueDate.toLocaleDateString()} | Points: ${a.maxPoints}
            </li>
          `
            )
            .join('')}
        </ul>
      </div>
      
      <p><strong>Action Items:</strong></p>
      <ul>
        <li>Encourage ${report.studentName} to complete missing work</li>
        <li>Contact instructor if there are extenuating circumstances</li>
        <li>Check Google Classroom regularly for updates</li>
      </ul>
    </div>
    <div class="footer">
      <p>Elevate for Humanity - Supporting Student Success</p>
      <p>Questions? Contact: info@elevateforhumanity.org</p>
    </div>
  </div>
</body>
</html>
  `;
}

/**
 * Generate instructor summary email
 */
function generateInstructorEmail(report: InstructorReport): string {
  const totalStudentsWithMissing = report.courses.reduce(
    (sum, course) => sum + course.studentsWithMissing,
    0
  );
  const totalMissing = report.courses.reduce(
    (sum, course) => sum + course.totalMissingAssignments,
    0
  );

  return `
<!DOCTYPE html>
<html>
<head>
  <style>
    body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
    .container { max-width: 700px; margin: 0 auto; padding: 20px; }
    .header { background: #4285f4; color: white; padding: 20px; border-radius: 8px 8px 0 0; }
    .content { background: #f9f9f9; padding: 20px; border-radius: 0 0 8px 8px; }
    .course { background: white; padding: 15px; margin: 15px 0; border-radius: 4px; }
    .stats { display: flex; justify-content: space-around; margin: 20px 0; }
    .stat { text-align: center; }
    .stat-number { font-size: 32px; font-weight: bold; color: #4285f4; }
    .stat-label { color: #666; }
    table { width: 100%; border-collapse: collapse; margin: 10px 0; }
    th, td { padding: 8px; text-align: left; border-bottom: 1px solid #ddd; }
    th { background: #f0f0f0; }
    .footer { text-align: center; padding: 20px; color: #666; font-size: 12px; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>📊 Weekly Instructor Report</h1>
      <p>Missing Assignments Summary</p>
    </div>
    <div class="content">
      <div class="stats">
        <div class="stat">
          <div class="stat-number">${totalStudentsWithMissing}</div>
          <div class="stat-label">Students with Missing Work</div>
        </div>
        <div class="stat">
          <div class="stat-number">${totalMissing}</div>
          <div class="stat-label">Total Missing Assignments</div>
        </div>
      </div>
      
      ${report.courses
        .map(
          course => `
        <div class="course">
          <h2>${course.courseName}</h2>
          <p><strong>${course.studentsWithMissing}</strong> of <strong>${course.totalStudents}</strong> students have missing work</p>
          
          <table>
            <thead>
              <tr>
                <th>Student</th>
                <th>Missing Assignments</th>
              </tr>
            </thead>
            <tbody>
              ${course.students
                .map(
                  student => `
                <tr>
                  <td>${student.name}</td>
                  <td>${student.missingCount}</td>
                </tr>
              `
                )
                .join('')}
            </tbody>
          </table>
        </div>
      `
        )
        .join('')}
      
      <p><strong>Recommended Actions:</strong></p>
      <ul>
        <li>Follow up with students who have multiple missing assignments</li>
        <li>Consider offering makeup opportunities or extensions</li>
        <li>Review assignment due dates and workload distribution</li>
      </ul>
    </div>
    <div class="footer">
      <p>Elevate for Humanity LMS - Instructor Dashboard</p>
    </div>
  </div>
</body>
</html>
  `;
}

/**
 * Send missing assignments emails
 */
export async function sendMissingAssignmentsEmails() {
  console.log('📧 Generating missing assignments emails...\n');

  // Get all missing assignments
  const missingAssignments = await getMissingAssignments();
  console.log(`Found ${missingAssignments.length} missing assignments`);

  if (missingAssignments.length === 0) {
    console.log('✅ No missing assignments - no emails to send');
    return;
  }

  // Group by student
  const studentReports = groupByStudent(missingAssignments);
  console.log(`Affecting ${studentReports.size} students`);

  // Get guardian emails
  const guardianEmails = await getGuardianEmails(Array.from(studentReports.keys()));

  // Add guardian emails to reports
  for (const [studentId, report] of studentReports) {
    report.guardianEmails = guardianEmails.get(studentId) || [];
  }

  // Generate correlation ID for this digest run
  const correlationId = generateCorrelationId('missing_assignments_digest');
  console.log(`Correlation ID: ${correlationId}`);

  // Queue emails for students and guardians
  let studentEmailsSent = 0;
  let guardianEmailsSent = 0;
  let guardianEmailsSkipped = 0;

  for (const report of studentReports.values()) {
    // Send student email
    if (report.studentEmail) {
      try {
        const result = await emailService.send({
          to: [report.studentEmail],
          from: process.env.EMAIL_FROM || 'noreply@elevateforhumanity.org',
          subject: `📚 You have ${report.totalMissing} missing assignment${report.totalMissing !== 1 ? 's' : ''}`,
          html: generateStudentEmail(report),
          tags: {
            type: 'missing_assignments_student',
            student_id: report.studentId,
          },
          // Correlation tracking
          correlationId,
          contentId: report.studentId,
        });

        if (result.success) {
          studentEmailsSent++;
        }
      } catch (error: any) {
        console.error(`Failed to send student email to ${report.studentEmail}:`, error.message);
      }
    }

    // Filter guardian emails based on preferences
    if (report.guardianEmails.length > 0) {
      const guardianList = report.guardianEmails.map(email => ({
        email,
        studentId: report.studentId,
      }));

      const filteredGuardians = await filterGuardianEmails(guardianList, 'missing_assignments');

      if (filteredGuardians.length > 0) {
        try {
          // Get preferences for unsubscribe links
          const guardianPrefs = await Promise.all(
            filteredGuardians.map(email => getGuardianPreferences(email, report.studentId))
          );

          // Send to each guardian individually (for personalized unsubscribe links)
          for (let i = 0; i < filteredGuardians.length; i++) {
            const guardianEmail = filteredGuardians[i];
            const prefs = guardianPrefs[i];

            let emailHtml = generateGuardianEmail(report);

            // Add unsubscribe footer
            if (prefs) {
              emailHtml = addUnsubscribeFooter(
                emailHtml,
                guardianEmail,
                report.studentId,
                prefs.unsubscribe_token
              );
            }

            const result = await emailService.send({
              to: [guardianEmail],
              from: process.env.EMAIL_FROM || 'noreply@elevateforhumanity.org',
              replyTo: 'info@elevateforhumanity.org',
              subject: `📧 Weekly Update: ${report.studentName} has ${report.totalMissing} missing assignment${report.totalMissing !== 1 ? 's' : ''}`,
              html: emailHtml,
              tags: {
                type: 'missing_assignments_guardian',
                student_id: report.studentId,
                guardian_email: guardianEmail,
              },
              // Correlation tracking
              correlationId,
              contentId: report.studentId,
            });

            if (result.success) {
              guardianEmailsSent++;
            }
          }
        } catch (error: any) {
          console.error(`Failed to send guardian emails for ${report.studentName}:`, error.message);
        }
      }

      guardianEmailsSkipped += report.guardianEmails.length - filteredGuardians.length;
    }
  }

  console.log(`\n✅ Sent ${studentEmailsSent} student emails`);
  console.log(`✅ Sent ${guardianEmailsSent} guardian emails`);
  if (guardianEmailsSkipped > 0) {
    console.log(`⏭️  Skipped ${guardianEmailsSkipped} guardian emails (opted out or preferences)`);
  }

  // TODO: Generate instructor reports
  // Group by course/instructor and send summary

  return {
    totalMissing: missingAssignments.length,
    studentsAffected: studentReports.size,
    studentEmailsSent,
    guardianEmailsSent,
    guardianEmailsSkipped,
  };
}

// CLI
if (import.meta.url === `file://${process.argv[1]}`) {
  sendMissingAssignmentsEmails()
    .then(result => {
      console.log('\n📊 Summary:', result);
    })
    .catch(error => {
      console.error('❌ Error:', error);
      process.exit(1);
    });
}
