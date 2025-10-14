# WIOA Compliance API Documentation

## Table of Contents
1. [Authentication](#authentication)
2. [Eligibility Management](#eligibility-management)
3. [Attendance Tracking](#attendance-tracking)
4. [Employment Outcomes](#employment-outcomes)
5. [Individual Employment Plans (IEP)](#individual-employment-plans-iep)
6. [Case Management](#case-management)
7. [Financial Tracking](#financial-tracking)
8. [Support Services](#support-services)
9. [Employer Management](#employer-management)
10. [Reporting](#reporting)
11. [Data Validation](#data-validation)
12. [Audit Logs](#audit-logs)

---

## Authentication

All API endpoints require authentication via JWT token.

### Headers
```
Authorization: Bearer <JWT_TOKEN>
Content-Type: application/json
```

### Roles
- `admin` - Full system access
- `case_manager` - Participant and case management
- `financial_manager` - Financial tracking and budgets
- `participant` - Limited access to own records

---

## Eligibility Management

### Get Eligibility Records
```http
GET /api/eligibility/:userId?
```

**Query Parameters:**
- `userId` (optional) - Specific user ID

**Response:**
```json
{
  "success": true,
  "data": {
    "id": "elig_123",
    "userId": "user_456",
    "eligibilityCategory": "adult",
    "enrollmentDate": "2024-01-15T00:00:00.000Z",
    "employmentStatus": "unemployed",
    "educationLevel": "high_school",
    "approved": true,
    "approvedBy": "admin_789",
    "approvedAt": "2024-01-16T10:30:00.000Z"
  }
}
```

### Create Eligibility Record
```http
POST /api/eligibility
```

**Request Body:**
```json
{
  "userId": "user_456",
  "eligibilityCategory": "adult",
  "employmentStatus": "unemployed",
  "educationLevel": "high_school",
  "income": 25000,
  "householdSize": 3,
  "documentationUrl": "https://..."
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "id": "elig_123",
    "userId": "user_456",
    "eligibilityCategory": "adult",
    "approved": false,
    "createdAt": "2024-01-15T00:00:00.000Z"
  }
}
```

### Update Eligibility Record
```http
PUT /api/eligibility/:id
```

**Request Body:**
```json
{
  "employmentStatus": "employed",
  "income": 30000
}
```

### Approve/Deny Eligibility
```http
POST /api/eligibility/:id/approve
```

**Authorization:** `admin`, `case_manager`

**Request Body:**
```json
{
  "approved": true,
  "notes": "All documentation verified"
}
```

### Get Pending Eligibility Records
```http
GET /api/eligibility/pending/all
```

**Authorization:** `admin`, `case_manager`

---

## Attendance Tracking

### Get Attendance Records
```http
GET /api/attendance
```

**Query Parameters:**
- `userId` - User ID
- `courseId` - Course ID
- `startDate` - Start date (YYYY-MM-DD)
- `endDate` - End date (YYYY-MM-DD)

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": "att_123",
      "userId": "user_456",
      "courseId": "course_789",
      "date": "2024-01-15",
      "status": "present",
      "hoursAttended": 4,
      "notes": "Participated actively"
    }
  ]
}
```

### Record Attendance
```http
POST /api/attendance
```

**Request Body:**
```json
{
  "userId": "user_456",
  "courseId": "course_789",
  "date": "2024-01-15",
  "status": "present",
  "hoursAttended": 4,
  "notes": "Participated actively"
}
```

### Update Attendance
```http
PUT /api/attendance/:id
```

**Request Body:**
```json
{
  "status": "excused",
  "notes": "Medical appointment"
}
```

### Get Attendance Summary
```http
GET /api/attendance/summary
```

**Query Parameters:**
- `userId` - User ID
- `courseId` - Course ID
- `startDate` - Start date
- `endDate` - End date

**Response:**
```json
{
  "success": true,
  "data": {
    "totalDays": 20,
    "present": 18,
    "absent": 1,
    "excused": 1,
    "attendanceRate": 90,
    "totalHours": 72
  }
}
```

---

## Employment Outcomes

### Get Employment Outcomes
```http
GET /api/employment
```

**Query Parameters:**
- `userId` - User ID
- `employerId` - Employer ID
- `status` - Employment status

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": "emp_123",
      "userId": "user_456",
      "employerId": "employer_789",
      "jobTitle": "Software Developer",
      "startDate": "2024-02-01",
      "wage": 25.00,
      "wageType": "hourly",
      "hoursPerWeek": 40,
      "benefits": ["health", "dental", "401k"],
      "retentionChecks": []
    }
  ]
}
```

### Create Employment Outcome
```http
POST /api/employment
```

**Request Body:**
```json
{
  "userId": "user_456",
  "employerId": "employer_789",
  "jobTitle": "Software Developer",
  "startDate": "2024-02-01",
  "wage": 25.00,
  "wageType": "hourly",
  "hoursPerWeek": 40,
  "benefits": ["health", "dental", "401k"]
}
```

### Add Retention Check
```http
POST /api/employment/:id/retention
```

**Request Body:**
```json
{
  "quarter": 2,
  "employed": true,
  "wage": 26.00,
  "hoursPerWeek": 40,
  "contactMethod": "phone",
  "notes": "Still employed, received raise"
}
```

---

## Individual Employment Plans (IEP)

### Get IEPs
```http
GET /api/iep
```

**Query Parameters:**
- `userId` - User ID
- `caseManagerId` - Case manager ID
- `status` - IEP status (draft, active, completed, archived)

### Create IEP
```http
POST /api/iep
```

**Request Body:**
```json
{
  "userId": "user_456",
  "caseManagerId": "cm_789",
  "careerGoal": "Become a certified web developer",
  "targetOccupation": "Web Developer",
  "targetIndustry": "Technology",
  "targetWage": 60000,
  "currentSkills": ["HTML", "CSS", "Basic JavaScript"],
  "skillGaps": ["React", "Node.js", "Database management"],
  "barriers": ["Lack of professional experience"],
  "strengths": ["Quick learner", "Strong problem-solving"],
  "trainingPrograms": [
    {
      "courseId": "course_123",
      "startDate": "2024-02-01",
      "expectedEndDate": "2024-05-01",
      "status": "planned"
    }
  ],
  "milestones": [
    {
      "description": "Complete React fundamentals",
      "targetDate": "2024-03-01",
      "status": "pending"
    }
  ]
}
```

### Update IEP
```http
PUT /api/iep/:id
```

### Sign IEP
```http
POST /api/iep/:id/sign
```

**Request Body:**
```json
{
  "signature": "John Doe",
  "role": "participant"
}
```

### Review IEP
```http
POST /api/iep/:id/review
```

**Request Body:**
```json
{
  "nextReviewDate": "2024-04-01"
}
```

---

## Case Management

### Get Cases
```http
GET /api/case-management
```

**Query Parameters:**
- `userId` - User ID
- `caseManagerId` - Case manager ID
- `status` - Case status
- `priority` - Priority level

### Create Case
```http
POST /api/case-management
```

**Request Body:**
```json
{
  "userId": "user_456",
  "caseManagerId": "cm_789",
  "priority": "medium",
  "contactFrequency": "monthly",
  "intakeNotes": "Initial assessment completed",
  "barriers": ["Transportation", "Childcare"],
  "accommodations": ["Flexible schedule"]
}
```

### Add Case Note
```http
POST /api/case-management/:id/notes
```

**Request Body:**
```json
{
  "type": "contact",
  "content": "Phone call with participant to discuss progress",
  "confidential": false
}
```

### Add Case Activity
```http
POST /api/case-management/:id/activities
```

**Request Body:**
```json
{
  "activityType": "meeting",
  "description": "In-person meeting to review IEP",
  "outcome": "Updated career goals",
  "hoursSpent": 1.5
}
```

### Add Referral
```http
POST /api/case-management/:id/referrals
```

**Request Body:**
```json
{
  "service": "Mental Health Counseling",
  "provider": "Community Health Center",
  "notes": "Referred for stress management"
}
```

### Close Case
```http
POST /api/case-management/:id/close
```

**Request Body:**
```json
{
  "exitReason": "Successfully employed",
  "exitNotes": "Participant secured full-time employment"
}
```

---

## Financial Tracking

### Get Financial Records
```http
GET /api/financial/records
```

**Query Parameters:**
- `userId` - User ID
- `programId` - Program ID
- `fundingSource` - Funding source
- `fiscalYear` - Fiscal year
- `status` - Record status

### Create Financial Record
```http
POST /api/financial/records
```

**Request Body:**
```json
{
  "userId": "user_456",
  "programId": "prog_789",
  "fundingSource": "WIOA Adult",
  "grantNumber": "GRANT-2024-001",
  "fiscalYear": 2024,
  "allocatedAmount": 5000,
  "budgetCategory": "training"
}
```

### Add Transaction
```http
POST /api/financial/records/:id/transactions
```

**Request Body:**
```json
{
  "type": "expenditure",
  "amount": 1500,
  "category": "tuition",
  "description": "Web Development Course Tuition",
  "vendor": "Tech Training Institute",
  "invoiceNumber": "INV-2024-001",
  "notes": "First semester payment"
}
```

### Get Financial Summary
```http
GET /api/financial/summary
```

**Query Parameters:**
- `programId` - Program ID
- `fiscalYear` - Fiscal year

**Response:**
```json
{
  "success": true,
  "data": {
    "totalAllocated": 50000,
    "totalSpent": 35000,
    "totalRemaining": 15000,
    "byCategory": {
      "training": {
        "allocated": 30000,
        "spent": 22000,
        "remaining": 8000
      },
      "support_services": {
        "allocated": 15000,
        "spent": 10000,
        "remaining": 5000
      }
    }
  }
}
```

### Create Participant Cost
```http
POST /api/financial/costs
```

**Request Body:**
```json
{
  "userId": "user_456",
  "financialRecordId": "fin_123",
  "costType": "transportation",
  "amount": 150,
  "vendor": "Metro Transit",
  "receiptUrl": "https://...",
  "notes": "Monthly bus pass"
}
```

### Approve Participant Cost
```http
POST /api/financial/costs/:id/approve
```

### Reimburse Participant Cost
```http
POST /api/financial/costs/:id/reimburse
```

---

## Support Services

### Get Support Services
```http
GET /api/support-services/services
```

**Query Parameters:**
- `userId` - User ID
- `serviceType` - Service type
- `approvalStatus` - Approval status
- `status` - Service status

### Create Support Service
```http
POST /api/support-services/services
```

**Request Body:**
```json
{
  "userId": "user_456",
  "caseManagerId": "cm_789",
  "serviceType": "childcare",
  "serviceProvider": "ABC Daycare Center",
  "providerContact": "555-0123",
  "description": "Full-time childcare for 2 children",
  "needAssessment": "Participant requires childcare to attend training",
  "startDate": "2024-02-01",
  "endDate": "2024-05-01",
  "frequency": "Monday-Friday",
  "duration": "8 hours/day",
  "cost": 800,
  "fundingSource": "WIOA Support Services"
}
```

### Approve Support Service
```http
POST /api/support-services/services/:id/approve
```

**Request Body:**
```json
{
  "approved": true,
  "denialReason": null
}
```

### Add Service Outcome
```http
POST /api/support-services/services/:id/outcomes
```

**Request Body:**
```json
{
  "description": "Participant able to attend all training sessions",
  "impact": "positive"
}
```

### Create Service Request
```http
POST /api/support-services/requests
```

**Request Body:**
```json
{
  "userId": "user_456",
  "serviceType": "transportation",
  "urgency": "high",
  "description": "Need bus pass for training attendance",
  "justification": "No personal vehicle, training location not walkable",
  "estimatedCost": 100
}
```

### Get Service Providers
```http
GET /api/support-services/providers
```

**Query Parameters:**
- `type` - Provider type
- `active` - Active status (true/false)

---

## Employer Management

### Get Employers
```http
GET /api/employer/employers
```

**Query Parameters:**
- `industry` - Industry
- `partnershipType` - Partnership type (training, placement, both)
- `active` - Active status

### Create Employer
```http
POST /api/employer/employers
```

**Request Body:**
```json
{
  "companyName": "Tech Solutions Inc",
  "industry": "Technology",
  "contactPerson": "Jane Smith",
  "contactTitle": "HR Manager",
  "email": "jane@techsolutions.com",
  "phone": "555-0100",
  "address": "123 Tech Street",
  "city": "San Francisco",
  "state": "CA",
  "zipCode": "94105",
  "website": "https://techsolutions.com",
  "companySize": "medium",
  "employeeCount": 150,
  "partnershipType": "both"
}
```

### Get Job Postings
```http
GET /api/employer/jobs
```

**Query Parameters:**
- `employerId` - Employer ID
- `jobType` - Job type (full_time, part_time, contract, temporary)
- `status` - Status (open, filled, closed, cancelled)
- `remote` - Remote work (true/false)

### Create Job Posting
```http
POST /api/employer/jobs
```

**Request Body:**
```json
{
  "employerId": "emp_123",
  "title": "Junior Web Developer",
  "description": "Entry-level position for recent graduates",
  "requirements": ["HTML/CSS", "JavaScript", "Git"],
  "jobType": "full_time",
  "salaryMin": 50000,
  "salaryMax": 65000,
  "salaryType": "annual",
  "benefits": ["health", "dental", "401k"],
  "location": "San Francisco, CA",
  "remote": false,
  "openings": 2,
  "closingDate": "2024-03-31"
}
```

### Create Application
```http
POST /api/employer/applications
```

**Request Body:**
```json
{
  "jobPostingId": "job_123",
  "userId": "user_456",
  "resumeUrl": "https://...",
  "coverLetterUrl": "https://...",
  "notes": "Completed web development training program"
}
```

### Update Application Status
```http
PUT /api/employer/applications/:id
```

**Request Body:**
```json
{
  "status": "interview_scheduled",
  "interviewDate": "2024-02-15T10:00:00Z",
  "interviewNotes": "Phone interview with hiring manager"
}
```

### Create Placement
```http
POST /api/employer/placements
```

**Request Body:**
```json
{
  "userId": "user_456",
  "employerId": "emp_123",
  "jobPostingId": "job_123",
  "jobTitle": "Junior Web Developer",
  "startDate": "2024-03-01",
  "employmentType": "full_time",
  "wage": 55000,
  "wageType": "annual",
  "hoursPerWeek": 40,
  "benefits": ["health", "dental", "401k"]
}
```

### Add Retention Check
```http
POST /api/employer/placements/:id/retention
```

**Request Body:**
```json
{
  "quarter": 2,
  "employed": true,
  "wage": 57000,
  "hoursPerWeek": 40,
  "contactMethod": "email",
  "notes": "Received performance-based raise"
}
```

---

## Reporting

### Get Available Reports
```http
GET /api/reporting/available
```

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": "pirl",
      "name": "PIRL (Participant Individual Record Layout)",
      "description": "Individual participant data for federal reporting",
      "parameters": ["startDate", "endDate"],
      "formats": ["json", "csv"]
    },
    {
      "id": "eta-9130",
      "name": "ETA-9130 Financial Report",
      "description": "Quarterly financial and performance report",
      "parameters": ["quarter", "year"],
      "formats": ["json"]
    }
  ]
}
```

### Generate PIRL Report
```http
GET /api/reporting/pirl?startDate=2024-01-01&endDate=2024-03-31
```

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "participantId": "user_456",
      "firstName": "John",
      "lastName": "Doe",
      "dateOfBirth": "1990-05-15",
      "gender": "male",
      "ethnicity": "not_hispanic",
      "race": ["white"],
      "programType": "WIOA",
      "enrollmentDate": "2024-01-15",
      "eligibilityCategory": "adult",
      "employmentStatus": "employed",
      "educationLevel": "high_school",
      "servicesReceived": ["training", "case_management", "job_placement"],
      "employmentOutcome": {
        "employed": true,
        "jobTitle": "Web Developer",
        "wage": 55000,
        "hoursPerWeek": 40
      },
      "skillGains": 3,
      "credentialsAttained": ["Web Development Certificate"],
      "retention2ndQuarter": true,
      "retention4thQuarter": null
    }
  ]
}
```

### Export PIRL Report (CSV)
```http
GET /api/reporting/pirl/export?startDate=2024-01-01&endDate=2024-03-31
```

**Response:** CSV file download

### Generate ETA-9130 Report
```http
GET /api/reporting/eta-9130?quarter=1&year=2024
```

**Response:**
```json
{
  "success": true,
  "data": {
    "reportingPeriod": {
      "startDate": "2024-01-01",
      "endDate": "2024-03-31",
      "quarter": 1,
      "year": 2024
    },
    "participants": {
      "totalEnrolled": 150,
      "totalExited": 45,
      "activeParticipants": 105
    },
    "demographics": {
      "byGender": {
        "male": 75,
        "female": 70,
        "other": 5
      },
      "byAge": {
        "18-24": 40,
        "25-34": 60,
        "35-44": 30,
        "45-54": 15,
        "55+": 5
      }
    },
    "outcomes": {
      "enteredEmployment": 38,
      "retainedEmployment2Q": 35,
      "retainedEmployment4Q": 30,
      "averageWage": 18.50,
      "credentialsAttained": 42,
      "measurableSkillGains": 95
    },
    "expenditures": {
      "totalSpent": 450000,
      "byCategory": {
        "training": 280000,
        "support_services": 120000,
        "administration": 50000
      }
    }
  }
}
```

### Generate ETA-9169 Report
```http
GET /api/reporting/eta-9169?fiscalYear=2024&quarter=1
```

---

## Data Validation

### Get Available Validators
```http
GET /api/validation/validators
```

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "type": "eligibility",
      "name": "Eligibility Validation",
      "description": "Validates participant eligibility records"
    },
    {
      "type": "attendance",
      "name": "Attendance Validation",
      "description": "Validates attendance records"
    }
  ]
}
```

### Get Validation Rules
```http
GET /api/validation/rules/eligibility
```

**Response:**
```json
{
  "success": true,
  "data": {
    "required": ["userId", "eligibilityCategory", "enrollmentDate"],
    "optional": ["documentationUrl", "employmentStatus", "educationLevel"],
    "validValues": {
      "eligibilityCategory": ["adult", "dislocated_worker", "youth"]
    }
  }
}
```

### Validate Single Record
```http
POST /api/validation/validate/eligibility
```

**Request Body:**
```json
{
  "userId": "user_456",
  "eligibilityCategory": "adult",
  "enrollmentDate": "2024-01-15"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "valid": true,
    "errors": [],
    "warnings": [
      {
        "field": "documentationUrl",
        "message": "Documentation URL is recommended for audit purposes",
        "code": "MISSING_DOCUMENTATION"
      }
    ]
  }
}
```

### Validate Batch Records
```http
POST /api/validation/validate-batch/attendance
```

**Request Body:**
```json
{
  "records": [
    {
      "userId": "user_456",
      "courseId": "course_789",
      "date": "2024-01-15",
      "hoursAttended": 4
    },
    {
      "userId": "user_457",
      "courseId": "course_789",
      "date": "2024-01-15",
      "hoursAttended": 3.5
    }
  ]
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "results": [
      {
        "valid": true,
        "errors": [],
        "warnings": []
      },
      {
        "valid": true,
        "errors": [],
        "warnings": []
      }
    ],
    "summary": {
      "total": 2,
      "valid": 2,
      "invalid": 0,
      "totalErrors": 0,
      "totalWarnings": 0
    }
  }
}
```

---

## Audit Logs

### Get Audit Logs
```http
GET /api/audit/logs
```

**Query Parameters:**
- `userId` - User ID
- `action` - Action type (create, read, update, delete, login, logout)
- `resource` - Resource type
- `startDate` - Start date
- `endDate` - End date
- `success` - Success status (true/false)
- `limit` - Results per page (default: 100)
- `offset` - Pagination offset (default: 0)

**Response:**
```json
{
  "success": true,
  "data": {
    "logs": [
      {
        "id": "audit_123",
        "userId": "user_456",
        "action": "create",
        "resource": "eligibility",
        "resourceId": "elig_789",
        "method": "POST",
        "path": "/api/eligibility",
        "ipAddress": "192.168.1.1",
        "userAgent": "Mozilla/5.0...",
        "requestBody": {...},
        "responseStatus": 201,
        "success": true,
        "timestamp": "2024-01-15T10:30:00.000Z"
      }
    ],
    "pagination": {
      "total": 1500,
      "limit": 100,
      "offset": 0,
      "hasMore": true
    }
  }
}
```

### Get Audit Summary
```http
GET /api/audit/summary?startDate=2024-01-01&endDate=2024-01-31
```

**Response:**
```json
{
  "success": true,
  "data": {
    "byAction": [
      {"action": "read", "count": 5000},
      {"action": "create", "count": 500},
      {"action": "update", "count": 300}
    ],
    "byResource": [
      {"resource": "attendance", "count": 2000},
      {"resource": "eligibility", "count": 1500}
    ],
    "topUsers": [
      {"user_id": "user_456", "count": 150}
    ],
    "successRate": {
      "successful": 5750,
      "failed": 50,
      "total": 5800,
      "rate": 99.14
    },
    "recentFailures": [...]
  }
}
```

### Get User Activity
```http
GET /api/audit/user/:userId
```

**Query Parameters:**
- `startDate` - Start date
- `endDate` - End date
- `limit` - Results limit (default: 50)

### Export Audit Logs
```http
GET /api/audit/export?startDate=2024-01-01&endDate=2024-01-31&format=csv
```

**Response:** CSV file download

---

## Error Responses

All endpoints return errors in the following format:

```json
{
  "success": false,
  "error": {
    "code": "ERROR_CODE",
    "message": "Human-readable error message"
  }
}
```

### Common Error Codes
- `UNAUTHORIZED` - Missing or invalid authentication token
- `FORBIDDEN` - Insufficient permissions
- `NOT_FOUND` - Resource not found
- `VALIDATION_ERROR` - Invalid request data
- `SERVER_ERROR` - Internal server error
- `RATE_LIMIT_EXCEEDED` - Too many requests

---

## Rate Limiting

- **Auth endpoints**: 5 requests per 15 minutes per IP
- **API endpoints**: 100 requests per 15 minutes per user

Rate limit headers:
```
X-RateLimit-Limit: 100
X-RateLimit-Remaining: 95
X-RateLimit-Reset: 1640000000
```

---

## Pagination

Endpoints that return lists support pagination:

**Query Parameters:**
- `limit` - Results per page (default varies by endpoint)
- `offset` - Number of results to skip

**Response:**
```json
{
  "success": true,
  "data": {
    "items": [...],
    "pagination": {
      "total": 500,
      "limit": 100,
      "offset": 0,
      "hasMore": true
    }
  }
}
```

---

## Webhooks (Future Feature)

Webhook support for real-time notifications is planned for future releases.

---

## Support

For API support:
- Email: api-support@elevateforhumanity.org
- Documentation: https://docs.elevateforhumanity.org
- GitHub Issues: https://github.com/elevateforhumanity/Elevate-sitemap/issues
