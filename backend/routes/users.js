// filepath: backend/routes/users.js
const express = require('express');
const router = express.Router();
const UserController = require('../controllers/userController');
const authMiddleware = require('../middleware/auth');
const { rbacMiddleware } = require('../middleware/rbac');

// All routes require authentication
router.use(authMiddleware);

// Admin only routes
router.get('/doctors', rbacMiddleware('admin', 'receptionist', 'doctor'), UserController.getDoctors);
router.get('/', rbacMiddleware('admin'), UserController.getAll);
router.get('/:id', rbacMiddleware('admin', 'receptionist', 'doctor', 'lab', 'pharmacy'), UserController.getById);
router.post('/', rbacMiddleware('admin'), UserController.create);
router.put('/:id', rbacMiddleware('admin'), UserController.update);
router.delete('/:id', rbacMiddleware('admin'), UserController.delete);

module.exports = router;