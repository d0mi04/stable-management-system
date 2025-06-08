const mongoose = require('mongoose');

const stallSchema = new mongoose.Schema({
    stableId: {  type: mongoose.Schema.Types.ObjectId, ref: 'Stable', required: true },
    size: { type: String, required: true },
    status: { type: String, required: true, default: "available" }, // occupied, available, maintenance, competition leave
    horseId: { type: mongoose.Schema.Types.ObjectId, ref: 'Horse', default: null } 
});

module.exports = mongoose.model('Stall', stallSchema);