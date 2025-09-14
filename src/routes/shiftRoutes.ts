import express from 'express';
import Shift from '../models/Shift';

const router = express.Router();

// Get all shifts
router.get('/', async (req, res) => {
  try {
    const shifts = await Shift.find({ isActive: true }).sort({ name: 1 });
    res.json(shifts);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch shifts' });
  }
});

// Create new shift
router.post('/', async (req, res) => {
  try {
    const shift = new Shift(req.body);
    const savedShift = await shift.save();
    res.status(201).json(savedShift);
  } catch (error: any) {
    if (error.code === 11000) {
      res.status(400).json({ error: 'Shift code already exists' });
    } else {
      res.status(400).json({ error: 'Failed to create shift' });
    }
  }
});

// Update shift
router.put('/:id', async (req, res) => {
  try {
    const updatedShift = await Shift.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );
    
    if (!updatedShift) {
      return res.status(404).json({ error: 'Shift not found' });
    }
    
    res.json(updatedShift);
  } catch (error) {
    res.status(400).json({ error: 'Failed to update shift' });
  }
});

// Delete shift (soft delete)
router.delete('/:id', async (req, res) => {
  try {
    const shift = await Shift.findByIdAndUpdate(
      req.params.id,
      { isActive: false },
      { new: true }
    );
    
    if (!shift) {
      return res.status(404).json({ error: 'Shift not found' });
    }
    
    res.json({ message: 'Shift deactivated successfully' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete shift' });
  }
});

// Initialize default shifts (based on the timetable image)
router.post('/initialize-defaults', async (req, res) => {
  try {
    const defaultShifts = [
      {
        name: 'IST Shift',
        code: 'IST',
        startTime: '09:00',
        endTime: '18:00',
        color: '#4CAF50',
        description: 'India Standard Time Shift'
      },
      {
        name: 'IST Shift Lead',
        code: 'IST_LEAD',
        startTime: '09:00',
        endTime: '18:00',
        color: '#2E7D32',
        description: 'IST Lead Shift'
      },
      {
        name: 'AU Shift',
        code: 'AU',
        startTime: '06:00',
        endTime: '15:00',
        color: '#E91E63',
        description: 'Australia Shift'
      },
      {
        name: 'AU Shift Lead',
        code: 'AU_LEAD',
        startTime: '06:00',
        endTime: '15:00',
        color: '#AD1457',
        description: 'AU Lead Shift'
      },
      {
        name: 'US Shift',
        code: 'US',
        startTime: '21:00',
        endTime: '06:00',
        color: '#2196F3',
        description: 'US Shift'
      },
      {
        name: 'AU Patching',
        code: 'AU_PATCH',
        startTime: '06:00',
        endTime: '15:00',
        color: '#FF9800',
        description: 'Australia Patching'
      },
      {
        name: 'KT-AU Patching',
        code: 'KT_AU_PATCH',
        startTime: '06:00',
        endTime: '15:00',
        color: '#FF5722',
        description: 'Knowledge Transfer AU Patching'
      },
      {
        name: 'KT-US Patching',
        code: 'KT_US_PATCH',
        startTime: '21:00',
        endTime: '06:00',
        color: '#9C27B0',
        description: 'Knowledge Transfer US Patching'
      },
      {
        name: 'DEV/TEST Patching',
        code: 'DEV_TEST_PATCH',
        startTime: '10:00',
        endTime: '19:00',
        color: '#607D8B',
        description: 'Development/Test Patching'
      }
    ];

    // Check if shifts already exist to avoid duplicates
    const existingShifts = await Shift.find({});
    if (existingShifts.length === 0) {
      const createdShifts = await Shift.insertMany(defaultShifts);
      res.status(201).json({ message: 'Default shifts created', shifts: createdShifts });
    } else {
      res.json({ message: 'Default shifts already exist', shifts: existingShifts });
    }
  } catch (error) {
    res.status(500).json({ error: 'Failed to initialize default shifts' });
  }
});

export default router;