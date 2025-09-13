import React, { useState, useEffect } from 'react';
import axios from 'axios';

interface Employee {
  _id?: string;
  name: string;
  employeeId: string;
  email: string;
  phone?: string;
  department?: string;
  position?: string;
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
  isActive?: boolean;
}

const EmployeeManagement: React.FC = () => {
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingEmployee, setEditingEmployee] = useState<Employee | null>(null);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [newEmployee, setNewEmployee] = useState<Employee>({
    name: '',
    employeeId: '',
    email: '',
    phone: '',
    department: '',
    position: '',
    skills: [],
    availability: {
      monday: true,
      tuesday: true,
      wednesday: true,
      thursday: true,
      friday: true,
      saturday: false,
      sunday: false,
    },
    isActive: true,
  });

  const [skillInput, setSkillInput] = useState('');

  useEffect(() => {
    fetchEmployees();
  }, []);

  const fetchEmployees = async () => {
    try {
      setLoading(true);
      const response = await axios.get('http://localhost:5000/api/employees');
      setEmployees(response.data);
    } catch (error) {
      console.error('Error fetching employees:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setLoading(true);
      if (editingEmployee) {
        await axios.put(`http://localhost:5000/api/employees/${editingEmployee._id}`, newEmployee);
        alert('Employee updated successfully!');
      } else {
        await axios.post('http://localhost:5000/api/employees', newEmployee);
        alert('Employee added successfully!');
      }
      
      resetForm();
      fetchEmployees();
    } catch (error) {
      console.error('Error saving employee:', error);
      alert('Error saving employee. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (employee: Employee) => {
    setEditingEmployee(employee);
    setNewEmployee(employee);
    setShowAddForm(true);
  };

  const handleDelete = async (employee: Employee) => {
    if (window.confirm(`Are you sure you want to delete employee ${employee.name}?`)) {
      try {
        setLoading(true);
        await axios.delete(`http://localhost:5000/api/employees/${employee._id}`);
        alert('Employee deleted successfully!');
        fetchEmployees();
      } catch (error) {
        console.error('Error deleting employee:', error);
        alert('Error deleting employee. Please try again.');
      } finally {
        setLoading(false);
      }
    }
  };

  const resetForm = () => {
    setNewEmployee({
      name: '',
      employeeId: '',
      email: '',
      phone: '',
      department: '',
      position: '',
      skills: [],
      availability: {
        monday: true,
        tuesday: true,
        wednesday: true,
        thursday: true,
        friday: true,
        saturday: false,
        sunday: false,
      },
      isActive: true,
    });
    setEditingEmployee(null);
    setShowAddForm(false);
    setSkillInput('');
  };

  const addSkill = () => {
    if (skillInput.trim() && !newEmployee.skills?.includes(skillInput.trim())) {
      setNewEmployee({
        ...newEmployee,
        skills: [...(newEmployee.skills || []), skillInput.trim()]
      });
      setSkillInput('');
    }
  };

  const removeSkill = (skillToRemove: string) => {
    setNewEmployee({
      ...newEmployee,
      skills: newEmployee.skills?.filter(skill => skill !== skillToRemove) || []
    });
  };

  const updateAvailability = (day: keyof typeof newEmployee.availability, available: boolean) => {
    setNewEmployee({
      ...newEmployee,
      availability: {
        ...newEmployee.availability!,
        [day]: available
      }
    });
  };

  const filteredEmployees = employees.filter(employee =>
    employee.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    employee.employeeId.toLowerCase().includes(searchTerm.toLowerCase()) ||
    employee.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    employee.department?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="bg-white rounded-lg shadow-lg p-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-gray-800">Employee Management</h2>
        <button
          onClick={() => setShowAddForm(!showAddForm)}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center"
        >
          <span className="mr-2">+</span>
          Add Employee
        </button>
      </div>

      {/* Search Bar */}
      <div className="mb-6">
        <input
          type="text"
          placeholder="Search employees by name, ID, email, or department..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>

      {showAddForm && (
        <div className="bg-gray-50 rounded-lg p-6 mb-6">
          <h3 className="text-lg font-semibold mb-4">
            {editingEmployee ? 'Edit Employee' : 'Add New Employee'}
          </h3>
          <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Full Name *
              </label>
              <input
                type="text"
                required
                value={newEmployee.name}
                onChange={(e) => setNewEmployee({ ...newEmployee, name: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Enter full name"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Employee ID *
              </label>
              <input
                type="text"
                required
                value={newEmployee.employeeId}
                onChange={(e) => setNewEmployee({ ...newEmployee, employeeId: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Enter employee ID"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Email *
              </label>
              <input
                type="email"
                required
                value={newEmployee.email}
                onChange={(e) => setNewEmployee({ ...newEmployee, email: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Enter email address"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Phone
              </label>
              <input
                type="tel"
                value={newEmployee.phone}
                onChange={(e) => setNewEmployee({ ...newEmployee, phone: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Enter phone number"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Department
              </label>
              <input
                type="text"
                value={newEmployee.department}
                onChange={(e) => setNewEmployee({ ...newEmployee, department: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Enter department"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Position
              </label>
              <input
                type="text"
                value={newEmployee.position}
                onChange={(e) => setNewEmployee({ ...newEmployee, position: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Enter position"
              />
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Skills
              </label>
              <div className="flex mb-2">
                <input
                  type="text"
                  value={skillInput}
                  onChange={(e) => setSkillInput(e.target.value)}
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-l-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Add a skill"
                  onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addSkill())}
                />
                <button
                  type="button"
                  onClick={addSkill}
                  className="px-4 py-2 bg-blue-600 text-white rounded-r-md hover:bg-blue-700"
                >
                  Add
                </button>
              </div>
              <div className="flex flex-wrap gap-2">
                {newEmployee.skills?.map((skill, index) => (
                  <span
                    key={index}
                    className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-blue-100 text-blue-800"
                  >
                    {skill}
                    <button
                      type="button"
                      onClick={() => removeSkill(skill)}
                      className="ml-2 text-blue-600 hover:text-blue-800"
                    >
                      ×
                    </button>
                  </span>
                ))}
              </div>
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Availability
              </label>
              <div className="grid grid-cols-7 gap-2">
                {Object.entries(newEmployee.availability || {}).map(([day, available]) => (
                  <label key={day} className="flex flex-col items-center">
                    <span className="text-xs font-medium mb-1 capitalize">
                      {day.substring(0, 3)}
                    </span>
                    <input
                      type="checkbox"
                      checked={available}
                      onChange={(e) => updateAvailability(day as keyof typeof newEmployee.availability, e.target.checked)}
                      className="form-checkbox h-4 w-4 text-blue-600"
                    />
                  </label>
                ))}
              </div>
            </div>

            <div className="md:col-span-2">
              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={newEmployee.isActive}
                  onChange={(e) => setNewEmployee({ ...newEmployee, isActive: e.target.checked })}
                  className="mr-2"
                />
                <span className="text-sm font-medium text-gray-700">Active Employee</span>
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
                {loading ? 'Saving...' : editingEmployee ? 'Update Employee' : 'Add Employee'}
              </button>
            </div>
          </form>
        </div>
      )}

      {loading && employees.length === 0 ? (
        <div className="text-center py-8">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          <p className="mt-2 text-gray-600">Loading employees...</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredEmployees.length > 0 ? (
            filteredEmployees.map((employee) => (
              <div key={employee._id} className="bg-gray-50 rounded-lg p-4 border">
                <div className="flex items-center justify-between mb-3">
                  <div>
                    <h3 className="font-semibold text-gray-900">{employee.name}</h3>
                    <span className="text-sm text-gray-500">ID: {employee.employeeId}</span>
                  </div>
                  <div className="flex items-center space-x-1">
                    <button
                      onClick={() => handleEdit(employee)}
                      className="p-1 text-blue-600 hover:text-blue-800"
                      title="Edit Employee"
                    >
                      ✏️
                    </button>
                    <button
                      onClick={() => handleDelete(employee)}
                      className="p-1 text-red-600 hover:text-red-800"
                      title="Delete Employee"
                    >
                      🗑️
                    </button>
                  </div>
                </div>

                <div className="text-sm text-gray-600 space-y-1">
                  <p><strong>Email:</strong> {employee.email}</p>
                  {employee.phone && <p><strong>Phone:</strong> {employee.phone}</p>}
                  {employee.department && <p><strong>Department:</strong> {employee.department}</p>}
                  {employee.position && <p><strong>Position:</strong> {employee.position}</p>}
                  
                  {employee.skills && employee.skills.length > 0 && (
                    <div>
                      <strong>Skills:</strong>
                      <div className="flex flex-wrap gap-1 mt-1">
                        {employee.skills.map((skill, index) => (
                          <span
                            key={index}
                            className="inline-block px-2 py-1 bg-blue-100 text-blue-800 rounded text-xs"
                          >
                            {skill}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  <div>
                    <strong>Status:</strong>
                    <span className={`ml-1 px-2 py-1 rounded-full text-xs ${
                      employee.isActive 
                        ? 'bg-green-100 text-green-800' 
                        : 'bg-red-100 text-red-800'
                    }`}>
                      {employee.isActive ? 'Active' : 'Inactive'}
                    </span>
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="col-span-full text-center py-8">
              <p className="text-gray-500">
                {searchTerm ? 'No employees match your search.' : 'No employees found. Add your first employee to get started!'}
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default EmployeeManagement;