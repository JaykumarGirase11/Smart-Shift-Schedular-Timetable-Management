import React, { useState, useEffect } from 'react';
import axios, { AxiosResponse } from 'axios';

interface LoginProps {
  onLoginSuccess: (userData: any) => void;
}

// Auth response interface
interface AuthResponse {
  token: string;
  user: {
    _id: string;
    username: string;
    email: string;
    role: string;
    isAccountHolder?: boolean;
    [key: string]: any;
  };
}

// Password strength levels
interface PasswordStrength {
  value: number;
  label: string;
  color: string;
  feedback?: string; // Added feedback property
}

const Login: React.FC<LoginProps> = ({ onLoginSuccess }) => {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isAccountHolder, setIsAccountHolder] = useState(false);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [passwordStrength, setPasswordStrength] = useState<PasswordStrength>({
    value: 0,
    label: 'None',
    color: '#d3d3d3'
  });

  // Function to check password strength
  const checkPasswordStrength = (password: string) => {
    // Start with a base score
    let strength = 0;
    let label = 'None';
    let color = '#d3d3d3';
    let feedback = '';
    
    // Missing requirements tracking
    const missing = {
      length: password.length < 8,
      mixedCase: !(password.match(/[a-z]/) && password.match(/[A-Z]/)),
      numbers: !password.match(/\d/),
      special: !password.match(/[^a-zA-Z\d]/)
    };

    // If password is empty, return the default values
    if (password.length === 0) {
      setPasswordStrength({ value: strength, label, color });
      return;
    }

    // Check password length
    if (!missing.length) strength += 25;
    
    // Check for mixed case
    if (!missing.mixedCase) strength += 25;
    
    // Check for numbers
    if (!missing.numbers) strength += 25;
    
    // Check for special characters
    if (!missing.special) strength += 25;

    // Determine label and color based on strength
    if (strength <= 25) {
      label = 'Weak';
      color = '#ff4d4d'; // Red
    } else if (strength <= 50) {
      label = 'Fair';
      color = '#ffab00'; // Amber
    } else if (strength <= 75) {
      label = 'Good';
      color = '#4db8ff'; // Blue
    } else {
      label = 'Strong';
      color = '#00cc66'; // Green
    }

    // Generate specific feedback based on missing criteria
    if (strength < 100) {
      const missingItems = [];
      if (missing.length) missingItems.push('at least 8 characters');
      if (missing.mixedCase) missingItems.push('both uppercase and lowercase letters');
      if (missing.numbers) missingItems.push('numbers');
      if (missing.special) missingItems.push('special characters');
      
      if (missingItems.length > 0) {
        feedback = `Add ${missingItems.join(', ')} to improve strength.`;
      }
    } else {
      feedback = 'Excellent password!';
    }

    setPasswordStrength({ value: strength, label, color, feedback });
  };

  // Update password strength when password changes
  useEffect(() => {
    checkPasswordStrength(password);
  }, [password]);

  // Check if user is already logged in as account holder
  useEffect(() => {
    const checkAccountHolder = async () => {
      const token = localStorage.getItem('token');
      const userData = localStorage.getItem('user');
      
      if (token && userData) {
        try {
          // Verify token is valid - this will automatically bypass for account holders
          const response = await axios.get('http://localhost:5000/api/auth/verify', {
            headers: { Authorization: `Bearer ${token}` }
          });
          
          if (response.data.isValid) {
            const user = JSON.parse(userData);
            // Auto login for all users with valid tokens, but set account holder flag if applicable
            if (user.isAccountHolder) {
              setIsAccountHolder(true);
            }
            // Automatic login for anyone with a valid token
            onLoginSuccess(user);
          }
        } catch (err) {
          console.log("Token verification failed, please log in again");
          // Token invalid, clear storage
          localStorage.removeItem('token');
          localStorage.removeItem('user');
        }
      }
    };
    
    checkAccountHolder();
  }, [onLoginSuccess]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email || !password) {
      setError('Please fill in all fields');
      return;
    }
    
    setIsLoading(true);
    setError('');
    setSuccessMessage('');
    
    try {
      let response: AxiosResponse<AuthResponse>;
      
      if (isLogin) {
        // Login request - use email for login
        response = await axios.post('http://localhost:5000/api/auth/login', {
          email,
          password
        });
        
        setSuccessMessage('Login successful! Redirecting...');
      } else {
        // Register request - fix error handling and response type
        try {
          response = await axios.post('http://localhost:5000/api/auth/register', {
            username: email.split('@')[0], // Create username from email (before @)
            email,
            password,
            role: 'user', // Default role for new registrations
            isAccountHolder: false // New users are not account holders by default
          });
          
          setSuccessMessage('Account created successfully! Logging you in...');
        } catch (registerError: any) {
          // Handle specific registration errors
          if (registerError.response?.status === 400) {
            throw new Error(registerError.response.data.message || 'Email already exists. Please use a different email.');
          }
          throw registerError;
        }
        
        // After successful registration, automatically log in if needed
        if (!response.data.token) {
          response = await axios.post('http://localhost:5000/api/auth/login', {
            email,
            password
          });
        }
      }
      
      if (response.data.token) {
        localStorage.setItem('token', response.data.token);
        localStorage.setItem('user', JSON.stringify(response.data.user));
        
        // Give the user a moment to see the success message
        setTimeout(() => {
          onLoginSuccess(response.data.user);
        }, 1500);
      }
    } catch (err: any) {
      console.error('Auth error:', err);
      setError(err.message || 'An error occurred during authentication. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  // Auto-login for account holders - keep this for potential loading display
  if (isAccountHolder) {
    return (
      <div className="auto-login-container" style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        minHeight: '100vh',
        backgroundColor: '#f5f5f5'
      }}>
        <div style={{
          backgroundColor: 'white',
          padding: '40px',
          borderRadius: '10px',
          boxShadow: '0 4px 20px rgba(0,0,0,0.1)',
          width: '100%',
          maxWidth: '400px',
          textAlign: 'center'
        }}>
          <h2 style={{ color: '#4CAF50', marginBottom: '20px' }}>Welcome Back!</h2>
          <p>You're logged in as an account holder. Redirecting...</p>
          <div className="loader" style={{ 
            margin: '20px auto',
            border: '5px solid #f3f3f3',
            borderTop: '5px solid #4CAF50',
            borderRadius: '50%',
            width: '30px',
            height: '30px',
            animation: 'spin 2s linear infinite'
          }}></div>
          <style>{`
            @keyframes spin {
              0% { transform: rotate(0deg); }
              100% { transform: rotate(360deg); }
            }
          `}</style>
        </div>
      </div>
    );
  }

  return (
    <div className="login-container" style={{
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      minHeight: '100vh',
      backgroundColor: '#f5f5f5'
    }}>
      <div className="login-form" style={{
        backgroundColor: 'white',
        padding: '40px',
        borderRadius: '10px',
        boxShadow: '0 4px 20px rgba(0,0,0,0.1)',
        width: '100%',
        maxWidth: '400px'
      }}>
        <h2 style={{ textAlign: 'center', marginBottom: '30px', color: '#4CAF50' }}>
          {isLogin ? 'Login to Shift Scheduler' : 'Create New Account'}
        </h2>
        
        {error && (
          <div style={{
            padding: '10px',
            marginBottom: '20px',
            backgroundColor: '#ffebee',
            color: '#d32f2f',
            borderRadius: '5px',
            fontSize: '14px'
          }}>
            {error}
          </div>
        )}
        
        {successMessage && (
          <div style={{
            padding: '10px',
            marginBottom: '20px',
            backgroundColor: '#e8f5e9',
            color: '#4CAF50',
            borderRadius: '5px',
            fontSize: '14px'
          }}>
            {successMessage}
          </div>
        )}
        
        <form onSubmit={handleSubmit}>
          <div style={{ marginBottom: '20px' }}>
            <label htmlFor="email" style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>
              Email
            </label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Enter your email"
              style={{
                width: '100%',
                padding: '12px',
                border: '1px solid #ddd',
                borderRadius: '5px',
                fontSize: '16px'
              }}
              disabled={isLoading}
            />
          </div>
          
          <div style={{ marginBottom: !isLogin ? '10px' : '30px' }}>
            <label htmlFor="password" style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>
              Password
            </label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter your password"
              style={{
                width: '100%',
                padding: '12px',
                border: '1px solid #ddd',
                borderRadius: '5px',
                fontSize: '16px'
              }}
              disabled={isLoading}
            />
          </div>
          
          {!isLogin && password.length > 0 && (
            <div style={{ marginBottom: '30px' }}>
              <div style={{ display: 'flex', alignItems: 'center', marginTop: '5px' }}>
                <div style={{ 
                  flex: 1, 
                  height: '5px', 
                  backgroundColor: '#e0e0e0',
                  borderRadius: '5px',
                  position: 'relative'
                }}>
                  <div style={{
                    width: `${passwordStrength.value}%`,
                    height: '100%',
                    backgroundColor: passwordStrength.color,
                    borderRadius: '5px',
                    transition: 'width 0.3s'
                  }}></div>
                </div>
                <span style={{ 
                  marginLeft: '10px', 
                  color: passwordStrength.color,
                  fontWeight: 'bold',
                  fontSize: '14px'
                }}>
                  {passwordStrength.label}
                </span>
              </div>
              <p style={{ fontSize: '12px', marginTop: '5px', color: '#666' }}>
                Strong passwords include a mix of uppercase, lowercase, numbers, and special characters.
              </p>
              {passwordStrength.feedback && (
                <p style={{ 
                  fontSize: '12px', 
                  marginTop: '5px', 
                  color: passwordStrength.color, 
                  fontStyle: 'italic'
                }}>
                  {passwordStrength.feedback}
                </p>
              )}
            </div>
          )}
          
          <button
            type="submit"
            disabled={isLoading}
            style={{
              width: '100%',
              padding: '14px',
              backgroundColor: '#4CAF50',
              color: 'white',
              border: 'none',
              borderRadius: '5px',
              fontSize: '16px',
              fontWeight: 'bold',
              cursor: isLoading ? 'not-allowed' : 'pointer',
              opacity: isLoading ? 0.7 : 1
            }}
          >
            {isLoading ? 'Please wait...' : isLogin ? 'Login' : 'Create Account'}
          </button>
        </form>
        
        <div style={{ marginTop: '20px', textAlign: 'center' }}>
          <button
            onClick={() => setIsLogin(!isLogin)}
            disabled={isLoading}
            style={{
              background: 'none',
              border: 'none',
              color: '#2196F3',
              cursor: isLoading ? 'not-allowed' : 'pointer',
              textDecoration: 'underline',
              fontSize: '14px',
              opacity: isLoading ? 0.7 : 1
            }}
          >
            {isLogin ? "Don't have an account? Register now" : "Already have an account? Login"}
          </button>
        </div>
        
        <div style={{ marginTop: '15px', textAlign: 'center' }}>
          <button
            onClick={() => {
              const demoEmail = "admin@example.com";
              const demoPassword = "admin123";
              setEmail(demoEmail);
              setPassword(demoPassword);
              setError('');
              setSuccessMessage('Demo credentials filled. Click Login to continue.');
            }}
            style={{
              background: 'none',
              border: 'none',
              color: '#FF9800',
              cursor: 'pointer',
              textDecoration: 'underline',
              fontSize: '14px'
            }}
          >
            Try Demo Account
          </button>
        </div>
      </div>
    </div>
  );
};

export default Login;