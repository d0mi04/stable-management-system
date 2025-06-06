const Stall = require('../models/Stall');

// GET /stalls
exports.getAllStalls = async (req, res) => {
    try {
        const stalls = await Stall.find();
        res.status(200).json({
            stalls
        });
    } catch (err) {
        console.log(err);
        res.status(500).json({
            message: '🍎 Internal error',
            error: err.message
        });
    }
};

// GET /stalls/:stallID - informacje o boksie
exports.getStallById = async (req, res) => {
    try {
        const stallId = req.params.stallID;
        const stall = await Stall.findById(stallId);

        if(!stall) {
            return res.status(404).json({
                message: '🍎 Stall does not exists!'
            });
        }

        res.status(200).json({
            stall
        });
    } catch (err) {
        res.status(200).json({
            message: '🍎 Internal error',
            error: err.message
        });
    }
};

// POST /stalls
exports.createStall = async (req, res) => {
    try {
        const stall = new Stall (req.body);
        await stall.save();

        res.status(201).json({
            message: '🍏 Stall successfully created!',
            stall: stall
        });
    } catch (err) {
        console.log(err);
        res.status(500).json({
            message: '🍎 Internal error',
            error: err.message
        });
    }
};

// PUT /stalls/:stallID - np. w przypadku zmiany konia w boksie
exports.updateStall = async (req, res) => {
    try {
        const stallId = req.params.stallID;
        const updatedStall = await Stall.findByIdAndUpdate(stallId, req.body, {
            new: true,
            runValidators: true,
        });

        if(!updatedStall) {
            return res.status(404).json({
                message: '🍎 Stall not found!'
            });
        }

        res.status(200).json({
            message: '🍏 Stall updated successfully.',
            stall: updatedStall
        });

    } catch (err) {
        console.log(err);
        res.status(500).json({
            message: '🍎 Internal error',
            error: err.message
        });
    }
}