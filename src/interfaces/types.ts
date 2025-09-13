// User interface for authentication and user management
export interface User {
  _id: string;
  username: string;
  email: string;
  role: 'user'; // Removed admin role completely
  lastActivity: Date;
  isActive?: boolean;
  createdAt?: Date;
  updatedAt?: Date;
  isAccountHolder?: boolean;
  sharedAccounts?: string[];
  sharedBy?: string;
  canShareAccess?: boolean;
}

// Activity interface for tracking user actions in the system
export interface Activity {
  _id: string;
  userId: string;
  username: string;
  action: string;
  details: string;
  timestamp: Date;
}

// Authentication response interface
export interface AuthResponse {
  token: string;
  user: User;
}