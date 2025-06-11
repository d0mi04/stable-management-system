const mongoose = require('mongoose');

const stallSchema = new mongoose.Schema({
    stableId: {  type: mongoose.Schema.Types.ObjectId, ref: 'Stable', required: true },
    size: { type: String, enum: ['small', 'medium', 'large'], required: true }, //small - 3x3, medium 3.5x3.5, large 4x4
    status: { 
        type: String, 
        enum: ['available', 'occupied', 'maintenance', 'horse on competition'],
        default: "available" 
    }, // occupied, available, maintenance, competition leave
    horseId: { type: mongoose.Schema.Types.ObjectId, ref: 'Horse', default: null } 
});

module.exports = mongoose.model('Stall', stallSchema);