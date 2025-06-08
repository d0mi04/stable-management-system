const mongoose = require('mongoose');

const expenseSchema = new mongoose.Schema({
    date: { type: Data, required: true }, // 2025-06-01
    type: { type: String, enum: ['expense', 'income'], required: true }, // expense or income
    category: { type: String, required: true }, // rent, horse food, repair
    relatedTo: { type: mongoose.Schema.Types.ObjectId, refPath: 'relatedModel' },
    relatedModel: { type: String, enum: ['Horse', 'Staff']}, // related model mówi do której kolekcji należy obiekt - Horse lub Staff
    amount: { type: Number, required: true }, // 2000
    settled: { type: Boolean, default: false }, // czy wydatek jest rozliczony --> można później filtrować
    description: { type: String } // monthly rent - Fantazja
});

module.exports = mongoose.model('Expense', expenseSchema);