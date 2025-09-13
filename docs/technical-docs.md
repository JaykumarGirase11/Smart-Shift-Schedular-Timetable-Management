# Smart Shift Scheduler - Technical Documentation

This document provides technical details about the architecture, components, and code structure of the Smart Shift Scheduler application.

## Table of Contents

1. [Architecture Overview](#architecture-overview)
2. [Frontend Structure](#frontend-structure)
3. [Backend Structure](#backend-structure)
4. [Data Models](#data-models)
5. [Key Algorithms](#key-algorithms)
6. [API Reference](#api-reference)
7. [State Management](#state-management)
8. [Performance Considerations](#performance-considerations)

## Architecture Overview

Smart Shift Scheduler follows a client-server architecture with a React frontend and Node.js/Express backend:

```
┌─────────────┐      HTTP/JSON      ┌─────────────┐
│             │  ◄──────────────►   │             │
│   Frontend  │                     │   Backend   │
│   (React)   │                     │  (Express)  │
│             │                     │             │
└─────────────┘                     └──────┬──────┘
                                           │
                                           ▼
                                    ┌─────────────┐
                                    │             │
                                    │  Database   │
                                    │  (MongoDB)  │
                                    │             │
                                    └─────────────┘
```

The application can run in two modes:
- **Demo Mode**: No backend/database required, all data stored in browser
- **Full Mode**: Complete setup with backend and database persistence

## Frontend Structure

### Key Files and Directories

- **src/App.tsx**: Main application component
- **src/components/**: Reusable UI components
- **src/interfaces/**: TypeScript type definitions

### Core Components

1. **App.tsx**:
   - Main component handling state and UI rendering
   - Manages shift data and user interactions
   - Implements core business logic

2. **Components**:
   - **TimetableDisplay**: Renders the shift calendar grid
   - **EmployeeManagement**: Handles employee CRUD operations
   - **ShiftManagement**: Manages shift types and assignments

### Key Interfaces

```typescript
interface Employee {
  id: number;
  name: string;
  position: string;
  weekOffPattern: 'sat-sun' | 'mon-tue' | 'thu-fri';
  workingHours: number;
  status?: string;
  joinDate?: string;
}

interface Shift {
  id?: number;
  code: string;
  name: string;
  color: string;
  time: string;
  category: string;  // 'morning', 'night', or 'off'
}

interface ScheduleEntry {
  employeeId: number;
  employeeName: string;
  date: string;
  month: string;
  year: number;
  shift: string;
  shiftName: string;
  shiftColor: string;
  hours: number;
  isAutoAssigned?: boolean;
}
```

## Backend Structure

### API Server

The backend is built with Express.js and offers RESTful endpoints for:
- User authentication
- Employee management
- Shift management
- Schedule management

### Routes Structure

```
/api
  /auth           # Authentication endpoints
  /employees      # Employee CRUD operations
  /shifts         # Shift type management
  /timetables     # Schedule management
```

## Data Models

### MongoDB Schemas

#### Employee Schema

```javascript
{
  name: String,
  position: String,
  weekOffPattern: String,
  workingHours: Number,
  status: String,
  joinDate: Date
}
```

#### Shift Schema

```javascript
{
  code: String,
  name: String,
  color: String,
  time: String,
  category: String
}
```

#### Timetable Schema

```javascript
{
  employeeId: ObjectId,
  date: Date,
  month: String,
  year: Number,
  shift: String,
  hours: Number,
  isAutoAssigned: Boolean
}
```

## Key Algorithms

### Pattern Detection Algorithm

The application uses a shift pattern detection algorithm to analyze existing shift assignments and predict future patterns:

1. Sort existing shift entries chronologically
2. Identify consecutive days with the same shift type
3. Calculate average days per shift type
4. Determine if the pattern alternates between shift categories (morning/night)
5. Use the detected pattern to generate future shift assignments

### Auto-Distribution Logic

```typescript
// Pseudocode for shift auto-distribution
function autoDistributeShifts(employeeId, existingEntries) {
  // Get employee's week-off pattern
  const employee = getEmployeeById(employeeId);
  const weekOffPattern = employee.weekOffPattern;
  
  // Analyze existing patterns
  const pattern = analyzeShiftPatterns(existingEntries, employeeId);
  
  // Get last used shift type
  let currentShift = pattern.lastShift;
  let consecutiveDays = pattern.currentConsecutiveDays;
  
  // For each remaining day in month
  for each day in remainingDaysInMonth {
    // Skip if weekend or already has an entry
    if (isWeekOff(day, weekOffPattern) || hasExistingEntry(day)) continue;
    
    // Assign the current shift
    assignShift(day, currentShift);
    
    // Update counter and check for rotation
    consecutiveDays++;
    if (consecutiveDays >= pattern.averageDaysPerShift) {
      // Switch shift category (morning -> night or night -> morning)
      currentShift = switchShiftCategory(currentShift);
      consecutiveDays = 0;
    }
  }
}
```

## API Reference

### Authentication API

- `POST /api/auth/login`: Authenticate user
- `POST /api/auth/register`: Register new user

### Employee API

- `GET /api/employees`: Get all employees
- `POST /api/employees`: Create new employee
- `GET /api/employees/:id`: Get employee by ID
- `PUT /api/employees/:id`: Update employee
- `DELETE /api/employees/:id`: Delete employee

### Shift API

- `GET /api/shifts`: Get all shift types
- `POST /api/shifts`: Create new shift type

### Timetable API

- `GET /api/timetables`: Get schedule entries (filterable by month/year)
- `POST /api/timetables`: Create schedule entry
- `PUT /api/timetables/:id`: Update schedule entry
- `DELETE /api/timetables/:id`: Delete schedule entry
- `POST /api/timetables/auto-generate`: Auto-generate schedule based on patterns

## State Management

The application uses React's useState and useEffect hooks for state management:

- `employees`: Array of employee objects
- `allScheduleEntries`: Array of all schedule entries
- `currentDate`: Date object for the selected month/year
- Various UI state variables for modals and selections

## Performance Considerations

1. **Memoization**: Critical rendering components should be wrapped with React.memo to prevent unnecessary re-renders

2. **Batch Updates**: Schedule entries are updated in batches to minimize render cycles

3. **Lazy Loading**: Future implementation could use React.lazy for code-splitting

4. **Pagination**: For large datasets, API endpoints support pagination parameters

5. **Indexing**: MongoDB collections have indexes on frequently queried fields:
   - Employee.name
   - ScheduleEntry.employeeId
   - ScheduleEntry.month + ScheduleEntry.year