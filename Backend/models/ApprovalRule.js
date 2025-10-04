// models/ApprovalRule.js
const mongoose = require('mongoose');

const approvalRuleSchema = new mongoose.Schema({
  company: { type: mongoose.Schema.Types.ObjectId, ref: 'Company', required: true },
  type: { type: String, enum: ['percentage', 'specific', 'hybrid'], required: true },
  config: { type: Object, required: true } 
  // e.g. { percentage: 60 } OR { approver: 'CFO' } OR { percentage: 60, approver: 'CFO' }
}, { timestamps: true });

module.exports = mongoose.model('ApprovalRule', approvalRuleSchema);
