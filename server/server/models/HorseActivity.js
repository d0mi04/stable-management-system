const mongoose = require('mongoose');

const horseActivitySchema = new mongoose.Schema({
    horseId: { type: mongoose.Schema.Types.ObjectId, ref: 'Horse', required: true },
    date: { type: Date }, // 2025-07-12T14:00
    durationMinutes: { type: Number }, // 1h
    allDay: { type: Boolean, default: false },
    type: { type: String }, // feeding, training, vet appointment, etc.
    notes: { type: String } // prepare horse's passport!
});

module.exports = mongoose.model('HorseActivity', horseActivitySchema);