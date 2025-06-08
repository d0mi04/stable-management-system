const mongoose = require('mongoose');

const staffSchema = new mongoose.Schema ({
    name: { type: String, required: true }, // Jan Kowalski
    phone: { type: Number, required: true }, // 123456789
    email: { type: String, required: true, unique: true },
    role: { type: String, required: true },
    specialities: [
        { type: String, required: true } // groomer
    ],
    schedule: [
        { type: String, required: true }
    ]
});

module.exports = mongoose.model('Staff', staffSchema);