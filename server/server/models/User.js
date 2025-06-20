const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
    email: {type: String, required: true, unique: true},
    username: {type: String, required: true, unique: true},
    password: {type: String, required: true },
    role: {type: String, enum: ['admin', 'user'], default: 'user'},
    myHorses: [
        { type: mongoose.Schema.Types.ObjectId, ref: 'Horse'}
    ]
});

module.exports = mongoose.model('User', userSchema);