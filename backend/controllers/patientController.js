// filepath: backend/controllers/patientController.js
const Patient = require('../models/patientModel');
const Payment = require('../models/paymentModel');

const PatientController = {
  // Get all patients
  async getAll(req, res) {
    try {
      const { stage, payment_status } = req.query;
      const filters = {};
      if (stage) filters.current_stage = stage;
      if (payment_status) filters.payment_status = payment_status;

      const patients = await Patient.getAll(filters);
      res.json({
        success: true,
        data: patients
      });
    } catch (error) {
      console.error('Get all patients error:', error);
      res.status(500).json({ 
        success: false, 
        message: 'Kuna hitilafu katika mfumo' 
      });
    }
  },

  // Get patient by ID
  async getById(req, res) {
    try {
      const patient = await Patient.getById(req.params.id);
      
      if (!patient) {
        return res.status(404).json({ 
          success: false, 
          message: 'Mgonjwa haepatikani' 
        });
      }

      res.json({
        success: true,
        data: patient
      });
    } catch (error) {
      console.error('Get patient error:', error);
      res.status(500).json({ 
        success: false, 
        message: 'Kuna hitilafu katika mfumo' 
      });
    }
  },

  // Create new patient
  async create(req, res) {
    try {
      const {
        full_name,
        gender,
        date_of_birth,
        phone,
        email,
        address,
        emergency_contact,
        emergency_phone,
        payment_status,
        payment_amount,
        payment_method,
        current_stage
      } = req.body;

      // Validation
      if (!full_name || !gender || !date_of_birth) {
        return res.status(400).json({ 
          success: false, 
          message: 'Tafadhali jaza maeneo yote yanayohitajika (*)' 
        });
      }

      const initialStage = current_stage || ((req.user.role === 'receptionist' || req.user.role === 'admin') ? 'doctor' : 'registration');
      const initialPaymentStatus = payment_status || (payment_amount && Number(payment_amount) > 0 ? 'paid' : 'unpaid');

      const patientId = await Patient.create({ 
        full_name,
        gender,
        date_of_birth,
        phone,
        email,
        address,
        emergency_contact,
        emergency_phone,
        payment_status: initialPaymentStatus,
        current_stage: initialStage
      });

      if (payment_amount && Number(payment_amount) > 0) {
        await Payment.create({
          patient_id: patientId,
          amount: Number(payment_amount),
          payment_type: 'registration',
          reference_id: null,
          payment_method: payment_method || 'cash',
          received_by: req.user.id
        });
      }

      res.status(201).json({
        success: true,
        message: 'Mgonjwa amesajiliwa kwa mafanikio',
        data: { id: patientId }
      });

    } catch (error) {
      console.error('Create patient error:', error);
      res.status(500).json({ 
        success: false, 
        message: 'Kuna hitilafu katika mfumo' 
      });
    }
  },

  // Update patient
  async update(req, res) {
    try {
      const {
        full_name,
        gender,
        date_of_birth,
        phone,
        email,
        address,
        emergency_contact,
        emergency_phone,
        payment_status,
        current_stage
      } = req.body;
      const patientId = req.params.id;

      await Patient.update(patientId, { 
        full_name,
        gender,
        date_of_birth,
        phone,
        email,
        address,
        emergency_contact,
        emergency_phone,
        payment_status,
        current_stage
      });

      res.json({
        success: true,
        message: 'Taarifa za mgonjwa zimebadilishwa'
      });

    } catch (error) {
      console.error('Update patient error:', error);
      res.status(500).json({ 
        success: false, 
        message: 'Kuna hitilafu katika mfumo' 
      });
    }
  },

  // Update patient stage/status
  async updateStage(req, res) {
    try {
      const { current_stage, payment_status } = req.body;
      const patientId = req.params.id;

      if (!current_stage && !payment_status) {
        return res.status(400).json({ success: false, message: 'Tafadhali toa stage au payment status' });
      }

      const patient = await Patient.getById(patientId);
      if (!patient) {
        return res.status(404).json({ success: false, message: 'Mgonjwa haepatikani' });
      }

      await Patient.update(patientId, {
        full_name: patient.full_name,
        gender: patient.gender,
        date_of_birth: patient.date_of_birth,
        phone: patient.phone,
        email: patient.email,
        address: patient.address,
        emergency_contact: patient.emergency_contact,
        emergency_phone: patient.emergency_phone,
        payment_status: payment_status || patient.payment_status,
        current_stage: current_stage || patient.current_stage
      });

      res.json({ success: true, message: 'Stage ya mgonjwa imebadilishwa' });
    } catch (error) {
      console.error('Update patient stage error:', error);
      res.status(500).json({ success: false, message: 'Kuna hitilafu katika mfumo' });
    }
  },

  // Delete patient
  async delete(req, res) {
    try {
      const patientId = req.params.id;

      await Patient.delete(patientId);

      res.json({
        success: true,
        message: 'Mgonjwa amefutwa'
      });
    } catch (error) {
      console.error('Delete patient error:', error);
      res.status(500).json({ 
        success: false, 
        message: 'Kuna hitilafu katika mfumo' 
      });
    }
  }
};

module.exports = PatientController;