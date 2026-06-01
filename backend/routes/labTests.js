const express = require('express');
const router = express.Router();
const LabTestController = require('../controllers/labTestController');
const authMiddleware = require('../middleware/auth');
const { rbacMiddleware } = require('../middleware/rbac');

router.use(authMiddleware);

router.get('/', rbacMiddleware('admin', 'lab', 'doctor'), LabTestController.getAll);
router.post('/', rbacMiddleware('admin', 'lab', 'doctor'), LabTestController.create);
router.put('/:id', rbacMiddleware('admin', 'lab', 'doctor'), LabTestController.update);

module.exports = router;
