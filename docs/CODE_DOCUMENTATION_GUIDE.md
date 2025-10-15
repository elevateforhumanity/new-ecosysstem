# Code Documentation Guide

## Documentation Standards

### When to Document

**DO document:**
- Complex business logic
- Non-obvious algorithms
- Performance trade-offs
- Security considerations
- API integrations
- Database schema decisions
- Configuration options

**DON'T document:**
- Self-explanatory code
- Simple getters/setters
- Obvious variable names
- Standard patterns

### Comment Style

#### JSDoc for Functions
```javascript
/**
 * Enrolls a student in a course
 * @param {string} userId - The student's user ID
 * @param {string} courseId - The course ID to enroll in
 * @returns {Promise<Object>} Enrollment record
 * @throws {Error} If user is already enrolled
 */
async function enrollStudent(userId, courseId) {
  // Implementation
}
```

#### Inline Comments for Complex Logic
```javascript
// Calculate progress percentage
// We use completed modules / total modules * 100
// Edge case: If no modules exist, return 0 to avoid division by zero
const progress = totalModules > 0 
  ? (completedModules / totalModules) * 100 
  : 0;
```

#### Component Documentation
```javascript
/**
 * CourseCard Component
 * 
 * Displays a course with thumbnail, title, and enrollment button.
 * Handles enrollment flow and shows loading states.
 * 
 * @component
 * @param {Object} props
 * @param {Object} props.course - Course data object
 * @param {Function} props.onEnroll - Callback when user enrolls
 * @param {boolean} props.isEnrolled - Whether user is already enrolled
 */
export function CourseCard({ course, onEnroll, isEnrolled }) {
  // Component implementation
}
```

## File Headers

### Standard Header
```javascript
/**
 * @file CourseService.js
 * @description Handles all course-related business logic
 * @author EFH Development Team
 * @created 2025-01-15
 * @modified 2025-10-15
 */
```

### Copyright Notice
```javascript
/*
  Copyright (c) 2025 Elevate for Humanity
  Commercial License. No resale, sublicensing, or redistribution allowed.
  See LICENSE file for details.
*/
```

## API Documentation

### Endpoint Documentation
```javascript
/**
 * GET /api/courses
 * 
 * Retrieves all published courses
 * 
 * Query Parameters:
 * - limit (number): Max courses to return (default: 20)
 * - offset (number): Pagination offset (default: 0)
 * - category (string): Filter by category
 * 
 * Response:
 * {
 *   success: boolean,
 *   data: Course[],
 *   total: number
 * }
 * 
 * Errors:
 * - 500: Database error
 */
app.get('/api/courses', async (req, res) => {
  // Implementation
});
```

## Database Schema Documentation

### Table Documentation
```sql
-- Courses table
-- Stores all course information including published and draft courses
-- Related tables: modules, enrollments, certificates
CREATE TABLE courses (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title TEXT NOT NULL,
  -- Course title (max 200 chars recommended)
  
  description TEXT,
  -- Full course description (supports Markdown)
  
  published BOOLEAN DEFAULT false,
  -- Only published courses are visible to students
  
  created_at TIMESTAMPTZ DEFAULT NOW()
  -- Timestamp when course was created
);

-- Indexes for performance
CREATE INDEX idx_courses_published ON courses(published);
-- Used by: GET /api/courses (filters published courses)
```

## Configuration Documentation

### Environment Variables
```javascript
/**
 * Environment Configuration
 * 
 * Required Variables:
 * - VITE_SUPABASE_URL: Supabase project URL
 * - VITE_SUPABASE_ANON_KEY: Supabase anonymous key
 * 
 * Optional Variables:
 * - VITE_SENTRY_DSN: Sentry error tracking DSN
 * - VITE_GOOGLE_ANALYTICS_ID: Google Analytics measurement ID
 * 
 * Security Notes:
 * - Never commit .env files
 * - Use different keys for dev/staging/prod
 * - Rotate keys quarterly
 */
```

## Complex Logic Documentation

### Algorithm Explanation
```javascript
/**
 * Calculates student progress through a course
 * 
 * Algorithm:
 * 1. Get all modules for the course
 * 2. Get completed modules for the student
 * 3. Calculate percentage: (completed / total) * 100
 * 4. Handle edge cases (no modules, all completed)
 * 
 * Performance:
 * - O(1) database queries (uses indexes)
 * - Cached for 5 minutes to reduce load
 * 
 * Edge Cases:
 * - Course with no modules returns 0%
 * - Completed all modules returns 100%
 * - Partial completion rounds down
 */
function calculateProgress(courseId, userId) {
  // Implementation
}
```

## Security Documentation

### Security Considerations
```javascript
/**
 * User Authentication Middleware
 * 
 * Security:
 * - Validates JWT token from Supabase
 * - Checks token expiration
 * - Verifies user role for protected routes
 * 
 * Attack Vectors:
 * - Token replay: Mitigated by short expiration (1 hour)
 * - Token theft: Mitigated by HTTPS only
 * - Privilege escalation: Mitigated by role checks
 * 
 * @middleware
 */
async function authenticate(req, res, next) {
  // Implementation
}
```

## Performance Documentation

### Performance Notes
```javascript
/**
 * Fetches course catalog with pagination
 * 
 * Performance Optimizations:
 * - Uses database indexes on published and created_at
 * - Limits results to 20 per page
 * - Caches results for 5 minutes
 * - Uses CDN for static assets
 * 
 * Benchmarks:
 * - Average response time: 50ms
 * - 95th percentile: 150ms
 * - Database query time: 10ms
 * 
 * @performance
 */
async function getCourses(page = 1) {
  // Implementation
}
```

## Testing Documentation

### Test Documentation
```javascript
/**
 * Course Enrollment Tests
 * 
 * Test Cases:
 * 1. Successful enrollment
 * 2. Duplicate enrollment (should fail)
 * 3. Invalid course ID (should fail)
 * 4. Invalid user ID (should fail)
 * 5. Database error handling
 * 
 * Mocks:
 * - Supabase client
 * - User authentication
 * 
 * @test
 */
describe('Course Enrollment', () => {
  // Test implementation
});
```

## Migration Documentation

### Database Migration
```sql
-- Migration: 012_hiring_automation.sql
-- Purpose: Add hiring automation tables for candidate tracking
-- Dependencies: 001_initial_schema.sql (profiles table)
-- Rollback: DROP TABLE candidates, interviews, job_postings CASCADE;
-- 
-- Changes:
-- - Creates candidates table
-- - Creates interviews table
-- - Creates job_postings table
-- - Adds RLS policies
-- - Creates indexes for performance
--
-- Author: EFH Dev Team
-- Date: 2025-10-15
```

## Deprecation Documentation

### Deprecation Notice
```javascript
/**
 * @deprecated Since version 2.0.0
 * Use `enrollStudent()` instead
 * Will be removed in version 3.0.0
 * 
 * @see enrollStudent
 */
function oldEnrollFunction(userId, courseId) {
  console.warn('oldEnrollFunction is deprecated');
  return enrollStudent(userId, courseId);
}
```

## TODO Documentation

### TODO Comments
```javascript
// TODO: Add caching layer for course data
// Priority: Medium
// Estimated effort: 2 hours
// Assigned to: Backend team
// Related issue: #123

// FIXME: Race condition when multiple users enroll simultaneously
// Priority: High
// Impact: Data corruption possible
// Assigned to: @john
// Related issue: #456

// HACK: Temporary workaround for Supabase RLS bug
// Remove when Supabase fixes issue #789
// Added: 2025-10-15
// Review: 2025-11-15
```

## Documentation Tools

### Recommended Tools
- **JSDoc** - JavaScript documentation
- **TypeDoc** - TypeScript documentation
- **Swagger/OpenAPI** - API documentation
- **Storybook** - Component documentation
- **Docusaurus** - Full documentation site

### Generating Documentation
```bash
# Generate JSDoc
npx jsdoc src/**/*.js -d docs/jsdoc

# Generate TypeDoc
npx typedoc src/**/*.ts -out docs/typedoc

# Generate API docs
npx swagger-jsdoc -d swaggerDef.js src/**/*.js -o docs/swagger.json
```

## Documentation Checklist

- [ ] File headers with purpose
- [ ] Function JSDoc comments
- [ ] Complex logic explained
- [ ] Security considerations noted
- [ ] Performance implications documented
- [ ] Edge cases handled
- [ ] Error handling documented
- [ ] API endpoints documented
- [ ] Database schema documented
- [ ] Configuration documented

## Examples

### Well-Documented Function
```javascript
/**
 * Processes a student's course completion
 * 
 * This function handles the entire completion workflow:
 * 1. Validates all modules are completed
 * 2. Generates a certificate
 * 3. Updates enrollment status
 * 4. Sends completion email
 * 5. Triggers analytics event
 * 
 * @async
 * @param {string} enrollmentId - The enrollment ID to complete
 * @returns {Promise<Object>} Certificate data
 * @throws {Error} If modules are incomplete
 * @throws {Error} If certificate generation fails
 * 
 * @example
 * const certificate = await completeCourse('enrollment-123');
 * console.log(certificate.url); // Certificate PDF URL
 * 
 * @performance
 * Average execution time: 500ms
 * Database queries: 3
 * External API calls: 1 (email service)
 * 
 * @security
 * - Validates user owns the enrollment
 * - Checks course is still published
 * - Rate limited to prevent abuse
 */
async function completeCourse(enrollmentId) {
  // Validate enrollment exists and belongs to user
  const enrollment = await validateEnrollment(enrollmentId);
  
  // Check all modules are completed
  // This prevents premature completion
  const allCompleted = await checkModulesCompleted(enrollment.id);
  if (!allCompleted) {
    throw new Error('All modules must be completed first');
  }
  
  // Generate certificate
  // Uses external PDF service (may take 200-300ms)
  const certificate = await generateCertificate(enrollment);
  
  // Update enrollment status
  await updateEnrollmentStatus(enrollment.id, 'completed');
  
  // Send completion email
  // Async - doesn't block response
  sendCompletionEmail(enrollment.user_id, certificate).catch(err => {
    console.error('Failed to send completion email:', err);
    // Don't fail the completion if email fails
  });
  
  // Track analytics
  trackCourseCompletion(enrollment.course_id, enrollment.user_id);
  
  return certificate;
}
```

---

*Last updated: 2025-10-15*
