// filepath: backend/routes/auth.js
const express = require('express');
const router = express.Router();
const AuthController = require('../controllers/authController');
const authMiddleware = require('../middleware/auth');

// Public routes
router.post('/login', AuthController.login);

// Protected routes (require authentication)
router.get('/me', authMiddleware, AuthController.getCurrentUser);
router.post('/change-password', authMiddleware, AuthController.changePassword);

module.exports = router;