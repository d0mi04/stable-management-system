const HorseActivity = require('../models/HorseActivity');

// GET /horseActivities
exports.getAllHorseActivities = async (req, res) => {
    try {
        const activities = await HorseActivity.find();
        res.status(200).json({
            horseActivities: activities
        });
    } catch (err) {
        console.log(err);
        res.status(500).json({
            message: '🍎 Invalid request',
            error: err.message
        });
    }
};

// GET /horseActivities/:activityID
exports.getHorseActivityById = async (req, res) => {
    try {
        const activityID = req.params.activityID;
        const activity = await HorseActivity.findById(activityID);

        if(!activity) {
            return res.status(404).json({
                message: '🍎 Horse Activity not found'
            });
        }

        res.status(200).json({
            horseActivity: activity
        });
    } catch {
        console.log(err);
        res.status(500).json({
            message: '🍎 Internal error while retrieving horse activity',
            error: err.message
        });
    }
};

// POST /horseActivities
exports.createHorseActivity = async (req, res) => {
    try {
        const activity = new HorseActivity(req.body);
        await activity.save();
        res.status(201).json({
            message: '🍏 Horse updated successfully!',
            horseActivity: activity
        });
    } catch (err) {
        console.log(err);
        res.status(400).json({
            message: '🍎 Invalid request',
            error: err.message
        });
    }
};

// PUT /horseActivities/:activityID
exports.updateHorseActivity = async (req, res) => {
    try {
        const activityId = req.params.activityID;
        const updatedActivity = await HorseActivity.findByIdAndUpdate(activityId, req.body, {
            new: true,
            runValidators: true,
        });

        if(!updatedActivity) {
            return res.status(404).json({
                message: '🍎 Horse Activity not found'
            });
        }

        res.status(200).json({
            message: '🍏 Horse Activityupdated successfully!',
            updatedHorseActivity: updatedActivity
        });
    } catch (err) {
        console.log(err);
        res.status(400).json({
            message: '🍎 Invalid request',
            error: err.message
        });
    }
};

// DELETE /horseAvtivities/:activityID
exports.deleteHorseActivity = async (req, res) => {
    try {
        const activityId = req.params.activityID;
        const deletedActivity = await HorseActivity.findByIdAndDelete(activityId);

        if(!deletedActivity) {
            return res.status(404).json({
                message: '🍎 Horse Activity not found'
            });
        }

        await deletedActivity.deleteOne();
        res.status(200).json({
            message: '🍏 Horse Activity deleted successfully!',
            deletedHorseActivity: deletedActivity
        });
    } catch (err) {
        console.log(err);
        res.status(500).json({
            message: '🍎 Internal error while deleting Horse Activity',
            error: err.message
        });
    }
};