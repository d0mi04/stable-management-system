const express = require('express');
const staffController = require('../controllers/staffController');

const router = express.Router();

router.get('/', staffController.getAllStaff);
router.get('/:staffID', staffController.getStaffById);
router.post('/', staffController.createStaffMember);
router.put('/:staffID', staffController.updateStaffMember);
router.delete('/:staffID', staffController.deleteStaffMember);

module.exports = router;