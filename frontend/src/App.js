// filepath: frontend/src/App.js
import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import Layout from './components/Layout';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Patients from './pages/Patients';
import Billing from './pages/Billing';
import Appointments from './pages/Appointments';
import Lab from './pages/Lab';
import Pharmacy from './pages/Pharmacy';
import MedicalRecords from './pages/MedicalRecords';
import Reports from './pages/Reports';
import Inventory from './pages/Inventory';
import Users from './pages/Users';
// Protected Route Component
const ProtectedRoute = ({ children, allowedRoles }) => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
        <p>Inapakia...</p>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (allowedRoles && !allowedRoles.includes(user.role)) {
    return <Navigate to="/dashboard" replace />;
  }

  return <Layout>{children}</Layout>;
};

function App() {
  return (
    <Router>
      <AuthProvider>
        <Routes>
          {/* Public Routes */}
          <Route path="/login" element={<Login />} />
          
          {/* Protected Routes */}
          <Route 
            path="/dashboard" 
            element={
              <ProtectedRoute allowedRoles={['admin', 'receptionist', 'doctor', 'lab', 'pharmacy']}>
                <Dashboard />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/patients" 
            element={
              <ProtectedRoute allowedRoles={['admin', 'receptionist', 'doctor']}>
                <Patients />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/patients/new" 
            element={
              <ProtectedRoute allowedRoles={['admin', 'receptionist']}>
                <Patients />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/appointments" 
            element={
              <ProtectedRoute allowedRoles={['admin', 'doctor', 'receptionist']}>
                <Appointments />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/billing" 
            element={
              <ProtectedRoute allowedRoles={['admin', 'receptionist', 'pharmacy']}>
                <Billing />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/medical-records" 
            element={
              <ProtectedRoute allowedRoles={['admin', 'doctor']}>
                <MedicalRecords />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/lab" 
            element={
              <ProtectedRoute allowedRoles={['admin', 'lab']}>
                <Lab />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/pharmacy" 
            element={
              <ProtectedRoute allowedRoles={['admin', 'pharmacy']}>
                <Pharmacy />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/inventory" 
            element={
              <ProtectedRoute allowedRoles={['admin', 'pharmacy']}>
                <Inventory />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/reports" 
            element={
              <ProtectedRoute allowedRoles={['admin']}>
                <Reports />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/users" 
            element={
              <ProtectedRoute allowedRoles={['admin']}>
                <Users />
              </ProtectedRoute>
            } 
          />
          
          {/* Default redirect */}
          <Route path="*" element={<Navigate to="/login" replace />} />
        </Routes>
      </AuthProvider>
    </Router>
  );
}

export default App;