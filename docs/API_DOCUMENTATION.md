# API Documentation

## Base URL
```
https://api.elevateforhumanity.org/v1
```

## Authentication
All authenticated endpoints require a Bearer token in the Authorization header:
```
Authorization: Bearer YOUR_TOKEN_HERE
```

---

## Authentication Endpoints

### POST /auth/register
Register a new user account.

**Request Body:**
```json
{
  "email": "user@example.com",
  "password": "SecurePass123!",
  "name": "John Doe",
  "role": "student"
}
```

**Response:** `201 Created`
```json
{
  "user": {
    "id": "user_123",
    "email": "user@example.com",
    "name": "John Doe",
    "role": "student"
  },
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

### POST /auth/login
Authenticate and receive access token.

**Request Body:**
```json
{
  "email": "user@example.com",
  "password": "SecurePass123!"
}
```

**Response:** `200 OK`
```json
{
  "user": {
    "id": "user_123",
    "email": "user@example.com",
    "name": "John Doe"
  },
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

### POST /auth/logout
Invalidate current session.

**Response:** `200 OK`

### POST /auth/refresh
Refresh access token.

**Response:** `200 OK`
```json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

---

## User Endpoints

### GET /users/me
Get current user profile.

**Response:** `200 OK`
```json
{
  "id": "user_123",
  "email": "user@example.com",
  "name": "John Doe",
  "role": "student",
  "createdAt": "2025-01-01T00:00:00Z"
}
```

### PATCH /users/me
Update current user profile.

**Request Body:**
```json
{
  "name": "Jane Doe",
  "bio": "Learning enthusiast"
}
```

**Response:** `200 OK`

### GET /users/:id
Get user by ID (public profile).

**Response:** `200 OK`

---

## Course Endpoints

### GET /courses
List all courses with pagination.

**Query Parameters:**
- `page` (number): Page number (default: 1)
- `limit` (number): Items per page (default: 20)
- `category` (string): Filter by category
- `search` (string): Search query

**Response:** `200 OK`
```json
{
  "courses": [
    {
      "id": "course_123",
      "title": "Introduction to Web Development",
      "description": "Learn the basics of web development",
      "instructor": {
        "id": "user_456",
        "name": "Jane Smith"
      },
      "price": 4999,
      "rating": 4.8,
      "enrollments": 1234
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 100,
    "pages": 5
  }
}
```

### GET /courses/:id
Get course details.

**Response:** `200 OK`
```json
{
  "id": "course_123",
  "title": "Introduction to Web Development",
  "description": "Learn the basics of web development",
  "instructor": {
    "id": "user_456",
    "name": "Jane Smith"
  },
  "lessons": [
    {
      "id": "lesson_1",
      "title": "Getting Started",
      "duration": 600
    }
  ],
  "price": 4999,
  "rating": 4.8
}
```

### POST /courses
Create a new course (instructor only).

**Request Body:**
```json
{
  "title": "Advanced React Patterns",
  "description": "Master advanced React concepts",
  "price": 9999,
  "category": "technology"
}
```

**Response:** `201 Created`

### PATCH /courses/:id
Update course (instructor only).

**Response:** `200 OK`

### DELETE /courses/:id
Delete course (instructor/admin only).

**Response:** `204 No Content`

### POST /courses/:id/enroll
Enroll in a course.

**Response:** `200 OK`
```json
{
  "enrollment": {
    "id": "enrollment_123",
    "courseId": "course_123",
    "userId": "user_123",
    "enrolledAt": "2025-01-01T00:00:00Z"
  }
}
```

---

## Progress Endpoints

### GET /progress
Get user's course progress.

**Response:** `200 OK`
```json
{
  "progress": {
    "course_123": {
      "lessons": {
        "lesson_1": true,
        "lesson_2": false
      },
      "completedCount": 1,
      "totalCount": 10,
      "progress": 10
    }
  }
}
```

### POST /progress/:courseId/:lessonId
Mark lesson as complete/incomplete.

**Request Body:**
```json
{
  "completed": true
}
```

**Response:** `200 OK`

---

## Certificate Endpoints

### GET /certificates
Get user's certificates.

**Response:** `200 OK`
```json
{
  "certificates": [
    {
      "id": "cert_123",
      "courseId": "course_123",
      "courseName": "Web Development",
      "issuedAt": "2025-01-01T00:00:00Z",
      "certificateId": "CERT-ABC123"
    }
  ]
}
```

### GET /certificates/:id
Get certificate details.

**Response:** `200 OK`

### GET /certificates/verify/:certificateId
Verify certificate authenticity.

**Response:** `200 OK`
```json
{
  "valid": true,
  "studentName": "John Doe",
  "courseName": "Web Development",
  "completionDate": "2025-01-01T00:00:00Z"
}
```

---

## Payment Endpoints

### POST /payments/create-intent
Create payment intent for Stripe.

**Request Body:**
```json
{
  "amount": 4999,
  "currency": "usd",
  "metadata": {
    "courseId": "course_123"
  }
}
```

**Response:** `200 OK`
```json
{
  "clientSecret": "pi_xxx_secret_xxx"
}
```

### POST /payments/create-checkout
Create Stripe checkout session.

**Request Body:**
```json
{
  "items": [
    {
      "courseId": "course_123",
      "price": 4999
    }
  ],
  "successUrl": "https://example.com/success",
  "cancelUrl": "https://example.com/cancel"
}
```

**Response:** `200 OK`
```json
{
  "sessionId": "cs_xxx"
}
```

### GET /payments/history
Get payment history.

**Response:** `200 OK`

---

## Search Endpoints

### GET /search
Search across courses, instructors, and pages.

**Query Parameters:**
- `q` (string): Search query
- `type` (string): Filter by type (course, instructor, page)
- `category` (string): Filter by category
- `sortBy` (string): Sort by (relevance, newest, popular, rating)

**Response:** `200 OK`
```json
{
  "results": [
    {
      "type": "course",
      "id": "course_123",
      "title": "Web Development",
      "description": "Learn web development",
      "rating": 4.8
    }
  ],
  "total": 42,
  "stats": {
    "courses": 30,
    "instructors": 10,
    "pages": 2
  }
}
```

---

## Notification Endpoints

### GET /notifications
Get user notifications.

**Response:** `200 OK`
```json
{
  "notifications": [
    {
      "id": "notif_123",
      "type": "course",
      "title": "New Course Available",
      "message": "Check out our new course",
      "read": false,
      "timestamp": "2025-01-01T00:00:00Z"
    }
  ]
}
```

### PATCH /notifications/:id/read
Mark notification as read.

**Response:** `200 OK`

### POST /notifications/read-all
Mark all notifications as read.

**Response:** `200 OK`

---

## File Upload Endpoints

### POST /upload
Upload a file.

**Request:** `multipart/form-data`
- `file`: File to upload

**Response:** `200 OK`
```json
{
  "url": "https://cdn.example.com/files/abc123.jpg",
  "filename": "image.jpg",
  "size": 102400,
  "type": "image/jpeg"
}
```

---

## Admin Endpoints

### GET /admin/dashboard
Get admin dashboard data.

**Response:** `200 OK`
```json
{
  "overview": {
    "totalUsers": { "value": 12458, "change": 12.5 },
    "activeCourses": { "value": 342, "change": 8.3 }
  },
  "userGrowth": [...],
  "courseEnrollments": [...]
}
```

### GET /admin/users
List all users (admin only).

**Response:** `200 OK`

### PATCH /admin/users/:id
Update user (admin only).

**Response:** `200 OK`

---

## Error Responses

All endpoints may return the following error responses:

### 400 Bad Request
```json
{
  "error": "Invalid request",
  "message": "Email is required"
}
```

### 401 Unauthorized
```json
{
  "error": "Unauthorized",
  "message": "Invalid or expired token"
}
```

### 403 Forbidden
```json
{
  "error": "Forbidden",
  "message": "Insufficient permissions"
}
```

### 404 Not Found
```json
{
  "error": "Not found",
  "message": "Resource not found"
}
```

### 429 Too Many Requests
```json
{
  "error": "Rate limit exceeded",
  "message": "Too many requests, please try again later",
  "retryAfter": 60
}
```

### 500 Internal Server Error
```json
{
  "error": "Internal server error",
  "message": "An unexpected error occurred"
}
```

---

## Rate Limiting

API requests are rate limited to:
- **Authenticated users:** 1000 requests per hour
- **Unauthenticated users:** 100 requests per hour

Rate limit headers are included in all responses:
```
X-RateLimit-Limit: 1000
X-RateLimit-Remaining: 999
X-RateLimit-Reset: 1640995200
```

---

## Webhooks

### Payment Success
Triggered when a payment is successful.

**Payload:**
```json
{
  "event": "payment.success",
  "data": {
    "paymentId": "pay_123",
    "userId": "user_123",
    "courseId": "course_123",
    "amount": 4999
  }
}
```

### Course Completion
Triggered when a user completes a course.

**Payload:**
```json
{
  "event": "course.completed",
  "data": {
    "userId": "user_123",
    "courseId": "course_123",
    "certificateId": "cert_123"
  }
}
```

---

## SDK Examples

### JavaScript
```javascript
import { api } from './lib/api';

// Get courses
const courses = await api.get('/courses', { category: 'technology' });

// Enroll in course
await api.post('/courses/course_123/enroll');

// Update progress
await api.post('/progress/course_123/lesson_1', { completed: true });
```

### cURL
```bash
# Login
curl -X POST https://api.elevateforhumanity.org/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"user@example.com","password":"SecurePass123!"}'

# Get courses
curl https://api.elevateforhumanity.org/v1/courses \
  -H "Authorization: Bearer YOUR_TOKEN"
```

---

## Support

For API support, contact: api-support@elevateforhumanity.org

**Documentation Version:** 1.0.0  
**Last Updated:** January 2025
