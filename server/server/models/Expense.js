const mongoose = require('mongoose');

const expenseSchema = new mongoose.Schema({
    date: { type: Date, required: true }, // 2025-06-01
    type: { type: String, enum: ['expense', 'income'], required: true }, // expense or income
    category: { type: String, required: true }, // rent, horse food, repair, maintenance, etc.
    relatedTo: { type: mongoose.Schema.Types.ObjectId, refPath: 'relatedModel', default: null },
    relatedModel: { type: String, enum: ['Horse', 'Staff', 'Stable'], default: null}, // related model mówi do której kolekcji należy obiekt - Horse, Staff, Stable
    amount: { type: Number, required: true }, // 2000
    settled: { type: Boolean, default: false }, // czy wydatek jest rozliczony --> można później filtrować
    description: { type: String } // monthly rent - Fantazja
});

module.exports = mongoose.model('Expense', expenseSchema);