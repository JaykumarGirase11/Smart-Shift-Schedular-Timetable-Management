import React, { useState, useEffect } from 'react';
import axios from 'axios';

interface Employee {
  _id?: string;
  name: string;
  employeeId: string;
  email: string;
  skills?: string[];
  availability?: {
    monday: boolean;
    tuesday: boolean;
    wednesday: boolean;
    thursday: boolean;
    friday: boolean;
    saturday: boolean;
    sunday: boolean;
  };
}

interface Shift {
  _id?: string;
  code: string;
  name: string;
  startTime: string;
  endTime: string;
  color?: string;
  requiredStaff?: number;
  isActive?: boolean;
}

interface TimetableEntry {
  employeeId: string;
  employeeName: string;
  shiftCode: string;
  date: string;
  status: 'scheduled' | 'confirmed' | 'completed' | 'absent';
}

const TimetableGenerator: React.FC = () => {
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [shifts, setShifts] = useState<Shift[]>([]);
  const [loading, setLoading] = useState(false);
  const [generating, setGenerating] = useState(false);
  
  const [formData, setFormData] = useState({
    projectName: '',
    month: '',
    year: new Date().getFullYear(),
    selectedEmployees: [] as string[],
    selectedShifts: [] as string[],
    workDaysPerWeek: 5,
    maxConsecutiveDays: 6,
  });

  const [generatedTimetable, setGeneratedTimetable] = useState<TimetableEntry[]>([]);

  useEffect(() => {
    fetchEmployees();
    fetchShifts();
  }, []);

  const fetchEmployees = async () => {
    try {
      const response = await axios.get('http://localhost:5000/api/employees');
      setEmployees(response.data);
    } catch (error) {
      console.error('Error fetching employees:', error);
    }
  };

  const fetchShifts = async () => {
    try {
      const response = await axios.get('http://localhost:5000/api/shifts');
      setShifts(response.data.filter((shift: Shift) => shift.isActive));
    } catch (error) {
      console.error('Error fetching shifts:', error);
    }
  };

  const handleEmployeeSelection = (employeeId: string) => {
    setFormData(prev => ({
      ...prev,
      selectedEmployees: prev.selectedEmployees.includes(employeeId)
        ? prev.selectedEmployees.filter(id => id !== employeeId)
        : [...prev.selectedEmployees, employeeId]
    }));
  };

  const handleShiftSelection = (shiftCode: string) => {
    setFormData(prev => ({
      ...prev,
      selectedShifts: prev.selectedShifts.includes(shiftCode)
        ? prev.selectedShifts.filter(code => code !== shiftCode)
        : [...prev.selectedShifts, shiftCode]
    }));
  };

  const generateTimetable = async () => {
    if (!formData.projectName || !formData.month || formData.selectedEmployees.length === 0 || formData.selectedShifts.length === 0) {
      alert('Please fill in all required fields and select at least one employee and shift.');
      return;
    }

    setGenerating(true);
    try {
      // Generate timetable logic
      const monthNames = [
        'January', 'February', 'March', 'April', 'May', 'June',
        'July', 'August', 'September', 'October', 'November', 'December'
      ];
      
      const monthIndex = monthNames.indexOf(formData.month);
      const daysInMonth = new Date(formData.year, monthIndex + 1, 0).getDate();
      
      const selectedEmployeeData = employees.filter(emp => formData.selectedEmployees.includes(emp._id!));
      const selectedShiftData = shifts.filter(shift => formData.selectedShifts.includes(shift.code));
      
      const entries: TimetableEntry[] = [];
      
      // Simple round-robin assignment
      for (let day = 1; day <= daysInMonth; day++) {
        const date = new Date(formData.year, monthIndex, day);
        const dayOfWeek = date.getDay(); // 0 = Sunday, 1 = Monday, etc.
        
        // Skip weekends if workDaysPerWeek is 5
        if (formData.workDaysPerWeek === 5 && (dayOfWeek === 0 || dayOfWeek === 6)) {
          continue;
        }
        
        selectedShiftData.forEach((shift, shiftIndex) => {
          const employeeIndex = (day + shiftIndex) % selectedEmployeeData.length;
          const employee = selectedEmployeeData[employeeIndex];
          
          entries.push({
            employeeId: employee._id!,
            employeeName: employee.name,
            shiftCode: shift.code,
            date: `${formData.year}-${String(monthIndex + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`,
            status: 'scheduled'
          });
        });
      }
      
      setGeneratedTimetable(entries);
    } catch (error) {
      console.error('Error generating timetable:', error);
      alert('Error generating timetable. Please try again.');
    } finally {
      setGenerating(false);
    }
  };

  const saveTimetable = async () => {
    if (generatedTimetable.length === 0) {
      alert('No timetable to save. Please generate a timetable first.');
      return;
    }

    setLoading(true);
    try {
      const timetableData = {
        projectName: formData.projectName,
        month: formData.month,
        year: formData.year,
        entries: generatedTimetable
      };

      await axios.post('http://localhost:5000/api/timetables', timetableData);
      alert('Timetable saved successfully!');
      
      // Reset form
      setFormData({
        projectName: '',
        month: '',
        year: new Date().getFullYear(),
        selectedEmployees: [],
        selectedShifts: [],
        workDaysPerWeek: 5,
        maxConsecutiveDays: 6,
      });
      setGeneratedTimetable([]);
    } catch (error) {
      console.error('Error saving timetable:', error);
      alert('Error saving timetable. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const exportTimetableCSV = () => {
    if (generatedTimetable.length === 0) return;

    const headers = ['Date', 'Employee Name', 'Employee ID', 'Shift Code', 'Status'];
    const csvContent = [
      headers.join(','),
      ...generatedTimetable.map(entry => [
        entry.date,
        entry.employeeName,
        entry.employeeId,
        entry.shiftCode,
        entry.status
      ].join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `${formData.projectName}_${formData.month}_${formData.year}_timetable.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="bg-white rounded-lg shadow-lg p-6">
      <h2 className="text-2xl font-bold text-gray-800 mb-6">Generate Timetable</h2>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Configuration Form */}
        <div className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Project Name *
            </label>
            <input
              type="text"
              required
              value={formData.projectName}
              onChange={(e) => setFormData({ ...formData, projectName: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Enter project name"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Month *
              </label>
              <select
                required
                value={formData.month}
                onChange={(e) => setFormData({ ...formData, month: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Select Month</option>
                {['January', 'February', 'March', 'April', 'May', 'June',
                  'July', 'August', 'September', 'October', 'November', 'December'].map(month => (
                  <option key={month} value={month}>{month}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Year *
              </label>
              <select
                value={formData.year}
                onChange={(e) => setFormData({ ...formData, year: parseInt(e.target.value) })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                {Array.from({ length: 3 }, (_, i) => new Date().getFullYear() + i).map(year => (
                  <option key={year} value={year}>{year}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Work Days Per Week
              </label>
              <select
                value={formData.workDaysPerWeek}
                onChange={(e) => setFormData({ ...formData, workDaysPerWeek: parseInt(e.target.value) })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value={5}>5 Days (Mon-Fri)</option>
                <option value={6}>6 Days (Mon-Sat)</option>
                <option value={7}>7 Days (All Week)</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Max Consecutive Days
              </label>
              <input
                type="number"
                min="1"
                max="14"
                value={formData.maxConsecutiveDays}
                onChange={(e) => setFormData({ ...formData, maxConsecutiveDays: parseInt(e.target.value) })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Select Employees *
            </label>
            <div className="max-h-48 overflow-y-auto border border-gray-300 rounded-md p-3">
              {employees.length > 0 ? (
                employees.map(employee => (
                  <label key={employee._id} className="flex items-center mb-2">
                    <input
                      type="checkbox"
                      checked={formData.selectedEmployees.includes(employee._id!)}
                      onChange={() => handleEmployeeSelection(employee._id!)}
                      className="mr-2"
                    />
                    <span className="text-sm">{employee.name} ({employee.employeeId})</span>
                  </label>
                ))
              ) : (
                <p className="text-gray-500 text-sm">No employees available. Please add employees first.</p>
              )}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Select Shifts *
            </label>
            <div className="max-h-48 overflow-y-auto border border-gray-300 rounded-md p-3">
              {shifts.length > 0 ? (
                shifts.map(shift => (
                  <label key={shift._id} className="flex items-center mb-2">
                    <input
                      type="checkbox"
                      checked={formData.selectedShifts.includes(shift.code)}
                      onChange={() => handleShiftSelection(shift.code)}
                      className="mr-2"
                    />
                    <div className="flex items-center">
                      <div
                        className="w-3 h-3 rounded-full mr-2"
                        style={{ backgroundColor: shift.color }}
                      />
                      <span className="text-sm">{shift.name} ({shift.code})</span>
                    </div>
                  </label>
                ))
              ) : (
                <p className="text-gray-500 text-sm">No shifts available. Please add shifts first.</p>
              )}
            </div>
          </div>

          <div className="flex space-x-4">
            <button
              onClick={generateTimetable}
              disabled={generating}
              className="flex-1 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 disabled:opacity-50 transition-colors"
            >
              {generating ? 'Generating...' : 'Generate Timetable'}
            </button>
          </div>
        </div>

        {/* Preview */}
        <div>
          <h3 className="text-lg font-semibold text-gray-800 mb-4">
            Timetable Preview
            {generatedTimetable.length > 0 && (
              <span className="text-sm font-normal text-gray-600 ml-2">
                ({generatedTimetable.length} entries)
              </span>
            )}
          </h3>

          {generatedTimetable.length > 0 ? (
            <div>
              <div className="max-h-96 overflow-y-auto border border-gray-300 rounded-md mb-4">
                <table className="w-full text-sm">
                  <thead className="bg-gray-50 sticky top-0">
                    <tr>
                      <th className="px-3 py-2 text-left">Date</th>
                      <th className="px-3 py-2 text-left">Employee</th>
                      <th className="px-3 py-2 text-left">Shift</th>
                    </tr>
                  </thead>
                  <tbody>
                    {generatedTimetable.slice(0, 50).map((entry, index) => (
                      <tr key={index} className="border-t">
                        <td className="px-3 py-2">{new Date(entry.date).toLocaleDateString()}</td>
                        <td className="px-3 py-2">{entry.employeeName}</td>
                        <td className="px-3 py-2">
                          <span className="inline-block px-2 py-1 bg-blue-100 text-blue-800 rounded text-xs">
                            {entry.shiftCode}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                {generatedTimetable.length > 50 && (
                  <div className="p-3 text-center text-gray-500 text-sm">
                    ... and {generatedTimetable.length - 50} more entries
                  </div>
                )}
              </div>

              <div className="flex space-x-3">
                <button
                  onClick={saveTimetable}
                  disabled={loading}
                  className="flex-1 bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 disabled:opacity-50 transition-colors"
                >
                  {loading ? 'Saving...' : 'Save Timetable'}
                </button>
                <button
                  onClick={exportTimetableCSV}
                  className="bg-gray-600 text-white px-4 py-2 rounded-lg hover:bg-gray-700 transition-colors"
                >
                  Export CSV
                </button>
              </div>
            </div>
          ) : (
            <div className="text-center py-8 text-gray-500">
              <p>No timetable generated yet.</p>
              <p className="text-sm">Fill in the form and click "Generate Timetable" to see the preview.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default TimetableGenerator;