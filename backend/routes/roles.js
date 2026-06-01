// filepath: backend/routes/roles.js
const express = require('express');
const router = express.Router();
const Role = require('../models/roleModel');
const authMiddleware = require('../middleware/auth');
const { rbacMiddleware } = require('../middleware/rbac');

// All routes require authentication
router.use(authMiddleware);

// Get all roles
router.get('/', rbacMiddleware('admin', 'receptionist', 'doctor', 'lab', 'pharmacy'), async (req, res) => {
  try {
    const roles = await Role.getAll();
    res.json({
      success: true,
      data: roles
    });
  } catch (error) {
    console.error('Get roles error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Kuna hitilafu katika mfumo' 
    });
  }
});

module.exports = router;