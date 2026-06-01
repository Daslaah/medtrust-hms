// filepath: backend/controllers/authController.js
const jwt = require('jsonwebtoken');
const User = require('../models/userModel');

const JWT_SECRET = process.env.JWT_SECRET || 'medtrust_secret_key_2024';

const AuthController = {
  // Login
  async login(req, res) {
    try {
      const { username, password } = req.body;

      if (!username || !password) {
        return res.status(400).json({ 
          success: false, 
          message: 'Tafadhali ingiza username na password' 
        });
      }

      // Find user by username
      const user = await User.getByUsername(username);
      
      if (!user) {
        return res.status(401).json({ 
          success: false, 
          message: 'Username au password si sahihi' 
        });
      }

      if (!user.is_active) {
        return res.status(401).json({ 
          success: false, 
          message: 'Akaunti yako imefungwa. Wasiliana na Admin' 
        });
      }

      // Verify password
      const isValidPassword = await User.verifyPassword(password, user.password);
      
      if (!isValidPassword) {
        return res.status(401).json({ 
          success: false, 
          message: 'Username au password si sahihi' 
        });
      }

      // Generate JWT token
      const token = jwt.sign(
        { 
          id: user.id, 
          username: user.username, 
          role: user.role_name,
          role_id: user.role_id
        },
        JWT_SECRET,
        { expiresIn: '24h' }
      );

      // Return user info (without password)
      res.json({
        success: true,
        message: 'Login imefanikiwa',
        data: {
          token,
          user: {
            id: user.id,
            username: user.username,
            full_name: user.full_name,
            email: user.email,
            phone: user.phone,
            role: user.role_name,
            role_id: user.role_id
          }
        }
      });

    } catch (error) {
      console.error('Login error:', error);
      res.status(500).json({ 
        success: false, 
        message: 'Kuna hitilafu katika mfumo' 
      });
    }
  },

  // Get current user
  async getCurrentUser(req, res) {
    try {
      const user = await User.getById(req.user.id);
      
      if (!user) {
        return res.status(404).json({ 
          success: false, 
          message: 'User not found' 
        });
      }

      res.json({
        success: true,
        data: {
          id: user.id,
          username: user.username,
          full_name: user.full_name,
          email: user.email,
          phone: user.phone,
          role: user.role_name,
          role_id: user.role_id
        }
      });

    } catch (error) {
      console.error('Get current user error:', error);
      res.status(500).json({ 
        success: false, 
        message: 'Kuna hitilafu katika mfumo' 
      });
    }
  },

  // Change password
  async changePassword(req, res) {
    try {
      const { currentPassword, newPassword } = req.body;
      const userId = req.user.id;

      if (!currentPassword || !newPassword) {
        return res.status(400).json({ 
          success: false, 
          message: 'Tafadhali ingiza password ya sasa na mpya' 
        });
      }

      // Get current user
      const user = await User.getById(userId);
      if (!user) {
        return res.status(404).json({ success: false, message: 'Mtumiaji haepatikani' });
      }
      
      // Verify current password
      const isValidPassword = await User.verifyPassword(currentPassword, user.password);
      
      if (!isValidPassword) {
        return res.status(400).json({ 
          success: false, 
          message: 'Password ya sasa si sahihi' 
        });
      }

      // Update password
      await User.updatePassword(userId, newPassword);

      res.json({
        success: true,
        message: 'Password imebadilika kwa mafanikio'
      });

    } catch (error) {
      console.error('Change password error:', error);
      res.status(500).json({ 
        success: false, 
        message: 'Kuna hitilafu katika mfumo' 
      });
    }
  }
};

module.exports = AuthController;