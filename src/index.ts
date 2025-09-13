import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import mongoose from 'mongoose';

// Import routes - removed adminRoutes completely
import employeeRoutes from './routes/employeeRoutes';
import shiftRoutes from './routes/shiftRoutes';
import timetableRoutes from './routes/timetableRoutes';
import authRoutes from './routes/authRoutes';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Routes - no admin routes
app.use('/api/auth', authRoutes);
app.use('/api/employees', employeeRoutes);
app.use('/api/shifts', shiftRoutes);
app.use('/api/timetables', timetableRoutes);

// Health check route
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    message: 'Shift Scheduler API is running',
    timestamp: new Date().toISOString()
  });
});

// Root route - removed admin endpoints
app.get('/', (req, res) => {
  res.json({ 
    message: 'Welcome to Shift Scheduler API',
    version: '1.0.0',
    endpoints: {
      auth: '/api/auth',
      health: '/api/health',
      employees: '/api/employees',
      shifts: '/api/shifts',
      timetables: '/api/timetables'
    }
  });
});

// MongoDB connection with error handling
const connectDB = async () => {
  try {
    const mongoURI = process.env.MONGODB_URI || 'mongodb://localhost:27017/shift-scheduler';
    await mongoose.connect(mongoURI);
    console.log('✅ MongoDB connected successfully');
  } catch (error) {
    console.log('⚠️  MongoDB not available, running in demo mode');
    console.log('🔧 To enable database features, please install and start MongoDB');
  }
};

// Start server
const startServer = async () => {
  await connectDB();
  
  app.listen(PORT, () => {
    console.log(`🚀 Server running on port ${PORT}`);
    console.log(`📱 Frontend URL: http://localhost:3001`);
    console.log(`🔗 Backend URL: http://localhost:${PORT}`);
    console.log(`💡 API Health Check: http://localhost:${PORT}/api/health`);
  });
};

startServer();

export default app;