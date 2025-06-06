const Horse = require('../models/Horse');

// GET /horses
exports.getAllHorses = async (req, res) => {
    try {
        const horses = await Horse.find().populate('stallId');
        res.status(200).json({
            horses
        });
    } catch (err) {
        console.log(err);
        res.status(500).json({
            message: '🍎 Error while retrieving horses'
        });
    }
};

// GET /horses/:horseID
exports.getHorseById = async (req, res) => {
    try {
        const horseId = req.params.horseID;
        const horse = await Horse.findById(horseId);
        if(!horse) {
            return res.status(404).json({
                message: '🍎 Horse not found'
            });
        }

        res.status(200).json({
            horse
        });
    } catch (err) {
        console.log(err);
        res.status(500).json({
            message: '🍎 Internal error while retrieving horse',
            error: err.message
        });
    }
};

// POST /horses
exports.createHorse = async (req, res) => {
    try{
        const horse = new Horse(req.body);
        await horse.save();
        res.status(201).json({
            message: '🍏 Horse was successfully created!',
            horse: horse
        });
    } catch (err) {
        console.log(err);
        res.status(400).json({
            message: '🍎 Invalid request',
            error: err.message
        });
    }
};

// PUT /horses/:horseID
exports.updateHorse = async (req, res) => {
    try {
        const horseId = req.params.horseID;
        const updatedHorseData = req.body;
        const updatedHorse = await Horse.findByIdAndUpdate(horseId, updatedHorseData, {
            new: true, // zwraca nowy dokument po aktualizacji
            runValidators: true, // sprawdza zgodność ze schemą
        });

        if(!updatedHorse) {
            return res.status(404).json({
                message: '🍎 Horse not found'
            });
        }

        res.status(200).json({
            message: '🍏 Horse updated successfully!',
            horse: updatedHorse
        });
    } catch (err) {
        console.log(err.message),
        res.status(400).json({
            message: '🍎 Invalid request',
            error: err.message
        });
    }
};

// DELETE /horses/:horseID
exports.deleteHorse = async (req, res) => {
    try {
        const horseId = req.params.horseID;
        const deletedHorse = await Horse.findById(horseId);
        
        if(!deletedHorse) {
            return res.status(404).json({
                message: '🍎 Horse not found'
            });
        }

        await deletedHorse.deleteOne();

        res.status(200).json({
            message: '🍏 Horse deleted successfully.',
            deletedHorse: deletedHorse
        });
    } catch (err) {
        res.status(500).json({
            message: '🍎 Internal error',
            error: err.message
        });
    }
};