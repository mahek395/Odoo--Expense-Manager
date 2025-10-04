// models/ApprovalLog.js
const mongoose = require('mongoose');

const approvalLogSchema = new mongoose.Schema({
  expense: { type: mongoose.Schema.Types.ObjectId, ref: 'Expense', required: true },
  approver: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  decision: { type: String, enum: ['Approved', 'Rejected'], required: true },
  comment: { type: String },
}, { timestamps: true });

module.exports = mongoose.model('ApprovalLog', approvalLogSchema);
