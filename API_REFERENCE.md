# GrandHR API Reference

## Base URL
```
/api
```

## Authentication
All protected endpoints require a Bearer token in the Authorization header:
```
Authorization: Bearer <access_token>
```

## Response Format
```json
{
  "message": "Success message",
  "data": { ... },
  "error": "Error message (if any)"
}
```

---

## Auth & RBAC

### Register
```http
POST /api/auth/register
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "password123",
  "firstName": "John",
  "lastName": "Doe",
  "companyId": "optional",
  "role": "EMPLOYEE",
  "employeeId": "optional"
}
```

### Login
```http
POST /api/auth/login
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "password123"
}

Response:
{
  "message": "Login successful",
  "token": "jwt_access_token",
  "refreshToken": "jwt_refresh_token",
  "user": {
    "id": "user_id",
    "email": "user@example.com",
    "role": "EMPLOYEE",
    "companyId": "company_id",
    "permissions": ["EMPLOYEE_VIEW", "ATTENDANCE_CREATE"]
  }
}
```

### Refresh Token
```http
POST /api/auth/refresh-token
Content-Type: application/json

{
  "refreshToken": "jwt_refresh_token"
}
```

### Get Profile
```http
GET /api/auth/profile
Authorization: Bearer <token>
```

### Invite User (Admin Only)
```http
POST /api/auth/invite
Authorization: Bearer <token>
Content-Type: application/json

{
  "email": "newuser@example.com",
  "role": "EMPLOYEE",
  "permissions": ["EMPLOYEE_VIEW"]
}
```

### Change Password
```http
PUT /api/auth/change-password
Authorization: Bearer <token>
Content-Type: application/json

{
  "currentPassword": "old_password",
  "newPassword": "new_password"
}
```

---

## Role Management

### Get All Roles
```http
GET /api/roles
Authorization: Bearer <token>
```

### Create Role
```http
POST /api/roles
Authorization: Bearer <token>
Content-Type: application/json

{
  "name": "Custom Role",
  "description": "Role description",
  "permissions": ["EMPLOYEE_VIEW", "EMPLOYEE_CREATE"]
}
```

### Update Role
```http
PUT /api/roles/:id
Authorization: Bearer <token>
Content-Type: application/json

{
  "name": "Updated Role",
  "permissions": ["EMPLOYEE_VIEW"]
}
```

### Delete Role
```http
DELETE /api/roles/:id
Authorization: Bearer <token>
```

---

## Company & Organization

### Create Company
```http
POST /api/companies
Authorization: Bearer <token>
Content-Type: application/json

{
  "name": "Acme Corp",
  "legalName": "Acme Corporation Pvt Ltd",
  "domain": "acme",
  "email": "contact@acme.com",
  "phone": "+1234567890",
  "address": "123 Main St",
  "city": "New York",
  "state": "NY",
  "country": "USA",
  "taxId": "TAX123456",
  "registrationNumber": "REG123456"
}
```

### Get Company
```http
GET /api/companies/:id
Authorization: Bearer <token>
```

### Update Company
```http
PUT /api/companies/:id
Authorization: Bearer <token>
Content-Type: application/json

{
  "name": "Updated Name"
}
```

---

## Locations

### Create Location
```http
POST /api/locations
Authorization: Bearer <token>
Content-Type: application/json

{
  "name": "Head Office",
  "code": "HO",
  "address": "123 Main St",
  "city": "New York",
  "isHeadOffice": true
}
```

### Get Locations
```http
GET /api/locations
Authorization: Bearer <token>
```

---

## Departments

### Create Department
```http
POST /api/departments
Authorization: Bearer <token>
Content-Type: application/json

{
  "name": "Engineering",
  "code": "ENG",
  "description": "Engineering Department",
  "parentId": "optional_parent_id"
}
```

### Get Departments (with hierarchy)
```http
GET /api/departments
Authorization: Bearer <token>
```

---

## Designations

### Create Designation
```http
POST /api/designations
Authorization: Bearer <token>
Content-Type: application/json

{
  "name": "Senior Software Engineer",
  "code": "SSE",
  "level": 5,
  "description": "Senior level engineer"
}
```

### Get Designations
```http
GET /api/designations
Authorization: Bearer <token>
```

---

## Attendance

### Punch In
```http
POST /api/attendance/punch-in
Authorization: Bearer <token>
Content-Type: application/json

{
  "notes": "Optional notes"
}
```

### Punch Out
```http
POST /api/attendance/punch-out
Authorization: Bearer <token>
Content-Type: application/json

{
  "breakDuration": 60,
  "notes": "Optional notes"
}
```

### Get My Attendance
```http
GET /api/attendance/my-attendance?startDate=2024-01-01&endDate=2024-01-31&page=1&limit=30
Authorization: Bearer <token>
```

### Get Monthly Summary
```http
GET /api/attendance/summary/:month/:year
Authorization: Bearer <token>

Example: /api/attendance/summary/1/2024
```

### Create Regularization Request
```http
POST /api/attendance/regularization
Authorization: Bearer <token>
Content-Type: application/json

{
  "date": "2024-01-15",
  "clockIn": "2024-01-15T09:30:00Z",
  "clockOut": "2024-01-15T18:00:00Z",
  "reason": "Forgot to punch in"
}
```

### Approve/Reject Regularization
```http
PUT /api/attendance/regularization/:id
Authorization: Bearer <token>
Content-Type: application/json

{
  "status": "APPROVED",
  "rejectedReason": "Optional if rejected"
}
```

---

## Shifts

### Create Shift
```http
POST /api/shifts
Authorization: Bearer <token>
Content-Type: application/json

{
  "name": "Day Shift",
  "code": "DAY",
  "startTime": "09:00",
  "endTime": "18:00",
  "breakDuration": 60,
  "gracePeriod": 15,
  "lateThreshold": 30,
  "earlyThreshold": 30,
  "workingHours": 8
}
```

### Get Shifts
```http
GET /api/shifts
Authorization: Bearer <token>
```

### Update Shift
```http
PUT /api/shifts/:id
Authorization: Bearer <token>
Content-Type: application/json

{
  "gracePeriod": 20
}
```

---

## Error Codes

- `400` - Bad Request (validation error)
- `401` - Unauthorized (missing/invalid token)
- `403` - Forbidden (insufficient permissions)
- `404` - Not Found
- `500` - Internal Server Error

## Pagination

For list endpoints, use query parameters:
- `page` - Page number (default: 1)
- `limit` - Items per page (default: 30)

Response includes pagination metadata:
```json
{
  "data": [...],
  "pagination": {
    "page": 1,
    "limit": 30,
    "total": 100,
    "pages": 4
  }
}
```

---

## Permissions Reference

### Employee Permissions
- `EMPLOYEE_VIEW` - View employees
- `EMPLOYEE_CREATE` - Create employees
- `EMPLOYEE_UPDATE` - Update employees
- `EMPLOYEE_DELETE` - Delete employees
- `EMPLOYEE_EXPORT` - Export employee data

### Attendance Permissions
- `ATTENDANCE_VIEW` - View attendance
- `ATTENDANCE_CREATE` - Create attendance
- `ATTENDANCE_UPDATE` - Update attendance
- `ATTENDANCE_DELETE` - Delete attendance
- `ATTENDANCE_APPROVE` - Approve attendance/regularization

### Leave Permissions
- `LEAVE_VIEW` - View leaves
- `LEAVE_CREATE` - Create leave requests
- `LEAVE_UPDATE` - Update leaves
- `LEAVE_APPROVE` - Approve leaves
- `LEAVE_REJECT` - Reject leaves

### Payroll Permissions
- `PAYROLL_VIEW` - View payroll
- `PAYROLL_CREATE` - Create payroll
- `PAYROLL_UPDATE` - Update payroll
- `PAYROLL_PROCESS` - Process payroll
- `PAYROLL_LOCK` - Lock payroll

### Settings Permissions
- `SETTINGS_VIEW` - View settings
- `SETTINGS_UPDATE` - Update settings

---

## Notes

1. All dates should be in ISO 8601 format
2. All timestamps are in UTC
3. Company context is automatically enforced from JWT token
4. Multi-tenant isolation is handled automatically
5. Soft deletes are used (isActive flag) - no hard deletes

