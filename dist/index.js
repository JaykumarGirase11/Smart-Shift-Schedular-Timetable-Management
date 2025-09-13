"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const dotenv_1 = __importDefault(require("dotenv"));
const mongoose_1 = __importDefault(require("mongoose"));
// Import routes - removed adminRoutes
const employeeRoutes_1 = __importDefault(require("./routes/employeeRoutes"));
const shiftRoutes_1 = __importDefault(require("./routes/shiftRoutes"));
const timetableRoutes_1 = __importDefault(require("./routes/timetableRoutes"));
const authRoutes_1 = __importDefault(require("./routes/authRoutes"));
dotenv_1.default.config();
const app = (0, express_1.default)();
const PORT = process.env.PORT || 5000;
// Middleware
app.use((0, cors_1.default)());
app.use(express_1.default.json());
app.use(express_1.default.urlencoded({ extended: true }));
// Routes - removed admin routes
app.use('/api/auth', authRoutes_1.default);
app.use('/api/employees', employeeRoutes_1.default);
app.use('/api/shifts', shiftRoutes_1.default);
app.use('/api/timetables', timetableRoutes_1.default);
// Health check route
app.get('/api/health', (req, res) => {
    res.json({
        status: 'OK',
        message: 'Shift Scheduler API is running',
        timestamp: new Date().toISOString()
    });
});
// Root route - updated endpoints
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
        await mongoose_1.default.connect(mongoURI);
        console.log('✅ MongoDB connected successfully');
    }
    catch (error) {
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
exports.default = app;
//# sourceMappingURL=index.js.map