// filepath: frontend/src/pages/Dashboard.js
import React from 'react';
import { useAuth } from '../context/AuthContext';
import './Dashboard.css';

const Dashboard = () => {
  const { user, hasRole } = useAuth();

  const getStats = () => {
    const stats = [];
    
    if (hasRole('admin', 'receptionist')) {
      stats.push({ label: 'Wagonjwa leo', value: '45', icon: '👥', color: '#667eea' });
    }
    if (hasRole('admin', 'doctor')) {
      stats.push({ label: 'Miadi leo', value: '23', icon: '📅', color: '#764ba2' });
    }
    if (hasRole('admin', 'lab')) {
      stats.push({ label: 'Vipimo vimesubmit', value: '12', icon: '🔬', color: '#f59e0b' });
    }
    if (hasRole('admin', 'pharmacy')) {
      stats.push({ label: 'Dawa zimetolewa', value: '67', icon: '💊', color: '#10b981' });
    }
    if (hasRole('admin')) {
      stats.push({ label: 'Jumla ya Watumiaji', value: '8', icon: '👤', color: '#6366f1' });
    }
    
    return stats;
  };

  const getQuickActions = () => {
    const actions = [];
    
    if (hasRole('receptionist', 'admin')) {
      actions.push({ label: 'Sajili Mgonjwa', path: '/patients/new', icon: '➕' });
    }
    if (hasRole('doctor', 'admin', 'receptionist')) {
      actions.push({ label: 'Tazama Miadi', path: '/appointments', icon: '📋' });
    }
    if (hasRole('lab', 'admin')) {
      actions.push({ label: 'Vipimo vipya', path: '/lab', icon: '🔍' });
    }
    if (hasRole('pharmacy', 'admin')) {
      actions.push({ label: 'Toa Dawa', path: '/pharmacy', icon: '💊' });
    }
    if (hasRole('admin')) {
      actions.push({ label: 'Ripoti', path: '/reports', icon: '📊' });
    }
    
    return actions;
  };

  return (
    <div className="dashboard">
      <div className="welcome-section">
        <h2>🙂 Habari, {user?.full_name}!</h2>
        <p>Karibu kwenye MedTrust Hospital Management System</p>
      </div>

      <div className="stats-grid">
        {getStats().map((stat, index) => (
          <div key={index} className="stat-card" style={{ borderLeftColor: stat.color }}>
            <div className="stat-icon">{stat.icon}</div>
            <div className="stat-info">
              <h3>{stat.value}</h3>
              <p>{stat.label}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="quick-actions">
        <h3>⚡ Vitendo vya Haraka</h3>
        <div className="actions-grid">
          {getQuickActions().map((action, index) => (
            <a key={index} href={action.path} className="action-card">
              <span className="action-icon">{action.icon}</span>
              <span>{action.label}</span>
            </a>
          ))}
        </div>
      </div>

      <div className="info-section">
        <div className="info-card">
          <h4>ℹ️ Taarifa za Mtumiaji</h4>
          <ul>
            <li><strong>Jina:</strong> {user?.full_name}</li>
            <li><strong>Role:</strong> {user?.role}</li>
            <li><strong>Username:</strong> {user?.username}</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;