import React, { useState, useEffect } from 'react';
import { Sun, Moon, ChevronLeft, ChevronRight, UserPlus, Edit3, FileText, CalendarDays, Timer, Trash2 } from 'lucide-react';
import * as XLSX from 'xlsx-js-style';
import './App.css';

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
  startTime?: string;
  endTime?: string;
  time: string;     // Required for shifts
  category: string; // Required for shift types (morning/night/off)
}

interface ScheduleEntry {
  employeeId: number;
  day?: number;
  shiftId?: number | null;
  isLeave?: boolean;
  isWeekOff?: boolean;
  // Required properties for the application
  id?: string;
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

const App: React.FC = () => {
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [currentDate, setCurrentDate] = useState(new Date());
  const [allScheduleEntries, setAllScheduleEntries] = useState<ScheduleEntry[]>([]); // Store ALL data

  // Modal states
  const [showEmployeeModal, setShowEmployeeModal] = useState(false);
  const [showLeaveModal, setShowLeaveModal] = useState(false);
  const [showWeekOffModal, setShowWeekOffModal] = useState(false);
  const [showManualShiftModal, setShowManualShiftModal] = useState(false);
  const [showExcelModal, setShowExcelModal] = useState(false);

  // Form states
  const [selectedEmployee, setSelectedEmployee] = useState<Employee | null>(null);
  const [leaveStartDate, setLeaveStartDate] = useState('');
  const [leaveEndDate, setLeaveEndDate] = useState('');
  const [weekOffStartDate, setWeekOffStartDate] = useState('');
  const [weekOffEndDate, setWeekOffEndDate] = useState('');

  // New employee form
  const [newEmployee, setNewEmployee] = useState({
    name: '',
    position: '',
    weekOffPattern: 'sat-sun' as const,
    workingHours: 8
  });

  // Manual shift assignment form
  const [manualShiftAssignment, setManualShiftAssignment] = useState({
    employeeId: 0,
    selectedShift: '',
    startDate: '',
    endDate: '',
    distributionType: 'auto' as 'auto' | 'manual',
    totalDays: 0,
    specificDays: [] as number[]
  });

  // Updated shifts with new names and colors
  const shifts: Shift[] = [
    { name: 'IST Shift', code: 'IST', time: '03:00PM-12:00AM', color: '#4CAF50', category: 'morning' },
    { name: 'US Shift', code: 'US', time: '11:30AM-08:30PM', color: '#E91E63', category: 'morning' },
    { name: 'AU Shift', code: 'AU', time: '03:30AM-11:30AM', color: '#2196F3', category: 'night' },
    { name: 'IST Shift Lead', code: 'IST-L', time: '03:00PM-12:00AM', color: '#2E7D32', category: 'morning' },
    { name: 'AU Shift Lead', code: 'AU-L', time: '03:30AM-11:30AM', color: '#1565C0', category: 'night' },
    { name: 'AU Patching', code: 'AU-P', time: '03:30AM-11:30AM', color: '#FF5722', category: 'night' },
    { name: 'US Patching', code: 'US-P', time: '11:30AM-08:30PM', color: '#FF6B35', category: 'morning' },
    { name: 'KT-AU Patching', code: 'KT-AU', time: '03:30AM-11:30AM', color: '#795548', category: 'night' },
    { name: 'Leave', code: 'L', time: '---', color: '#dc3545', category: 'off' },
    { name: 'Week Off', code: 'WO', time: '---', color: '#9C27B0', category: 'off' },
    { name: 'Off', code: 'OFF', time: '---', color: '#607D8B', category: 'off' }
  ];

  // Initialize with demo employees
  useEffect(() => {
    const demoEmployees: Employee[] = [
      { id: 1, name: 'Sagar Girase', position: 'Lead Developer', status: 'active', joinDate: '2023-01-15', weekOffPattern: 'sat-sun', workingHours: 8 },
      { id: 2, name: 'Rahul Sharma', position: 'Developer', status: 'active', joinDate: '2023-02-20', weekOffPattern: 'sat-sun', workingHours: 8 },
      { id: 3, name: 'Priya Patel', position: 'Senior Developer', status: 'active', joinDate: '2023-03-10', weekOffPattern: 'mon-tue', workingHours: 8 },
      { id: 4, name: 'Amit Kumar', position: 'Developer', status: 'active', joinDate: '2023-04-05', weekOffPattern: 'thu-fri', workingHours: 8 }
    ];

    setEmployees(demoEmployees);
    setAllScheduleEntries([]);
  }, []);

  // Get current month's schedule entries
  const getCurrentMonthEntries = () => {
    const currentMonth = currentDate.getMonth() + 1;
    const currentYear = currentDate.getFullYear();
    return allScheduleEntries.filter(entry =>
      entry.month === `${currentMonth}/${currentYear}`
    );
  };

  // Generate monthly calendar
  const generateMonthlyCalendar = () => {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    const daysInMonth = new Date(year, month + 1, 0).getDate();

    return Array.from({ length: daysInMonth }, (_, i) => {
      const day = i + 1;
      const date = new Date(year, month, day);
      return {
        day,
        dayName: date.toLocaleDateString('en-US', { weekday: 'short' }),
        date: `${day}/${month + 1}/${year}`
      };
    });
  };

  // Calculate total counts for current month
  const calculateTotalCounts = () => {
    const currentEntries = getCurrentMonthEntries();
    const totalEntries = currentEntries.length;
    const workingDays = currentEntries.filter(e => !['L', 'WO', 'OFF'].includes(e.shift)).length;
    const leaves = currentEntries.filter(e => e.shift === 'L').length;
    const weekOffs = currentEntries.filter(e => e.shift === 'WO').length;
    const auShifts = currentEntries.filter(e => e.shift === 'AU').length;
    const istShifts = currentEntries.filter(e => e.shift === 'IST').length;

    return {
      totalEntries,
      workingDays,
      leaves,
      weekOffs,
      auShifts,
      istShifts
    };
  };

  // Auto-assign holiday after AU shift
  const autoAssignHolidayAfterAU = (employeeId: number, auDate: string) => {
    const employee = employees.find(emp => emp.id === employeeId);
    if (!employee) return;

    // Parse the date and get next day
    const [day, month, year] = auDate.split('/').map(Number);
    const nextDay = new Date(year, month - 1, day + 1);

    // Check if next day is within the same month
    if (nextDay.getMonth() === month - 1) {
      const nextDateStr = `${nextDay.getDate()}/${month}/${year}`;
      const monthKey = `${month}/${year}`;

      // Check if next day already has an entry
      const existingEntry = allScheduleEntries.find(e =>
        e.employeeId === employeeId && e.date === nextDateStr && e.month === monthKey
      );

      if (!existingEntry) {
        const holidayEntry: ScheduleEntry = {
          id: `auto-holiday-${employeeId}-${nextDay.getDate()}-${Date.now()}`,
          employeeId,
          employeeName: employee.name,
          date: nextDateStr,
          month: monthKey,
          year: year,
          shift: 'OFF',
          shiftName: 'Off',
          shiftColor: '#6c757d',
          hours: 0,
          isAutoAssigned: true
        };

        setAllScheduleEntries(prev => [...prev, holidayEntry]);
      }
    }
  };

  // DELETE EMPLOYEE FUNCTION
  const deleteEmployee = (employeeId: number) => {
    const employee = employees.find(emp => emp.id === employeeId);
    if (!employee) return;

    if (window.confirm(`Delete ${employee.name}? This will remove all their schedule entries.`)) {
      setEmployees(prev => prev.filter(emp => emp.id !== employeeId));
      setAllScheduleEntries(prev => prev.filter(entry => entry.employeeId !== employeeId));
      alert(`${employee.name} deleted successfully.`);
    }
  };

  // ANALYZE SHIFT PATTERNS from user-filled data
  const analyzeShiftPatterns = () => {
    const patterns: { [employeeId: number]: any } = {};

    employees.forEach(employee => {
      const employeeEntries = getCurrentMonthEntries().filter(e => e.employeeId === employee.id);
      const workingEntries = employeeEntries.filter(e => !['L', 'WO', 'OFF'].includes(e.shift));

      if (workingEntries.length > 0) {
        workingEntries.sort((a, b) => {
          const dateA = new Date(a.date.split('/').reverse().join('/'));
          const dateB = new Date(b.date.split('/').reverse().join('/'));
          return dateA.getTime() - dateB.getTime();
        });

        // Analyze consecutive shift patterns
        let currentShift = '';
        let consecutiveDays = 0;
        const shiftRotations: string[] = [];

        workingEntries.forEach(entry => {
          if (entry.shift === currentShift) {
            consecutiveDays++;
          } else {
            if (currentShift && consecutiveDays > 0) {
              shiftRotations.push(`${currentShift}:${consecutiveDays}`);
            }
            currentShift = entry.shift;
            consecutiveDays = 1;
          }
        });

        if (currentShift && consecutiveDays > 0) {
          shiftRotations.push(`${currentShift}:${consecutiveDays}`);
        }

        patterns[employee.id] = {
          lastShift: workingEntries[workingEntries.length - 1]?.shift || '',
          shiftRotations,
          averageDaysPerShift: Math.round(workingEntries.length / (shiftRotations.length || 1)),
          totalWorkingDays: workingEntries.length
        };
      }
    });

    return patterns;
  };

  // SMART MONTH NAVIGATION with pattern continuation
  const handleMonthChange = (direction: 'prev' | 'next') => {
    if (direction === 'next') {
      const currentEntries = getCurrentMonthEntries();
      const hasCurrentMonthData = currentEntries.length > 0;

      if (hasCurrentMonthData) {
        // GENERATE NEXT MONTH based on patterns
        const patterns = analyzeShiftPatterns();
        const nextMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1);
        const daysInNextMonth = new Date(nextMonth.getFullYear(), nextMonth.getMonth() + 1, 0).getDate();
        const nextMonthKey = `${nextMonth.getMonth() + 1}/${nextMonth.getFullYear()}`;

        const newEntries: ScheduleEntry[] = [];

        employees.forEach(employee => {
          const pattern = patterns[employee.id];
          if (!pattern) return;

          let currentShift = pattern.lastShift;
          let daysSinceLastShift = 0;

          // Check if in middle of rotation
          const lastRotation = pattern.shiftRotations[pattern.shiftRotations.length - 1];
          if (lastRotation) {
            const [shiftCode, daysStr] = lastRotation.split(':');
            const daysCompleted = parseInt(daysStr);

            if (daysCompleted < 5) {
              // Continue same shift
              currentShift = shiftCode;
              daysSinceLastShift = daysCompleted;
            } else {
              // Switch to opposite shift type
              const shift = shifts.find(s => s.code === shiftCode);
              if (shift?.category === 'morning') {
                currentShift = shifts.find(s => s.category === 'night')?.code || currentShift;
              } else if (shift?.category === 'night') {
                currentShift = shifts.find(s => s.category === 'morning')?.code || currentShift;
              }
              daysSinceLastShift = 0;
            }
          }

          // Generate next month schedule
          for (let day = 1; day <= daysInNextMonth; day++) {
            const date = new Date(nextMonth.getFullYear(), nextMonth.getMonth(), day);
            const dayOfWeek = date.getDay();
            const dateStr = `${day}/${nextMonth.getMonth() + 1}/${nextMonth.getFullYear()}`;

            // Check week-off pattern
            let isWeekOff = false;
            switch (employee.weekOffPattern) {
              case 'sat-sun': isWeekOff = dayOfWeek === 0 || dayOfWeek === 6; break;
              case 'mon-tue': isWeekOff = dayOfWeek === 1 || dayOfWeek === 2; break;
              case 'thu-fri': isWeekOff = dayOfWeek === 4 || dayOfWeek === 5; break;
            }

            if (isWeekOff) {
              newEntries.push({
                id: `auto-weekoff-${employee.id}-${day}`,
                employeeId: employee.id,
                employeeName: employee.name,
                date: dateStr,
                month: nextMonthKey,
                year: nextMonth.getFullYear(),
                shift: 'WO',
                shiftName: 'Week Off',
                shiftColor: '#9C27B0',
                hours: 0,
                isAutoAssigned: true
              });
            } else {
              const shift = shifts.find(s => s.code === currentShift);
              if (shift && shift.category !== 'off') {
                newEntries.push({
                  id: `auto-continue-${employee.id}-${day}`,
                  employeeId: employee.id,
                  employeeName: employee.name,
                  date: dateStr,
                  month: nextMonthKey,
                  year: nextMonth.getFullYear(),
                  shift: currentShift,
                  shiftName: shift.name,
                  shiftColor: shift.color,
                  hours: employee.workingHours || 8,
                  isAutoAssigned: true
                });

                daysSinceLastShift++;

                // Rotate shift after 5-6 days
                if (daysSinceLastShift >= (pattern.averageDaysPerShift || 5)) {
                  const currentShiftObj = shifts.find(s => s.code === currentShift);
                  if (currentShiftObj?.category === 'morning') {
                    currentShift = shifts.find(s => s.category === 'night')?.code || currentShift;
                  } else if (currentShiftObj?.category === 'night') {
                    currentShift = shifts.find(s => s.category === 'morning')?.code || currentShift;
                  }
                  daysSinceLastShift = 0;
                }
              }
            }
          }
        });

        setCurrentDate(nextMonth);
        setAllScheduleEntries(prev => [...prev, ...newEntries]);
        alert('Next month generated based on patterns!');
      } else {
        // Just navigate without generating
        setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1));
      }
    } else {
      // Previous month - just navigate, data persists
      setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1));
    }
  };

  // ADD NEW EMPLOYEE
  const addEmployee = () => {
    if (!newEmployee.name.trim()) {
      alert('Please enter employee name');
      return;
    }

    const employee: Employee = {
      id: Math.max(...employees.map(e => e.id), 0) + 1,
      name: newEmployee.name,
      position: newEmployee.position,
      status: 'active',
      joinDate: new Date().toISOString().split('T')[0],
      weekOffPattern: newEmployee.weekOffPattern,
      workingHours: newEmployee.workingHours
    };

    setEmployees(prev => [...prev, employee]);
    setNewEmployee({ name: '', position: '', weekOffPattern: 'sat-sun', workingHours: 8 });
    setShowEmployeeModal(false);
    alert('Employee added successfully!');
  };

  // MANUAL CELL EDITING
  const handleCellClick = (employeeId: number, date: string) => {
    const employee = employees.find(emp => emp.id === employeeId);
    if (!employee) return;

    const shiftCode = prompt('Enter shift code:\nIST (IST Shift)\nUS (US Shift)\nAU (AU Shift)\nIST-L (IST Shift Lead)\nAU-L (AU Shift Lead)\nAU-P (AU Patching)\nUS-P (US Patching)\nKT-AU (KT-AU Patching)\nL (Leave)\nWO (Week Off)\nOFF (Off)\n\nOr leave empty to clear:');

    if (shiftCode === null) return; // Cancelled

    const currentMonth = currentDate.getMonth() + 1;
    const currentYear = currentDate.getFullYear();
    const monthKey = `${currentMonth}/${currentYear}`;

    if (shiftCode.trim() === '') {
      // Remove entry
      setAllScheduleEntries(prev => prev.filter(e => !(e.employeeId === employeeId && e.date === date && e.month === monthKey)));
      return;
    }

    const shift = shifts.find(s => s.code.toUpperCase() === shiftCode.toUpperCase());
    if (!shift) {
      alert('Invalid shift code. Available codes:\nIST, US, AU, IST-L, AU-L, AU-P, US-P, KT-AU, L, WO, OFF');
      return;
    }

    const newEntry: ScheduleEntry = {
      id: `manual-${employeeId}-${date}-${Date.now()}`,
      employeeId,
      employeeName: employee.name,
      date,
      month: monthKey,
      year: currentYear,
      shift: shift.code,
      shiftName: shift.name,
      shiftColor: shift.color,
      hours: employee.workingHours || 8,
      isAutoAssigned: false
    };

    setAllScheduleEntries(prev => [
      ...prev.filter(e => !(e.employeeId === employeeId && e.date === date && e.month === monthKey)),
      newEntry
    ]);

    // Auto-assign holiday after AU shift
    if (shift.code === 'AU') {
      autoAssignHolidayAfterAU(employeeId, date);
    }
  };

  // ADD LEAVE
  const addLeave = () => {
    if (!selectedEmployee || !leaveStartDate || !leaveEndDate) {
      alert('Please fill all fields');
      return;
    }

    const start = new Date(leaveStartDate);
    const end = new Date(leaveEndDate);
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    const monthKey = `${month + 1}/${year}`;

    const leaveEntries: ScheduleEntry[] = [];

    for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
      if (d.getFullYear() === year && d.getMonth() === month) {
        const day = d.getDate();
        const dateStr = `${day}/${month + 1}/${year}`;

        leaveEntries.push({
          id: `leave-${selectedEmployee.id}-${day}-${Date.now()}`,
          employeeId: selectedEmployee.id,
          employeeName: selectedEmployee.name,
          date: dateStr,
          month: monthKey,
          year: year,
          shift: 'L',
          shiftName: 'Leave',
          shiftColor: '#dc3545',
          hours: 0
        });
      }
    }

    setAllScheduleEntries(prev => [
      ...prev.filter(e => !leaveEntries.some(le => e.date === le.date && e.employeeId === le.employeeId && e.month === le.month)),
      ...leaveEntries
    ]);

    setSelectedEmployee(null);
    setLeaveStartDate('');
    setLeaveEndDate('');
    setShowLeaveModal(false);
    alert('Leave added successfully!');
  };

  // ADD WEEK OFF
  const addWeekOff = () => {
    if (!selectedEmployee || !weekOffStartDate || !weekOffEndDate) {
      alert('Please fill all fields');
      return;
    }

    const start = new Date(weekOffStartDate);
    const end = new Date(weekOffEndDate);
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    const monthKey = `${month + 1}/${year}`;

    const weekOffEntries: ScheduleEntry[] = [];

    for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
      if (d.getFullYear() === year && d.getMonth() === month) {
        const day = d.getDate();
        const dateStr = `${day}/${month + 1}/${year}`;

        weekOffEntries.push({
          id: `weekoff-${selectedEmployee.id}-${day}-${Date.now()}`,
          employeeId: selectedEmployee.id,
          employeeName: selectedEmployee.name,
          date: dateStr,
          month: monthKey,
          year: year,
          shift: 'WO',
          shiftName: 'Week Off',
          shiftColor: '#6f42c1',
          hours: 0
        });
      }
    }

    setAllScheduleEntries(prev => [
      ...prev.filter(e => !weekOffEntries.some(we => e.date === we.date && e.employeeId === we.employeeId && e.month === we.month)),
      ...weekOffEntries
    ]);

    setSelectedEmployee(null);
    setWeekOffStartDate('');
    setWeekOffEndDate('');
    setShowWeekOffModal(false);
    alert('Week off added successfully!');
  };

  // EXPORT TO EXCEL
  const exportToExcel = () => {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    const monthName = currentDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });

    const wb = XLSX.utils.book_new();
    const calendar = generateMonthlyCalendar();
    const headers = ['Employee Name', ...calendar.map(day => `${day.day}\n${day.dayName}`)];

    const data = [headers];
    const currentEntries = getCurrentMonthEntries();

    employees.forEach(employee => {
      const row = [employee.name];
      calendar.forEach(day => {
        const entry = currentEntries.find(e => e.employeeId === employee.id && e.date === day.date);
        row.push(entry?.shift || '');
      });
      data.push(row);
    });

    const ws = XLSX.utils.aoa_to_sheet(data);

    // Add styling
    const range = XLSX.utils.decode_range(ws['!ref'] || 'A1');
    for (let R = range.s.r; R <= range.e.r; ++R) {
      for (let C = range.s.c; C <= range.e.c; ++C) {
        const cell_address = XLSX.utils.encode_cell({ c: C, r: R });
        const cell = ws[cell_address];
        if (!cell) continue;

        if (R === 0) {
          cell.s = {
            fill: { fgColor: { rgb: "4CAF50" } },
            font: { color: { rgb: "FFFFFF" }, bold: true },
            alignment: { horizontal: "center", vertical: "center" }
          };
        } else if (C > 0) {
          const shiftCode = cell.v;
          const shift = shifts.find(s => s.code === shiftCode);
          if (shift) {
            cell.s = {
              fill: { fgColor: { rgb: shift.color.replace('#', '') } },
              font: { color: { rgb: "FFFFFF" }, bold: true },
              alignment: { horizontal: "center", vertical: "center" }
            };
          }
        }
      }
    }

    XLSX.utils.book_append_sheet(wb, ws, `${monthName} Schedule`);
    XLSX.writeFile(wb, `${monthName}_Shift_Schedule.xlsx`);
  };

  // AUTOMATIC SHIFT DISTRIBUTION based on manual entries
  const autoDistributeShifts = (employeeId: number, currentEntries: ScheduleEntry[]) => {
    const employee = employees.find(emp => emp.id === employeeId);
    if (!employee) return;

    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    const monthKey = `${month + 1}/${year}`;
    const daysInMonth = new Date(year, month + 1, 0).getDate();

    // Get current employee entries for this month
    const employeeEntries = currentEntries.filter(e => e.employeeId === employeeId && e.month === monthKey);
    const workingEntries = employeeEntries.filter(e => !['L', 'WO', 'OFF'].includes(e.shift));

    if (workingEntries.length < 3) return; // Need at least 3 entries to detect pattern

    // Sort entries by date
    workingEntries.sort((a, b) => {
      const dateA = new Date(a.date.split('/').reverse().join('/'));
      const dateB = new Date(b.date.split('/').reverse().join('/'));
      return dateA.getTime() - dateB.getTime();
    });

    // Detect shift pattern and auto-fill remaining days
    let currentShift = workingEntries[workingEntries.length - 1].shift;
    let consecutiveDays = 1;

    // Count consecutive days of current shift
    for (let i = workingEntries.length - 2; i >= 0; i--) {
      if (workingEntries[i].shift === currentShift) {
        consecutiveDays++;
      } else {
        break;
      }
    }

    // Determine next shift based on pattern
    const shouldSwitchShift = consecutiveDays >= 5;
    let nextShift = currentShift;

    if (shouldSwitchShift) {
      const currentShiftObj = shifts.find(s => s.code === currentShift);
      if (currentShiftObj?.category === 'morning') {
        nextShift = shifts.find(s => s.category === 'night')?.code || currentShift;
      } else if (currentShiftObj?.category === 'night') {
        nextShift = shifts.find(s => s.category === 'morning')?.code || currentShift;
      }
    }

    // Auto-fill remaining empty days
    const newEntries: ScheduleEntry[] = [];
    const lastEntryDate = new Date(workingEntries[workingEntries.length - 1].date.split('/').reverse().join('/'));

    for (let day = lastEntryDate.getDate() + 1; day <= daysInMonth; day++) {
      const date = new Date(year, month, day);
      const dayOfWeek = date.getDay();
      const dateStr = `${day}/${month + 1}/${year}`;

      // Check if day already has entry
      const existingEntry = currentEntries.find(e => e.employeeId === employeeId && e.date === dateStr && e.month === monthKey);
      if (existingEntry) continue;

      // Check week-off pattern
      let isWeekOff = false;
      switch (employee.weekOffPattern) {
        case 'sat-sun': isWeekOff = dayOfWeek === 0 || dayOfWeek === 6; break;
        case 'mon-tue': isWeekOff = dayOfWeek === 1 || dayOfWeek === 2; break;
        case 'thu-fri': isWeekOff = dayOfWeek === 4 || dayOfWeek === 5; break;
      }

      if (isWeekOff) {
        newEntries.push({
          id: `auto-weekoff-${employeeId}-${day}-${Date.now()}`,
          employeeId: employeeId,
          employeeName: employee.name,
          date: dateStr,
          month: monthKey,
          year: year,
          shift: 'WO',
          shiftName: 'Week Off',
          shiftColor: '#6f42c1',
          hours: 0,
          isAutoAssigned: true
        });
      } else {
        const shift = shifts.find(s => s.code === nextShift);
        if (shift && shift.category !== 'off') {
          newEntries.push({
            id: `auto-distribute-${employeeId}-${day}-${Date.now()}`,
            employeeId: employeeId,
            employeeName: employee.name,
            date: dateStr,
            month: monthKey,
            year: year,
            shift: nextShift,
            shiftName: shift.name,
            shiftColor: shift.color,
            hours: employee.workingHours || 8,
            isAutoAssigned: true
          });

          consecutiveDays++;

          // Switch shift after 5 days
          if (consecutiveDays >= 5) {
            const currentShiftObj = shifts.find(s => s.code === nextShift);
            if (currentShiftObj?.category === 'morning') {
              nextShift = shifts.find(s => s.category === 'night')?.code || nextShift;
            } else if (currentShiftObj?.category === 'night') {
              nextShift = shifts.find(s => s.category === 'morning')?.code || nextShift;
            }
            consecutiveDays = 0;
          }
        }
      }
    }

    if (newEntries.length > 0) {
      setAllScheduleEntries(prev => [...prev, ...newEntries]);
      alert(`Auto-distributed ${newEntries.length} shifts for ${employee.name} based on detected pattern!`);
    }
  };

  // Manual Shift Assignment Function
  const applyManualShiftAssignment = () => {
    if (!manualShiftAssignment.employeeId || !manualShiftAssignment.selectedShift || 
        !manualShiftAssignment.startDate || !manualShiftAssignment.endDate) {
      alert('Please fill all required fields');
      return;
    }
    
    const employee = employees.find(emp => emp.id === manualShiftAssignment.employeeId);
    if (!employee) {
      alert('Employee not found');
      return;
    }
    
    const shift = shifts.find(s => s.code === manualShiftAssignment.selectedShift);
    if (!shift) {
      alert('Shift not found');
      return;
    }
    
    const startDate = new Date(manualShiftAssignment.startDate);
    const endDate = new Date(manualShiftAssignment.endDate);
    const currentMonth = currentDate.getMonth();
    const currentYear = currentDate.getFullYear();
    const monthKey = `${currentMonth + 1}/${currentYear}`;
    
    // Check if dates are within current month
    if (startDate.getMonth() !== currentMonth || endDate.getMonth() !== currentMonth || 
        startDate.getFullYear() !== currentYear || endDate.getFullYear() !== currentYear) {
      alert('Dates must be within the current month');
      return;
    }
    
    // Create entries
    const newEntries: ScheduleEntry[] = [];
    const existingEntries: ScheduleEntry[] = [];
    
    // Loop through date range
    for (let d = new Date(startDate); d <= endDate; d.setDate(d.getDate() + 1)) {
      const day = d.getDate();
      const dateStr = `${day}/${currentMonth + 1}/${currentYear}`;
      
      // Skip if distribution type is manual and day is not selected
      if (manualShiftAssignment.distributionType === 'manual' && 
          !manualShiftAssignment.specificDays.includes(day)) {
        continue;
      }
      
      // Check for week off days
      const dayOfWeek = d.getDay();
      let isWeekOff = false;
      
      switch (employee.weekOffPattern) {
        case 'sat-sun': isWeekOff = (dayOfWeek === 0 || dayOfWeek === 6); break;
        case 'mon-tue': isWeekOff = (dayOfWeek === 1 || dayOfWeek === 2); break;
        case 'thu-fri': isWeekOff = (dayOfWeek === 4 || dayOfWeek === 5); break;
      }
      
      // Skip weekends if auto distribution unless explicitly including weekends
      if (isWeekOff && manualShiftAssignment.distributionType === 'auto') {
        continue;
      }
      
      // Check if there's an existing entry
      const existingEntry = allScheduleEntries.find(e => 
        e.employeeId === employee.id && e.date === dateStr && e.month === monthKey);
        
      if (existingEntry) {
        existingEntries.push(existingEntry);
      }
      
      // Create new entry
      newEntries.push({
        id: `manual-assign-${employee.id}-${day}-${Date.now()}`,
        employeeId: employee.id,
        employeeName: employee.name,
        date: dateStr,
        month: monthKey,
        year: currentYear,
        shift: shift.code,
        shiftName: shift.name,
        shiftColor: shift.color,
        hours: employee.workingHours,
        isAutoAssigned: false
      });
    }
    
    // Confirm replacement of existing entries if any
    if (existingEntries.length > 0) {
      if (!window.confirm(`This will replace ${existingEntries.length} existing entries. Continue?`)) {
        return;
      }
    }
    
    // Update schedule entries
    setAllScheduleEntries(prev => [
      ...prev.filter(e => !newEntries.some(ne => 
        ne.employeeId === e.employeeId && ne.date === e.date && e.month === ne.month)),
      ...newEntries
    ]);
    
    // Special handling for AU shift - add holiday next day
    if (shift.code === 'AU') {
      newEntries.forEach(entry => {
        const dateStr = entry.date;
        autoAssignHolidayAfterAU(employee.id, dateStr);
      });
    }
    
    // Reset form and close modal
    setManualShiftAssignment({
      employeeId: 0,
      selectedShift: '',
      startDate: '',
      endDate: '',
      distributionType: 'auto',
      totalDays: 0,
      specificDays: []
    });
    
    setShowManualShiftModal(false);
    alert(`${newEntries.length} shifts assigned successfully!`);
    
    // Auto distribute based on detected pattern
    if (newEntries.length >= 3) {
      setTimeout(() => {
        if (window.confirm('Would you like to auto-distribute shifts for the rest of the month based on this pattern?')) {
          autoDistributeShifts(employee.id, [...allScheduleEntries, ...newEntries]);
        }
      }, 500);
    }
  };

  const calendar = generateMonthlyCalendar();
  const monthName = currentDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
  const currentEntries = getCurrentMonthEntries();
  const totalCounts = calculateTotalCounts();

  // Regular scheduler view
  return (
    <div className={`shift-scheduler-app ${isDarkMode ? 'dark' : ''}`} style={{ height: '100vh', overflow: 'hidden' }}>
      {/* Header with user info */}
      <header className="main-header">
        <div className="welcome-section">
          <h1>Welcome to Smart Shift Scheduler Dashboard</h1>
        </div>

        <div className="header-controls">
          <div className="month-navigation">
            <button onClick={() => handleMonthChange('prev')}>
              <ChevronLeft className="icon" />
            </button>
            <h2>{monthName}</h2>
            <button onClick={() => handleMonthChange('next')}>
              <ChevronRight className="icon" />
            </button>
          </div>

          <div className="action-buttons">
            <button onClick={() => setShowEmployeeModal(true)} className="btn-employee">
              <UserPlus className="icon" />
              Add Employee
            </button>
            <button onClick={() => setShowManualShiftModal(true)} className="btn-manual">
              <Edit3 className="icon" />
              Manual Assign
            </button>
            <button onClick={() => setShowExcelModal(true)} className="btn-excel-edit">
              <FileText className="icon" />
              Export Excel
            </button>
            <button onClick={() => setShowLeaveModal(true)} className="btn-leave">
              <CalendarDays className="icon" />
              Leave Request
            </button>
            <button onClick={() => setShowWeekOffModal(true)} className="btn-weekoff">
              <Timer className="icon" />
              Week Off
            </button>
            <button onClick={() => setIsDarkMode(!isDarkMode)} className="btn-theme">
              {isDarkMode ? <Sun className="icon" /> : <Moon className="icon" />}
            </button>
          </div>
        </div>
      </header>

      <main className="main-content" style={{
        height: 'calc(100vh - 120px)',
        display: 'flex',
        flexDirection: 'column',
        position: 'relative'
      }}>
        {/* Excel-like Shift Table - NORMAL SIZE NOW */}
        <div className="shift-table-container" style={{
          flex: 1,
          overflow: 'auto',
          marginBottom: '20px',
          width: '100%',
          position: 'relative'
        }}>
          <div className="shift-table" style={{
            width: '100%',
            display: 'grid',
            gridTemplateRows: 'auto auto',
            fontSize: '14px' // Increased font size
          }}>
            <div className="table-header" style={{
              display: 'grid',
              gridTemplateColumns: `180px repeat(${calendar.length}, minmax(50px, 1fr))`, // Increased column width
              gap: '1px',
              backgroundColor: '#f5f5f5',
              padding: '5px',
              position: 'sticky',
              top: 0,
              zIndex: 10
            }}>
              <div className="employee-header" style={{
                padding: '12px', // Increased padding
                backgroundColor: '#4CAF50',
                color: 'white',
                fontWeight: 'bold',
                textAlign: 'center',
                fontSize: '14px' // Increased font size
              }}>
                Employee
                <small style={{ display: 'block', fontSize: '11px' }}>Click name to delete</small>
              </div>
              {calendar.map(day => (
                <div key={day.day} className="day-header" style={{
                  padding: '10px 5px', // Increased padding
                  backgroundColor: '#4CAF50',
                  color: 'white',
                  textAlign: 'center',
                  fontSize: '12px' // Increased font size
                }}>
                  <div className="day-number" style={{ fontWeight: 'bold' }}>{day.day}</div>
                  <div className="day-name" style={{ fontSize: '10px' }}>{day.dayName}</div>
                </div>
              ))}
            </div>

            <div className="table-body" style={{
              display: 'grid',
              gridTemplateColumns: `180px repeat(${calendar.length}, minmax(50px, 1fr))`, // Increased column width
              gap: '1px',
              padding: '5px',
              overflow: 'visible'
            }}>
              {employees.map(employee => (
                <React.Fragment key={employee.id}>
                  <div className="employee-cell" style={{
                    padding: '10px', // Increased padding
                    backgroundColor: '#f8f9fa',
                    border: '1px solid #dee2e6',
                    cursor: 'pointer',
                    fontSize: '14px' // Increased font size
                  }}>
                    <div className="employee-name" onClick={() => deleteEmployee(employee.id)} style={{
                      fontWeight: 'bold',
                      fontSize: '14px', // Increased font size
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between'
                    }}>
                      {employee.name}
                      <Trash2 className="delete-icon" style={{ width: '16px', height: '16px' }} />
                    </div>
                    <div className="employee-pattern" style={{ fontSize: '12px', color: '#666' }}>{employee.weekOffPattern}</div>
                  </div>

                  {calendar.map(day => {
                    const entry = currentEntries.find(e =>
                      e.employeeId === employee.id && e.date === day.date
                    );
                    const shift = entry ? shifts.find(s => s.code === entry.shift) : null;

                    return (
                      <div
                        key={day.day}
                        className={`shift-cell ${shift ? 'has-shift' : 'empty'} editable`}
                        style={{
                          padding: '6px', // Increased padding
                          border: '1px solid #dee2e6',
                          textAlign: 'center',
                          cursor: 'pointer',
                          fontSize: '12px', // Increased font size
                          height: '40px', // Increased height
                          maxHeight: '40px',
                          display: 'flex',
                          flexDirection: 'column',
                          justifyContent: 'center',
                          backgroundColor: shift ? shift.color + '30' : '#fff',
                          borderColor: shift ? shift.color : '#dee2e6',
                          color: shift ? shift.color : '#666'
                        }}
                        onClick={() => handleCellClick(employee.id, day.date)}
                      >
                        {shift && entry ? (
                          <div className="shift-content">
                            <div className="shift-code" style={{ fontWeight: 'bold', fontSize: '12px' }}>
                              {shift.code === 'WO' ? 'WO' : shift.code}
                            </div>
                            {shift.category !== 'off' && (
                              <div className="shift-hours" style={{ fontSize: '10px' }}>{entry.hours}h</div>
                            )}
                          </div>
                        ) : (
                          <div className="empty-cell" style={{ fontSize: '10px', color: '#ccc' }}>Click</div>
                        )}
                      </div>
                    );
                  })}
                </React.Fragment>
              ))}
            </div>
          </div>
        </div>
      </main>

      {/* Employee Summary Table - BOTTOM OF PAGE - INCREASED SIZE WITH BETTER DARK MODE CONTRAST */}
      <div className="employee-summary-footer" style={{
        position: 'fixed',
        bottom: '10px',
        left: '10px',
        width: '300px', // Increased from 200px
        backgroundColor: isDarkMode ? '#1a202c' : '#ffffff', 
        border: isDarkMode ? '2px solid #90cdf4' : '2px solid #2196F3',
        borderRadius: '8px',
        padding: '15px', // Increased padding
        boxShadow: isDarkMode ? '0 4px 12px rgba(0,0,0,0.3)' : '0 4px 12px rgba(0,0,0,0.1)',
        fontSize: '12px', 
        color: isDarkMode ? '#f7fafc' : '#333333', // Lighter text in dark mode for better visibility
        zIndex: 1000,
        maxHeight: '250px', 
        overflowY: 'auto'
      }}>
        <div style={{
          textAlign: 'center',
          marginBottom: '12px',
          paddingBottom: '10px',
          borderBottom: isDarkMode ? '1px solid #90cdf4' : '1px solid #2196F3'
        }}>
          <h4 style={{ 
            margin: '0', 
            color: isDarkMode ? '#90cdf4' : '#2196F3', 
            fontWeight: 'bold', 
            fontSize: '14px',
            textShadow: isDarkMode ? '0px 0px 3px rgba(144, 205, 244, 0.5)' : 'none' // Add text shadow for better visibility
          }}>👥 Employee Summary</h4>
        </div>

        {/* Compact Vertical Table - INCREASED SIZE WITH BETTER CONTRAST */}
        <div className="summary-table-compact">
          {employees.map((employee, index) => {
            const empEntries = currentEntries.filter(e => e.employeeId === employee.id);
            const leaves = empEntries.filter(e => e.shift === 'L').length;
            const weekOffs = empEntries.filter(e => e.shift === 'WO').length;
            const working = empEntries.filter(e => !['L', 'WO', 'OFF'].includes(e.shift)).length;

            return (
              <div key={employee.id} style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                padding: '8px 10px',
                backgroundColor: isDarkMode ? '#2d3748' : '#f8f9fa',
                borderRadius: '4px',
                border: isDarkMode ? '1px solid #4a5568' : '1px solid #e0e0e0',
                marginBottom: '6px'
              }}>
                <div style={{
                  fontWeight: 'bold',
                  fontSize: '13px', // Increased from 12px
                  color: isDarkMode ? '#ffffff' : '#333333', 
                  flex: 1,
                  textAlign: 'left',
                  textShadow: isDarkMode ? '0px 0px 2px rgba(255,255,255,0.2)' : 'none' // Text shadow for better readability
                }}>{employee.name.split(' ')[0]}</div>
                <div style={{
                  display: 'flex',
                  gap: '8px',
                  fontSize: '12px' // Increased from 11px
                }}>
                  <span style={{ 
                    color: isDarkMode ? '#68D391' : '#4CAF50', 
                    fontWeight: 'bold',
                    textShadow: isDarkMode ? '0px 0px 2px rgba(104, 211, 145, 0.5)' : 'none' 
                  }}>W:{working}</span>
                  <span style={{ 
                    color: isDarkMode ? '#FC8181' : '#dc3545', 
                    fontWeight: 'bold',
                    textShadow: isDarkMode ? '0px 0px 2px rgba(252, 129, 129, 0.5)' : 'none'
                  }}>L:{leaves}</span>
                  <span style={{ 
                    color: isDarkMode ? '#D6BCFA' : '#9C27B0', 
                    fontWeight: 'bold',
                    textShadow: isDarkMode ? '0px 0px 2px rgba(214, 188, 250, 0.5)' : 'none'
                  }}>WO:{weekOffs}</span>
                </div>
              </div>
            );
          })}
        </div>

        {/* Total Summary - IMPROVED VISIBILITY WITH BETTER CONTRAST */}
        <div style={{
          marginTop: '12px',
          padding: '10px',
          backgroundColor: isDarkMode ? '#2d3748' : '#e8f5e8',
          borderRadius: '4px',
          border: isDarkMode ? '1px solid #68D391' : '1px solid #4CAF50',
          textAlign: 'center'
        }}>
          <div style={{
            fontWeight: 'bold',
            fontSize: '13px', // Increased from 12px
            color: isDarkMode ? '#68D391' : '#4CAF50',
            marginBottom: '5px',
            textShadow: isDarkMode ? '0px 0px 3px rgba(104, 211, 145, 0.5)' : 'none'
          }}>TOTAL SUMMARY</div>
          <div style={{
            fontSize: '12px', // Increased from 11px
            display: 'grid',
            gridTemplateColumns: '1fr 1fr',
            gap: '6px'
          }}>
            <span style={{ 
              color: isDarkMode ? '#f7fafc' : '#333333',
              fontWeight: isDarkMode ? 'bold' : 'normal'  // Make bold in dark mode for better visibility
            }}>Emp: {employees.length}</span>
            <span style={{ 
              color: isDarkMode ? '#68D391' : '#4CAF50',
              textShadow: isDarkMode ? '0px 0px 2px rgba(104, 211, 145, 0.3)' : 'none'
            }}>Work: {totalCounts.workingDays}</span>
            <span style={{ 
              color: isDarkMode ? '#FC8181' : '#dc3545',
              textShadow: isDarkMode ? '0px 0px 2px rgba(252, 129, 129, 0.3)' : 'none'
            }}>Leave: {totalCounts.leaves}</span>
            <span style={{ 
              color: isDarkMode ? '#D6BCFA' : '#9C27B0',
              textShadow: isDarkMode ? '0px 0px 2px rgba(214, 188, 250, 0.3)' : 'none'
            }}>WO: {totalCounts.weekOffs}</span>
          </div>
        </div>
      </div>

      {/* Monthly Summary Box */}
      <div style={{
        position: 'fixed',
        bottom: '65px',
        right: '20px',
        backgroundColor: isDarkMode ? '#2d3748' : '#ffffff',
        border: '2px solid #4CAF50',
        borderRadius: '8px',
        padding: '12px',
        boxShadow: '0 4px 12px rgba(0,0,0,0.2)',
        minWidth: '250px',
        fontSize: '11px',
        color: isDarkMode ? '#ffffff' : '#333333',
        zIndex: 1000
      }}>
        <h4 style={{ margin: '0 0 10px 0', color: '#4CAF50', fontWeight: 'bold' }}>📊 Monthly Summary</h4>
        <div style={{
          display: 'grid',
          gridTemplateColumns: '1fr 1fr',
          gap: '8px',
          width: '100%'
        }}>
          <div style={{ color: isDarkMode ? '#ffffff' : '#333333' }}><strong>Total Entries:</strong> {totalCounts.totalEntries}</div>
          <div style={{ color: isDarkMode ? '#ffffff' : '#333333' }}><strong>Working Days:</strong> {totalCounts.workingDays}</div>
          <div style={{ color: isDarkMode ? '#ffffff' : '#333333' }}><strong>AU Shifts:</strong> {totalCounts.auShifts}</div>
          <div style={{ color: isDarkMode ? '#ffffff' : '#333333' }}><strong>IST Shifts:</strong> {totalCounts.istShifts}</div>
          <div style={{ color: isDarkMode ? '#ffffff' : '#333333' }}><strong>Leaves:</strong> {totalCounts.leaves}</div>
          <div style={{ color: isDarkMode ? '#ffffff' : '#333333' }}><strong>Week Offs:</strong> {totalCounts.weekOffs}</div>
        </div>
      </div>

      {/* Welcome Message */}
      {currentEntries.length === 0 && (
        <div className="empty-state" style={{
          position: 'fixed',
          bottom: '200px',
          left: '50%',
          transform: 'translateX(-50%)',
          textAlign: 'center',
          backgroundColor: isDarkMode ? '#2d3748' : '#fff',
          padding: '20px',
          borderRadius: '12px',
          boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
          border: '2px dashed #4CAF50',
          maxWidth: '600px',
          zIndex: 100
        }}>
          <h3 style={{ color: '#4CAF50' }}>📅 Start by filling your first month manually</h3>
          <p>Click on any cell in the table above to assign shifts. The system will learn from your patterns and automatically generate subsequent months!</p>
          <div className="shift-legend-quick" style={{ marginTop: '15px', fontSize: '14px' }}>
            <strong>Available Shifts:</strong> IST Shift, US Shift, AU Shift, IST Shift Lead, AU Shift Lead, AU Patching, US Patching, KT-AU Patching, L (Leave), WO (Week Off), OFF (Holiday)
            <br />
            <em style={{ fontSize: '12px', color: '#666' }}>Note: AU shift automatically adds holiday next day</em>
          </div>
        </div>
      )}

      {/* Modals */}
      {showEmployeeModal && (
        <div className="modal-overlay" onClick={() => setShowEmployeeModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Add New Employee</h2>
              <button onClick={() => setShowEmployeeModal(false)}>×</button>
            </div>
            <div className="modal-body">
              <div className="form-group">
                <label>Name</label>
                <input
                  type="text"
                  value={newEmployee.name}
                  onChange={(e) => setNewEmployee(prev => ({ ...prev, name: e.target.value }))}
                  placeholder="Enter employee name"
                />
              </div>
              <div className="form-group">
                <label>Position</label>
                <input
                  type="text"
                  value={newEmployee.position}
                  onChange={(e) => setNewEmployee(prev => ({ ...prev, position: e.target.value }))}
                  placeholder="Enter position"
                />
              </div>
              <div className="form-group">
                <label>Week Off Pattern</label>
                <select
                  value={newEmployee.weekOffPattern}
                  onChange={(e) => setNewEmployee(prev => ({ ...prev, weekOffPattern: e.target.value as any }))}
                >
                  <option value="sat-sun">Saturday-Sunday</option>
                  <option value="mon-tue">Monday-Tuesday</option>
                  <option value="thu-fri">Thursday-Friday</option>
                </select>
              </div>
              <div className="form-group">
                <label>Working Hours per Day</label>
                <input
                  type="number"
                  value={newEmployee.workingHours}
                  onChange={(e) => setNewEmployee(prev => ({ ...prev, workingHours: parseInt(e.target.value) }))}
                  min="6"
                  max="12"
                />
              </div>
            </div>
            <div className="modal-actions">
              <button className="btn-cancel" onClick={() => setShowEmployeeModal(false)}>Cancel</button>
              <button className="btn-submit" onClick={addEmployee}>Add Employee</button>
            </div>
          </div>
        </div>
      )}

      {showLeaveModal && (
        <div className="modal-overlay" onClick={() => setShowLeaveModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Add Leave</h2>
              <button onClick={() => setShowLeaveModal(false)}>×</button>
            </div>
            <div className="modal-body">
              <div className="form-group">
                <label>Select Employee</label>
                <select
                  value={selectedEmployee?.id || ''}
                  onChange={(e) => {
                    const emp = employees.find(emp => emp.id === parseInt(e.target.value));
                    setSelectedEmployee(emp || null);
                  }}
                >
                  <option value="">Select an employee</option>
                  {employees.map(emp => (
                    <option key={emp.id} value={emp.id}>{emp.name}</option>
                  ))}
                </select>
              </div>
              <div className="form-group">
                <label>Start Date</label>
                <input
                  type="date"
                  value={leaveStartDate}
                  onChange={(e) => setLeaveStartDate(e.target.value)}
                />
              </div>
              <div className="form-group">
                <label>End Date</label>
                <input
                  type="date"
                  value={leaveEndDate}
                  onChange={(e) => setLeaveEndDate(e.target.value)}
                />
              </div>
            </div>
            <div className="modal-actions">
              <button className="btn-cancel" onClick={() => setShowLeaveModal(false)}>Cancel</button>
              <button className="btn-submit" onClick={addLeave}>Add Leave</button>
            </div>
          </div>
        </div>
      )}

      {showWeekOffModal && (
        <div className="modal-overlay" onClick={() => setShowWeekOffModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Add Week Off</h2>
              <button onClick={() => setShowWeekOffModal(false)}>×</button>
            </div>
            <div className="modal-body">
              <div className="form-group">
                <label>Select Employee</label>
                <select
                  value={selectedEmployee?.id || ''}
                  onChange={(e) => {
                    const emp = employees.find(emp => emp.id === parseInt(e.target.value));
                    setSelectedEmployee(emp || null);
                  }}
                >
                  <option value="">Select an employee</option>
                  {employees.map(emp => (
                    <option key={emp.id} value={emp.id}>{emp.name}</option>
                  ))}
                </select>
              </div>
              <div className="form-group">
                <label>Start Date</label>
                <input
                  type="date"
                  value={weekOffStartDate}
                  onChange={(e) => setWeekOffStartDate(e.target.value)}
                />
              </div>
              <div className="form-group">
                <label>End Date</label>
                <input
                  type="date"
                  value={weekOffEndDate}
                  onChange={(e) => setWeekOffEndDate(e.target.value)}
                />
              </div>
            </div>
            <div className="modal-actions">
              <button className="btn-cancel" onClick={() => setShowWeekOffModal(false)}>Cancel</button>
              <button className="btn-submit" onClick={addWeekOff}>Add Week Off</button>
            </div>
          </div>
        </div>
      )}

      {/* Manual Shift Assignment Modal */}
      {showManualShiftModal && (
        <div className="modal-overlay" onClick={() => setShowManualShiftModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}
            style={{ maxWidth: '600px', width: '90%' }}>
            <div className="modal-header">
              <h2>Manual Shift Assignment</h2>
              <button onClick={() => setShowManualShiftModal(false)}>×</button>
            </div>
            <div className="modal-body">
              <div className="form-group">
                <label>Select Employee</label>
                <select
                  value={manualShiftAssignment.employeeId || ''}
                  onChange={(e) => setManualShiftAssignment(prev => ({ 
                    ...prev, 
                    employeeId: parseInt(e.target.value) 
                  }))}
                >
                  <option value="">Select an employee</option>
                  {employees.map(emp => (
                    <option key={emp.id} value={emp.id}>{emp.name}</option>
                  ))}
                </select>
              </div>
              
              <div className="form-group">
                <label>Select Shift</label>
                <select
                  value={manualShiftAssignment.selectedShift}
                  onChange={(e) => setManualShiftAssignment(prev => ({ 
                    ...prev, 
                    selectedShift: e.target.value 
                  }))}
                  style={{
                    backgroundColor: shifts.find(s => s.code === manualShiftAssignment.selectedShift)?.color + '30' || '#fff',
                    borderColor: shifts.find(s => s.code === manualShiftAssignment.selectedShift)?.color || '#ddd',
                    fontWeight: 'bold'
                  }}
                >
                  <option value="">Select a shift</option>
                  {shifts.map(shift => (
                    <option key={shift.code} value={shift.code}
                      style={{ fontWeight: 'bold' }}>
                      {shift.name} ({shift.code}) - {shift.time}
                    </option>
                  ))}
                </select>
              </div>
              
              <div style={{ display: 'flex', gap: '10px', marginBottom: '20px' }}>
                <div className="form-group" style={{ flex: 1 }}>
                  <label>Start Date</label>
                  <input
                    type="date"
                    value={manualShiftAssignment.startDate}
                    onChange={(e) => setManualShiftAssignment(prev => ({ 
                      ...prev, 
                      startDate: e.target.value 
                    }))}
                  />
                </div>
                
                <div className="form-group" style={{ flex: 1 }}>
                  <label>End Date</label>
                  <input
                    type="date"
                    value={manualShiftAssignment.endDate}
                    onChange={(e) => setManualShiftAssignment(prev => ({ 
                      ...prev, 
                      endDate: e.target.value 
                    }))}
                  />
                </div>
              </div>
              
              <div className="form-group">
                <label>Distribution Type</label>
                <select
                  value={manualShiftAssignment.distributionType}
                  onChange={(e) => setManualShiftAssignment(prev => ({ 
                    ...prev, 
                    distributionType: e.target.value as 'auto' | 'manual' 
                  }))}
                >
                  <option value="auto">Auto (Fill all days except weekends/conflicts)</option>
                  <option value="manual">Manual (Specify days to assign)</option>
                </select>
              </div>
              
              {manualShiftAssignment.distributionType === 'manual' && (
                <div className="form-group">
                  <label>Select Specific Days</label>
                  <div className="day-checkboxes" style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(7, 1fr)',
                    gap: '5px',
                    marginTop: '5px'
                  }}>
                    {calendar.map(day => (
                      <label key={day.day} style={{
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        fontSize: '12px',
                        padding: '5px',
                        border: '1px solid #ddd',
                        borderRadius: '4px'
                      }}>
                        <input
                          type="checkbox"
                          value={day.day}
                          checked={manualShiftAssignment.specificDays.includes(day.day)}
                          onChange={(e) => {
                            const day = parseInt(e.target.value);
                            setManualShiftAssignment(prev => ({
                              ...prev,
                              specificDays: e.target.checked
                                ? [...prev.specificDays, day]
                                : prev.specificDays.filter(d => d !== day)
                            }));
                          }}
                        />
                        <span>{day.day}</span>
                        <span style={{ fontSize: '10px' }}>{day.dayName}</span>
                      </label>
                    ))}
                  </div>
                </div>
              )}
              
              {/* Preview of assignment */}
              {manualShiftAssignment.employeeId > 0 && manualShiftAssignment.selectedShift && 
                manualShiftAssignment.startDate && manualShiftAssignment.endDate && (
                <div className="assignment-preview" style={{
                  marginTop: '20px',
                  padding: '10px',
                  backgroundColor: '#f8f9fa',
                  border: '1px solid #ddd',
                  borderRadius: '4px'
                }}>
                  <h4 style={{ margin: '0 0 10px 0' }}>Assignment Preview:</h4>
                  <p style={{ margin: '5px 0' }}>
                    <strong>Employee:</strong> {employees.find(e => e.id === manualShiftAssignment.employeeId)?.name}
                  </p>
                  <p style={{ margin: '5px 0' }}>
                    <strong>Shift:</strong> {shifts.find(s => s.code === manualShiftAssignment.selectedShift)?.name} 
                    ({shifts.find(s => s.code === manualShiftAssignment.selectedShift)?.time})
                  </p>
                  <p style={{ margin: '5px 0' }}>
                    <strong>Period:</strong> {new Date(manualShiftAssignment.startDate).toLocaleDateString()} to {new Date(manualShiftAssignment.endDate).toLocaleDateString()}
                  </p>
                  <p style={{ margin: '5px 0' }}>
                    <strong>Method:</strong> {manualShiftAssignment.distributionType === 'auto' ? 
                      'Automatic (all days in range)' : 
                      `Manual (${manualShiftAssignment.specificDays.length} selected days)`}
                  </p>
                </div>
              )}
            </div>
            <div className="modal-actions">
              <button className="btn-cancel" onClick={() => setShowManualShiftModal(false)}>Cancel</button>
              <button className="btn-submit assign-shifts" onClick={applyManualShiftAssignment} 
                disabled={!manualShiftAssignment.employeeId || 
                  !manualShiftAssignment.selectedShift || 
                  !manualShiftAssignment.startDate || 
                  !manualShiftAssignment.endDate ||
                  (manualShiftAssignment.distributionType === 'manual' && 
                    manualShiftAssignment.specificDays.length === 0)}>
                Apply Shifts
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Export to Excel Modal */}
      {showExcelModal && (
        <div className="modal-overlay" onClick={() => setShowExcelModal(false)}>
          <div className="modal-content excel-modal" onClick={(e) => e.stopPropagation()}
            style={{ maxWidth: '500px', width: '90%' }}>
            <div className="modal-header">
              <h2>Export Schedule</h2>
              <button onClick={() => setShowExcelModal(false)}>×</button>
            </div>
            <div className="modal-body">
              <div style={{ marginBottom: '20px' }}>
                <h3 style={{ marginTop: '0', fontSize: '18px' }}>Preview</h3>
                <div style={{
                  maxHeight: '300px',
                  overflowY: 'auto',
                  border: '1px solid #ddd',
                  borderRadius: '4px',
                  padding: '10px',
                  fontSize: '12px'
                }}>
                  <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                    <thead>
                      <tr style={{ backgroundColor: '#4CAF50', color: 'white' }}>
                        <th style={{ padding: '8px', textAlign: 'left', position: 'sticky', top: 0, backgroundColor: '#4CAF50' }}>Employee</th>
                        {calendar.slice(0, 7).map(day => (
                          <th key={day.day} style={{ padding: '8px', textAlign: 'center', position: 'sticky', top: 0, backgroundColor: '#4CAF50' }}>
                            {day.day}<br/>{day.dayName}
                          </th>
                        ))}
                        <th style={{ padding: '8px', textAlign: 'center', position: 'sticky', top: 0, backgroundColor: '#4CAF50' }}>...</th>
                      </tr>
                    </thead>
                    <tbody>
                      {employees.map(employee => {
                        const empEntries = currentEntries.filter(e => e.employeeId === employee.id);
                        return (
                          <tr key={employee.id} style={{ borderBottom: '1px solid #ddd' }}>
                            <td style={{ padding: '8px', fontWeight: 'bold' }}>{employee.name}</td>
                            {calendar.slice(0, 7).map(day => {
                              const entry = empEntries.find(e => e.date === day.date);
                              const shift = entry ? shifts.find(s => s.code === entry.shift) : null;
                              return (
                                <td key={day.day} style={{ 
                                  padding: '8px', 
                                  textAlign: 'center',
                                  backgroundColor: shift ? shift.color + '30' : '',
                                  color: shift ? shift.color : ''
                                }}>
                                  {entry?.shift || '-'}
                                </td>
                              );
                            })}
                            <td style={{ padding: '8px', textAlign: 'center' }}>...</td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
              
              <div style={{ marginBottom: '20px' }}>
                <h3 style={{ marginTop: '0', fontSize: '18px' }}>Export Options</h3>
                <div style={{ display: 'flex', gap: '10px', marginBottom: '10px' }}>
                  <div style={{ flex: 1 }}>
                    <label style={{
                      display: 'block',
                      marginBottom: '5px',
                      fontSize: '14px',
                      fontWeight: 'bold'
                    }}>Format</label>
                    <select style={{
                      width: '100%',
                      padding: '8px',
                      borderRadius: '4px',
                      border: '1px solid #ddd'
                    }}>
                      <option value="xlsx">Excel (.xlsx)</option>
                      <option value="csv">CSV (.csv)</option>
                    </select>
                  </div>
                  
                  <div style={{ flex: 1 }}>
                    <label style={{
                      display: 'block',
                      marginBottom: '5px',
                      fontSize: '14px',
                      fontWeight: 'bold'
                    }}>Include</label>
                    <select style={{
                      width: '100%',
                      padding: '8px',
                      borderRadius: '4px',
                      border: '1px solid #ddd'
                    }}>
                      <option value="all">All Employees</option>
                      <option value="selected">Selected Employees</option>
                    </select>
                  </div>
                </div>
                
                <label style={{ display: 'flex', alignItems: 'center', gap: '5px', marginBottom: '10px' }}>
                  <input type="checkbox" checked style={{ width: '16px', height: '16px' }} />
                  <span>Include color coding</span>
                </label>
                
                <label style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                  <input type="checkbox" checked style={{ width: '16px', height: '16px' }} />
                  <span>Include summary statistics</span>
                </label>
              </div>
            </div>
            <div className="modal-actions">
              <button className="btn-cancel" onClick={() => setShowExcelModal(false)}>Cancel</button>
              <button className="btn-submit" onClick={() => {
                exportToExcel();
                setShowExcelModal(false);
              }}>Export</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default App;
