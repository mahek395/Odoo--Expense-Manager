const express = require('express');
const router = express.Router();
const { protect } = require('../middlewares/auth.middleware');
const { getPendingExpenses, approveRejectExpense } = require('../controllers/approval.controller');

// Manager/Admin: view pending approvals
router.get('/pending', protect, getPendingExpenses);

// Approve/Reject an expense
router.put('/:expenseId', protect, approveRejectExpense);

module.exports = router;
