const MedicalRecord = require('../models/medicalRecordModel');
const Patient = require('../models/patientModel');

const MedicalRecordController = {
  async getAll(req, res) {
    try {
      const filters = {};
      if (req.user.role === 'doctor') {
        filters.doctor_id = req.user.id;
      }
      if (req.query.patient_id) {
        filters.patient_id = req.query.patient_id;
      }

      const records = await MedicalRecord.getAll(filters);
      res.json({ success: true, data: records });
    } catch (error) {
      console.error('Get medical records error:', error);
      res.status(500).json({ success: false, message: 'Kuna hitilafu katika mfumo' });
    }
  },

  async create(req, res) {
    try {
      const { patient_id, appointment_id, diagnosis, symptoms, prescription, notes, next_stage } = req.body;

      if (!patient_id || !diagnosis) {
        return res.status(400).json({ success: false, message: 'Tafadhali toa mgonjwa na uchunguzi' });
      }

      const recordId = await MedicalRecord.create({
        patient_id,
        doctor_id: req.user.id,
        appointment_id,
        diagnosis,
        symptoms,
        prescription,
        notes
      });

      if (next_stage) {
        const patient = await Patient.getById(patient_id);
        await Patient.update(patient_id, {
          full_name: patient.full_name,
          gender: patient.gender,
          date_of_birth: patient.date_of_birth,
          phone: patient.phone,
          email: patient.email,
          address: patient.address,
          emergency_contact: patient.emergency_contact,
          emergency_phone: patient.emergency_phone,
          payment_status: patient.payment_status,
          current_stage: next_stage
        });
      }

      res.status(201).json({ success: true, message: 'Rekodi ya matibabu imehifadhiwa', data: { id: recordId } });
    } catch (error) {
      console.error('Create medical record error:', error);
      res.status(500).json({ success: false, message: 'Kuna hitilafu katika mfumo' });
    }
  }
};

module.exports = MedicalRecordController;
