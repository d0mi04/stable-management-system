const express = require('express');
const horseController = require('../controllers/horseController');
const { verifyToken, isAdmin } = require('../middleware/authMiddleware');

const router = express.Router();

router.get('/', horseController.getAllHorses);
router.get('/waiting', verifyToken, isAdmin, horseController.getHorsesWaitingForStall); // zwraca listę koni oczekujących na przypisanie do boksu
router.get('/:horseID', horseController.getHorseById); // ścieżki ogólne /:id - NA KOŃCU!!

router.post('/', verifyToken, horseController.createHorse);

router.put('/:horseID', horseController.updateHorse);
router.put('/:horseID/assign-stall', verifyToken, isAdmin, horseController.assignStallToHorse); // przypisanie koniowi boksu
router.put('/:horseID/unassign-stall', verifyToken, isAdmin, horseController.unassignStallToHorse); // wypisanie konia z boksu

router.delete('/:horseID', horseController.deleteHorse);

module.exports = router;