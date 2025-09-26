# QR Code Task Completion System Documentation

## System Overview

The QR Code Task Completion System allows facility managers to create daily checklists for different hygiene sections (Housekeeping, Gardening, Pest Control) across multiple floor locations. Employees can scan QR codes to view and complete assigned tasks.

## Key Components

### 1. Models

#### FloorLocation Model
- **Purpose**: Represents physical floor locations with unique QR codes
- **Key Fields**:
  - `qrCode`: Unique identifier for QR scanning
  - `floorName`: Human-readable floor name
  - `floorNumber`: Numeric floor identifier
  - `facilityId`: Links to specific facility

#### DailyChecklist Model
- **Purpose**: Stores daily task checklists for specific floor locations
- **Key Fields**:
  - `checklistItems`: Array of individual tasks with completion status
  - `overallStatus`: PENDING/IN_PROGRESS/COMPLETED
  - `assignedDepartment`: HOUSEKEEPING/GARDENING/PEST_CONTROL
  - `completedBy`: Employee who completed the checklist
  - `verifiedBy`: Supervisor who verified the work

### 2. API Endpoints

#### Daily Checklist Management

**Create Daily Checklist**
```
POST /api/daily-checklists
```
- Creates new checklist for specific floor location and date
- Access: FACILITY_MANAGER, ADMIN, SUPER_ADMIN

**Get Daily Checklists**
```
GET /api/daily-checklists
```
- Retrieves checklists with filtering options
- Filters: date, status, department, floor location, hygiene section

**QR Code Scanning**
```
GET /api/daily-checklists/qr/:qrCode
```
- Mobile endpoint for QR code scanning
- Returns all checklists for scanned floor location
- Access: All authenticated users

**Complete Checklist Item**
```
PATCH /api/daily-checklists/:id/items/:itemIndex/complete
```
- Marks individual checklist item as completed
- Automatically updates overall checklist status
- Records completion timestamp and employee

**Verify Completed Checklist**
```
PATCH /api/daily-checklists/:id/verify
```
- Supervisor verification of completed work
- Only available for COMPLETED checklists
- Access: FACILITY_MANAGER, ADMIN, SUPER_ADMIN

**Dashboard Statistics**
```
GET /api/daily-checklists/stats
```
- Provides completion statistics for dashboard
- Breakdown by status and department

### 3. Workflow

#### Setup Phase (Facility Manager)
1. **Upload Hygiene Checklists**: Upload Excel files with task templates via `/api/hygiene-checklists`
2. **Create Floor Locations**: Set up floor locations with auto-generated QR codes
3. **Generate Daily Checklists**: Create daily checklists for each floor/department combination

#### Employee Workflow
1. **QR Code Scan**: Employee scans QR code at floor location
2. **View Tasks**: System displays all pending checklists for that location
3. **Complete Items**: Employee marks individual tasks as completed with optional notes
4. **Auto-Status Update**: System automatically updates checklist status as items are completed

#### Supervisor Workflow
1. **Monitor Progress**: View dashboard with real-time completion statistics
2. **Review Completed Work**: Access completed checklists with employee details
3. **Verify Quality**: Mark high-quality completed work as verified

## QR Code Format

QR codes are generated with the format: `FL_{facilityId}_{floorNumber}_{uniqueId}`

Example: `FL_64a7b8c9d1e2f3a4b5c6d7e8_1_A1B2C3D4`

## Status Flow

```
PENDING → IN_PROGRESS → COMPLETED
                      ↓
                   VERIFIED (optional)
```

- **PENDING**: No items completed
- **IN_PROGRESS**: Some items completed, not all
- **COMPLETED**: All items completed
- **VERIFIED**: Supervisor has verified the completed work

## Mobile App Integration

### QR Scanner Flow
1. Employee opens mobile app
2. Scans QR code using device camera
3. App calls `/api/daily-checklists/qr/:qrCode`
4. Displays available checklists for that location
5. Employee selects checklist and completes items
6. Each completion calls `/api/daily-checklists/:id/items/:itemIndex/complete`

### Offline Capability
- Checklists can be cached locally for offline completion
- Sync with server when connection is restored

## Dashboard Features

### For Facility Managers
- **Real-time Statistics**: Overall completion rates by department and date
- **Progress Tracking**: See which floors/areas need attention
- **Employee Performance**: Track completion rates by employee
- **Quality Metrics**: Monitor verification rates

### For Employees
- **My Tasks**: View assigned checklists
- **Completion History**: See previously completed work
- **QR Scanner**: Quick access to camera for scanning

## Security & Access Control

- **Authentication**: All endpoints require valid JWT token
- **Role-based Access**: Different permissions for managers vs employees
- **Facility Isolation**: Users only see data for their assigned facility
- **Audit Trail**: All completions tracked with timestamps and user IDs

## Data Relationships

```
FacilityDetails
    ↓
FloorLocation (has QR code)
    ↓
DailyChecklist
    ↓
ChecklistItems (individual tasks)
```

## Best Practices

### For Facility Managers
1. Create checklists daily or weekly in advance
2. Ensure QR codes are printed clearly and placed prominently
3. Regular monitoring of completion rates
4. Provide feedback through verification system

### For Employees
1. Scan QR codes only when physically at the location
2. Complete tasks thoroughly before marking as done
3. Add notes for any issues or additional work performed
4. Report damaged or missing QR codes to management

## Troubleshooting

### Common Issues
1. **QR Code Not Found**: Check if floor location is active and not deleted
2. **No Checklists Available**: Verify checklists have been created for the current date
3. **Cannot Complete Item**: Ensure user is authenticated and has proper permissions
4. **Verification Not Available**: Only completed checklists can be verified

### Error Codes
- **404**: QR code not found or checklist not available
- **400**: Invalid item index or checklist already completed
- **401**: Authentication required
- **403**: Insufficient permissions for operation