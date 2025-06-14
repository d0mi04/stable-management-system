const Stable = require('../models/Stable');
const Stall = require('../models/Stall');
const Horses = require('../models/Horse');
const Horse = require('../models/Horse');

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
        const { fullName, location, capacity, description, stallSize } = req.body;

        const stable = new Stable({
            fullName: fullName,
            location: location,
            capacity: capacity,
            description: description,
            stallArray: []
        });
        await stable.save();

        // teraz tworzymy tyle boksów jakie podaliśmy capacity
        const stalls = [];
        for (let i = 1; i <= capacity; i++) {
            const newStall = new Stall({
                stableId: stable._id, // boks ma prsypisane ID stajni, w której się znajduje
                name: `${i}-${fullName}`, // name boksu np. 1-SUN - use fullName instead of name
                size: stallSize // wszystkie boksy w stajni mają ten sam rozmiar
            });

            await newStall.save();
            stalls.push(newStall._id);
        }

        // teraz uzupełnienie tablicy boksów w obiekcie stajnia --> wsm to niekoniecznie musi być, póki co zostawiam, ale może zajmować dodatkowe miejsce w pamięci niepotrzebnie
        stable.stallArray = stalls;
        await stable.save();

        res.status(201).json({
            message: '🍏 Stable was successfully created!',
            stable: stable
        });
    } catch (err) {
        res.status(400).json({
            message: '🍎 Invalid request',
            error: err.message
        });
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
        const deletedStable = await Stable.findById(stableId);

        if(!deletedStable) {
            return res.status(404).json({
                message: '🍎 Stable not found'
            });
        }

        const stalls = await Stall.find({ stableId });
        console.log(`Stalls found: ${stalls.length}`);

        const hasOccupiedStalls = stalls.some(stall => 
            stall.status.toLocaleLowerCase() !== 'available'
        );

        if(hasOccupiedStalls) {
            console.log(`Stable has ${hasOccupiedStalls.length} occupied stalls - horses will have status set to waiting for stall`);
        }

        for(const stall of stalls) {
            if(stall.horseId) {
                await Horse.findByIdAndUpdate(
                    stall.horseId,
                    {
                        $set: {
                            stallId: null,
                            status: 'waiting for stall'
                        }
                    }
                );
            }
        }

        // usuwamy teraz wszystkie boksy ze stajni:
        await Stall.deleteMany({ stableId });

        // stajnie też usuwamy XD
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