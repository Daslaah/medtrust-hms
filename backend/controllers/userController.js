// filepath: backend/controllers/userController.js
const User = require('../models/userModel');

const UserController = {
  // Get all users
  async getAll(req, res) {
    try {
      const users = await User.getAll();
      res.json({
        success: true,
        data: users
      });
    } catch (error) {
      console.error('Get all users error:', error);
      res.status(500).json({ 
        success: false, 
        message: 'Kuna hitilafu katika mfumo' 
      });
    }
  },

  async getDoctors(req, res) {
    try {
      const doctors = await User.getDoctors();
      res.json({
        success: true,
        data: doctors
      });
    } catch (error) {
      console.error('Get doctors error:', error);
      res.status(500).json({
        success: false,
        message: 'Kuna hitilafu katika mfumo'
      });
    }
  },

  // Get user by ID
  async getById(req, res) {
    try {
      const user = await User.getById(req.params.id);
      
      if (!user) {
        return res.status(404).json({ 
          success: false, 
          message: 'User haepatikani' 
        });
      }

      res.json({
        success: true,
        data: user
      });
    } catch (error) {
      console.error('Get user error:', error);
      res.status(500).json({ 
        success: false, 
        message: 'Kuna hitilafu katika mfumo' 
      });
    }
  },

  // Create new user
  async create(req, res) {
    try {
      const { username, password, full_name, email, phone, role_id, specialty } = req.body;

      // Validation
      if (!username || !password || !full_name || !role_id) {
        return res.status(400).json({ 
          success: false, 
          message: 'Tafadhali jaza maeneo yote yanayohitajika' 
        });
      }

      const userId = await User.create({ 
        username, 
        password, 
        full_name, 
        email, 
        phone, 
        role_id,
        specialty
      });

      res.status(201).json({
        success: true,
        message: 'Mtumiaji ameundwa kwa mafanikio',
        data: { id: userId }
      });

    } catch (error) {
      console.error('Create user error:', error);
      if (error.code === 'ER_DUP_ENTRY') {
        return res.status(400).json({ 
          success: false, 
          message: 'Username hii tayari inatumika' 
        });
      }
      res.status(500).json({ 
        success: false, 
        message: 'Kuna hitilafu katika mfumo' 
      });
    }
  },

  // Update user
  async update(req, res) {
    try {
      const { full_name, email, phone, role_id, is_active, specialty } = req.body;
      const userId = req.params.id;

      await User.update(userId, { full_name, email, phone, role_id, is_active, specialty });

      res.json({
        success: true,
        message: 'Taarifa za mtumiaji zimebadilika'
      });

    } catch (error) {
      console.error('Update user error:', error);
      res.status(500).json({ 
        success: false, 
        message: 'Kuna hitilafu katika mfumo' 
      });
    }
  },

  // Delete user
  async delete(req, res) {
    try {
      const userId = req.params.id;

      // Prevent self-deletion
      if (parseInt(userId) === req.user.id) {
        return res.status(400).json({ 
          success: false, 
          message: 'Huwezi kujifuta mwenyewe' 
        });
      }

      await User.delete(userId);

      res.json({
        success: true,
        message: 'Mtumiaji amefutwa'
      });

    } catch (error) {
      console.error('Delete user error:', error);
      res.status(500).json({ 
        success: false, 
        message: 'Kuna hitilafu katika mfumo' 
      });
    }
  }
};

module.exports = UserController;