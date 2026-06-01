const Appointment = require('../models/appointmentModel');

const AppointmentController = {
  async getAll(req, res) {
    try {
      const filters = {};
      if (req.user.role === 'doctor') {
        filters.doctor_id = req.user.id;
      }
      const appointments = await Appointment.getAll(filters);
      res.json({ success: true, data: appointments });
    } catch (error) {
      console.error('Get all appointments error:', error);
      res.status(500).json({ success: false, message: 'Kuna hitilafu katika mfumo' });
    }
  },

  async getById(req, res) {
    try {
      const appointment = await Appointment.getById(req.params.id);
      if (!appointment) {
        return res.status(404).json({ success: false, message: 'Miadi haipatikani' });
      }
      res.json({ success: true, data: appointment });
    } catch (error) {
      console.error('Get appointment error:', error);
      res.status(500).json({ success: false, message: 'Kuna hitilafu katika mfumo' });
    }
  },

  async create(req, res) {
    try {
      const { patient_id, doctor_id, appointment_date, appointment_time, notes } = req.body;
      const creatorRole = req.user.role;
      const userId = req.user.id;

      if (!patient_id || !appointment_date || !appointment_time) {
        return res.status(400).json({ success: false, message: 'Tafadhali jaza maeneo yote yanayohitajika' });
      }

      const appointmentDoctorId = creatorRole === 'doctor' ? (doctor_id || userId) : doctor_id;
      if (!appointmentDoctorId) {
        return res.status(400).json({ success: false, message: 'Tafadhali chagua daktari kwa miadi' });
      }

      const appointmentId = await Appointment.create({
        patient_id,
        doctor_id: appointmentDoctorId,
        appointment_date,
        appointment_time,
        notes,
        status: 'scheduled'
      });

      res.status(201).json({ success: true, message: 'Miadi imehifadhiwa kwa mafanikio', data: { id: appointmentId } });
    } catch (error) {
      console.error('Create appointment error:', error);
      res.status(500).json({ success: false, message: 'Kuna hitilafu katika mfumo' });
    }
  },

  async update(req, res) {
    try {
      const { patient_id, doctor_id, appointment_date, appointment_time, notes, status } = req.body;
      const appointmentId = req.params.id;

      await Appointment.update(appointmentId, {
        patient_id,
        doctor_id,
        appointment_date,
        appointment_time,
        notes,
        status
      });

      res.json({ success: true, message: 'Miadi imebadilishwa' });
    } catch (error) {
      console.error('Update appointment error:', error);
      res.status(500).json({ success: false, message: 'Kuna hitilafu katika mfumo' });
    }
  },

  async delete(req, res) {
    try {
      await Appointment.delete(req.params.id);
      res.json({ success: true, message: 'Miadi imefutwa' });
    } catch (error) {
      console.error('Delete appointment error:', error);
      res.status(500).json({ success: false, message: 'Kuna hitilafu katika mfumo' });
    }
  }
};

module.exports = AppointmentController;
