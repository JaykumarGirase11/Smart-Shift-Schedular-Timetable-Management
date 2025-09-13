"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const Timetable_1 = __importDefault(require("../models/Timetable"));
const Employee_1 = __importDefault(require("../models/Employee"));
const Shift_1 = __importDefault(require("../models/Shift"));
const XLSX = __importStar(require("xlsx"));
const date_fns_1 = require("date-fns");
const router = express_1.default.Router();
// Generate timetable based on inputs
router.post('/generate', async (req, res) => {
    try {
        const { month, year, projectName, employees, shiftAssignments, createdBy } = req.body;
        // Create date range for the month
        const startDate = (0, date_fns_1.startOfMonth)(new Date(year, month - 1));
        const endDate = (0, date_fns_1.endOfMonth)(new Date(year, month - 1));
        const daysInMonth = (0, date_fns_1.eachDayOfInterval)({ start: startDate, end: endDate });
        const entries = [];
        // Generate entries for each employee and each day
        for (const employee of employees) {
            for (const day of daysInMonth) {
                const dayOfWeek = (0, date_fns_1.getDay)(day);
                const dateKey = (0, date_fns_1.format)(day, 'yyyy-MM-dd');
                let entry = {
                    employeeId: employee.employeeId,
                    date: day,
                    shiftCode: 'OFF',
                    status: 'off'
                };
                // Check if it's weekend (Saturday = 6, Sunday = 0)
                const isWeekend = dayOfWeek === 0 || dayOfWeek === 6;
                // Check if employee has shift assignment for this date
                const assignment = shiftAssignments.find((a) => a.employeeId === employee.employeeId && a.date === dateKey);
                if (assignment) {
                    entry.shiftCode = assignment.shiftCode;
                    entry.status = assignment.status || 'scheduled';
                }
                else if (isWeekend) {
                    entry.status = 'off';
                }
                else if (employee.weekOff === dayOfWeek) {
                    entry.status = 'off';
                }
                entries.push(entry);
            }
        }
        // Save or update timetable
        const existingTimetable = await Timetable_1.default.findOne({ month, year, projectName });
        if (existingTimetable) {
            existingTimetable.entries = entries;
            await existingTimetable.save();
            res.json(existingTimetable);
        }
        else {
            const newTimetable = new Timetable_1.default({
                month,
                year,
                projectName,
                entries,
                createdBy
            });
            const savedTimetable = await newTimetable.save();
            res.json(savedTimetable);
        }
    }
    catch (error) {
        console.error('Error generating timetable:', error);
        res.status(500).json({ error: 'Failed to generate timetable' });
    }
});
// Get timetable by month/year/project
router.get('/:year/:month/:projectName', async (req, res) => {
    try {
        const { year, month, projectName } = req.params;
        const timetable = await Timetable_1.default.findOne({
            year: parseInt(year),
            month: parseInt(month),
            projectName
        });
        if (!timetable) {
            return res.status(404).json({ error: 'Timetable not found' });
        }
        res.json(timetable);
    }
    catch (error) {
        res.status(500).json({ error: 'Failed to fetch timetable' });
    }
});
// Export timetable to Excel
router.get('/export/:year/:month/:projectName', async (req, res) => {
    try {
        const { year, month, projectName } = req.params;
        const timetable = await Timetable_1.default.findOne({
            year: parseInt(year),
            month: parseInt(month),
            projectName
        });
        if (!timetable) {
            return res.status(404).json({ error: 'Timetable not found' });
        }
        // Get all employees and shifts for proper formatting
        const employees = await Employee_1.default.find({ isActive: true });
        const shifts = await Shift_1.default.find({ isActive: true });
        // Create Excel workbook
        const workbook = XLSX.utils.book_new();
        // Generate the timetable data in Excel format
        const startDate = (0, date_fns_1.startOfMonth)(new Date(parseInt(year), parseInt(month) - 1));
        const endDate = (0, date_fns_1.endOfMonth)(new Date(parseInt(year), parseInt(month) - 1));
        const daysInMonth = (0, date_fns_1.eachDayOfInterval)({ start: startDate, end: endDate });
        // Create header row with dates
        const headers = ['Employee', ...daysInMonth.map(day => (0, date_fns_1.format)(day, 'd-MMM'))];
        const worksheetData = [headers];
        // Add employee rows
        for (const employee of employees) {
            const row = [employee.name];
            for (const day of daysInMonth) {
                const entry = timetable.entries.find(e => e.employeeId === employee.employeeId &&
                    (0, date_fns_1.format)(new Date(e.date), 'yyyy-MM-dd') === (0, date_fns_1.format)(day, 'yyyy-MM-dd'));
                if (entry) {
                    if (entry.status === 'off') {
                        row.push('Off');
                    }
                    else if (entry.status === 'leave') {
                        row.push('Leave');
                    }
                    else if (entry.status === 'holiday') {
                        row.push('Holiday');
                    }
                    else {
                        const shift = shifts.find(s => s.code === entry.shiftCode);
                        row.push(shift ? shift.name : entry.shiftCode);
                    }
                }
                else {
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
    }
    catch (error) {
        console.error('Error exporting timetable:', error);
        res.status(500).json({ error: 'Failed to export timetable' });
    }
});
// Update timetable entry
router.put('/entry/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const { employeeId, date, shiftCode, status } = req.body;
        const timetable = await Timetable_1.default.findById(id);
        if (!timetable) {
            return res.status(404).json({ error: 'Timetable not found' });
        }
        const entryIndex = timetable.entries.findIndex(e => e.employeeId === employeeId &&
            (0, date_fns_1.format)(new Date(e.date), 'yyyy-MM-dd') === (0, date_fns_1.format)(new Date(date), 'yyyy-MM-dd'));
        if (entryIndex !== -1) {
            timetable.entries[entryIndex].shiftCode = shiftCode;
            timetable.entries[entryIndex].status = status;
        }
        else {
            timetable.entries.push({ employeeId, date: new Date(date), shiftCode, status });
        }
        await timetable.save();
        res.json(timetable);
    }
    catch (error) {
        res.status(500).json({ error: 'Failed to update timetable entry' });
    }
});
exports.default = router;
//# sourceMappingURL=timetableRoutes.js.map