import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

// Shared account schema for account sharing functionality
const sharedAccountSchema = new mongoose.Schema({
  accountId: {
    type: mongoose.Schema.Types.ObjectId,
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
const userSchema = new mongoose.Schema({
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
    enum: ['user'], // Removed admin role completely
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
userSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();
  
  try {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error: any) {
    next(error);
  }
});

// Method to compare passwords
userSchema.methods.comparePassword = async function(candidatePassword: string): Promise<boolean> {
  try {
    return await bcrypt.compare(candidatePassword, this.password);
  } catch (error) {
    return false;
  }
};

// Method to check if user has specific permission on a shared account
userSchema.methods.hasPermission = function(accountId: string, permission: string): boolean {
  const sharedAccount = this.sharedAccounts?.find((acc: any) => 
    acc.accountId.toString() === accountId
  );
  
  if (!sharedAccount) return false;
  
  // Admin permission includes all other permissions
  if (sharedAccount.permissions.includes('admin')) return true;
  
  // Check for specific permission
  return sharedAccount.permissions.includes(permission);
};

// Track user login
userSchema.methods.trackLogin = function(ipAddress: string, userAgent: string) {
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

const User = mongoose.model('User', userSchema);

export default User;