const express = require('express');
const horseController = require('../controllers/horseController');
const authmiddleware = require('../middleware/authMiddleware');
const verifyToken = require('../middleware/authMiddleware');

const router = express.Router();

router.get('/', horseController.getAllHorses);
router.get('/:horseID', horseController.getHorseById);
router.post('/', verifyToken, horseController.createHorse);
router.put('/:horseID', horseController.updateHorse);
router.delete('/:horseID', horseController.deleteHorse);

module.exports = router;