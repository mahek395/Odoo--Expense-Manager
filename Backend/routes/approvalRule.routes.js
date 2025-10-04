const express = require('express');
const router = express.Router();
const { protect } = require('../middlewares/auth.middleware');
const { roleCheck } = require('../middlewares/roleCheck');
const { createApprovalRule, getApprovalRules } = require('../controllers/approvalRule.controller');

// Only Admin can create rules
router.post('/', protect, roleCheck(['Admin']), createApprovalRule);

// Admin/Manager can get rules
router.get('/', protect, getApprovalRules);

module.exports = router;
