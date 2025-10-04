const ApprovalRule = require('../models/ApprovalRule');

// Create a new approval rule
exports.createApprovalRule = async (req, res) => {
  try {
    const { company, type, config } = req.body;

    if (!company || !type || !config) {
      return res.status(400).json({ message: "All fields are required" });
    }

    const rule = await ApprovalRule.create({ company, type, config });
    res.status(201).json(rule);

  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Get all approval rules for a company
exports.getApprovalRules = async (req, res) => {
  try {
    const rules = await ApprovalRule.find({ company: req.user.company });
    res.json(rules);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
