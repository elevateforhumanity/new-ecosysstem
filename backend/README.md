# Backend API - Elevate for Humanity LMS

Express.js backend API for the Learning Management System with Supabase integration.

## Features

- ✅ RESTful API with 20+ endpoints
- ✅ JWT authentication
- ✅ Supabase database integration
- ✅ Rate limiting & security (helmet, cors)
- ✅ Input validation (express-validator)
- ✅ Request logging (morgan)
- ✅ Compression middleware

## Quick Start

### 1. Install Dependencies

```bash
cd backend
npm install
```

### 2. Configure Environment

```bash
cp .env.example .env
# Edit .env with your credentials
```

Required variables:
- `SUPABASE_URL` - Your Supabase project URL
- `SUPABASE_ANON_KEY` or `SUPABASE_SERVICE_KEY`
- `JWT_SECRET` - Secret for JWT tokens (min 32 chars)
- `FRONTEND_URL` - Frontend URL for CORS

### 3. Run Development Server

```bash
npm run dev
```

Server will start on `http://localhost:3001`

### 4. Run Production Server

```bash
npm start
```

## API Endpoints

### Health Check
- `GET /health` - Server health status

### Courses
- `GET /api/v1/courses` - List all courses
- `GET /api/v1/courses/:id` - Get course details

### Enrollments
- `GET /api/v1/enrollments` - Get user enrollments (auth required)
- `POST /api/v1/enrollments` - Enroll in course (auth required)

### Progress
- `GET /api/v1/progress/:enrollmentId` - Get progress (auth required)
- `PUT /api/v1/progress/:progressId` - Update progress (auth required)

### Certificates
- `GET /api/v1/certificates` - Get user certificates (auth required)
- `GET /api/v1/certificates/:id` - Get certificate details

### Dashboard
- `GET /api/v1/dashboard` - User dashboard data (auth required)

### LMS API (Alternative)
- `GET /api/lms/courses` - List courses
- `GET /api/lms/course/:id` - Get course
- `GET /api/lms/my-courses` - My courses (auth required)
- `POST /api/lms/enroll/:courseId` - Enroll (auth required)
- `PUT /api/lms/progress/:courseId` - Update progress (auth required)
- `GET /api/lms/progress/:courseId` - Get progress (auth required)
- `GET /api/lms/assignments` - Get assignments (auth required)
- `POST /api/lms/submit` - Submit assignment (auth required)

## Authentication

### JWT Token

All protected endpoints require a JWT token in the Authorization header:

```
Authorization: Bearer <your-jwt-token>
```

### Getting a Token

Users authenticate through Supabase Auth. The JWT token is returned after successful login.

## Security

### Middleware Stack

1. **Helmet** - Security headers
2. **CORS** - Cross-origin resource sharing
3. **Rate Limiting** - 100 requests per 15 minutes per IP
4. **Body Parser** - JSON/URL-encoded (10MB limit)
5. **Compression** - Gzip compression

### Content Security Policy

```javascript
{
  defaultSrc: ["'self'"],
  styleSrc: ["'self'", "'unsafe-inline'"],
  scriptSrc: ["'self'"],
  imgSrc: ["'self'", 'data:', 'https:']
}
```

## Database

### Supabase Client

```javascript
const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);
```

### Tables Used

- `profiles` - User profiles
- `courses` - Course catalog
- `modules` - Course modules/lessons
- `enrollments` - Student enrollments
- `module_progress` - Progress tracking
- `certificates` - Issued certificates
- `assignments` - Course assignments
- `submissions` - Assignment submissions

## Error Handling

All endpoints return consistent error responses:

```json
{
  "success": false,
  "error": "Error message here"
}
```

## Deployment

### Render

The backend can be deployed to Render as a web service:

```yaml
services:
  - type: web
    name: efh-backend
    env: node
    buildCommand: npm install
    startCommand: npm start
    envVars:
      - key: NODE_ENV
        value: production
      - key: SUPABASE_URL
        sync: false
      - key: SUPABASE_ANON_KEY
        sync: false
      - key: JWT_SECRET
        sync: false
```

### Environment Variables

Set these in your deployment platform:
- `NODE_ENV=production`
- `PORT=3001` (or platform default)
- `SUPABASE_URL`
- `SUPABASE_ANON_KEY` or `SUPABASE_SERVICE_KEY`
- `JWT_SECRET`
- `FRONTEND_URL`

## Development

### File Structure

```
backend/
├── server.js          # Main server file (1034 lines)
├── package.json       # Dependencies
├── .env.example       # Environment template
└── README.md          # This file
```

### Dependencies

```json
{
  "@supabase/supabase-js": "^2.75.0",
  "express": "^4.18.2",
  "cors": "^2.8.5",
  "helmet": "^8.1.0",
  "express-rate-limit": "^8.1.0",
  "express-validator": "^7.2.1",
  "jsonwebtoken": "^9.0.2",
  "morgan": "^1.10.1",
  "compression": "^1.8.1"
}
```

## Testing

### Manual Testing

```bash
# Health check
curl http://localhost:3001/health

# Get courses (no auth)
curl http://localhost:3001/api/v1/courses

# Get enrollments (with auth)
curl -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  http://localhost:3001/api/v1/enrollments
```

## Troubleshooting

### Port Already in Use

```bash
# Kill process on port 3001
lsof -ti:3001 | xargs kill -9
```

### Supabase Connection Issues

1. Check `SUPABASE_URL` is correct
2. Verify `SUPABASE_ANON_KEY` or `SUPABASE_SERVICE_KEY`
3. Ensure Supabase project is active
4. Check network connectivity

### JWT Errors

1. Ensure `JWT_SECRET` is set (min 32 characters)
2. Verify token is not expired
3. Check token format: `Bearer <token>`

## Support

For issues or questions:
1. Check the main [README.md](../README.md)
2. Review [LMS_COMPLETE_SYSTEM_REPORT.md](../LMS_COMPLETE_SYSTEM_REPORT.md)
3. Check Supabase logs
4. Review server logs

## License

Part of Elevate for Humanity platform.
