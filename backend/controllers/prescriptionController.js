const Prescription = require('../models/prescriptionModel');
const Medicine = require('../models/medicineModel');
const Patient = require('../models/patientModel');

const PrescriptionController = {
  async getAll(req, res) {
    try {
      const filters = {};
      if (req.query.status) filters.status = req.query.status;
      if (req.query.patient_id) filters.patient_id = req.query.patient_id;
      if (req.query.medicine_id) filters.medicine_id = req.query.medicine_id;

      const prescriptions = await Prescription.getAll(filters);
      res.json({ success: true, data: prescriptions });
    } catch (error) {
      console.error('Get prescriptions error:', error);
      res.status(500).json({ success: false, message: 'Kuna hitilafu katika mfumo' });
    }
  },

  async create(req, res) {
    try {
      const { patient_id, medicine_id, quantity, notes } = req.body;

      if (!patient_id || !medicine_id || !quantity) {
        return res.status(400).json({ success: false, message: 'Tafadhali toa mgonjwa, dawa, na kiasi' });
      }

      const medicine = await Medicine.getById(medicine_id);
      if (!medicine) {
        return res.status(404).json({ success: false, message: 'Dawa haikupatikana' });
      }

      const unit_price = medicine.unit_price;
      const total_price = Number(unit_price) * Number(quantity);

      const prescriptionId = await Prescription.create({
        patient_id,
        prescribed_by: req.user.id,
        medicine_id,
        quantity,
        unit_price,
        total_price,
        notes
      });

      res.status(201).json({ success: true, message: 'Agizo la dawa limehifadhiwa', data: { id: prescriptionId } });
    } catch (error) {
      console.error('Create prescription error:', error);
      res.status(500).json({ success: false, message: 'Kuna hitilafu katika mfumo' });
    }
  },

  async dispense(req, res) {
    try {
      const prescription = await Prescription.getById(req.params.id);
      if (!prescription) {
        return res.status(404).json({ success: false, message: 'Agizo halikupatikana' });
      }
      if (prescription.status === 'dispensed') {
        return res.status(400).json({ success: false, message: 'Agizo tayari limeweza kutolewa' });
      }

      const medicine = await Medicine.getById(prescription.medicine_id);
      if (!medicine) {
        return res.status(404).json({ success: false, message: 'Dawa haikupatikana' });
      }

      if (medicine.quantity_in_stock < prescription.quantity) {
        return res.status(400).json({ success: false, message: 'Hakuna hesabu ya kutosha ya dawa' });
      }

      await Medicine.update(medicine.id, {
        name: medicine.name,
        category: medicine.category,
        unit_price: medicine.unit_price,
        quantity_in_stock: medicine.quantity_in_stock - prescription.quantity,
        expiry_date: medicine.expiry_date,
        description: medicine.description
      });

      await Prescription.dispense(prescription.id);

      const pending = await Prescription.getAll({ patient_id: prescription.patient_id, status: 'pending' });
      if (pending.length === 0) {
        const patient = await Patient.getById(prescription.patient_id);
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
            current_stage: 'completed'
          });
        }
      }

      res.json({ success: true, message: 'Dawa imeweza kutolewa' });
    } catch (error) {
      console.error('Dispense prescription error:', error);
      res.status(500).json({ success: false, message: 'Kuna hitilafu katika mfumo' });
    }
  }
};

module.exports = PrescriptionController;
