// filepath: frontend/src/pages/Login.js
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import './Login.css';

const Login = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const user = await login(username, password);
      // Redirect based on role
      switch (user.role) {
        case 'admin':
          navigate('/dashboard');
          break;
        case 'receptionist':
          navigate('/patients');
          break;
        case 'doctor':
          navigate('/appointments');
          break;
        case 'lab':
          navigate('/lab');
          break;
        case 'pharmacy':
          navigate('/pharmacy');
          break;
        default:
          navigate('/dashboard');
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Kuna hitilafu. Jaribu tena.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-container">
      <div className="login-box">
        <div className="login-header">
          <h1>🏥 MedTrust</h1>
          <p>Hospital Management System</p>
        </div>

        <form onSubmit={handleSubmit}>
          {error && <div className="error-message">{error}</div>}
          
          <div className="form-group">
            <label>Username</label>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="Ingiza username"
              required
            />
          </div>

          <div className="form-group">
            <label>Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Ingiza password"
              required
            />
          </div>

          <button type="submit" className="login-btn" disabled={loading}>
            {loading ? 'Inapakia...' : 'Ingia'}
          </button>
        </form>

        <div className="login-footer">
          <p>Default Account:</p>
          <code>Username: admin | Password: admin123</code>
        </div>
      </div>
    </div>
  );
};

export default Login;