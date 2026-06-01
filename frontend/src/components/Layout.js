// filepath: frontend/src/components/Layout.js
import React from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Layout = ({ children }) => {
  const { user, logout, hasRole } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const getPageTitle = () => {
    const path = location.pathname;
    if (path.includes('dashboard')) return 'Dashboard';
    if (path.includes('patients')) return 'Wagonjwa';
    if (path.includes('billing')) return 'Malipo';
    if (path.includes('appointments')) return 'Miadi';
    if (path.includes('lab')) return 'Maabara';
    if (path.includes('pharmacy')) return 'Pharmacy';
    if (path.includes('inventory')) return 'Inventory';
    if (path.includes('users')) return 'Watumiaji';
    if (path.includes('reports')) return 'Ripoti';
    return 'MedTrust HMS';
  };

  return (
    <div className="layout">
      {/* Sidebar */}
      <aside className="sidebar">
        <div className="sidebar-header">
          <h2>🏥 MedTrust</h2>
          <p>HMS</p>
        </div>
        
        <nav className="sidebar-nav">
          <Link to="/dashboard" className={location.pathname === '/dashboard' ? 'active' : ''}>
            📊 Dashboard
          </Link>
          
          {hasRole('receptionist', 'admin') && (
            <Link to="/patients" className={location.pathname.includes('/patients') ? 'active' : ''}>
              👥 Wagonjwa
            </Link>
          )}
          
          {hasRole('receptionist', 'admin', 'pharmacy') && (
            <Link to="/billing" className={location.pathname.includes('/billing') ? 'active' : ''}>
              💰 Malipo
            </Link>
          )}
          
          {hasRole('doctor', 'admin', 'receptionist') && (
            <Link to="/appointments" className={location.pathname.includes('/appointments') ? 'active' : ''}>
              📅 Miadi
            </Link>
          )}
          
          {hasRole('doctor', 'admin') && (
            <Link to="/medical-records" className={location.pathname.includes('/medical-records') ? 'active' : ''}>
              📋 Rekodu za Matibabu
            </Link>
          )}
          
          {hasRole('lab', 'admin') && (
            <Link to="/lab" className={location.pathname.includes('/lab') ? 'active' : ''}>
              🔬 Maabara
            </Link>
          )}
          
          {hasRole('pharmacy', 'admin') && (
            <Link to="/pharmacy" className={location.pathname.includes('/pharmacy') ? 'active' : ''}>
              💊 Pharmacy
            </Link>
          )}
          
          {hasRole('pharmacy', 'admin') && (
            <Link to="/inventory" className={location.pathname.includes('/inventory') ? 'active' : ''}>
              📦 Inventory
            </Link>
          )}
          
          {hasRole('admin') && (
            <Link to="/reports" className={location.pathname.includes('/reports') ? 'active' : ''}>
              📈 Ripoti
            </Link>
          )}
          
          {hasRole('admin') && (
            <Link to="/users" className={location.pathname.includes('/users') ? 'active' : ''}>
              👤 Watumiaji
            </Link>
          )}
        </nav>

        <div className="sidebar-footer">
          <div className="user-info">
            <p className="user-name">{user?.full_name}</p>
            <p className="user-role">{user?.role}</p>
          </div>
          <button onClick={handleLogout} className="logout-btn">
            🚪 Toka
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="main-content">
        <header className="header">
          <h1>{getPageTitle()}</h1>
          <div className="header-right">
            <span>Tarehe: {new Date().toLocaleDateString('sw-TZ')}</span>
          </div>
        </header>
        
        <div className="content">
          {children}
        </div>
      </main>
    </div>
  );
};

export default Layout;