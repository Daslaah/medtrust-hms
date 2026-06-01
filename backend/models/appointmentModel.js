const pool = require('../config/db');

const Appointment = {
  async getAll(filters = {}) {
    let query = `
      SELECT a.*, 
             pt.full_name as patient_name, 
             pt.patient_number as patient_number,
             u.full_name as doctor_name,
             u.role_id as doctor_role_id
      FROM appointments a
      LEFT JOIN patients pt ON a.patient_id = pt.id
      LEFT JOIN users u ON a.doctor_id = u.id
    `;

    const conditions = [];
    const params = [];

    if (filters.doctor_id) {
      conditions.push('a.doctor_id = ?');
      params.push(filters.doctor_id);
    }

    if (filters.patient_id) {
      conditions.push('a.patient_id = ?');
      params.push(filters.patient_id);
    }

    if (conditions.length > 0) {
      query += ' WHERE ' + conditions.join(' AND ');
    }

    query += ' ORDER BY a.appointment_date DESC, a.appointment_time DESC';

    const [rows] = await pool.query(query, params);
    return rows;
  },

  async getById(id) {
    const [rows] = await pool.query(
      `SELECT a.*, 
              pt.full_name as patient_name, 
              pt.patient_number as patient_number,
              u.full_name as doctor_name
       FROM appointments a
       LEFT JOIN patients pt ON a.patient_id = pt.id
       LEFT JOIN users u ON a.doctor_id = u.id
       WHERE a.id = ?`,
      [id]
    );
    return rows[0];
  },

  async create(data) {
    const { patient_id, doctor_id, appointment_date, appointment_time, notes, status } = data;
    const [result] = await pool.query(
      `INSERT INTO appointments (patient_id, doctor_id, appointment_date, appointment_time, notes, status) 
       VALUES (?, ?, ?, ?, ?, ?)`,
      [patient_id, doctor_id, appointment_date, appointment_time, notes || '', status || 'scheduled']
    );
    return result.insertId;
  },

  async update(id, data) {
    const { patient_id, doctor_id, appointment_date, appointment_time, notes, status } = data;
    await pool.query(
      `UPDATE appointments SET patient_id = ?, doctor_id = ?, appointment_date = ?, appointment_time = ?, notes = ?, status = ?
       WHERE id = ?`,
      [patient_id, doctor_id, appointment_date, appointment_time, notes || '', status || 'scheduled', id]
    );
    return true;
  },

  async delete(id) {
    await pool.query(`DELETE FROM appointments WHERE id = ?`, [id]);
    return true;
  }
};

module.exports = Appointment;
