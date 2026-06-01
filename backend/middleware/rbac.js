// filepath: backend/middleware/rbac.js
const Role = require('../models/roleModel');

// Role-Based Access Control middleware
const rbacMiddleware = (...allowedRoles) => {
  return async (req, res, next) => {
    try {
      const userRole = req.user.role;

      // Check if user's role is allowed
      if (!allowedRoles.includes(userRole)) {
        return res.status(403).json({ 
          success: false, 
          message: 'Huna ruhusa ya kufanya kitendo hiki' 
        });
      }

      next();

    } catch (error) {
      console.error('RBAC error:', error);
      return res.status(500).json({ 
        success: false, 
        message: 'Kuna hitilafu katika mfumo' 
      });
    }
  };
};

// Helper function to check permissions
const checkPermission = (userRole, requiredRole) => {
  const roleHierarchy = {
    'admin': 5,
    'doctor': 4,
    'lab': 3,
    'pharmacy': 2,
    'receptionist': 1
  };

  return roleHierarchy[userRole] >= roleHierarchy[requiredRole];
};

module.exports = { rbacMiddleware, checkPermission };