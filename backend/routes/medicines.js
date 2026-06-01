const express = require('express');
const router = express.Router();
const MedicineController = require('../controllers/medicineController');
const authMiddleware = require('../middleware/auth');
const { rbacMiddleware } = require('../middleware/rbac');

router.use(authMiddleware);

router.get('/', rbacMiddleware('admin', 'pharmacy', 'doctor'), MedicineController.getAll);
router.post('/', rbacMiddleware('admin'), MedicineController.create);

// Inventory management routes
router.get('/inventory/low-stock', rbacMiddleware('admin', 'pharmacy'), MedicineController.getLowStock);
router.get('/inventory/expiring-soon', rbacMiddleware('admin', 'pharmacy'), MedicineController.getExpiringSoon);
router.get('/inventory/expired', rbacMiddleware('admin', 'pharmacy'), MedicineController.getExpired);
router.get('/inventory/summary', rbacMiddleware('admin', 'pharmacy'), MedicineController.getInventorySummary);
router.get('/categories', rbacMiddleware('admin', 'pharmacy'), MedicineController.getCategories);
router.get('/:id', rbacMiddleware('admin', 'pharmacy', 'doctor'), MedicineController.getById);
router.put('/:id', rbacMiddleware('admin'), MedicineController.update);

module.exports = router;
