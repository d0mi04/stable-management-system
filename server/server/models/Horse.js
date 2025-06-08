const mongoose = require('mongoose');

const horseSchema = new mongoose.Schema ({
    name: { type: String, required: true },
    birthDate: { type: Date },
    breed: { type: String },
    owner: { type: String },
    ownerEmail: { type: String },
    stallId: { type: mongoose.Schema.Types.ObjectId, ref: 'Stall', unique: true, default: null, sparse: true}, // sparse - nie będzie wywalać błędu, że wylko jeden koń może mieć null
    status: { type: String }, // available, training, sick, left for competition
    notes: { type: String }
});

module.exports = mongoose.model('Horse', horseSchema);