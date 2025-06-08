const express = require('express');
const expenseController = require('../controllers/expenseController');

const router = express.Router();

router.get('/', expenseController.getAllExpenses);
router.get('/:expenseID', expenseController.getExpenseById);
router.post('/', expenseController.createExpense);
router.put('/:expenseID', expenseController.updateExpense);
router.delete('/:expenseID', expenseController.deleteExpense);

module.exports = router;