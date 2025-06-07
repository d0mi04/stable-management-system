const mongoose = require('mongoose');

const horseSchema = new mongoose.Schema ({
    name: { type: String, required: true },
    age: { type: Number },
    breed: { type: String },
    owner: { type: String },
    ownerEmail: { type: String, required: true},
    stallId: { type: mongoose.Schema.Types.ObjectId, ref: 'Stall' },
    notes: { type: String }
}, {
    timestamps: true
});

module.exports = mongoose.model('Horse', horseSchema);