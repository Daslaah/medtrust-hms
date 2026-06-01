// filepath: backend/models/roleModel.js
const pool = require('../config/db');

const Role = {
  // Get all roles
  async getAll() {
    const [rows] = await pool.query(`SELECT * FROM roles ORDER BY id`);
    return rows;
  },

  // Get role by ID
  async getById(id) {
    const [rows] = await pool.query(`SELECT * FROM roles WHERE id = ?`, [id]);
    return rows[0];
  },

  // Get role by name
  async getByName(name) {
    const [rows] = await pool.query(`SELECT * FROM roles WHERE name = ?`, [name]);
    return rows[0];
  }
};

module.exports = Role;