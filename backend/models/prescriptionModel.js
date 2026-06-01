const pool = require('../config/db');

const Prescription = {
  async getAll(filters = {}) {
    let query = `
      SELECT pr.*, pt.full_name as patient_name, pt.patient_number, u.full_name as prescribed_by_name,
             m.name as medicine_name, m.category as medicine_category
      FROM prescriptions pr
      LEFT JOIN patients pt ON pr.patient_id = pt.id
      LEFT JOIN users u ON pr.prescribed_by = u.id
      LEFT JOIN medicines m ON pr.medicine_id = m.id
    `;

    const conditions = [];
    const params = [];

    if (filters.status) {
      conditions.push('pr.status = ?');
      params.push(filters.status);
    }
    if (filters.patient_id) {
      conditions.push('pr.patient_id = ?');
      params.push(filters.patient_id);
    }
    if (filters.medicine_id) {
      conditions.push('pr.medicine_id = ?');
      params.push(filters.medicine_id);
    }
    if (filters.start_date && filters.end_date) {
      conditions.push('pr.created_at BETWEEN ? AND ?');
      params.push(filters.start_date, filters.end_date);
    }

    if (conditions.length > 0) {
      query += ' WHERE ' + conditions.join(' AND ');
    }

    query += ' ORDER BY pr.created_at DESC';

    const [rows] = await pool.query(query, params);
    return rows;
  },

  async getById(id) {
    const [rows] = await pool.query(
      `SELECT pr.*, pt.full_name as patient_name, pt.patient_number, u.full_name as prescribed_by_name,
              m.name as medicine_name, m.category as medicine_category
       FROM prescriptions pr
       LEFT JOIN patients pt ON pr.patient_id = pt.id
       LEFT JOIN users u ON pr.prescribed_by = u.id
       LEFT JOIN medicines m ON pr.medicine_id = m.id
       WHERE pr.id = ?`,
      [id]
    );
    return rows[0];
  },

  async create(data) {
    const { patient_id, prescribed_by, medicine_id, quantity, unit_price, total_price, notes } = data;
    const [result] = await pool.query(
      `INSERT INTO prescriptions (patient_id, prescribed_by, medicine_id, quantity, unit_price, total_price, status, notes)
       VALUES (?, ?, ?, ?, ?, ?, 'pending', ?)`,
      [patient_id, prescribed_by, medicine_id, quantity, unit_price, total_price, notes || '']
    );
    return result.insertId;
  },

  async dispense(id) {
    await pool.query(
      `UPDATE prescriptions SET status = 'dispensed', dispensed_at = CURRENT_TIMESTAMP WHERE id = ?`,
      [id]
    );
    return true;
  }
};

module.exports = Prescription;
