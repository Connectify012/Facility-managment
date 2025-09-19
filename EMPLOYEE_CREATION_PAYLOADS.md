# Employee Creation Payloads Guide

This document provides comprehensive examples of payloads for creating employee users through the `/api/users` endpoint.

## 🔐 Authentication & Authorization

All requests require authentication with a Bearer token:
```
Authorization: Bearer <your_jwt_token>
```

## 🚫 Role Restrictions

**Cannot be created via API:**
- `super_admin` - Use `User.createSuperAdmin()` method
- `admin` - Use dedicated admin creation process

**Available roles for API creation:**
- `facility_manager`
- `supervisor`
- `technician`
- `housekeeping`
- `user`
- `guest`

## 🔧 Auto-Assignment Logic

### For All Users Creating Employees:
- ✅ `createdBy` → Automatically set to creator's user ID
- ✅ `managedFacilities` → Automatically inherited from creator's managed facilities
- ✅ No need to pass `managedFacilities` in request body (will be ignored if provided)

### Facility Assignment Rules:
- **Facility Managers**: New employees get assigned all facilities the creator manages
- **Admins/Super Admins**: New employees get assigned all facilities the creator manages
- **Users with no facilities**: New employees get empty facilities array
- **Security**: Cannot manually override facility assignment - always inherited from creator

---

## 📋 Required Fields

All employee creation requests must include:
```json
{
  "email": "unique@email.com",
  "password": "SecurePass123!",
  "firstName": "First",
  "lastName": "Last"
}
```

**Password Requirements:**
- Minimum 8 characters
- At least one uppercase letter
- At least one lowercase letter
- At least one number
- At least one special character (@$!%*?&)

---

## 👥 Employee Creation Examples

### 1. 🏢 Facility Manager

**Payload:**
```json
{
  "email": "manager@company.com",
  "password": "ManagerPass123!",
  "firstName": "Michael",
  "lastName": "Thompson",
  "phone": "+1-555-345-6789",
  "role": "facility_manager",
  "profile": {
    "dateOfBirth": "1985-08-20",
    "address": {
      "street": "456 Manager Ave",
      "city": "New York",
      "state": "New York",
      "country": "USA",
      "postalCode": "10001"
    },
    "emergencyContact": {
      "name": "Sarah Thompson",
      "relationship": "Spouse",
      "phone": "+1-555-987-6543",
      "email": "sarah.thompson@email.com"
    },
    "department": "Facility Management",
    "jobTitle": "Senior Facility Manager",
    "employeeId": "FM001",
    "hireDate": "2023-06-01",
    "employeeType": "permanent",
    "employmentStatus": "active",
    "workLocation": "hybrid",
    "shiftType": "flexible",
    "salary": {
      "basic": 95000,
      "currency": "USD",
      "payFrequency": "monthly",
      "effectiveDate": "2023-06-01"
    },
    "workSchedule": {
      "workingDays": ["monday", "tuesday", "wednesday", "thursday", "friday"],
      "startTime": "09:00",
      "endTime": "18:00",
      "breakDuration": 60,
      "weeklyHours": 40
    }
  },
  "managedFacilities": ["507f1f77bcf86cd799439011", "507f1f77bcf86cd799439012"], // ⚠️ IGNORED - Auto-assigned from creator
  "settings": {
    "notifications": {
      "email": true,
      "sms": true,
      "push": true,
      "inApp": true
    },
    "privacy": {
      "profileVisibility": "private",
      "showEmail": false,
      "showPhone": false
    },
    "theme": "light"
  }
}
```

### 2. 👷 Supervisor

**Payload:**
```json
{
  "email": "supervisor@company.com",
  "password": "SuperPass123!",
  "firstName": "David",
  "lastName": "Wilson",
  "phone": "+1-555-456-7890",
  "role": "supervisor",
  "profile": {
    "dateOfBirth": "1988-03-15",
    "address": {
      "street": "789 Supervisor St",
      "city": "Chicago",
      "state": "Illinois",
      "country": "USA",
      "postalCode": "60601"
    },
    "emergencyContact": {
      "name": "Lisa Wilson",
      "relationship": "Wife",
      "phone": "+1-555-123-7890",
      "email": "lisa.wilson@email.com"
    },
    "department": "Operations",
    "jobTitle": "Operations Supervisor",
    "employeeId": "SUP001",
    "hireDate": "2024-01-10",
    "employeeType": "permanent",
    "employmentStatus": "active",
    "workLocation": "on_site",
    "shiftType": "morning",
    "salary": {
      "basic": 75000,
      "currency": "USD",
      "payFrequency": "monthly",
      "effectiveDate": "2024-01-10"
    },
    "workSchedule": {
      "workingDays": ["monday", "tuesday", "wednesday", "thursday", "friday"],
      "startTime": "07:00",
      "endTime": "16:00",
      "breakDuration": 60,
      "weeklyHours": 40
    }
  },
  "managedFacilities": ["507f1f77bcf86cd799439011"]
}
```

### 3. 🔧 Technician

**Payload:**
```json
{
  "email": "alex.technician@company.com",
  "password": "TechPass123!",
  "firstName": "Alex",
  "lastName": "Rodriguez",
  "phone": "+1-555-123-4567",
  "role": "technician",
  "profile": {
    "dateOfBirth": "1990-05-15",
    "address": {
      "street": "123 Tech Street",
      "city": "San Francisco",
      "state": "California",
      "country": "USA",
      "postalCode": "94105"
    },
    "emergencyContact": {
      "name": "Maria Rodriguez",
      "relationship": "Spouse",
      "phone": "+1-555-987-6543",
      "email": "maria.rodriguez@email.com"
    },
    "department": "Technical Operations",
    "jobTitle": "Senior Technician",
    "employeeId": "TECH001",
    "hireDate": "2024-01-15",
    "employeeType": "permanent",
    "employmentStatus": "active",
    "workLocation": "on_site",
    "shiftType": "morning",
    "salary": {
      "basic": 65000,
      "currency": "USD",
      "payFrequency": "monthly",
      "effectiveDate": "2024-01-15"
    },
    "workSchedule": {
      "workingDays": ["monday", "tuesday", "wednesday", "thursday", "friday"],
      "startTime": "08:00",
      "endTime": "17:00",
      "breakDuration": 60,
      "weeklyHours": 40
    }
  },
  "managedFacilities": ["507f1f77bcf86cd799439011"]
}
```

### 4. 🧽 Housekeeping

**Payload:**
```json
{
  "email": "sarah.housekeeping@company.com",
  "password": "CleanPass123!",
  "firstName": "Sarah",
  "lastName": "Johnson",
  "phone": "+1-555-234-5678",
  "role": "housekeeping",
  "profile": {
    "dateOfBirth": "1992-11-08",
    "address": {
      "street": "321 Clean Ave",
      "city": "Miami",
      "state": "Florida",
      "country": "USA",
      "postalCode": "33101"
    },
    "emergencyContact": {
      "name": "Robert Johnson",
      "relationship": "Husband",
      "phone": "+1-555-876-5432",
      "email": "robert.johnson@email.com"
    },
    "department": "Housekeeping",
    "jobTitle": "Housekeeping Supervisor",
    "employeeId": "HOUSE001",
    "hireDate": "2024-02-01",
    "employeeType": "permanent",
    "employmentStatus": "active",
    "workLocation": "on_site",
    "shiftType": "morning",
    "salary": {
      "basic": 45000,
      "currency": "USD",
      "payFrequency": "monthly",
      "effectiveDate": "2024-02-01"
    },
    "workSchedule": {
      "workingDays": ["monday", "tuesday", "wednesday", "thursday", "friday", "saturday"],
      "startTime": "06:00",
      "endTime": "14:00",
      "breakDuration": 30,
      "weeklyHours": 48
    }
  },
      "managedFacilities": ["507f1f77bcf86cd799439013"] // ⚠️ IGNORED - Auto-assigned from creator
    }
  }
```

### 5. 👤 Regular User

**Payload:**
```json
{
  "email": "regular.user@company.com",
  "password": "UserPass123!",
  "firstName": "John",
  "lastName": "Doe",
  "phone": "+1-555-567-8901",
  "role": "user",
  "profile": {
    "dateOfBirth": "1995-07-20",
    "address": {
      "street": "456 User Blvd",
      "city": "Austin",
      "state": "Texas",
      "country": "USA",
      "postalCode": "73301"
    },
    "emergencyContact": {
      "name": "Jane Doe",
      "relationship": "Sister",
      "phone": "+1-555-234-8901",
      "email": "jane.doe@email.com"
    },
    "department": "General",
    "jobTitle": "Employee",
    "employeeId": "USR001",
    "hireDate": "2024-03-01",
    "employeeType": "permanent",
    "employmentStatus": "active",
    "workLocation": "remote",
    "shiftType": "flexible"
  }
}
```

### 6. 🏃 Guest User

**Payload:**
```json
{
  "email": "guest@company.com",
  "password": "GuestPass123!",
  "firstName": "Emma",
  "lastName": "Guest",
  "role": "guest",
  "profile": {
    "jobTitle": "Temporary Visitor",
    "employeeId": "GUEST001",
    "hireDate": "2024-09-19",
    "employeeType": "contract",
    "employmentStatus": "active",
    "workLocation": "on_site",
    "shiftType": "flexible"
  }
}
```

---

## 🏢 Auto-Assignment from Creator

When any authenticated user creates an employee, the system automatically:

### Facility Inheritance (No manual assignment needed):
```json
{
  "email": "auto.employee@company.com",
  "password": "AutoPass123!",
  "firstName": "Auto",
  "lastName": "Employee",
  "role": "technician",
  "profile": {
    "jobTitle": "Auto-Assigned Technician",
    "employeeId": "AUTO001"
  }
  // ✅ managedFacilities automatically inherited from creator
  // ✅ createdBy automatically set to creator's ID
  // ⚠️ Do NOT include managedFacilities in request - will be ignored
}
```

### Assignment Rules:
- **Creator has facilities**: New employee inherits ALL creator's managed facilities
- **Creator has no facilities**: New employee gets empty facilities array
- **Manual override**: Not allowed - `managedFacilities` in request body is ignored for security

---

## 📝 Contract & Probation Employees

### Contract Employee:
```json
{
  "email": "contract.worker@company.com",
  "password": "ContractPass123!",
  "firstName": "Emma",
  "lastName": "Wilson",
  "role": "user",
  "profile": {
    "jobTitle": "Contract Specialist",
    "employeeId": "CONT001",
    "hireDate": "2024-09-01",
    "employeeType": "contract",
    "employmentStatus": "active",
    "workLocation": "remote",
    "shiftType": "flexible",
    "noticePeriod": 15,
    "workSchedule": {
      "workingDays": ["monday", "tuesday", "wednesday", "thursday", "friday"],
      "startTime": "10:00",
      "endTime": "18:00",
      "breakDuration": 45,
      "weeklyHours": 35
    }
  }
}
```

### Probation Employee:
```json
{
  "email": "probation.employee@company.com",
  "password": "ProbationPass123!",
  "firstName": "Tom",
  "lastName": "Probation",
  "role": "technician",
  "profile": {
    "jobTitle": "Probation Technician",
    "employeeId": "PROB001",
    "hireDate": "2024-09-01",
    "employeeType": "permanent",
    "employmentStatus": "probation",
    "workLocation": "on_site",
    "shiftType": "morning",
    "probationEndDate": "2024-12-01",
    "workSchedule": {
      "workingDays": ["monday", "tuesday", "wednesday", "thursday", "friday"],
      "startTime": "09:00",
      "endTime": "17:00",
      "breakDuration": 60,
      "weeklyHours": 40
    }
  }
}
```

---

## 📊 Response Examples

### Successful Creation:
```json
{
  "status": "success",
  "message": "User created successfully",
  "data": {
    "user": {
      "_id": "66ec1234567890abcdef1234",
      "email": "alex.technician@company.com",
      "firstName": "Alex",
      "lastName": "Rodriguez",
      "fullName": "Alex Rodriguez",
      "role": "technician",
      "status": "pending",
      "verificationStatus": "pending",
      "createdBy": "66ec1234567890abcdef9999", // Auto-populated
      "managedFacilities": ["507f1f77bcf86cd799439011"], // Auto-assigned from creator
      "profile": {
        "jobTitle": "Senior Technician",
        "employeeId": "TECH001",
        "employeeType": "permanent",
        "employmentStatus": "active"
      },
      "createdAt": "2024-09-19T10:30:00.000Z",
      "updatedAt": "2024-09-19T10:30:00.000Z"
    }
  }
}
```

### Error Responses:

**Role Restriction:**
```json
{
  "status": "error",
  "message": "Cannot create SUPER_ADMIN or ADMIN users through this endpoint. Use dedicated admin creation methods.",
  "statusCode": 403
}
```

**Facility Restriction (No longer applicable):**
```json
{
  "status": "error", 
  "message": "managedFacilities field is ignored - facilities are auto-assigned from creator",
  "statusCode": 400
}
```

**Duplicate Email:**
```json
{
  "status": "error",
  "message": "User with this email already exists",
  "statusCode": 400
}
```

**Validation Error:**
```json
{
  "status": "error",
  "message": "Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character",
  "statusCode": 400
}
```

---

## 📋 Field Reference

### Employee Types:
- `permanent` - Full-time permanent employee
- `contract` - Contract worker
- `intern` - Internship position
- `part_time` - Part-time employee
- `freelancer` - Freelance worker
- `consultant` - Consulting role

### Employment Status:
- `active` - Currently active employee
- `terminated` - Employment terminated
- `resigned` - Employee resigned
- `retired` - Retired employee
- `on_leave` - Currently on leave
- `probation` - On probation period

### Work Location:
- `on_site` - Office/facility based
- `remote` - Work from home
- `hybrid` - Mix of on-site and remote

### Shift Types:
- `morning` - Morning shift
- `afternoon` - Afternoon shift
- `night` - Night shift
- `flexible` - Flexible hours
- `rotational` - Rotating shifts

---

## 🔗 API Endpoint

```
POST /api/users
Content-Type: application/json
Authorization: Bearer <your_jwt_token>
```

## 🚀 Quick Start

### Minimal Employee Creation:
```json
{
  "email": "quick@company.com",
  "password": "QuickPass123!",
  "firstName": "Quick",
  "lastName": "Start",
  "role": "user"
}
```

This will create a basic employee with default settings and auto-populated audit fields.