const express = require('express');
const router = express.Router();
const ReportController = require('../controllers/reportController');
const authMiddleware = require('../middleware/auth');
const { rbacMiddleware } = require('../middleware/rbac');

router.use(authMiddleware);

// All reports require admin access
router.get('/dashboard', rbacMiddleware('admin'), ReportController.getDashboardStats);
router.get('/patients', rbacMiddleware('admin'), ReportController.getPatientReports);
router.get('/payments', rbacMiddleware('admin'), ReportController.getPaymentReports);
router.get('/inventory', rbacMiddleware('admin'), ReportController.getInventoryReports);
router.get('/workflow', rbacMiddleware('admin'), ReportController.getWorkflowReports);

module.exports = router;