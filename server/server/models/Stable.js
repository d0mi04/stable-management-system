const mongoose = require('mongoose');

const stableSchema = new mongoose.Schema ({
    "fullName": { type: String, required: true, unique: true },
    "location": { type: String },
    "capacity": { type: Number, required: true },
    "description": { type: String },
    "stallArray": [
        { type: mongoose.Schema.Types.ObjectId, ref: 'Stall' } // lista boksów w danej stajni
    ]
});

module.exports = mongoose.model('Stable', stableSchema);