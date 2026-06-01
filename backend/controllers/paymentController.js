// filepath: backend/controllers/paymentController.js
const Payment = require('../models/paymentModel');

const PaymentController = {
  // Get all payments
  async getAll(req, res) {
    try {
      const { patient_id, payment_type, status, start_date, end_date } = req.query;
      const payments = await Payment.getAll({ patient_id, payment_type, status, start_date, end_date });
      res.json({
        success: true,
        data: payments
      });
    } catch (error) {
      console.error('Get all payments error:', error);
      res.status(500).json({ 
        success: false, 
        message: 'Kuna hitilafu katika mfumo' 
      });
    }
  },

  // Get payment by ID
  async getById(req, res) {
    try {
      const payment = await Payment.getById(req.params.id);
      if (!payment) {
        return res.status(404).json({ 
          success: false, 
          message: 'Malipo haepatikani' 
        });
      }
      res.json({ success: true, data: payment });
    } catch (error) {
      console.error('Get payment error:', error);
      res.status(500).json({ success: false, message: 'Kuna hitilafu' });
    }
  },

  // Create new payment
  async create(req, res) {
    try {
      const { patient_id, amount, payment_type, reference_id, payment_method } = req.body;

      if (!patient_id || !amount || !payment_type || !payment_method) {
        return res.status(400).json({ 
          success: false, 
          message: 'Tafadhali jaza maeneo yote yanayohitajika' 
        });
      }

      const paymentId = await Payment.create({ 
        patient_id, 
        amount, 
        payment_type, 
        reference_id, 
        payment_method,
        received_by: req.user.id
      });

      res.status(201).json({
        success: true,
        message: 'Malipo yamesajiliwa kwa mafanikio',
        data: { id: paymentId }
      });
    } catch (error) {
      console.error('Create payment error:', error);
      res.status(500).json({ success: false, message: 'Kuna hitilafu' });
    }
  },

  // Update payment status
  async updateStatus(req, res) {
    try {
      const { status } = req.body;
      if (!['pending', 'completed', 'failed'].includes(status)) {
        return res.status(400).json({ success: false, message: 'Status si sahihi' });
      }
      await Payment.updateStatus(req.params.id, status);
      res.json({ success: true, message: 'Status imebadilishwa' });
    } catch (error) {
      console.error('Update payment error:', error);
      res.status(500).json({ success: false, message: 'Kuna hitilafu' });
    }
  },

  // Delete payment
  async delete(req, res) {
    try {
      await Payment.delete(req.params.id);
      res.json({ success: true, message: 'Malipo yamefutwa' });
    } catch (error) {
      console.error('Delete payment error:', error);
      res.status(500).json({ success: false, message: 'Kuna hitilafu' });
    }
  },

  // Get payment summary
  async getSummary(req, res) {
    try {
      const { start_date, end_date } = req.query;
      const summary = await Payment.getSummary({ start_date, end_date });
      res.json({ success: true, data: summary });
    } catch (error) {
      console.error('Get summary error:', error);
      res.status(500).json({ success: false, message: 'Kuna hitilafu' });
    }
  }
};

module.exports = PaymentController;