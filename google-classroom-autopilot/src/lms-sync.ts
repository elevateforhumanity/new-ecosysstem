/**
 * LMS → Google Classroom Sync Runner
 * Processes queued LMS events and syncs to Google Classroom
 */

import { createClient } from '@supabase/supabase-js';
import { google } from 'googleapis';

const supabase = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

// Initialize Google Classroom API
const getClassroomClient = () => {
  const serviceAccountJson = Buffer.from(
    process.env.GOOGLE_SA_JSON_B64 || '',
    'base64'
  ).toString('utf-8');
  
  const serviceAccount = JSON.parse(serviceAccountJson);
  
  const auth = new google.auth.JWT({
    email: serviceAccount.client_email,
    key: serviceAccount.private_key,
    scopes: [
      'https://www.googleapis.com/auth/classroom.courses',
      'https://www.googleapis.com/auth/classroom.coursework.students',
      'https://www.googleapis.com/auth/classroom.rosters',
      'https://www.googleapis.com/auth/classroom.topics',
    ],
    subject: process.env.GOOGLE_IMPERSONATE_EMAIL, // Domain-wide delegation
  });

  return google.classroom({ version: 'v1', auth });
};

interface SyncTask {
  id: string;
  event_type: string;
  event_source: string;
  payload: any;
  attempts: number;
}

/**
 * Process a single sync task
 */
async function processSyncTask(task: SyncTask): Promise<void> {
  console.log(`Processing task ${task.id}: ${task.event_type}`);

  try {
    const classroom = getClassroomClient();
    let classroomId: string;

    switch (task.event_type) {
      case 'course.upsert':
        classroomId = await syncCourse(classroom, task);
        break;
      
      case 'topic.upsert':
        classroomId = await syncTopic(classroom, task);
        break;
      
      case 'work.upsert':
        classroomId = await syncCoursework(classroom, task);
        break;
      
      case 'roster.upsert':
        classroomId = await syncRoster(classroom, task);
        break;
      
      default:
        throw new Error(`Unknown event type: ${task.event_type}`);
    }

    // Mark task as completed
    await supabase.rpc('complete_sync_task', {
      p_task_id: task.id,
      p_classroom_id: classroomId,
      p_sync_result: { status: 'success', timestamp: new Date().toISOString() },
    });

    console.log(`✅ Task ${task.id} completed successfully`);
  } catch (error: any) {
    console.error(`❌ Task ${task.id} failed:`, error.message);

    // Mark task as failed
    await supabase.rpc('fail_sync_task', {
      p_task_id: task.id,
      p_error_message: error.message,
      p_error_details: { 
        code: error.code, 
        stack: error.stack?.split('\n').slice(0, 5) 
      },
    });
  }
}

/**
 * Sync course to Google Classroom
 */
async function syncCourse(classroom: any, task: SyncTask): Promise<string> {
  const { payload, event_source } = task;
  
  // Check if course already exists in mapping
  const { data: existingMapping } = await supabase
    .from('lms_classroom_course_map')
    .select('classroom_course_id')
    .eq('lms_source', event_source)
    .eq('lms_course_id', payload.id)
    .single();

  let classroomCourseId: string;

  if (existingMapping) {
    // Update existing course
    classroomCourseId = existingMapping.classroom_course_id;
    
    await classroom.courses.patch({
      id: classroomCourseId,
      updateMask: 'name,section,descriptionHeading,description',
      requestBody: {
        name: payload.name || payload.title,
        section: payload.code || payload.course_code,
        descriptionHeading: payload.description_heading,
        description: payload.description,
      },
    });

    console.log(`Updated course: ${classroomCourseId}`);
  } else {
    // Create new course
    const response = await classroom.courses.create({
      requestBody: {
        name: payload.name || payload.title,
        section: payload.code || payload.course_code,
        descriptionHeading: payload.description_heading || 'Course Description',
        description: payload.description || '',
        ownerId: 'me', // Will be the impersonated user
        courseState: 'ACTIVE',
      },
    });

    classroomCourseId = response.data.id!;
    console.log(`Created course: ${classroomCourseId}`);
  }

  // Update mapping
  await supabase.rpc('get_or_create_course_mapping', {
    p_lms_source: event_source,
    p_lms_course_id: payload.id,
    p_classroom_course_id: classroomCourseId,
    p_lms_data: payload,
    p_classroom_data: { id: classroomCourseId },
  });

  return classroomCourseId;
}

/**
 * Sync topic to Google Classroom
 */
async function syncTopic(classroom: any, task: SyncTask): Promise<string> {
  const { payload, event_source } = task;

  // Get course mapping
  const { data: courseMapping } = await supabase
    .from('lms_classroom_course_map')
    .select('classroom_course_id')
    .eq('lms_source', event_source)
    .eq('lms_course_id', payload.course_id)
    .single();

  if (!courseMapping) {
    throw new Error(`Course mapping not found for LMS course ${payload.course_id}`);
  }

  const classroomCourseId = courseMapping.classroom_course_id;

  // Check if topic already exists
  const { data: existingMapping } = await supabase
    .from('lms_classroom_topic_map')
    .select('classroom_topic_id')
    .eq('lms_source', event_source)
    .eq('lms_course_id', payload.course_id)
    .eq('lms_topic_id', payload.id)
    .single();

  let classroomTopicId: string;

  if (existingMapping) {
    // Update existing topic
    classroomTopicId = existingMapping.classroom_topic_id;
    
    await classroom.courses.topics.patch({
      courseId: classroomCourseId,
      id: classroomTopicId,
      updateMask: 'name',
      requestBody: {
        name: payload.name || payload.title,
      },
    });

    console.log(`Updated topic: ${classroomTopicId}`);
  } else {
    // Create new topic
    const response = await classroom.courses.topics.create({
      courseId: classroomCourseId,
      requestBody: {
        name: payload.name || payload.title,
      },
    });

    classroomTopicId = response.data.topicId!;
    console.log(`Created topic: ${classroomTopicId}`);
  }

  // Update mapping
  await supabase
    .from('lms_classroom_topic_map')
    .upsert({
      lms_source: event_source,
      lms_course_id: payload.course_id,
      lms_topic_id: payload.id,
      classroom_course_id: classroomCourseId,
      classroom_topic_id: classroomTopicId,
      lms_data: payload,
      last_synced_at: new Date().toISOString(),
    });

  return classroomTopicId;
}

/**
 * Sync coursework/assignment to Google Classroom
 */
async function syncCoursework(classroom: any, task: SyncTask): Promise<string> {
  const { payload, event_source } = task;

  // Get course mapping
  const { data: courseMapping } = await supabase
    .from('lms_classroom_course_map')
    .select('classroom_course_id')
    .eq('lms_source', event_source)
    .eq('lms_course_id', payload.course_id)
    .single();

  if (!courseMapping) {
    throw new Error(`Course mapping not found for LMS course ${payload.course_id}`);
  }

  const classroomCourseId = courseMapping.classroom_course_id;

  // Get topic mapping if topic_id provided
  let classroomTopicId: string | undefined;
  if (payload.topic_id) {
    const { data: topicMapping } = await supabase
      .from('lms_classroom_topic_map')
      .select('classroom_topic_id')
      .eq('lms_source', event_source)
      .eq('lms_course_id', payload.course_id)
      .eq('lms_topic_id', payload.topic_id)
      .single();

    classroomTopicId = topicMapping?.classroom_topic_id;
  }

  // Check if coursework already exists
  const { data: existingMapping } = await supabase
    .from('lms_classroom_work_map')
    .select('classroom_work_id')
    .eq('lms_source', event_source)
    .eq('lms_course_id', payload.course_id)
    .eq('lms_work_id', payload.id)
    .single();

  let classroomWorkId: string;

  const courseworkData = {
    title: payload.title || payload.name,
    description: payload.description || '',
    workType: 'ASSIGNMENT',
    state: 'PUBLISHED',
    topicId: classroomTopicId,
    maxPoints: payload.points_possible || payload.max_points || 100,
    dueDate: payload.due_date ? parseDueDate(payload.due_date) : undefined,
    dueTime: payload.due_time ? parseDueTime(payload.due_time) : undefined,
  };

  if (existingMapping) {
    // Update existing coursework
    classroomWorkId = existingMapping.classroom_work_id;
    
    await classroom.courses.courseWork.patch({
      courseId: classroomCourseId,
      id: classroomWorkId,
      updateMask: 'title,description,maxPoints,dueDate,dueTime',
      requestBody: courseworkData,
    });

    console.log(`Updated coursework: ${classroomWorkId}`);
  } else {
    // Create new coursework
    const response = await classroom.courses.courseWork.create({
      courseId: classroomCourseId,
      requestBody: courseworkData,
    });

    classroomWorkId = response.data.id!;
    console.log(`Created coursework: ${classroomWorkId}`);
  }

  // Update mapping
  await supabase
    .from('lms_classroom_work_map')
    .upsert({
      lms_source: event_source,
      lms_course_id: payload.course_id,
      lms_work_id: payload.id,
      classroom_course_id: classroomCourseId,
      classroom_work_id: classroomWorkId,
      lms_data: payload,
      last_synced_at: new Date().toISOString(),
    });

  return classroomWorkId;
}

/**
 * Sync roster (enroll students) to Google Classroom
 */
async function syncRoster(classroom: any, task: SyncTask): Promise<string> {
  const { payload, event_source } = task;

  // Get course mapping
  const { data: courseMapping } = await supabase
    .from('lms_classroom_course_map')
    .select('classroom_course_id')
    .eq('lms_source', event_source)
    .eq('lms_course_id', payload.course_id)
    .single();

  if (!courseMapping) {
    throw new Error(`Course mapping not found for LMS course ${payload.course_id}`);
  }

  const classroomCourseId = courseMapping.classroom_course_id;

  // Check if student already enrolled
  const { data: existingMapping } = await supabase
    .from('lms_classroom_roster_map')
    .select('classroom_enrollment_id')
    .eq('lms_source', event_source)
    .eq('lms_course_id', payload.course_id)
    .eq('lms_user_id', payload.user_id)
    .single();

  let enrollmentId: string;

  if (existingMapping && payload.action !== 'remove') {
    // Already enrolled
    enrollmentId = existingMapping.classroom_enrollment_id;
    console.log(`Student already enrolled: ${payload.user_email}`);
  } else if (payload.action === 'remove') {
    // Remove student
    if (existingMapping) {
      await classroom.courses.students.delete({
        courseId: classroomCourseId,
        userId: payload.user_email,
      });

      // Update mapping status
      await supabase
        .from('lms_classroom_roster_map')
        .update({ enrollment_status: 'removed' })
        .eq('lms_source', event_source)
        .eq('lms_course_id', payload.course_id)
        .eq('lms_user_id', payload.user_id);

      console.log(`Removed student: ${payload.user_email}`);
    }
    enrollmentId = 'removed';
  } else {
    // Enroll new student
    const response = await classroom.courses.students.create({
      courseId: classroomCourseId,
      requestBody: {
        userId: payload.user_email,
      },
    });

    enrollmentId = response.data.userId!;

    // Create mapping
    await supabase
      .from('lms_classroom_roster_map')
      .upsert({
        lms_source: event_source,
        lms_course_id: payload.course_id,
        lms_user_id: payload.user_id,
        lms_user_email: payload.user_email,
        lms_user_role: payload.role || 'student',
        classroom_course_id: classroomCourseId,
        classroom_user_id: enrollmentId,
        classroom_enrollment_id: enrollmentId,
        enrollment_status: 'active',
        lms_data: payload,
        last_synced_at: new Date().toISOString(),
      });

    console.log(`Enrolled student: ${payload.user_email}`);
  }

  return enrollmentId;
}

/**
 * Helper: Parse due date
 */
function parseDueDate(dateString: string): { year: number; month: number; day: number } {
  const date = new Date(dateString);
  return {
    year: date.getFullYear(),
    month: date.getMonth() + 1,
    day: date.getDate(),
  };
}

/**
 * Helper: Parse due time
 */
function parseDueTime(timeString: string): { hours: number; minutes: number } {
  const [hours, minutes] = timeString.split(':').map(Number);
  return { hours, minutes };
}

/**
 * Main sync loop
 */
async function runSyncLoop(maxTasks: number = 10): Promise<void> {
  console.log(`🔄 Starting sync loop (max ${maxTasks} tasks)...`);

  let processedCount = 0;

  while (processedCount < maxTasks) {
    // Get next task
    const { data: tasks, error } = await supabase.rpc('get_next_sync_task');

    if (error) {
      console.error('Failed to get next task:', error);
      break;
    }

    if (!tasks || tasks.length === 0) {
      console.log('No more tasks to process');
      break;
    }

    const task = tasks[0];
    await processSyncTask(task);
    processedCount++;
  }

  console.log(`✅ Processed ${processedCount} tasks`);
}

/**
 * CLI entry point
 */
if (import.meta.url === `file://${process.argv[1]}`) {
  const maxTasks = parseInt(process.argv[2]) || 10;
  
  runSyncLoop(maxTasks)
    .then(() => {
      console.log('Sync complete');
      process.exit(0);
    })
    .catch((error) => {
      console.error('Sync failed:', error);
      process.exit(1);
    });
}

export { runSyncLoop, processSyncTask };
