const Horse = require('../models/Horse');
const Stall = require('../models/Stall');
const User = require('../models/User');

// GET /horses
exports.getAllHorses = async (req, res) => {
    try {
        const horses = await Horse.find().select('name birthDate breed notes ownerEmail status')  // filtowanie, żeby nie było widać wrażliwych danych
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

// GET /horses/admin/waiting
exports.getHorsesWaitingForStall = async (req, res) => {
    try {
        const horses = await Horse.find({ status: 'waiting for stall' });
        res.status(200).json({
            horses: horses
        });
    } catch (err) {
        console.log(err);
        res.status(500).json({
            message: '🍎 Internal error while fetching waiting horses'
        });
    }
};

// GET /horses/:horseID
exports.getHorseById = async (req, res) => {
    try {
        const horseId = req.params.horseID;
        const horse = await Horse.findById(horseId).populate('stallId');
        
        if(!horse) {
            return res.status(404).json({
                message: '🍎 Horse not found'
            });
        }

        // sprawdzenie, czy użytkownik jest właścicielem:
        const isOwner = req.user.userId === horse.owner.toString();
        const isAdmin = req.user.role === 'admin'; // tu nie będziemy używać później { isAdmin } bo mogłoby całkiem blokować dostęp userowi

        if(!isOwner && !isAdmin) {
            return res.status(403).json({
                message: '🍎 You are not allowed to display this horse'
            });
        }

        res.status(200).json({
            horse: horse
        });
    } catch (err) {
        console.log(err);
        res.status(500).json({
            message: '🍎 Internal error while retrieving horse',
            error: err.message
        });
    }
};

// POST /horses --> user create horse, added midleware
exports.createHorse = async (req, res) => {
    try{
        const { name, birthDate, breed, notes } = req.body;
        const horse = new Horse({
            name,
            birthDate,
            breed,
            notes,
            owner: req.user.userId,
            ownerEmail: req.user.email,
            status: 'waiting for stall'
        });
        await horse.save();

        // dodanie konia do listy my-horses użytkownika, który tworzy konia:
        await User.findByIdAndUpdate(req.user.userId, {
            $addToSet: { myHorses: horse._id }
        });

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

// PUT /horses/:horseID/asign-stall --> admin assigning stall to horse
exports.assignStallToHorse = async (req, res) => {
    const { horseID } = req.params; // to jest to samo co const horseId = req.params.horseID
    const { stallID } = req.body;

    try {
        const horse = await Horse.findById(horseID);
        if(!horse) {
            return res.status(404).json({
                message: '🍎 Horse not found'
            });
        }

        // sprawdzenie, czy koń nie ma już przypisanego boksu
        if(horse.stallId) { 
            return res.status(400).json({
                message: '🍎 Horse already has a stall assigned'
            });
        }

        // znalezienie boksu, który będzie przypisywany
        const stall = await Stall.findById(stallID);
        if(!stall) {
            return res.status(404).json({
                message: '🍎 Stall not found'
            });
        }

        // czy boks jest dostępny?
        if(stall.status !== 'available') {
            return res.status(400).json({
                message: '🍎 Stall is not available for assignment'
            });
        }

        // przypisanie boksu do konia:
        horse.stallId = stallID;
        horse.status = 'stall granted';

        // aktualizacja boksu:
        stall.horseId = horseID;
        stall.status = 'occupied';

        // zapisanie obu zmian:
        await horse.save();
        await stall.save();

        res.status(200).json({
            message: '🍏 Stall successfully assigned to horse!',
            horse: horse,
            stall: stall
        });
    } catch (err) {
        console.log(err);
        res.status(500).json({
            message: '🍎 Internal error assigning stall',
            error: err.message
        });
    }
};

// PUT /horses/:horseID/unassign-stall --> tylko dla admina
exports.unassignStallToHorse = async (req, res) => {
    const { horseID } = req.params;
    
    try {
        const horse = await Horse.findById(horseID);

        if(!horse) {
            return res.status(404).json({
                message: '🍎 Horse not found'
            });
        }

        if(!horse.stallId) {
            return res.status(400).json({
                message: '🍎 No stall ASSIGNED to horse'
            });
        }

        const stall = await Stall.findById(horse.stallId);
        if(!stall) {
            return res.status(404).json({
                message: '🍎 Stall not found'
            });
        }

        // w końcu: wypisywanie konia z boksu:
        horse.stallId = null;
        horse.status = 'waiting for stall';

        // wypisywanie konia z boksu po stronie boksu:
        stall.horseId = null;
        stall.status = 'available';

        // zapisanie zmian:
        await horse.save();
        await stall.save();

        res.status(200).json({
            message: '🍏 Stall successfully UNASSIGNED to horse!',
            horse: horse,
            stall: stall
        });

    } catch (err) {
        console.log(err);
        res.status(500).json({
            message: '🍎 Internal error assigning stall',
            error: err.message
        });
    }
}

// PUT /horses/:horseID
exports.updateHorse = async (req, res) => {
    try {
        const horseId = req.params.horseID;
        const updatedHorseData = req.body;

        const horse = await Horse.findById(horseId);
        if(!horse) {
            return res.status(404).json({
                message: '🍎 Horse not found'
            });
        }

        // sprawdzenie, czy użytkownik jest właścicielem:
        const isOwner = req.user.userId === horse.owner.toString();
        const isAdmin = req.user.role === 'admin'; // tu nie będziemy używać później { isAdmin } bo mogłoby całkiem blokować dostęp userowi

        if(!isOwner && !isAdmin) {
            return res.status(403).json({
                message: '🍎 You are not allowed to update this horse'
            });
        }

        // aktualizacja danych konia:
        const updatedHorse = await Horse.findByIdAndUpdate(horseId, updatedHorseData, {
            new: true, // zwraca nowy dokument po aktualizacji
            runValidators: true, // sprawdza zgodność ze schemą
        });

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
        const userId = req.user.userId;

        const deletedHorse = await Horse.findById(horseId);
        if(!deletedHorse) {
            return res.status(404).json({
                message: '🍎 Horse not found'
            });
        }

        // sprawdzenie, czy użytkownik jest właścicielem:
        const isOwner = userId === deletedHorse.owner.toString();
        const isAdmin = req.user.role === 'admin'; // tu nie będziemy używać później { isAdmin } bo mogłoby całkiem blokować dostęp userowi

        if(!isOwner && !isAdmin) {
            return res.status(403).json({
                message: '🍎 You are not allowed to delete this horse'
            });
        }

        // najpierw trzeba zwolnić boks - o ile koń miał boks
        if(deletedHorse.stallId) {
            await Stall.findByIdAndUpdate(deletedHorse.stallId, {
                $set: {
                    horseId: null,
                    status: 'available'
                }
            });
        }
        
        // usuwanie konia z kolekcji koni
        await deletedHorse.deleteOne();

        // trzeba usunąć konia z listy myHorses:
        await User.findByIdAndUpdate(deletedHorse.owner, { // używam deletedHorse.owner, a nie userID - bo jak admin usuwa konia, to żeby użytkownikowi usunął
            $pull: { myHorses: horseId }
        });

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