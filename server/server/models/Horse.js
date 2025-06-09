const mongoose = require('mongoose');

const horseSchema = new mongoose.Schema ({
    name: { type: String, required: true },
    birthDate: { type: Date },
    breed: { type: String },
    notes: { type: String },

    owner: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    ownerEmail: { type: String },

    stallId: { type: mongoose.Schema.Types.ObjectId, ref: 'Stall', default: null }, // przy tworzeniu konia tego pola jeszcze nie ma
    status: { 
        type: String,
        enum: [ 'waiting for stall', 'stall granted', 'available', 'training', 'sick', 'left for competition'],
        default: 'waiting for stall' 
    } // available, training, sick, left for competition
});

module.exports = mongoose.model('Horse', horseSchema);