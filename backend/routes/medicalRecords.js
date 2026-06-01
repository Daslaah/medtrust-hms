const express = require('express');
const router = express.Router();
const MedicalRecordController = require('../controllers/medicalRecordController');
const authMiddleware = require('../middleware/auth');
const { rbacMiddleware } = require('../middleware/rbac');

router.use(authMiddleware);

router.get('/', rbacMiddleware('admin', 'doctor', 'pharmacy'), MedicalRecordController.getAll);
router.post('/', rbacMiddleware('doctor'), MedicalRecordController.create);

module.exports = router;
