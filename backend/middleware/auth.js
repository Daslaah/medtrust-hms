// filepath: backend/middleware/auth.js
const jwt = require('jsonwebtoken');

const JWT_SECRET = process.env.JWT_SECRET || 'medtrust_secret_key_2024';

// Verify JWT token
const authMiddleware = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ 
        success: false, 
        message: 'Token haipo. Tafadhali ingia mara moja' 
      });
    }

    const token = authHeader.split(' ')[1];
    
    // Verify token
    const decoded = jwt.verify(token, JWT_SECRET);
    
    // Add user info to request
    req.user = {
      id: decoded.id,
      username: decoded.username,
      role: decoded.role,
      role_id: decoded.role_id
    };

    next();

  } catch (error) {
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({ 
        success: false, 
        message: 'Token imeisha. Tafadhali ingia tena' 
      });
    }
    return res.status(401).json({ 
      success: false, 
      message: 'Token si sahihi' 
    });
  }
};

module.exports = authMiddleware;