const pool = require('../config/db');

const ReportController = {
  // Dashboard overview statistics
  async getDashboardStats(req, res) {
    try {
      const { start_date, end_date } = req.query;

      // Patient statistics
      const [patientStats] = await pool.query(`
        SELECT
          COUNT(*) as total_patients,
          SUM(CASE WHEN current_stage = 'registration' THEN 1 ELSE 0 END) as registration_stage,
          SUM(CASE WHEN current_stage = 'doctor' THEN 1 ELSE 0 END) as doctor_stage,
          SUM(CASE WHEN current_stage = 'lab' THEN 1 ELSE 0 END) as lab_stage,
          SUM(CASE WHEN current_stage = 'pharmacy' THEN 1 ELSE 0 END) as pharmacy_stage,
          SUM(CASE WHEN current_stage = 'completed' THEN 1 ELSE 0 END) as completed_stage,
          SUM(CASE WHEN payment_status = 'paid' THEN 1 ELSE 0 END) as paid_patients,
          SUM(CASE WHEN payment_status = 'unpaid' THEN 1 ELSE 0 END) as unpaid_patients
        FROM patients
      `);

      // Payment statistics
      const [paymentStats] = await pool.query(`
        SELECT
          COUNT(*) as total_transactions,
          SUM(CASE WHEN status = 'completed' THEN amount ELSE 0 END) as total_collected,
          AVG(CASE WHEN status = 'completed' THEN amount ELSE NULL END) as average_payment,
          SUM(CASE WHEN payment_method = 'cash' AND status = 'completed' THEN amount ELSE 0 END) as cash_total,
          SUM(CASE WHEN payment_method = 'mobile_money' AND status = 'completed' THEN amount ELSE 0 END) as mobile_money_total,
          SUM(CASE WHEN payment_method = 'card' AND status = 'completed' THEN amount ELSE 0 END) as card_total,
          SUM(CASE WHEN payment_method = 'insurance' AND status = 'completed' THEN amount ELSE 0 END) as insurance_total
        FROM payments
        WHERE created_at >= ? AND created_at <= ?
      `, [start_date || '2024-01-01', end_date || '2026-12-31']);

      // Medicine inventory
      const [inventoryStats] = await pool.query(`
        SELECT
          COUNT(*) as total_medicines,
          SUM(quantity_in_stock) as total_stock_quantity,
          SUM(CASE WHEN quantity_in_stock < 10 THEN 1 ELSE 0 END) as low_stock_items,
          SUM(CASE WHEN expiry_date < DATE_ADD(CURDATE(), INTERVAL 30 DAY) THEN 1 ELSE 0 END) as expiring_soon
        FROM medicines
      `);

      // Recent activity (last 7 days)
      const [recentActivity] = await pool.query(`
        SELECT
          COUNT(DISTINCT p.id) as new_patients_week,
          COUNT(DISTINCT pay.id) as payments_week,
          COUNT(DISTINCT mr.id) as consultations_week,
          COUNT(DISTINCT lt.id) as lab_tests_week,
          COUNT(DISTINCT pr.id) as prescriptions_week
        FROM patients p
        LEFT JOIN payments pay ON pay.patient_id = p.id AND pay.created_at >= DATE_SUB(CURDATE(), INTERVAL 7 DAY)
        LEFT JOIN medical_records mr ON mr.patient_id = p.id AND mr.created_at >= DATE_SUB(CURDATE(), INTERVAL 7 DAY)
        LEFT JOIN lab_tests lt ON lt.patient_id = p.id AND lt.created_at >= DATE_SUB(CURDATE(), INTERVAL 7 DAY)
        LEFT JOIN prescriptions pr ON pr.patient_id = p.id AND pr.created_at >= DATE_SUB(CURDATE(), INTERVAL 7 DAY)
        WHERE p.created_at >= DATE_SUB(CURDATE(), INTERVAL 7 DAY)
      `);

      res.json({
        success: true,
        data: {
          patients: patientStats[0],
          payments: paymentStats[0],
          inventory: inventoryStats[0],
          activity: recentActivity[0]
        }
      });
    } catch (error) {
      console.error('Dashboard stats error:', error);
      res.status(500).json({ success: false, message: 'Kuna hitilafu katika mfumo' });
    }
  },

  // Detailed patient reports
  async getPatientReports(req, res) {
    try {
      const { start_date, end_date, stage, payment_status } = req.query;

      let query = `
        SELECT
          p.*,
          COUNT(DISTINCT mr.id) as consultation_count,
          COUNT(DISTINCT lt.id) as lab_test_count,
          COUNT(DISTINCT pr.id) as prescription_count,
          COALESCE(SUM(pay.amount), 0) as total_paid
        FROM patients p
        LEFT JOIN medical_records mr ON p.id = mr.patient_id
        LEFT JOIN lab_tests lt ON p.id = lt.patient_id
        LEFT JOIN prescriptions pr ON p.id = pr.patient_id
        LEFT JOIN payments pay ON p.id = pay.patient_id AND pay.status = 'completed'
        WHERE 1=1
      `;

      const params = [];

      if (start_date && end_date) {
        query += ' AND p.created_at BETWEEN ? AND ?';
        params.push(start_date, end_date);
      }

      if (stage) {
        query += ' AND p.current_stage = ?';
        params.push(stage);
      }

      if (payment_status) {
        query += ' AND p.payment_status = ?';
        params.push(payment_status);
      }

      query += ' GROUP BY p.id ORDER BY p.created_at DESC';

      const [rows] = await pool.query(query, params);
      res.json({ success: true, data: rows });
    } catch (error) {
      console.error('Patient reports error:', error);
      res.status(500).json({ success: false, message: 'Kuna hitilafu katika mfumo' });
    }
  },

  // Payment reports
  async getPaymentReports(req, res) {
    try {
      const { start_date, end_date, payment_type, payment_method } = req.query;

      let query = `
        SELECT
          pay.*,
          p.full_name as patient_name,
          p.patient_number
        FROM payments pay
        LEFT JOIN patients p ON pay.patient_id = p.id
        WHERE 1=1
      `;

      const params = [];

      if (start_date && end_date) {
        query += ' AND pay.created_at BETWEEN ? AND ?';
        params.push(start_date, end_date);
      }

      if (payment_type) {
        query += ' AND pay.payment_type = ?';
        params.push(payment_type);
      }

      if (payment_method) {
        query += ' AND pay.payment_method = ?';
        params.push(payment_method);
      }

      query += ' ORDER BY pay.created_at DESC';

      const [rows] = await pool.query(query, params);
      res.json({ success: true, data: rows });
    } catch (error) {
      console.error('Payment reports error:', error);
      res.status(500).json({ success: false, message: 'Kuna hitilafu katika mfumo' });
    }
  },

  // Inventory reports
  async getInventoryReports(req, res) {
    try {
      const [medicines] = await pool.query(`
        SELECT
          m.*,
          COUNT(DISTINCT pr.id) as times_prescribed,
          SUM(CASE WHEN pr.status = 'dispensed' THEN pr.quantity ELSE 0 END) as quantity_dispensed
        FROM medicines m
        LEFT JOIN prescriptions pr ON m.id = pr.medicine_id
        GROUP BY m.id
        ORDER BY m.quantity_in_stock ASC, m.expiry_date ASC
      `);

      res.json({ success: true, data: medicines });
    } catch (error) {
      console.error('Inventory reports error:', error);
      res.status(500).json({ success: false, message: 'Kuna hitilafu katika mfumo' });
    }
  },

  // Workflow efficiency reports
  async getWorkflowReports(req, res) {
    try {
      const [workflowStats] = await pool.query(`
        SELECT
          COUNT(*) as total_patients,
          AVG(TIMESTAMPDIFF(HOUR, p.created_at,
            CASE
              WHEN p.current_stage = 'completed' THEN p.updated_at
              ELSE NOW()
            END
          )) as avg_completion_hours,
          SUM(CASE WHEN TIMESTAMPDIFF(HOUR, p.created_at, NOW()) < 24 THEN 1 ELSE 0 END) as completed_within_24h,
          SUM(CASE WHEN TIMESTAMPDIFF(DAY, p.created_at, NOW()) > 7 THEN 1 ELSE 0 END) as long_waiting_patients
        FROM patients p
        WHERE p.created_at >= DATE_SUB(CURDATE(), INTERVAL 30 DAY)
      `);

      res.json({ success: true, data: workflowStats[0] });
    } catch (error) {
      console.error('Workflow reports error:', error);
      res.status(500).json({ success: false, message: 'Kuna hitilafu katika mfumo' });
    }
  }
};

module.exports = ReportController;