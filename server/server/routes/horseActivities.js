const express = require('express');
const horseActivityController = require('../controllers/horseActivityController');

const router = express.Router();

router.get('/', horseActivityController.getAllHorseActivities);
router.get('/:activityID', horseActivityController.getHorseActivityById);
router.post('/', horseActivityController.createHorseActivity);
router.put('/:activityID', horseActivityController.updateHorseActivity);
router.delete('/:activityID', horseActivityController.deleteHorseActivity);

module.exports = router;