const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
    email: {type: String, required: true, unique: true},
    username: {type: String, required: true, unique: true},
    password: {type: String }, // usunęłam required: true, bo do logowania google to pole będzie puste (chyba)
    role: {type: String, enum: ['admin', 'user'], default: 'user'},
    myHorses: [
        { type: mongoose.Schema.Types.ObjectId, ref: 'Horse'}
    ],
    googleId: { type: String }
});

module.exports = mongoose.model('User', userSchema);