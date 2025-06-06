const express = require('express');
const horseController = require('../controllers/horseController');

const router = express.Router();

router.get('/', horseController.getAllHorses);
router.get('/:horseID', horseController.getHorseById);
router.post('/', horseController.createHorse);
router.put('/:horseID', horseController.updateHorse);
router.delete('/:horseID', horseController.deleteHorse);

module.exports = router;