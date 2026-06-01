const express = require('express');
const router = express.Router();
const AppointmentController = require('../controllers/appointmentController');
const authMiddleware = require('../middleware/auth');
const { rbacMiddleware } = require('../middleware/rbac');

router.use(authMiddleware);

router.get('/', rbacMiddleware('admin', 'doctor'), AppointmentController.getAll);
router.get('/:id', rbacMiddleware('admin', 'doctor'), AppointmentController.getById);
router.post('/', rbacMiddleware('admin', 'doctor'), AppointmentController.create);
router.put('/:id', rbacMiddleware('admin', 'doctor'), AppointmentController.update);
router.delete('/:id', rbacMiddleware('admin', 'doctor'), AppointmentController.delete);

module.exports = router;
