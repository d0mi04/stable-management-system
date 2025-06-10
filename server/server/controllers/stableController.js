const Stable = require('../models/Stable');

// GET /stables
exports.getAllStables = async (req, res) => {
    try {
        const stables = await Stable.find();
        res.status(200).json({
            stables: stables
        });
    } catch (err) {
        res.status(500).json({
            message: '🍎 Error while retrieving stables data',
            error: err.message
        });
    }
};

// GET /stables/:stableID
exports.getStableById = async (req, res) => {
    try {
        const stableId = req.params.stableID;
        const stable = await Stable.findById(stableId);

        if(!stable) {
            return res.status(404).json({
                message: '🍎 Stable not found'
            });
        }

        res.status(200).json({
            stable: stable
        });
    } catch (err) {
        res.status(500).json({
            message: '🍎 Internal error',
            error: err.message
        });
    }
};

// POST /stables
exports.createStable = async (req, res) => {
    try {
        const stable = new Stable(req.body);
        await stable.save();

        res.status(201).json({
            message: '🍏 Stable was successfully created!',
            stable: stable
        });
    } catch (err) {
        res.status(400).json({
            message: '🍎 Invalid request',
            error: err.message
        })
    }
};

// PUT /stables/:stableID
exports.updateStable = async (req, res) => {
    try {
        const stableId = req.params.stableID;
        
        const updatedStable = await Stable.findByIdAndUpdate(stableId, req.body, {
            new: true,
            runValidators: true,
        });

        if(!updatedStable) {
            return res.status(404).json({
                message: '🍎 Stable not found'
            });
        }

        res.status(200).json({
            message: '🍏 Stable updated successfully!',
            stable: updatedStable
        });
    } catch (err) {
        res.status(400).json({
            message: '🍎 Invalid request',
            error: err.message
        });
    }
};

// DELETE /stables/:stableID
exports.deleteStable = async (req, res) => {
    try {
        const stableId = req.params.stableID;
        const deletedStable = await Stable.findByIdAndDelete(stableId);

        if(!deletedStable) {
            return res.status(404).json({
                message: '🍎 Stable not found'
            });
        }

        await deletedStable.deleteOne();

        res.status(200).json({
            message: '🍏 Stable deleted successfully!',
            deletedStable: deletedStable
        });
    } catch (err) {
        res.status(500).json({
            message: '🍎 Internal error while deleting stable',
            error: err.message
        });
    }
};