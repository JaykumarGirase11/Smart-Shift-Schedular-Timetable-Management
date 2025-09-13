"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const User_1 = __importDefault(require("../models/User"));
const Activity_1 = __importDefault(require("../models/Activity"));
const authRoutes_1 = require("./authRoutes");
const router = express_1.default.Router();
// Get all users - Admin only
router.get('/users', authRoutes_1.verifyToken, authRoutes_1.verifyAdmin, async (req, res) => {
    try {
        // Get all users but exclude passwords
        const users = await User_1.default.find().select('-password');
        res.json(users);
    }
    catch (error) {
        console.error('Error fetching users:', error);
        res.status(500).json({ message: 'Error fetching users' });
    }
});
// Get active users - Admin only
router.get('/users/active', authRoutes_1.verifyToken, authRoutes_1.verifyAdmin, async (req, res) => {
    try {
        // Get users who are active (recently logged in)
        const fifteenMinutesAgo = new Date(Date.now() - 15 * 60 * 1000);
        const activeUsers = await User_1.default.find({
            lastActivity: { $gte: fifteenMinutesAgo }
        }).select('-password');
        res.json(activeUsers);
    }
    catch (error) {
        console.error('Error fetching active users:', error);
        res.status(500).json({ message: 'Error fetching active users' });
    }
});
// Get user activities - Admin only
router.get('/activities', authRoutes_1.verifyToken, authRoutes_1.verifyAdmin, async (req, res) => {
    try {
        const limit = parseInt(req.query.limit) || 50;
        // Get recent activities with optional filtering
        const activities = await Activity_1.default.find()
            .sort({ timestamp: -1 })
            .limit(limit);
        res.json(activities);
    }
    catch (error) {
        console.error('Error fetching activities:', error);
        res.status(500).json({ message: 'Error fetching activities' });
    }
});
// Get activities by user - Admin only
router.get('/activities/user/:userId', authRoutes_1.verifyToken, authRoutes_1.verifyAdmin, async (req, res) => {
    try {
        const userId = req.params.userId;
        const limit = parseInt(req.query.limit) || 50;
        // Get activities for specific user
        const activities = await Activity_1.default.find({ userId })
            .sort({ timestamp: -1 })
            .limit(limit);
        res.json(activities);
    }
    catch (error) {
        console.error('Error fetching user activities:', error);
        res.status(500).json({ message: 'Error fetching user activities' });
    }
});
// Get system statistics - Admin only
router.get('/stats', authRoutes_1.verifyToken, authRoutes_1.verifyAdmin, async (req, res) => {
    try {
        const totalUsers = await User_1.default.countDocuments();
        const activeUsers = await User_1.default.countDocuments({ isActive: true });
        const adminUsers = await User_1.default.countDocuments({ role: 'admin' });
        const twentyFourHoursAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
        const recentActivities = await Activity_1.default.countDocuments({
            timestamp: { $gte: twentyFourHoursAgo }
        });
        const recentLogins = await Activity_1.default.countDocuments({
            action: 'login',
            timestamp: { $gte: twentyFourHoursAgo }
        });
        res.json({
            totalUsers,
            activeUsers,
            adminUsers,
            recentActivities,
            recentLogins
        });
    }
    catch (error) {
        console.error('Error fetching stats:', error);
        res.status(500).json({ message: 'Error fetching system statistics' });
    }
});
exports.default = router;
//# sourceMappingURL=adminRoutes.js.map