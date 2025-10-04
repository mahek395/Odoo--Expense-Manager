const Expense = require('../models/Expense');

// Submit new expense claim
exports.submitExpense = async (req, res) => {
  try {
    const { amount, currency, category, description, date } = req.body;

    // Simple validation
    if (!amount || !category || !date) {
      return res.status(400).json({ message: "Amount, category, and date are required" });
    }

    const expense = await Expense.create({
      employee: req.user._id,
      amount,
      currency: currency || 'USD',
      category,
      description,
      date
    });

    res.status(201).json({ message: "Expense submitted successfully", expense });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: err.message });
  }
};

// Get expense history for logged-in employee
exports.getExpenseHistory = async (req, res) => {
  try {
    const expenses = await Expense.find({ employee: req.user._id })
      .sort({ date: -1 }); // latest first

    res.json({ expenses });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: err.message });
  }
};
// Add this at the end of the file, before module.exports

// Get dashboard stats
exports.getDashboardStats = async (req, res) => {
  try {
    const userId = req.user._id;
    
    // Get user's expenses
    const expenses = await Expense.find({ employee: userId });
    
    const totalAmount = expenses.reduce((sum, exp) => sum + exp.amount, 0);
    const pendingCount = expenses.filter(e => e.status === 'Pending').length;
    
    const startOfMonth = new Date();
    startOfMonth.setDate(1);
    startOfMonth.setHours(0, 0, 0, 0);
    
    const approvedThisMonth = expenses.filter(e => 
      e.status === 'Approved' && 
      new Date(e.updatedAt) >= startOfMonth
    ).length;
    
    res.json({
      totalExpenses: totalAmount,
      pendingApprovals: pendingCount,
      approvedThisMonth,
      totalCount: expenses.length
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Get all expenses (admin)
exports.getAllExpenses = async (req, res) => {
  try {
    const expenses = await Expense.find()
      .sort({ date: -1 })
      .populate('employee', 'name email'); // optional: include employee info
    res.json({ expenses });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Update expense status (admin approve/reject)
exports.updateExpenseStatus = async (req, res) => {
  try {
    const { status } = req.body; // 'Approved' | 'Rejected'
    const expense = await Expense.findById(req.params.id);
    if (!expense) return res.status(404).json({ message: 'Expense not found' });

    expense.status = status;
    await expense.save();

    res.json({ message: `Expense ${status}`, expense });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
