const express = require('express');
const router = express.Router();
const { protect } = require('../middlewares/auth.middleware');
const { submitExpense, getExpenseHistory } = require('../controllers/expense.controller');
const { getAllExpenses, updateExpenseStatus } = require('../controllers/expense.controller');

// Employee can submit a new expense
router.post('/submit', protect, submitExpense);

// Employee can view their own expense history
router.get('/my',  protect, getExpenseHistory);

// In expense.routes.js
router.get('/dashboard-stats', protect, require('../controllers/expense.controller').getDashboardStats);4

// Admin endpoints
router.get('/', protect, getAllExpenses); // GET /api/expenses
router.put('/:id/status', protect, updateExpenseStatus); // PUT /api/expenses/:id/status


module.exports = router;
