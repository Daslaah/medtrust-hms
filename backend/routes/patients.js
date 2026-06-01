// filepath: backend/routes/patients.js
const express = require('express');
const router = express.Router();
const PatientController = require('../controllers/patientController');
const authMiddleware = require('../middleware/auth');
const { rbacMiddleware } = require('../middleware/rbac');

// All routes require authentication
router.use(authMiddleware);

// Patient routes - accessible by admin, receptionist, doctor
router.get('/', rbacMiddleware('admin', 'receptionist', 'doctor'), PatientController.getAll);
router.get('/:id', rbacMiddleware('admin', 'receptionist', 'doctor'), PatientController.getById);
router.post('/', rbacMiddleware('admin', 'receptionist'), PatientController.create);
router.put('/:id', rbacMiddleware('admin', 'receptionist'), PatientController.update);
router.patch('/:id/stage', rbacMiddleware('admin', 'doctor', 'lab', 'pharmacy'), PatientController.updateStage);
router.delete('/:id', rbacMiddleware('admin'), PatientController.delete);

module.exports = router;