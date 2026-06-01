const pool = require('../config/db');

const MedicalRecord = {
  async getAll(filters = {}) {
    let query = `
      SELECT mr.*, 
             pt.full_name as patient_name, 
             pt.patient_number as patient_number,
             u.full_name as doctor_name
      FROM medical_records mr
      LEFT JOIN patients pt ON mr.patient_id = pt.id
      LEFT JOIN users u ON mr.doctor_id = u.id
    `;

    const conditions = [];
    const params = [];

    if (filters.patient_id) {
      conditions.push('mr.patient_id = ?');
      params.push(filters.patient_id);
    }
    if (filters.doctor_id) {
      conditions.push('mr.doctor_id = ?');
      params.push(filters.doctor_id);
    }

    if (conditions.length > 0) {
      query += ' WHERE ' + conditions.join(' AND ');
    }

    query += ' ORDER BY mr.created_at DESC';

    const [rows] = await pool.query(query, params);
    return rows;
  },

  async getById(id) {
    const [rows] = await pool.query(
      `SELECT mr.*, pt.full_name as patient_name, pt.patient_number as patient_number, u.full_name as doctor_name
       FROM medical_records mr
       LEFT JOIN patients pt ON mr.patient_id = pt.id
       LEFT JOIN users u ON mr.doctor_id = u.id
       WHERE mr.id = ?`,
      [id]
    );
    return rows[0];
  },

  async create(data) {
    const { patient_id, doctor_id, appointment_id, diagnosis, symptoms, prescription, notes } = data;
    const [result] = await pool.query(
      `INSERT INTO medical_records (patient_id, doctor_id, appointment_id, diagnosis, symptoms, prescription, notes)
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [patient_id, doctor_id, appointment_id || null, diagnosis, symptoms || '', prescription || '', notes || '']
    );
    return result.insertId;
  },

  async delete(id) {
    await pool.query(`DELETE FROM medical_records WHERE id = ?`, [id]);
    return true;
  }
};

module.exports = MedicalRecord;
