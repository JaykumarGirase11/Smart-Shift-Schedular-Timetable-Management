"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = __importDefault(require("mongoose"));
const bcryptjs_1 = __importDefault(require("bcryptjs"));
// Shared account schema for account sharing functionality
const sharedAccountSchema = new mongoose_1.default.Schema({
    accountId: {
        type: mongoose_1.default.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    accountName: {
        type: String,
        required: true
    },
    permissions: {
        type: [String],
        enum: ['view', 'edit', 'admin'],
        default: ['view']
    },
    sharedAt: {
        type: Date,
        default: Date.now
    }
});
// User Schema
const userSchema = new mongoose_1.default.Schema({
    username: {
        type: String,
        required: true,
        unique: true,
        trim: true
    },
    email: {
        type: String,
        required: true,
        unique: true,
        trim: true,
        lowercase: true
    },
    password: {
        type: String,
        required: true
    },
    role: {
        type: String,
        enum: ['user'], // Removed admin role
        default: 'user'
    },
    isAccountHolder: {
        type: Boolean,
        default: false
    },
    sharedAccounts: [sharedAccountSchema],
    cannotBeCancelled: {
        type: Boolean,
        default: false
    },
    lastActivity: {
        type: Date,
        default: Date.now
    },
    isActive: {
        type: Boolean,
        default: true
    },
    lastLogin: {
        type: Date,
        default: Date.now
    },
    loginHistory: [{
            timestamp: {
                type: Date,
                default: Date.now
            },
            ipAddress: String,
            userAgent: String
        }]
}, {
    timestamps: true
});
// Pre-save hook to hash password
userSchema.pre('save', async function (next) {
    if (!this.isModified('password'))
        return next();
    try {
        const salt = await bcryptjs_1.default.genSalt(10);
        this.password = await bcryptjs_1.default.hash(this.password, salt);
        next();
    }
    catch (error) {
        next(error);
    }
});
// Method to compare passwords
userSchema.methods.comparePassword = async function (candidatePassword) {
    try {
        return await bcryptjs_1.default.compare(candidatePassword, this.password);
    }
    catch (error) {
        return false;
    }
};
// Method to check if user has specific permission on a shared account
userSchema.methods.hasPermission = function (accountId, permission) {
    const sharedAccount = this.sharedAccounts?.find((acc) => acc.accountId.toString() === accountId);
    if (!sharedAccount)
        return false;
    // Admin permission includes all other permissions
    if (sharedAccount.permissions.includes('admin'))
        return true;
    // Check for specific permission
    return sharedAccount.permissions.includes(permission);
};
// Track user login
userSchema.methods.trackLogin = function (ipAddress, userAgent) {
    this.lastLogin = new Date();
    this.isActive = true;
    // Add to login history, limit to last 10 logins
    this.loginHistory.push({
        timestamp: new Date(),
        ipAddress,
        userAgent
    });
    // Keep only last 10 entries
    if (this.loginHistory.length > 10) {
        this.loginHistory = this.loginHistory.slice(-10);
    }
};
const User = mongoose_1.default.model('User', userSchema);
exports.default = User;
//# sourceMappingURL=User.js.map