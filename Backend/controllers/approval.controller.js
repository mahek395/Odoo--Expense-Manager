const Expense = require('../models/Expense');
const ApprovalLog = require('../models/ApprovalLog');
const ApprovalRule = require('../models/ApprovalRule');
const User = require('../models/User');

// Get pending expenses for logged-in approver
exports.getPendingExpenses = async (req, res) => {
  try {
    // Find expenses which are still pending
    const expenses = await Expense.find({ status: 'Pending' })
      .sort({ date: -1 });

    // Filter expenses where approver hasn't approved yet
    const pending = [];
    for (const exp of expenses) {
      const logs = await ApprovalLog.find({ expense: exp._id });
      const approvers = logs.map(l => l.approver.toString());

      // If current user hasn't approved/rejected yet, add to pending
      if (!approvers.includes(req.user._id.toString())) {
        pending.push(exp);
      }
    }

    res.json({ expenses: pending });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: err.message });
  }
};

// Approve or Reject an expense
exports.approveRejectExpense = async (req, res) => {
  try {
    const { expenseId } = req.params;
    const { decision, comment } = req.body;

    if (!['Approved', 'Rejected'].includes(decision)) {
      return res.status(400).json({ message: 'Decision must be Approved or Rejected' });
    }

    const expense = await Expense.findById(expenseId);
    if (!expense) return res.status(404).json({ message: 'Expense not found' });

    // Check if user already approved/rejected
    const existingLog = await ApprovalLog.findOne({ expense: expenseId, approver: req.user._id });
    if (existingLog) {
      return res.status(400).json({ message: 'You have already acted on this expense' });
    }

    // Create ApprovalLog
    await ApprovalLog.create({
      expense: expenseId,
      approver: req.user._id,
      decision,
      comment
    });

    // Check if there is an approval rule for this company
    const rule = await ApprovalRule.findOne({ company: req.user.company });
    let finalDecision = null;

    if (rule) {
      const logs = await ApprovalLog.find({ expense: expenseId });
      const totalApprovers = logs.length + 1; // approximate if you want full approvers list
      const approvedCount = logs.filter(l => l.decision === 'Approved').length + (decision === 'Approved' ? 1 : 0);

      // Conditional logic
      if (rule.type === 'percentage') {
        if ((approvedCount / totalApprovers) * 100 >= rule.config.percentage) {
          finalDecision = 'Approved';
        }
      } else if (rule.type === 'specific') {
        if (decision === 'Approved' && req.user._id.toString() === rule.config.approver.toString()) {
          finalDecision = 'Approved';
        }
      } else if (rule.type === 'hybrid') {
        const percMet = (approvedCount / totalApprovers) * 100 >= rule.config.percentage;
        const specificMet = decision === 'Approved' && req.user._id.toString() === rule.config.approver.toString();
        if (percMet || specificMet) finalDecision = 'Approved';
      }
    }

    // If no rule or final approval reached
    if (!finalDecision) {
      finalDecision = decision === 'Rejected' ? 'Rejected' : null;
    }

    if (finalDecision) {
      expense.status = finalDecision;
      await expense.save();
    }

    res.json({ message: `Expense ${decision} successfully`, expense });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: err.message });
  }
};
