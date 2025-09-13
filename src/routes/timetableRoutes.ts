import express from 'express';
import Timetable from '../models/Timetable';
import Employee from '../models/Employee';
import Shift from '../models/Shift';
import * as XLSX from 'xlsx';
import { startOfMonth, endOfMonth, eachDayOfInterval, format, getDay } from 'date-fns';

const router = express.Router();

// Generate timetable based on inputs
router.post('/generate', async (req, res) => {
  try {
    const { month, year, projectName, employees, shiftAssignments, createdBy } = req.body;

    // Create date range for the month
    const startDate = startOfMonth(new Date(year, month - 1));
    const endDate = endOfMonth(new Date(year, month - 1));
    const daysInMonth = eachDayOfInterval({ start: startDate, end: endDate });

    const entries: any[] = [];

    // Generate entries for each employee and each day
    for (const employee of employees) {
      for (const day of daysInMonth) {
        const dayOfWeek = getDay(day);
        const dateKey = format(day, 'yyyy-MM-dd');
        
        let entry = {
          employeeId: employee.employeeId,
          date: day,
          shiftCode: 'OFF',
          status: 'off' as const
        };

        // Check if it's weekend (Saturday = 6, Sunday = 0)
        const isWeekend = dayOfWeek === 0 || dayOfWeek === 6;
        
        // Check if employee has shift assignment for this date
        const assignment = shiftAssignments.find((a: any) => 
          a.employeeId === employee.employeeId && a.date === dateKey
        );

        if (assignment) {
          entry.shiftCode = assignment.shiftCode;
          entry.status = assignment.status || 'scheduled';
        } else if (isWeekend) {
          entry.status = 'off';
        } else if (employee.weekOff === dayOfWeek) {
          entry.status = 'off';
        }

        entries.push(entry);
      }
    }

    // Save or update timetable
    const existingTimetable = await Timetable.findOne({ month, year, projectName });
    
    if (existingTimetable) {
      existingTimetable.entries = entries as any;
      await existingTimetable.save();
      res.json(existingTimetable);
    } else {
      const newTimetable = new Timetable({
        month,
        year,
        projectName,
        entries,
        createdBy
      });
      const savedTimetable = await newTimetable.save();
      res.json(savedTimetable);
    }
  } catch (error) {
    console.error('Error generating timetable:', error);
    res.status(500).json({ error: 'Failed to generate timetable' });
  }
});

// Get timetable by month/year/project
router.get('/:year/:month/:projectName', async (req, res) => {
  try {
    const { year, month, projectName } = req.params;
    const timetable = await Timetable.findOne({ 
      year: parseInt(year), 
      month: parseInt(month), 
      projectName 
    });
    
    if (!timetable) {
      return res.status(404).json({ error: 'Timetable not found' });
    }
    
    res.json(timetable);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch timetable' });
  }
});

// Export timetable to Excel
router.get('/export/:year/:month/:projectName', async (req, res) => {
  try {
    const { year, month, projectName } = req.params;
    const timetable = await Timetable.findOne({ 
      year: parseInt(year), 
      month: parseInt(month), 
      projectName 
    });
    
    if (!timetable) {
      return res.status(404).json({ error: 'Timetable not found' });
    }

    // Get all employees and shifts for proper formatting
    const employees = await Employee.find({ isActive: true });
    const shifts = await Shift.find({ isActive: true });

    // Create Excel workbook
    const workbook = XLSX.utils.book_new();
    
    // Generate the timetable data in Excel format
    const startDate = startOfMonth(new Date(parseInt(year), parseInt(month) - 1));
    const endDate = endOfMonth(new Date(parseInt(year), parseInt(month) - 1));
    const daysInMonth = eachDayOfInterval({ start: startDate, end: endDate });

    // Create header row with dates
    const headers = ['Employee', ...daysInMonth.map(day => format(day, 'd-MMM'))];
    const worksheetData = [headers];

    // Add employee rows
    for (const employee of employees) {
      const row = [employee.name];
      
      for (const day of daysInMonth) {
        const entry = timetable.entries.find(e => 
          e.employeeId === employee.employeeId && 
          format(new Date(e.date), 'yyyy-MM-dd') === format(day, 'yyyy-MM-dd')
        );
        
        if (entry) {
          if (entry.status === 'off') {
            row.push('Off');
          } else if (entry.status === 'leave') {
            row.push('Leave');
          } else if (entry.status === 'holiday') {
            row.push('Holiday');
          } else {
            const shift = shifts.find(s => s.code === entry.shiftCode);
            row.push(shift ? shift.name : entry.shiftCode);
          }
        } else {
          row.push('Off');
        }
      }
      
      worksheetData.push(row);
    }

    const worksheet = XLSX.utils.aoa_to_sheet(worksheetData);
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Timetable');

    // Generate buffer
    const buffer = XLSX.write(workbook, { type: 'buffer', bookType: 'xlsx' });

    res.setHeader('Content-Disposition', `attachment; filename="${projectName}_${month}_${year}.xlsx"`);
    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.send(buffer);

  } catch (error) {
    console.error('Error exporting timetable:', error);
    res.status(500).json({ error: 'Failed to export timetable' });
  }
});

// Update timetable entry
router.put('/entry/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { employeeId, date, shiftCode, status } = req.body;
    
    const timetable = await Timetable.findById(id);
    if (!timetable) {
      return res.status(404).json({ error: 'Timetable not found' });
    }

    const entryIndex = timetable.entries.findIndex(e => 
      e.employeeId === employeeId && 
      format(new Date(e.date), 'yyyy-MM-dd') === format(new Date(date), 'yyyy-MM-dd')
    );

    if (entryIndex !== -1) {
      (timetable.entries[entryIndex] as any).shiftCode = shiftCode;
      (timetable.entries[entryIndex] as any).status = status;
    } else {
      (timetable.entries as any).push({ employeeId, date: new Date(date), shiftCode, status });
    }

    await timetable.save();
    res.json(timetable);
  } catch (error) {
    res.status(500).json({ error: 'Failed to update timetable entry' });
  }
});

export default router;