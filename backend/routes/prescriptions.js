const express = require('express');
const router = express.Router();
const PrescriptionController = require('../controllers/prescriptionController');
const authMiddleware = require('../middleware/auth');
const { rbacMiddleware } = require('../middleware/rbac');

router.use(authMiddleware);

router.get('/', rbacMiddleware('admin', 'doctor', 'pharmacy'), PrescriptionController.getAll);
router.post('/', rbacMiddleware('admin', 'doctor', 'pharmacy'), PrescriptionController.create);
router.put('/:id/dispense', rbacMiddleware('admin', 'pharmacy'), PrescriptionController.dispense);

module.exports = router;
