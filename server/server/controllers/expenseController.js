const Expense = require('../models/Expense');

// GET /expenses
exports.getAllExpenses = async (req, res) => {
    try {
        const expenses = await Expense.find();
        res.status(200).json({
            expenses: expenses
        });
    } catch (err) {
        console.log(err);
        res.status(500).json({
            message: '🍎 Invalid request',
            error: err.message
        });
    }
};

// GET /expenses/:expenseID
exports.getExpenseById = async (req, res) => {
    try {
        const expenseId = req.params.expenseID;
        const expense = await Expense.findById(expenseId);

        if(!expense) {
            return res.status(404).json({
                message: '🍎 Expense not found'
            });
        }

        res.status(200).json({
            expense: expense
        });
    } catch (err) {
        console.log(err);
        res.status(500).json({
            message: '🍎 Invalid request',
            error: err.message
        });
    }
};

// POST /expenses
exports.createExpense = async (req, res) => {
    try {
        const expense = new Expense(req.body);
        await expense.save();
        res.status(201).json({
            message: '🍏 Expense successfully created!',
            expense: expense
        });
    } catch (err) {
        console.log(err);
        res.status(400).json({
            message: '🍎 Invalid request',
            error: err.message
        });
    }
};

// PUT /expenses/:expenseID
exports.updateExpense = async (req, res) => {
    try {
        const expenseId = req.params.expenseID;
        const updatedExpense = await Expense.findByIdAndUpdate(expenseId, req.body, {
            new: true,
            runValidators: true,
        });

        if(!updatedExpense) {
            return res.status(404).json({
                message: '🍎 Expense not found'               
            });
        }

        res.status(200).json({
            message: '🍏 Expense updated successfully!',
            updatedExpense: updatedExpense
        });
    } catch (err) {
        console.log(err);
        res.status(400).json({
            message: '🍎 Invalid request',
            error: err.message
        });
    }
};

// DELETE /expenses/:expenseID
exports.deleteExpense = async (req, res) => {
    try {
        const expenseId = req.params.expenseID;
        const deletedExpense = await Expense.findByIdAndDelete(expenseId);

        if(!deletedExpense) {
            return res.status(404).json({
                message: '🍎 Expense not found'               
            });
        }

        await deletedExpense.deleteOne();
        res.status(200).json({
            message: '🍏 Expense deleted successfully!',
            deletedExpense: deletedExpense
        });
    } catch (err) {
        console.log(err);
        res.status(500).json({
            message: '🍎 Internal error while deleting expense',
            error: err.message
        });
    }
};