const express = require('express');
const stallController = require('../controllers/stallController');

const router = express.Router();

router.get('/', stallController.getAllStalls);
router.get('/:stallID', stallController.getStallById);
router.post('/', stallController.createStall);
router.put('/:stallID', stallController.updateStall);

module.exports = router;