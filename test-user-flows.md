# LMS User Flow Testing

## Flow 1: New User Registration → Course Enrollment
1. Visit homepage (/)
2. Click "Get Started" or "Sign Up"
3. Fill registration form
4. Verify email (if enabled)
5. Redirected to dashboard
6. Browse courses (/courses)
7. Select a course
8. Click "Enroll Now"
9. Confirm enrollment
10. Redirected to dashboard with enrolled course

## Flow 2: Course Learning Journey
1. Login to dashboard
2. Click "Continue Learning" on enrolled course
3. Redirected to course player (/learn/:courseId)
4. View lesson content (video or text)
5. Mark lesson as complete
6. Progress bar updates
7. Navigate to next lesson
8. Complete all lessons
9. Certificate automatically generated

## Flow 3: Certificate Viewing & Sharing
1. Complete all course lessons
2. Dashboard shows certificate badge
3. Click "View Certificate"
4. Certificate page displays (/certificates/:id)
5. Download PDF option
6. Share link option
7. Verify certificate ID

## Flow 4: Instructor Course Creation
1. Login as instructor
2. Navigate to instructor dashboard
3. Click "Create New Course"
4. Fill course details (title, description, price, etc.)
5. Add lessons/modules
6. Upload thumbnail
7. Publish course
8. Course appears in catalog

## Flow 5: Student Progress Tracking
1. Login as student
2. View dashboard stats
3. See progress bars on enrolled courses
4. View completed vs in-progress courses
5. Track total learning hours
6. View certificates earned
