"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const User_1 = __importDefault(require("../models/User"));
const authRoutes_1 = require("./authRoutes");
const router = express_1.default.Router();
// Get all users who have access to the current user's account
router.get('/shared-users', authRoutes_1.verifyToken, async (req, res) => {
    try {
        const currentUserId = req.user.id;
        // Find all users who have the current user's account in their sharedAccounts array
        const usersWithAccess = await User_1.default.find({
            'sharedAccounts.accountId': currentUserId
        }).select('_id username email sharedAccounts');
        // Format the response to include permissions
        const formattedUsers = usersWithAccess.map(user => {
            const sharedAccount = user.sharedAccounts.find((account) => account.accountId.toString() === currentUserId);
            return {
                _id: user._id,
                username: user.username,
                email: user.email,
                permissions: sharedAccount ? sharedAccount.permissions : []
            };
        });
        res.json(formattedUsers);
    }
    catch (error) {
        console.error('Error fetching shared users:', error);
        res.status(500).json({ message: 'Server error while fetching shared users' });
    }
});
// Get accounts shared with the current user
router.get('/my-shared-accounts', authRoutes_1.verifyToken, async (req, res) => {
    try {
        const currentUserId = req.user.id;
        // Find the current user with their shared accounts
        const currentUser = await User_1.default.findById(currentUserId).select('sharedAccounts');
        if (!currentUser) {
            return res.status(404).json({ message: 'User not found' });
        }
        // If no shared accounts, return empty array
        if (!currentUser.sharedAccounts || currentUser.sharedAccounts.length === 0) {
            return res.json([]);
        }
        // Get details of each account holder
        const accountIds = currentUser.sharedAccounts.map((account) => account.accountId);
        const accountHolders = await User_1.default.find({
            _id: { $in: accountIds }
        }).select('_id username email lastActivity');
        // Merge the account details with permissions
        const sharedAccounts = accountHolders.map(holder => {
            const accountInfo = currentUser.sharedAccounts.find((account) => account.accountId.toString() === holder._id.toString());
            return {
                _id: holder._id,
                username: holder.username,
                email: holder.email,
                lastActivity: holder.lastActivity,
                permissions: accountInfo ? accountInfo.permissions : [],
                sharedAt: accountInfo ? accountInfo.sharedAt : null
            };
        });
        res.json(sharedAccounts);
    }
    catch (error) {
        console.error('Error fetching shared accounts:', error);
        res.status(500).json({ message: 'Server error while fetching shared accounts' });
    }
});
// Get activity logs for a shared account (visible to both account holder and shared users)
router.get('/activity/:accountId', authRoutes_1.verifyToken, async (req, res) => {
    try {
        const currentUserId = req.user.id;
        const accountId = req.params.accountId;
        // Check if user has access to this account
        const currentUser = await User_1.default.findById(currentUserId);
        if (!currentUser) {
            return res.status(404).json({ message: 'User not found' });
        }
        // Allow access if user is the account holder
        let hasAccess = currentUser._id.toString() === accountId;
        // Or if user has this account shared with them
        if (!hasAccess) {
            hasAccess = currentUser.sharedAccounts?.some((account) => account.accountId.toString() === accountId);
        }
        if (!hasAccess) {
            return res.status(403).json({ message: 'You do not have access to this account' });
        }
        // Get activities for this account
        const activities = await User_1.default.findById(accountId)
            .select('loginHistory')
            .populate('loginHistory');
        res.json(activities?.loginHistory || []);
    }
    catch (error) {
        console.error('Error fetching account activity:', error);
        res.status(500).json({ message: 'Server error while fetching account activity' });
    }
});
exports.default = router;
//# sourceMappingURL=accountSharingRoutes.js.map