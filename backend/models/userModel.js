// filepath: backend/models/userModel.js
const pool = require('../config/db');
const bcrypt = require('bcryptjs');

const User = {
  // Get all users
  async getAll() {
    const [rows] = await pool.query(
      `SELECT u.id, u.username, u.full_name, u.email, u.phone, u.specialty, u.is_active, u.created_at, r.name as role_name, r.id as role_id 
       FROM users u 
       JOIN roles r ON u.role_id = r.id 
       ORDER BY u.created_at DESC`
    );
    return rows;
  },

  async getDoctors() {
    const [rows] = await pool.query(
      `SELECT u.id, u.username, u.full_name, u.email, u.phone, u.specialty, u.is_active, u.created_at, r.name as role_name, r.id as role_id
       FROM users u
       JOIN roles r ON u.role_id = r.id
       WHERE r.name = 'doctor'
       ORDER BY u.full_name ASC`
    );
    return rows;
  },

  // Get user by ID
  async getById(id) {
    const [rows] = await pool.query(
      `SELECT u.id, u.username, u.full_name, u.email, u.phone, u.specialty, u.is_active, u.created_at, r.name as role_name, r.id as role_id 
       FROM users u 
       JOIN roles r ON u.role_id = r.id 
       WHERE u.id = ?`,
      [id]
    );
    return rows[0];
  },

  // Get user by username
  async getByUsername(username) {
    const [rows] = await pool.query(
      `SELECT u.*, r.name as role_name 
       FROM users u 
       JOIN roles r ON u.role_id = r.id 
       WHERE u.username = ?`,
      [username]
    );
    return rows[0];
  },

  // Create new user
  async create(userData) {
    const { username, password, full_name, email, phone, role_id, specialty } = userData;
    const hashedPassword = await bcrypt.hash(password, 10);
    
    const [result] = await pool.query(
      `INSERT INTO users (username, password, full_name, email, phone, role_id, specialty) 
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [username, hashedPassword, full_name, email, phone, role_id, specialty || null]
    );
    return result.insertId;
  },

  // Update user
  async update(id, userData) {
    const { full_name, email, phone, role_id, is_active, specialty } = userData;
    
    await pool.query(
      `UPDATE users SET full_name = ?, email = ?, phone = ?, role_id = ?, is_active = ?, specialty = ? 
       WHERE id = ?`,
      [full_name, email, phone, role_id, is_active, specialty || null, id]
    );
    return true;
  },

  // Update password
  async updatePassword(id, newPassword) {
    const hashedPassword = await bcrypt.hash(newPassword, 10);
    await pool.query(`UPDATE users SET password = ? WHERE id = ?`, [hashedPassword, id]);
    return true;
  },

  // Delete user
  async delete(id) {
    await pool.query(`DELETE FROM users WHERE id = ?`, [id]);
    return true;
  },

  // Verify password
  async verifyPassword(plainPassword, hashedPassword) {
    return await bcrypt.compare(plainPassword, hashedPassword);
  }
};

module.exports = User;