const pool = require('../config/db');

const LabTest = {
  async getAll(filters = {}) {
    let query = `
      SELECT lt.*, 
             pt.full_name as patient_name, 
             pt.patient_number as patient_number,
             u.full_name as doctor_name
      FROM lab_tests lt
      LEFT JOIN patients pt ON lt.patient_id = pt.id
      LEFT JOIN users u ON lt.doctor_id = u.id
    `;

    const conditions = [];
    const params = [];

    if (filters.patient_id) {
      conditions.push('lt.patient_id = ?');
      params.push(filters.patient_id);
    }
    if (filters.status) {
      conditions.push('lt.status = ?');
      params.push(filters.status);
    }

    if (conditions.length > 0) {
      query += ' WHERE ' + conditions.join(' AND ');
    }

    query += ' ORDER BY lt.test_date DESC, lt.id DESC';

    const [rows] = await pool.query(query, params);
    return rows;
  },

  async getById(id) {
    const [rows] = await pool.query(
      `SELECT lt.*, pt.full_name as patient_name, pt.patient_number as patient_number, u.full_name as doctor_name
       FROM lab_tests lt
       LEFT JOIN patients pt ON lt.patient_id = pt.id
       LEFT JOIN users u ON lt.doctor_id = u.id
       WHERE lt.id = ?`,
      [id]
    );
    return rows[0];
  },

  async create(data) {
    const { patient_id, doctor_id, test_type, test_date, notes } = data;
    const [result] = await pool.query(
      `INSERT INTO lab_tests (patient_id, doctor_id, test_type, test_date, status, notes)
       VALUES (?, ?, ?, ?, 'pending', ?)`,
      [patient_id, doctor_id, test_type, test_date || new Date(), notes || '']
    );
    return result.insertId;
  },

  async update(id, data) {
    const { results, status, notes } = data;
    await pool.query(
      `UPDATE lab_tests SET results = ?, status = ?, notes = ? WHERE id = ?`,
      [results || null, status || 'completed', notes || null, id]
    );
    return true;
  }
};

module.exports = LabTest;
