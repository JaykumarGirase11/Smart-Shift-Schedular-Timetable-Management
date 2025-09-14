import express, { Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import User from '../models/User';
import Activity from '../models/Activity';

const router = express.Router();
const JWT_SECRET = process.env.JWT_SECRET || 'shift-scheduler-secret-key';

// Middleware to verify token for protected routes
export const verifyToken = async (req: Request, res: Response, next: Function) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ message: 'No token provided' });
    }
    
    const token = authHeader.split(' ')[1];
    const decoded = jwt.verify(token, JWT_SECRET) as { 
      id: string, 
      username: string, 
      email: string,
      isAccountHolder: boolean
    };
    
    // Update last activity
    await User.findByIdAndUpdate(decoded.id, { lastActivity: new Date() });
    
    // Add user to request
    (req as any).user = decoded;
    next();
  } catch (error) {
    console.error('Token verification error:', error);
    res.status(401).json({ message: 'Invalid or expired token' });
  }
};

// Register a new user - removed admin functionality completely
router.post('/register', async (req: Request, res: Response) => {
  try {
    const { username, email, password } = req.body;
    
    // Check if user already exists
    const existingUser = await User.findOne({ $or: [{ username }, { email }] });
    if (existingUser) {
      return res.status(400).json({ message: 'Username or email already exists' });
    }
    
    // Create new user - always create regular users only
    const user = new User({
      username,
      email,
      password,
      role: 'user', // Always create regular users
      isAccountHolder: false,
      sharedAccounts: [],
      cannotBeCancelled: false
    });
    
    await user.save();
    
    // Create token
    const token = jwt.sign(
      { 
        id: user._id, 
        username: user.username, 
        email: user.email, 
        role: user.role,
        isAccountHolder: user.isAccountHolder
      },
      JWT_SECRET,
      { expiresIn: '30d' }
    );
    
    // Log activity
    const activity = new Activity({
      userId: user._id,
      username: user.username,
      action: 'create',
      details: 'User account created',
      ipAddress: req.ip,
      userAgent: req.headers['user-agent']
    });
    await activity.save();
    
    // Return user without password and token
    const userResponse = {
      _id: user._id,
      username: user.username,
      email: user.email,
      role: user.role,
      isAccountHolder: user.isAccountHolder,
      sharedAccounts: user.sharedAccounts,
      lastActivity: user.lastActivity,
      createdAt: user.createdAt
    };
    
    res.status(201).json({
      message: 'User registered successfully',
      user: userResponse,
      token
    });
  } catch (error) {
    console.error('Register error:', error);
    res.status(500).json({ message: 'Server error during registration' });
  }
});

// Login user
router.post('/login', async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;
    
    // Check if user exists by email
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({ message: 'Invalid email or password' });
    }
    
    // Check password using the comparePassword method
    const isMatch = await (user as any).comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({ message: 'Invalid email or password' });
    }
    
    // Update last activity and set as active
    user.lastActivity = new Date();
    user.isActive = true;
    await user.save();
    
    // Create token with extended user info
    const token = jwt.sign(
      { 
        id: user._id, 
        username: user.username, 
        email: user.email, 
        role: user.role,
        isAccountHolder: user.isAccountHolder
      },
      JWT_SECRET,
      { expiresIn: '30d' }
    );
    
    // Log activity
    const activity = new Activity({
      userId: user._id,
      username: user.username,
      action: 'login',
      details: 'User logged in',
      ipAddress: req.ip,
      userAgent: req.headers['user-agent']
    });
    await activity.save();
    
    // Return user without password and token
    const userResponse = {
      _id: user._id,
      username: user.username,
      email: user.email,
      role: user.role,
      isAccountHolder: user.isAccountHolder,
      sharedAccounts: user.sharedAccounts || [],
      lastActivity: user.lastActivity
    };
    
    res.json({
      message: 'Login successful',
      user: userResponse,
      token
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ message: 'Server error during login' });
  }
});

// Logout user
router.post('/logout', async (req: Request, res: Response) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ message: 'Unauthorized' });
    }
    
    const token = authHeader.split(' ')[1];
    const decoded = jwt.verify(token, JWT_SECRET) as { 
      id: string, 
      username: string, 
      email: string 
    };
    
    // Update user as inactive
    const user = await User.findById(decoded.id);
    if (user) {
      user.isActive = false;
      await user.save();
      
      // Log activity
      const activity = new Activity({
        userId: user._id,
        username: user.username,
        action: 'logout',
        details: 'User logged out',
        ipAddress: req.ip,
        userAgent: req.headers['user-agent']
      });
      await activity.save();
    }
    
    res.json({ message: 'Logged out successfully' });
  } catch (error) {
    console.error('Logout error:', error);
    res.status(500).json({ message: 'Server error during logout' });
  }
});

// Verify token validity and return user info
router.get('/verify', verifyToken, async (req: Request, res: Response) => {
  try {
    // Use a properly typed user object from the request
    const userId = (req as any).user.id;
    const user = await User.findById(userId).select('-password');
    
    if (!user) {
      return res.status(404).json({ isValid: false, message: 'User not found' });
    }
    
    // Track user activity
    user.lastActivity = new Date();
    user.isActive = true;
    await user.save();
    
    res.json({
      isValid: true,
      user: {
        _id: user._id,
        username: user.username,
        email: user.email,
        role: user.role,
        isAccountHolder: user.isAccountHolder,
        sharedAccounts: user.sharedAccounts || [],
        lastActivity: user.lastActivity
      }
    });
  } catch (error) {
    console.error('Token verification error:', error);
    res.status(500).json({ isValid: false, message: 'Server error during verification' });
  }
});

export default router;