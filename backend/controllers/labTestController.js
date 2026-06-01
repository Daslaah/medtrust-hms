const LabTest = require('../models/labTestModel');
const Patient = require('../models/patientModel');

const LabTestController = {
  async getAll(req, res) {
    try {
      const filters = {};
      if (req.query.patient_id) filters.patient_id = req.query.patient_id;
      if (req.query.status) filters.status = req.query.status;

      const tests = await LabTest.getAll(filters);
      res.json({ success: true, data: tests });
    } catch (error) {
      console.error('Get lab tests error:', error);
      res.status(500).json({ success: false, message: 'Kuna hitilafu katika mfumo' });
    }
  },

  async create(req, res) {
    try {
      const { patient_id, test_type, test_date, notes } = req.body;

      if (!patient_id || !test_type) {
        return res.status(400).json({ success: false, message: 'Tafadhali toa mgonjwa na aina ya upimaji' });
      }

      const patient = await Patient.getById(patient_id);
      if (!patient) {
        return res.status(404).json({ success: false, message: 'Mgonjwa haepatikani' });
      }

      const testId = await LabTest.create({
        patient_id,
        doctor_id: req.user.id,
        test_type,
        test_date,
        notes
      });

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
        current_stage: 'lab'
      });

      res.status(201).json({ success: true, message: 'Omba upimaji wa maabara umehifadhiwa', data: { id: testId } });
    } catch (error) {
      console.error('Create lab test error:', error);
      res.status(500).json({ success: false, message: 'Kuna hitilafu katika mfumo' });
    }
  },

  async update(req, res) {
    try {
      const testId = req.params.id;
      const { results, status, notes, next_stage } = req.body;

      if (!results && !status) {
        return res.status(400).json({ success: false, message: 'Tafadhali toa matokeo au status' });
      }

      await LabTest.update(testId, {
        results,
        status: status || 'completed',
        notes
      });

      if (next_stage) {
        const labTest = await LabTest.getById(testId);
        if (labTest && labTest.patient_id) {
          const patient = await Patient.getById(labTest.patient_id);
          if (patient) {
            await Patient.update(patient.id, {
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
        }
      }

      res.json({ success: true, message: 'Matokeo ya upimaji wamehifadhiwa' });
    } catch (error) {
      console.error('Update lab test error:', error);
      res.status(500).json({ success: false, message: 'Kuna hitilafu katika mfumo' });
    }
  }
};

module.exports = LabTestController;
