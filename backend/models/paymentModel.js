// filepath: backend/models/paymentModel.js
const pool = require('../config/db');

const Payment = {
  // Get all payments
  async getAll(filters = {}) {
    let query = `
      SELECT p.*, pt.full_name as patient_name, u.full_name as received_by_name
      FROM payments p
      LEFT JOIN patients pt ON p.patient_id = pt.id
      LEFT JOIN users u ON p.received_by = u.id
    `;
    
    const conditions = [];
    const params = [];

    if (filters.patient_id) {
      conditions.push('p.patient_id = ?');
      params.push(filters.patient_id);
    }
    if (filters.payment_type) {
      conditions.push('p.payment_type = ?');
      params.push(filters.payment_type);
    }
    if (filters.status) {
      conditions.push('p.status = ?');
      params.push(filters.status);
    }
    if (filters.start_date && filters.end_date) {
      conditions.push('p.created_at BETWEEN ? AND ?');
      params.push(filters.start_date, filters.end_date);
    }

    if (conditions.length > 0) {
      query += ' WHERE ' + conditions.join(' AND ');
    }

    query += ' ORDER BY p.created_at DESC';

    const [rows] = await pool.query(query, params);
    return rows;
  },

  // Get payment by ID
  async getById(id) {
    const [rows] = await pool.query(
      `SELECT p.*, pt.full_name as patient_name, u.full_name as received_by_name
       FROM payments p
       LEFT JOIN patients pt ON p.patient_id = pt.id
       LEFT JOIN users u ON p.received_by = u.id
       WHERE p.id = ?`,
      [id]
    );
    return rows[0];
  },

  // Create new payment
  async create(paymentData) {
    const { patient_id, amount, payment_type, reference_id, payment_method, received_by } = paymentData;

    const [result] = await pool.query(
      `INSERT INTO payments (patient_id, amount, payment_type, reference_id, payment_method, received_by) 
       VALUES (?, ?, ?, ?, ?, ?)`,
      [patient_id, amount, payment_type, reference_id || null, payment_method, received_by]
    );
    return result.insertId;
  },

  // Update payment status
  async updateStatus(id, status) {
    await pool.query(
      `UPDATE payments SET status = ? WHERE id = ?`,
      [status, id]
    );
    return true;
  },

  // Delete payment
  async delete(id) {
    await pool.query(`DELETE FROM payments WHERE id = ?`, [id]);
    return true;
  },

  // Get payment summary
  async getSummary(filters = {}) {
    let query = `
      SELECT 
        COUNT(*) as total_transactions,
        SUM(CASE WHEN status = 'completed' THEN amount ELSE 0 END) as total_collected,
        SUM(CASE WHEN payment_method = 'cash' AND status = 'completed' THEN amount ELSE 0 END) as cash_total,
        SUM(CASE WHEN payment_method = 'mobile_money' AND status = 'completed' THEN amount ELSE 0 END) as mobile_money_total,
        SUM(CASE WHEN payment_method = 'card' AND status = 'completed' THEN amount ELSE 0 END) as card_total,
        SUM(CASE WHEN payment_method = 'insurance' AND status = 'completed' THEN amount ELSE 0 END) as insurance_total
      FROM payments
    `;

    const conditions = [];
    const params = [];

    if (filters.start_date && filters.end_date) {
      conditions.push('created_at BETWEEN ? AND ?');
      params.push(filters.start_date, filters.end_date);
    }

    if (conditions.length > 0) {
      query += ' WHERE ' + conditions.join(' AND ');
    }

    const [rows] = await pool.query(query, params);
    return rows[0];
  }
};

module.exports = Payment;