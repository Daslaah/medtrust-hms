// filepath: backend/routes/payments.js
const express = require('express');
const router = express.Router();
const PaymentController = require('../controllers/paymentController');
const authMiddleware = require('../middleware/auth');
const { rbacMiddleware } = require('../middleware/rbac');

router.use(authMiddleware);

router.get('/', rbacMiddleware('admin', 'receptionist', 'pharmacy'), PaymentController.getAll);
router.get('/summary', rbacMiddleware('admin'), PaymentController.getSummary);
router.get('/:id', rbacMiddleware('admin', 'receptionist', 'pharmacy'), PaymentController.getById);
router.post('/', rbacMiddleware('admin', 'receptionist', 'pharmacy'), PaymentController.create);
router.put('/:id/status', rbacMiddleware('admin'), PaymentController.updateStatus);
router.delete('/:id', rbacMiddleware('admin'), PaymentController.delete);

module.exports = router;