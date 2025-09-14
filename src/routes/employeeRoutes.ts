import express from 'express';
import Employee from '../models/Employee';

const router = express.Router();

// Get all employees
router.get('/', async (req, res) => {
  try {
    const employees = await Employee.find({ isActive: true }).sort({ name: 1 });
    res.json(employees);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch employees' });
  }
});

// Create new employee
router.post('/', async (req, res) => {
  try {
    const employee = new Employee(req.body);
    const savedEmployee = await employee.save();
    res.status(201).json(savedEmployee);
  } catch (error: any) {
    if (error.code === 11000) {
      res.status(400).json({ error: 'Employee ID or email already exists' });
    } else {
      res.status(400).json({ error: 'Failed to create employee' });
    }
  }
});

// Update employee
router.put('/:id', async (req, res) => {
  try {
    const updatedEmployee = await Employee.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );
    
    if (!updatedEmployee) {
      return res.status(404).json({ error: 'Employee not found' });
    }
    
    res.json(updatedEmployee);
  } catch (error) {
    res.status(400).json({ error: 'Failed to update employee' });
  }
});

// Delete employee (soft delete)
router.delete('/:id', async (req, res) => {
  try {
    const employee = await Employee.findByIdAndUpdate(
      req.params.id,
      { isActive: false },
      { new: true }
    );
    
    if (!employee) {
      return res.status(404).json({ error: 'Employee not found' });
    }
    
    res.json({ message: 'Employee deactivated successfully' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete employee' });
  }
});

// Bulk create employees
router.post('/bulk', async (req, res) => {
  try {
    const { employees } = req.body;
    const createdEmployees = await Employee.insertMany(employees, { ordered: false });
    res.status(201).json(createdEmployees);
  } catch (error) {
    res.status(400).json({ error: 'Failed to create employees in bulk' });
  }
});

export default router;