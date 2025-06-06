const mongoose = require('mongoose');

const stallSchema = new mongoose.Schema({
    number: {  type: String, required: true, unique: true },
    size: { type: String, required: true },
    occupied: { type: Boolean, required: true },
    horseId: { type: mongoose.Schema.Types.ObjectId, ref: 'Horse'}
});

module.exports = mongoose.model('Stall', stallSchema);