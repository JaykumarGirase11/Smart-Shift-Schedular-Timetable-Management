# Smart Shift Scheduler - User Guide

This guide provides detailed information on how to use the Smart Shift Scheduler application effectively.

## Table of Contents

1. [Dashboard Overview](#dashboard-overview)
2. [Managing Employees](#managing-employees)
3. [Shift Management](#shift-management)
4. [Leave & Week-Off Management](#leave--week-off-management)
5. [Manual Shift Assignment](#manual-shift-assignment)
6. [Excel Export](#excel-export)
7. [Dark/Light Mode](#darklight-mode)
8. [Tips & Best Practices](#tips--best-practices)

## Dashboard Overview

The main dashboard provides an Excel-like interface displaying employees and their shifts for the current month.

### Key Elements:

- **Top Navigation Bar**: Contains month navigation, action buttons, and theme toggle
- **Shift Grid**: Main table showing employees and their daily shifts
- **Employee Summary**: Shows statistics for each employee (bottom left)
- **Monthly Summary**: Overall statistics for the current month (bottom right)

### Navigation:

- Use the left/right arrows to navigate between months
- The current month and year are displayed in the center

## Managing Employees

### Adding a New Employee:

1. Click the "Add Employee" button in the top menu
2. Fill in the required information:
   - **Name**: Employee's full name
   - **Position**: Job title or role
   - **Week Off Pattern**: Select recurring days off (Sat-Sun, Mon-Tue, or Thu-Fri)
   - **Working Hours per Day**: Standard shift duration
3. Click "Add Employee" to save

### Removing an Employee:

1. Click on the employee's name in the shift grid
2. Confirm deletion in the popup dialog
3. All associated shift data for the employee will be removed

## Shift Management

### Available Shifts:

- **IST Shift**: 03:00PM-12:00AM (Green)
- **US Shift**: 11:30AM-08:30PM (Pink)
- **AU Shift**: 03:30AM-11:30AM (Blue)
- **IST Shift Lead**: 03:00PM-12:00AM (Dark Green)
- **AU Shift Lead**: 03:30AM-11:30AM (Dark Blue)
- **AU Patching**: 03:30AM-11:30AM (Orange)
- **US Patching**: 11:30AM-08:30PM (Light Orange)
- **KT-AU Patching**: 03:30AM-11:30AM (Brown)
- **Leave**: Marked in Red
- **Week Off**: Marked in Purple
- **Off**: Marked in Gray

### Manual Cell Editing:

1. Click on any cell in the grid
2. Enter the shift code from the prompt:
   - IST, US, AU, IST-L, AU-L, AU-P, US-P, KT-AU, L, WO, or OFF
3. Leave empty to clear the cell

### Auto-Holiday Feature:

- When you assign an AU shift, the system automatically adds an OFF day for the following day
- This is to account for late-night shifts requiring rest the next day

## Leave & Week-Off Management

### Adding Leave:

1. Click the "Leave Request" button
2. Select the employee
3. Choose start and end dates
4. Click "Add Leave"

### Adding Week-Off:

1. Click the "Week Off" button
2. Select the employee
3. Choose start and end dates
4. Click "Add Week Off"

## Manual Shift Assignment

For assigning shifts to multiple days at once:

1. Click the "Manual Assign" button
2. Select the employee
3. Choose the shift type
4. Set date range (start and end dates)
5. Select distribution type:
   - **Auto**: Fill all days except weekends/conflicts
   - **Manual**: Choose specific days to assign
6. Review the assignment preview
7. Click "Apply Shifts"

### Pattern Detection:

After manually assigning at least 3 shifts, the system will offer to auto-distribute shifts for the rest of the month based on the detected pattern.

## Excel Export

1. Click the "Export Excel" button
2. Preview the data to be exported
3. Configure export options:
   - Format (Excel or CSV)
   - Include all or selected employees
   - Color coding options
   - Summary statistics
4. Click "Export"

## Dark/Light Mode

Toggle between dark and light themes by clicking the sun/moon icon in the top navigation bar.

## Tips & Best Practices

1. **Start with Manual Entry**: Begin by manually filling in shifts for the first few weeks to help the system learn patterns
2. **Consistent Patterns**: Try to maintain consistent shift rotation patterns for better auto-generation
3. **Review Auto-Generated Shifts**: Always review automatically generated shifts before finalizing
4. **Export Regularly**: Export schedules to Excel regularly for backup and sharing
5. **Mark Leaves in Advance**: Add known leaves and time-offs in advance to avoid scheduling conflicts