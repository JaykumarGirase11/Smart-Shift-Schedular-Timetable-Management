# Smart Shift Scheduler - Feature Walkthrough

This document provides a comprehensive overview of all features in the Smart Shift Scheduler application with step-by-step instructions and visual examples.

## Table of Contents

1. [Dashboard Overview](#dashboard-overview)
2. [Employee Management](#employee-management)
3. [Shift Management](#shift-management)
4. [Smart Schedule Generation](#smart-schedule-generation)
5. [Leave & Week-Off Management](#leave--week-off-management)
6. [Excel Export & Reporting](#excel-export--reporting)
7. [Theme Customization](#theme-customization)

## Dashboard Overview

The Smart Shift Scheduler dashboard provides a comprehensive view of your team's schedule in an intuitive Excel-like interface.

![Dashboard Overview](https://via.placeholder.com/800x450?text=Dashboard+Overview)

### Key Dashboard Elements:

1. **Header Section**
   - Month navigation controls
   - Action buttons for common tasks
   - Theme toggle switch

2. **Main Shift Grid**
   - Employee names and information on the left
   - Days of the month across the top
   - Color-coded shift cells in the grid

3. **Employee Summary Box**
   - Condensed view of employee statistics
   - Quick counts of working days, leaves, and week offs
   - Positioned in the bottom left for easy reference

4. **Monthly Summary Box**
   - Overall statistics for the current month
   - Total shifts by type
   - Total leaves and week offs

### Navigation:

Use the left and right arrows in the top header to navigate between months. The current month/year is displayed prominently in the center.

## Employee Management

### Adding Employees

1. Click the "Add Employee" button in the header
2. Fill in the required fields:

![Add Employee Form](https://via.placeholder.com/600x400?text=Add+Employee+Form)

3. Select a week-off pattern that suits the employee's schedule:
   - **Saturday-Sunday**: Traditional weekend off
   - **Monday-Tuesday**: Alternative weekend
   - **Thursday-Friday**: Alternative weekend

4. Set standard working hours (typically 8 hours)

5. Click "Add Employee" to save

### Deleting Employees

To delete an employee and all their associated shift data:

1. Find the employee in the shift grid
2. Click on their name in the leftmost column
3. Confirm deletion in the popup dialog

![Delete Employee](https://via.placeholder.com/400x200?text=Delete+Employee+Confirmation)

## Shift Management

### Available Shift Types

Smart Shift Scheduler comes pre-configured with the following shift types:

| Shift Code | Shift Name | Time | Color |
|------------|------------|------|-------|
| IST | IST Shift | 03:00PM-12:00AM | Green |
| US | US Shift | 11:30AM-08:30PM | Pink |
| AU | AU Shift | 03:30AM-11:30AM | Blue |
| IST-L | IST Shift Lead | 03:00PM-12:00AM | Dark Green |
| AU-L | AU Shift Lead | 03:30AM-11:30AM | Dark Blue |
| AU-P | AU Patching | 03:30AM-11:30AM | Orange |
| US-P | US Patching | 11:30AM-08:30PM | Light Orange |
| KT-AU | KT-AU Patching | 03:30AM-11:30AM | Brown |
| L | Leave | --- | Red |
| WO | Week Off | --- | Purple |
| OFF | Off | --- | Gray |

### Manual Shift Assignment (Cell by Cell)

The simplest way to assign shifts is by clicking directly on a cell in the grid:

1. Click on the cell at the intersection of an employee and date
2. Enter the shift code when prompted (e.g., "IST", "AU", etc.)
3. The cell will update with the color-coded shift

![Manual Cell Edit](https://via.placeholder.com/400x250?text=Manual+Cell+Edit)

### Bulk Shift Assignment

For assigning multiple shifts efficiently:

1. Click the "Manual Assign" button in the header
2. Select an employee, shift type, and date range
3. Choose distribution type:
   - **Auto**: Assign to all days except weekly offs
   - **Manual**: Specifically select which days to assign

![Bulk Assignment](https://via.placeholder.com/600x400?text=Bulk+Assignment+Modal)

4. Review the assignment preview
5. Click "Apply Shifts"

## Smart Schedule Generation

One of the most powerful features of Smart Shift Scheduler is its ability to learn from your scheduling patterns and automatically generate future schedules.

### How Pattern Detection Works:

1. The system analyzes existing shift assignments for each employee
2. It identifies patterns such as:
   - Number of consecutive days on the same shift
   - Rotation between morning/night shifts
   - Regular cycles of shifts

### Generating a Future Month:

1. First, create a pattern by manually assigning shifts for at least one week
2. Navigate to the next month using the right arrow in the header
3. The system will offer to generate the schedule based on detected patterns

![Pattern Detection](https://via.placeholder.com/600x300?text=Pattern+Detection+Prompt)

4. Review the generated schedule and make any necessary adjustments

### Auto-Distribution Within Current Month:

If you've manually assigned at least 3 shifts for an employee, you can auto-distribute the remaining days:

1. Use the "Manual Assign" feature to assign a few initial shifts
2. After applying, the system will ask if you want to auto-distribute
3. Click "Yes" to fill in the remaining days based on the detected pattern

## Leave & Week-Off Management

### Adding Leave Requests

1. Click the "Leave Request" button in the header
2. Select the employee from the dropdown
3. Set the start and end dates for the leave period
4. Click "Add Leave"

![Leave Management](https://via.placeholder.com/500x300?text=Leave+Management)

All days within the selected range will be marked with "L" and colored red in the schedule grid.

### Managing Week Offs

While employees have their regular week-off pattern, you can also assign special week offs:

1. Click the "Week Off" button in the header
2. Select the employee from the dropdown
3. Set the start and end dates for the week off period
4. Click "Add Week Off"

All days within the selected range will be marked with "WO" and colored purple in the schedule grid.

### Auto-Holiday After AU Shift

The system automatically adds an "OFF" day following any "AU" shift assignment to account for required rest after late-night shifts.

![Auto Holiday](https://via.placeholder.com/400x200?text=Auto+Holiday+Feature)

## Excel Export & Reporting

### Exporting to Excel

1. Click the "Export Excel" button in the header
2. Preview the data that will be exported
3. Configure export options:
   - Format (Excel or CSV)
   - Include all or selected employees
   - Enable/disable color coding
   - Include/exclude summary statistics

![Excel Export](https://via.placeholder.com/600x400?text=Excel+Export+Preview)

4. Click "Export" to download the file

### Excel Output

The exported Excel file includes:

- Complete monthly schedule with employee names and shifts
- Color-coding matching the application's color scheme
- Day and date headers
- Summary statistics if selected

![Excel Output](https://via.placeholder.com/700x400?text=Excel+Output+Sample)

## Theme Customization

### Switching Between Light and Dark Mode

Toggle between light and dark themes by clicking the sun/moon icon in the top header.

#### Light Mode
![Light Mode](https://via.placeholder.com/600x300?text=Light+Mode)

#### Dark Mode
![Dark Mode](https://via.placeholder.com/600x300?text=Dark+Mode+with+Higher+Contrast)

### Dark Mode Benefits

- Reduced eye strain during night shifts
- Enhanced visibility in low-light environments
- Improved contrast for color-coded shifts

### Accessibility Considerations

The application is designed with accessibility in mind:
- High contrast colors in dark mode
- Text shadows for better readability
- Increased font sizes for better visibility
- Screen reader compatible elements