const express = require('express');
const stableController = require('../controllers/stableController');

const router = express.Router();

router.get('/', stableController.getAllStables);
router.get('/:stableID', stableController.getStableById);
router.post('/', stableController.createStable);
router.put('/:stableID', stableController.updateStable);
router.delete('/:stableID', stableController.deleteStable);

module.exports = router;