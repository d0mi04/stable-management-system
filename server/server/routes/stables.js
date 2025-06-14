const express = require('express');
const stableController = require('../controllers/stableController');
const { verifyToken, isAdmin } = require('../middleware/authMiddleware');

const router = express.Router();

router.get('/', verifyToken, isAdmin, stableController.getAllStables);
router.get('/:stableID', verifyToken, isAdmin, stableController.getStableById);
router.post('/', verifyToken, isAdmin, stableController.createStable);
router.put('/:stableID', verifyToken, isAdmin, stableController.updateStable);
router.delete('/:stableID', verifyToken, isAdmin, stableController.deleteStable);

module.exports = router;