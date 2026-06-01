// filepath: backend/models/patientModel.js
const pool = require('../config/db');

const Patient = {
  // Get all patients
  async getAll(filters = {}) {
    let query = `SELECT * FROM patients`;
    const conditions = [];
    const params = [];

    if (filters.current_stage) {
      conditions.push('current_stage = ?');
      params.push(filters.current_stage);
    }
    if (filters.payment_status) {
      conditions.push('payment_status = ?');
      params.push(filters.payment_status);
    }

    if (conditions.length > 0) {
      query += ' WHERE ' + conditions.join(' AND ');
    }

    query += ' ORDER BY created_at DESC';

    const [rows] = await pool.query(query, params);
    return rows;
  },

  // Get patient by ID
  async getById(id) {
    const [rows] = await pool.query(
      `SELECT * FROM patients WHERE id = ?`,
      [id]
    );
    return rows[0];
  },

  // Create new patient
  async create(patientData) {
    const { 
      full_name, gender, date_of_birth, phone, email, 
      address, emergency_contact, emergency_phone, payment_status, current_stage 
    } = patientData;

    // Generate patient number
    const year = new Date().getFullYear();
    const random = Math.floor(1000 + Math.random() * 9000);
    const patientNumber = `PT${year}${random}`;

    const [result] = await pool.query(
      `INSERT INTO patients (patient_number, full_name, gender, date_of_birth, phone, email, address, emergency_contact, emergency_phone, payment_status, current_stage) 
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [patientNumber, full_name, gender, date_of_birth, phone, email, address, emergency_contact, emergency_phone, payment_status || 'unpaid', current_stage || 'registration']
    );
    return result.insertId;
  },

  // Update patient
  async update(id, patientData) {
    const { 
      full_name, gender, date_of_birth, phone, email, 
      address, emergency_contact, emergency_phone, payment_status, current_stage 
    } = patientData;
    
    await pool.query(
      `UPDATE patients SET full_name = ?, gender = ?, date_of_birth = ?, phone = ?, email = ?, address = ?, emergency_contact = ?, emergency_phone = ?, payment_status = ?, current_stage = ? 
       WHERE id = ?`,
      [full_name, gender, date_of_birth, phone, email, address, emergency_contact, emergency_phone, payment_status || 'unpaid', current_stage || 'registration', id]
    );
    return true;
  },

  // Delete patient
  async delete(id) {
    await pool.query(`DELETE FROM patients WHERE id = ?`, [id]);
    return true;
  },

  // Get patient with payment status
  async getWithPaymentStatus(id) {
    const [rows] = await pool.query(
      `SELECT p.*, 
       COALESCE(SUM(CASE WHEN pay.status = 'completed' THEN pay.amount ELSE 0 END), 0) as total_paid,
       COUNT(DISTINCT pay.id) as payment_count
       FROM patients p
       LEFT JOIN payments pay ON p.id = pay.patient_id AND pay.status = 'completed'
       WHERE p.id = ?
       GROUP BY p.id`,
      [id]
    );
    return rows[0];
  },

  // Get all patients with payment status
  async getAllWithPaymentStatus() {
    const [rows] = await pool.query(
      `SELECT p.*, 
       COALESCE(SUM(CASE WHEN pay.status = 'completed' THEN pay.amount ELSE 0 END), 0) as total_paid,
       COUNT(DISTINCT pay.id) as payment_count
       FROM patients p
       LEFT JOIN payments pay ON p.id = pay.patient_id AND pay.status = 'completed'
       GROUP BY p.id
       ORDER BY p.created_at DESC`
    );
    return rows;
  }
};

module.exports = Patient;