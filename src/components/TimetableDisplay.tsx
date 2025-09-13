import React, { useState, useEffect } from 'react';
import axios from 'axios';

interface TimetableEntry {
  _id?: string;
  employeeId: string;
  employeeName: string;
  shiftCode: string;
  date: string;
  status: 'scheduled' | 'confirmed' | 'completed' | 'absent';
}

interface Timetable {
  _id?: string;
  projectName: string;
  month: string;
  year: number;
  entries: TimetableEntry[];
  createdAt?: string;
}

const TimetableDisplay: React.FC = () => {
  const [timetables, setTimetables] = useState<Timetable[]>([]);
  const [selectedTimetable, setSelectedTimetable] = useState<Timetable | null>(null);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedMonth, setSelectedMonth] = useState('');
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());

  useEffect(() => {
    fetchTimetables();
  }, []);

  const fetchTimetables = async () => {
    try {
      setLoading(true);
      const response = await axios.get('http://localhost:5000/api/timetables');
      setTimetables(response.data);
    } catch (error) {
      console.error('Error fetching timetables:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredTimetables = timetables.filter(timetable => {
    const matchesSearch = timetable.projectName.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesMonth = !selectedMonth || timetable.month === selectedMonth;
    const matchesYear = timetable.year === selectedYear;
    return matchesSearch && matchesMonth && matchesYear;
  });

  const generateCalendarDays = (month: string, year: number) => {
    const monthNames = [
      'January', 'February', 'March', 'April', 'May', 'June',
      'July', 'August', 'September', 'October', 'November', 'December'
    ];
    const monthIndex = monthNames.indexOf(month);
    const daysInMonth = new Date(year, monthIndex + 1, 0).getDate();
    return Array.from({ length: daysInMonth }, (_, i) => i + 1);
  };

  const getEntriesForDate = (date: number) => {
    if (!selectedTimetable) return [];
    const dateString = `${selectedTimetable.year}-${String(new Date().getMonth() + 1).padStart(2, '0')}-${String(date).padStart(2, '0')}`;
    return selectedTimetable.entries.filter(entry => entry.date === dateString);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'scheduled': return 'bg-blue-100 text-blue-800';
      case 'confirmed': return 'bg-green-100 text-green-800';
      case 'completed': return 'bg-purple-100 text-purple-800';
      case 'absent': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const exportToCSV = () => {
    if (!selectedTimetable) return;

    const headers = ['Date', 'Employee Name', 'Employee ID', 'Shift Code', 'Status'];
    const csvContent = [
      headers.join(','),
      ...selectedTimetable.entries.map(entry => [
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
    link.setAttribute('download', `${selectedTimetable.projectName}_${selectedTimetable.month}_${selectedTimetable.year}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  if (selectedTimetable) {
    const calendarDays = generateCalendarDays(selectedTimetable.month, selectedTimetable.year);
    
    return (
      <div className="bg-white rounded-lg shadow-lg p-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <button
              onClick={() => setSelectedTimetable(null)}
              className="text-blue-600 hover:text-blue-800 mb-2"
            >
              ← Back to Timetables
            </button>
            <h2 className="text-2xl font-bold text-gray-800">
              {selectedTimetable.projectName} - {selectedTimetable.month} {selectedTimetable.year}
            </h2>
          </div>
          <button
            onClick={exportToCSV}
            className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors flex items-center"
          >
            <span className="mr-2">📊</span>
            Export CSV
          </button>
        </div>

        <div className="grid grid-cols-7 gap-2 mb-4">
          {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
            <div key={day} className="text-center font-semibold text-gray-700 py-2">
              {day}
            </div>
          ))}
        </div>

        <div className="grid grid-cols-7 gap-2">
          {calendarDays.map(date => {
            const entries = getEntriesForDate(date);
            return (
              <div key={date} className="min-h-[120px] border border-gray-200 rounded-lg p-2">
                <div className="font-semibold text-sm text-gray-700 mb-2">{date}</div>
                <div className="space-y-1">
                  {entries.map((entry, index) => (
                    <div
                      key={index}
                      className={`text-xs p-1 rounded ${getStatusColor(entry.status)}`}
                      title={`${entry.employeeName} - ${entry.shiftCode} - ${entry.status}`}
                    >
                      <div className="font-medium">{entry.employeeName}</div>
                      <div>{entry.shiftCode}</div>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>

        <div className="mt-6">
          <h3 className="text-lg font-semibold mb-4">Legend</h3>
          <div className="flex flex-wrap gap-4">
            <div className="flex items-center">
              <div className="w-4 h-4 bg-blue-100 border border-blue-300 rounded mr-2"></div>
              <span className="text-sm">Scheduled</span>
            </div>
            <div className="flex items-center">
              <div className="w-4 h-4 bg-green-100 border border-green-300 rounded mr-2"></div>
              <span className="text-sm">Confirmed</span>
            </div>
            <div className="flex items-center">
              <div className="w-4 h-4 bg-purple-100 border border-purple-300 rounded mr-2"></div>
              <span className="text-sm">Completed</span>
            </div>
            <div className="flex items-center">
              <div className="w-4 h-4 bg-red-100 border border-red-300 rounded mr-2"></div>
              <span className="text-sm">Absent</span>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-lg p-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-gray-800">Timetable Display</h2>
        <button
          onClick={fetchTimetables}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center"
        >
          <span className="mr-2">🔄</span>
          Refresh
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Search Project
          </label>
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Search by project name..."
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Month
          </label>
          <select
            value={selectedMonth}
            onChange={(e) => setSelectedMonth(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">All Months</option>
            {['January', 'February', 'March', 'April', 'May', 'June',
              'July', 'August', 'September', 'October', 'November', 'December'].map(month => (
              <option key={month} value={month}>{month}</option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Year
          </label>
          <select
            value={selectedYear}
            onChange={(e) => setSelectedYear(parseInt(e.target.value))}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            {Array.from({ length: 5 }, (_, i) => new Date().getFullYear() - 2 + i).map(year => (
              <option key={year} value={year}>{year}</option>
            ))}
          </select>
        </div>
      </div>

      {loading ? (
        <div className="text-center py-8">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          <p className="mt-2 text-gray-600">Loading timetables...</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredTimetables.length > 0 ? (
            filteredTimetables.map((timetable) => (
              <div
                key={timetable._id}
                className="bg-gray-50 rounded-lg p-4 border cursor-pointer hover:bg-gray-100 transition-colors"
                onClick={() => setSelectedTimetable(timetable)}
              >
                <h3 className="font-semibold text-gray-900 mb-2">{timetable.projectName}</h3>
                <div className="text-sm text-gray-600 space-y-1">
                  <p><strong>Period:</strong> {timetable.month} {timetable.year}</p>
                  <p><strong>Entries:</strong> {timetable.entries.length}</p>
                  {timetable.createdAt && (
                    <p><strong>Created:</strong> {new Date(timetable.createdAt).toLocaleDateString()}</p>
                  )}
                </div>
                <div className="mt-3">
                  <span className="inline-block bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded-full">
                    Click to View
                  </span>
                </div>
              </div>
            ))
          ) : (
            <div className="col-span-full text-center py-8">
              <p className="text-gray-500">
                {searchTerm || selectedMonth ? 'No timetables match your filters.' : 'No timetables found. Generate your first timetable to get started!'}
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default TimetableDisplay;