import React, { useState, useEffect } from 'react';
import axios from 'axios';

// Define the types directly in this file to bypass the module resolution issue
interface User {
  _id: string;
  username: string;
  email: string;
  role: 'admin' | 'user';
  lastActivity: Date;
  isActive?: boolean;
  createdAt?: Date;
  updatedAt?: Date;
  isAccountHolder?: boolean;
  sharedAccounts?: string[];
  sharedBy?: string;
  canShareAccess?: boolean;
}

interface Activity {
  _id: string;
  userId: string;
  username: string;
  action: string;
  details: string;
  timestamp: Date;
}

interface AdminDashboardProps {
  currentUser: User;
}

const AdminDashboard: React.FC<AdminDashboardProps> = ({ currentUser }) => {
  const [users, setUsers] = useState<User[]>([]);
  const [activeUsers, setActiveUsers] = useState<User[]>([]);
  const [activities, setActivities] = useState<Activity[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchAdminData = async () => {
      if (currentUser.role !== 'admin') {
        setError('You do not have permission to access this page');
        setIsLoading(false);
        return;
      }

      setIsLoading(true);
      setError('');

      try {
        // Fetch all users
        const usersResponse = await axios.get('http://localhost:5000/api/users', {
          headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
        });
        
        // Fetch active users (those currently logged in)
        const activeUsersResponse = await axios.get('http://localhost:5000/api/users/active', {
          headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
        });
        
        // Fetch recent activities
        const activitiesResponse = await axios.get('http://localhost:5000/api/activities', {
          headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
        });

        setUsers(usersResponse.data);
        setActiveUsers(activeUsersResponse.data);
        setActivities(activitiesResponse.data);
      } catch (err: any) {
        setError('Failed to load admin data: ' + (err.response?.data?.message || err.message));
      } finally {
        setIsLoading(false);
      }
    };

    fetchAdminData();
    
    // Set up interval to refresh active users every 30 seconds
    const interval = setInterval(() => {
      axios.get('http://localhost:5000/api/users/active', {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      })
      .then(response => {
        setActiveUsers(response.data);
      })
      .catch(err => {
        console.error('Failed to refresh active users:', err);
      });
    }, 30000);

    return () => clearInterval(interval);
  }, [currentUser]);

  if (isLoading) {
    return <div className="loading">Loading admin dashboard...</div>;
  }

  if (error) {
    return <div className="error">{error}</div>;
  }

  return (
    <div className="admin-dashboard" style={{ padding: '20px', maxWidth: '1200px', margin: '0 auto' }}>
      <h1 style={{ marginBottom: '20px', color: '#2196F3' }}>Admin Dashboard</h1>
      
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
        {/* Active Users Panel */}
        <div style={{ 
          backgroundColor: 'white', 
          borderRadius: '10px', 
          padding: '20px', 
          boxShadow: '0 2px 10px rgba(0,0,0,0.1)'
        }}>
          <h2 style={{ borderBottom: '2px solid #4CAF50', paddingBottom: '10px', color: '#4CAF50' }}>
            Currently Active Users ({activeUsers.length})
          </h2>
          
          <div className="user-list" style={{ marginTop: '20px' }}>
            {activeUsers.length === 0 ? (
              <p>No users currently active</p>
            ) : (
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                  <tr>
                    <th style={{ textAlign: 'left', padding: '10px', borderBottom: '1px solid #eee' }}>Username</th>
                    <th style={{ textAlign: 'left', padding: '10px', borderBottom: '1px solid #eee' }}>Role</th>
                    <th style={{ textAlign: 'left', padding: '10px', borderBottom: '1px solid #eee' }}>Last Activity</th>
                  </tr>
                </thead>
                <tbody>
                  {activeUsers.map(user => (
                    <tr key={user._id}>
                      <td style={{ padding: '10px', borderBottom: '1px solid #eee' }}>
                        {user.username}
                        {user.username === currentUser.username && (
                          <span style={{ marginLeft: '5px', color: '#888', fontSize: '12px' }}>(you)</span>
                        )}
                      </td>
                      <td style={{ padding: '10px', borderBottom: '1px solid #eee' }}>
                        <span style={{ 
                          backgroundColor: user.role === 'admin' ? '#2196F3' : '#4CAF50',
                          color: 'white',
                          padding: '3px 8px',
                          borderRadius: '12px',
                          fontSize: '12px'
                        }}>
                          {user.role}
                        </span>
                      </td>
                      <td style={{ padding: '10px', borderBottom: '1px solid #eee' }}>
                        {new Date(user.lastActivity).toLocaleString()}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>
        
        {/* All Users Panel */}
        <div style={{ 
          backgroundColor: 'white', 
          borderRadius: '10px', 
          padding: '20px', 
          boxShadow: '0 2px 10px rgba(0,0,0,0.1)'
        }}>
          <h2 style={{ borderBottom: '2px solid #2196F3', paddingBottom: '10px', color: '#2196F3' }}>
            All Registered Users ({users.length})
          </h2>
          
          <div className="user-list" style={{ marginTop: '20px', maxHeight: '300px', overflowY: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead style={{ position: 'sticky', top: 0, backgroundColor: 'white' }}>
                <tr>
                  <th style={{ textAlign: 'left', padding: '10px', borderBottom: '1px solid #eee' }}>Username</th>
                  <th style={{ textAlign: 'left', padding: '10px', borderBottom: '1px solid #eee' }}>Email</th>
                  <th style={{ textAlign: 'left', padding: '10px', borderBottom: '1px solid #eee' }}>Role</th>
                  <th style={{ textAlign: 'left', padding: '10px', borderBottom: '1px solid #eee' }}>Status</th>
                </tr>
              </thead>
              <tbody>
                {users.map(user => (
                  <tr key={user._id}>
                    <td style={{ padding: '10px', borderBottom: '1px solid #eee' }}>{user.username}</td>
                    <td style={{ padding: '10px', borderBottom: '1px solid #eee' }}>{user.email}</td>
                    <td style={{ padding: '10px', borderBottom: '1px solid #eee' }}>
                      <span style={{ 
                        backgroundColor: user.role === 'admin' ? '#2196F3' : '#4CAF50',
                        color: 'white',
                        padding: '3px 8px',
                        borderRadius: '12px',
                        fontSize: '12px'
                      }}>
                        {user.role}
                      </span>
                    </td>
                    <td style={{ padding: '10px', borderBottom: '1px solid #eee' }}>
                      <span style={{ 
                        backgroundColor: activeUsers.some(active => active._id === user._id) ? '#4CAF50' : '#9e9e9e',
                        color: 'white',
                        padding: '3px 8px',
                        borderRadius: '12px',
                        fontSize: '12px'
                      }}>
                        {activeUsers.some(active => active._id === user._id) ? 'Online' : 'Offline'}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
      
      {/* Recent Activities Panel */}
      <div style={{ 
        backgroundColor: 'white', 
        borderRadius: '10px', 
        padding: '20px', 
        boxShadow: '0 2px 10px rgba(0,0,0,0.1)',
        marginTop: '20px'
      }}>
        <h2 style={{ borderBottom: '2px solid #FF9800', paddingBottom: '10px', color: '#FF9800' }}>
          Recent Activities
        </h2>
        
        <div className="activity-list" style={{ marginTop: '20px', maxHeight: '300px', overflowY: 'auto' }}>
          {activities.length === 0 ? (
            <p>No recent activities</p>
          ) : (
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead style={{ position: 'sticky', top: 0, backgroundColor: 'white' }}>
                <tr>
                  <th style={{ textAlign: 'left', padding: '10px', borderBottom: '1px solid #eee' }}>User</th>
                  <th style={{ textAlign: 'left', padding: '10px', borderBottom: '1px solid #eee' }}>Action</th>
                  <th style={{ textAlign: 'left', padding: '10px', borderBottom: '1px solid #eee' }}>Details</th>
                  <th style={{ textAlign: 'left', padding: '10px', borderBottom: '1px solid #eee' }}>Timestamp</th>
                </tr>
              </thead>
              <tbody>
                {activities.map(activity => (
                  <tr key={activity._id}>
                    <td style={{ padding: '10px', borderBottom: '1px solid #eee' }}>{activity.username}</td>
                    <td style={{ padding: '10px', borderBottom: '1px solid #eee' }}>
                      <span style={{ 
                        backgroundColor: getActionColor(activity.action),
                        color: 'white',
                        padding: '3px 8px',
                        borderRadius: '12px',
                        fontSize: '12px'
                      }}>
                        {activity.action}
                      </span>
                    </td>
                    <td style={{ padding: '10px', borderBottom: '1px solid #eee' }}>{activity.details}</td>
                    <td style={{ padding: '10px', borderBottom: '1px solid #eee' }}>
                      {new Date(activity.timestamp).toLocaleString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
};

// Helper function to get color for different activity types
const getActionColor = (action: string): string => {
  switch (action.toLowerCase()) {
    case 'login':
      return '#4CAF50'; // Green
    case 'logout':
      return '#FF5722'; // Orange
    case 'create':
      return '#2196F3'; // Blue
    case 'update':
      return '#9C27B0'; // Purple
    case 'delete':
      return '#F44336'; // Red
    default:
      return '#607D8B'; // Blue-grey
  }
};

export default AdminDashboard;