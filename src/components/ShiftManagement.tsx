import React, { useState, useEffect } from 'react';
import axios from 'axios';

interface Shift {
  _id?: string;
  code: string;
  name: string;
  startTime: string;
  endTime: string;
  color?: string;
  description?: string;
  requiredStaff?: number;
  isActive?: boolean;
}

const ShiftManagement: React.FC = () => {
  const [shifts, setShifts] = useState<Shift[]>([]);
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingShift, setEditingShift] = useState<Shift | null>(null);
  const [loading, setLoading] = useState(false);
  const [newShift, setNewShift] = useState<Shift>({
    code: '',
    name: '',
    startTime: '',
    endTime: '',
    color: '#3B82F6',
    description: '',
    requiredStaff: 1,
    isActive: true,
  });

  const predefinedColors = [
    '#3B82F6', '#EF4444', '#10B981', '#F59E0B',
    '#8B5CF6', '#EC4899', '#06B6D4', '#84CC16'
  ];

  useEffect(() => {
    fetchShifts();
  }, []);

  const fetchShifts = async () => {
    try {
      setLoading(true);
      const response = await axios.get('http://localhost:5000/api/shifts');
      setShifts(response.data);
    } catch (error) {
      console.error('Error fetching shifts:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setLoading(true);
      if (editingShift) {
        await axios.put(`http://localhost:5000/api/shifts/${editingShift._id}`, newShift);
        alert('Shift updated successfully!');
      } else {
        await axios.post('http://localhost:5000/api/shifts', newShift);
        alert('Shift added successfully!');
      }
      
      resetForm();
      fetchShifts();
    } catch (error) {
      console.error('Error saving shift:', error);
      alert('Error saving shift. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (shift: Shift) => {
    setEditingShift(shift);
    setNewShift(shift);
    setShowAddForm(true);
  };

  const handleDelete = async (shift: Shift) => {
    if (window.confirm(`Are you sure you want to delete shift ${shift.name}?`)) {
      try {
        setLoading(true);
        await axios.delete(`http://localhost:5000/api/shifts/${shift._id}`);
        alert('Shift deleted successfully!');
        fetchShifts();
      } catch (error) {
        console.error('Error deleting shift:', error);
        alert('Error deleting shift. Please try again.');
      } finally {
        setLoading(false);
      }
    }
  };

  const resetForm = () => {
    setNewShift({
      code: '',
      name: '',
      startTime: '',
      endTime: '',
      color: '#3B82F6',
      description: '',
      requiredStaff: 1,
      isActive: true,
    });
    setEditingShift(null);
    setShowAddForm(false);
  };

  const formatTime = (time: string) => {
    const [hours, minutes] = time.split(':');
    const hour = parseInt(hours);
    const ampm = hour >= 12 ? 'PM' : 'AM';
    const displayHour = hour % 12 || 12;
    return `${displayHour}:${minutes} ${ampm}`;
  };

  return (
    <div className="bg-white rounded-lg shadow-lg p-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-gray-800">Shift Management</h2>
        <button
          onClick={() => setShowAddForm(!showAddForm)}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center"
        >
          <span className="mr-2">+</span>
          Add Shift
        </button>
      </div>

      {showAddForm && (
        <div className="bg-gray-50 rounded-lg p-6 mb-6">
          <h3 className="text-lg font-semibold mb-4">
            {editingShift ? 'Edit Shift' : 'Add New Shift'}
          </h3>
          <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Shift Code *
              </label>
              <input
                type="text"
                required
                value={newShift.code}
                onChange={(e) => setNewShift({ ...newShift, code: e.target.value.toUpperCase() })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="e.g., IST, AU, US"
                maxLength={5}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Shift Name *
              </label>
              <input
                type="text"
                required
                value={newShift.name}
                onChange={(e) => setNewShift({ ...newShift, name: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="e.g., Morning Shift, Night Shift"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Start Time *
              </label>
              <input
                type="time"
                required
                value={newShift.startTime}
                onChange={(e) => setNewShift({ ...newShift, startTime: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                End Time *
              </label>
              <input
                type="time"
                required
                value={newShift.endTime}
                onChange={(e) => setNewShift({ ...newShift, endTime: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Required Staff
              </label>
              <input
                type="number"
                min="1"
                value={newShift.requiredStaff}
                onChange={(e) => setNewShift({ ...newShift, requiredStaff: parseInt(e.target.value) })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Color
              </label>
              <div className="flex items-center space-x-2">
                <input
                  type="color"
                  value={newShift.color}
                  onChange={(e) => setNewShift({ ...newShift, color: e.target.value })}
                  className="w-12 h-10 border border-gray-300 rounded-md"
                />
                <div className="flex space-x-1">
                  {predefinedColors.map((color) => (
                    <button
                      key={color}
                      type="button"
                      onClick={() => setNewShift({ ...newShift, color })}
                      className="w-6 h-6 rounded-full border-2 border-gray-300 hover:border-gray-400"
                      style={{ backgroundColor: color }}
                    />
                  ))}
                </div>
              </div>
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Description
              </label>
              <textarea
                value={newShift.description}
                onChange={(e) => setNewShift({ ...newShift, description: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Optional description for the shift"
                rows={3}
              />
            </div>

            <div className="md:col-span-2">
              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={newShift.isActive}
                  onChange={(e) => setNewShift({ ...newShift, isActive: e.target.checked })}
                  className="mr-2"
                />
                <span className="text-sm font-medium text-gray-700">Active Shift</span>
              </label>
            </div>

            <div className="md:col-span-2 flex justify-end space-x-4">
              <button
                type="button"
                onClick={resetForm}
                className="px-4 py-2 text-gray-600 border border-gray-300 rounded-md hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading}
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
              >
                {loading ? 'Saving...' : editingShift ? 'Update Shift' : 'Add Shift'}
              </button>
            </div>
          </form>
        </div>
      )}

      {loading && shifts.length === 0 ? (
        <div className="text-center py-8">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          <p className="mt-2 text-gray-600">Loading shifts...</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {shifts.length > 0 ? (
            shifts.map((shift) => (
              <div key={shift._id} className="bg-gray-50 rounded-lg p-4 border">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center">
                    <div
                      className="w-4 h-4 rounded-full mr-3"
                      style={{ backgroundColor: shift.color }}
                    />
                    <div>
                      <h3 className="font-semibold text-gray-900">{shift.name}</h3>
                      <span className="text-sm text-gray-500">({shift.code})</span>
                    </div>
                  </div>
                  <div className="flex items-center space-x-1">
                    <button
                      onClick={() => handleEdit(shift)}
                      className="p-1 text-blue-600 hover:text-blue-800"
                      title="Edit Shift"
                    >
                      ✏️
                    </button>
                    <button
                      onClick={() => handleDelete(shift)}
                      className="p-1 text-red-600 hover:text-red-800"
                      title="Delete Shift"
                    >
                      🗑️
                    </button>
                  </div>
                </div>

                <div className="text-sm text-gray-600 space-y-1">
                  <p className="flex items-center">
                    <span className="mr-2">🕐</span>
                    <strong>Time:</strong> {formatTime(shift.startTime)} - {formatTime(shift.endTime)}
                  </p>
                  {shift.requiredStaff && (
                    <p className="flex items-center">
                      <span className="mr-2">👥</span>
                      <strong>Required Staff:</strong> {shift.requiredStaff}
                    </p>
                  )}
                  {shift.description && (
                    <p className="flex items-start">
                      <span className="mr-2">📝</span>
                      <span><strong>Description:</strong> {shift.description}</span>
                    </p>
                  )}
                  <p className="flex items-center">
                    <span className="mr-2">📊</span>
                    <strong>Status:</strong> 
                    <span className={`ml-1 px-2 py-1 rounded-full text-xs ${
                      shift.isActive 
                        ? 'bg-green-100 text-green-800' 
                        : 'bg-red-100 text-red-800'
                    }`}>
                      {shift.isActive ? 'Active' : 'Inactive'}
                    </span>
                  </p>
                </div>
              </div>
            ))
          ) : (
            <div className="col-span-full text-center py-8">
              <p className="text-gray-500">No shifts found. Add your first shift to get started!</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default ShiftManagement;