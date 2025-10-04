// controllers/admin.controller.js
const User = require('../models/User');

// Create Employee/Manager
exports.createUser = async (req, res) => {
  try {
    const { name, email, password, role, managerId } = req.body;

    // Check if user already exists
    const userExists = await User.findOne({ email });
    if (userExists) return res.status(400).json({ message: "User already exists" });

    // Create user under admin's company
    const user = await User.create({
      name,
      email,
      password,
      role,
      company: req.user.company,
      manager: managerId || null
    });

    res.status(201).json(user);

  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Change role of a user
exports.changeUserRole = async (req, res) => {
  try {
    const { userId, newRole } = req.body;
    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ message: "User not found" });

    // Ensure same company
    if (user.company.toString() !== req.user.company.toString()) {
      return res.status(403).json({ message: "Cannot change role of users outside your company" });
    }

    user.role = newRole;
    await user.save();
    res.json(user);

  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Assign/Change manager for an employee
exports.assignManager = async (req, res) => {
  try {
    const { userId, managerId } = req.body;

    // Fetch both users
    const user = await User.findById(userId);
    const manager = await User.findById(managerId);

    if (!user || !manager)
      return res.status(404).json({ message: "User or Manager not found" });

    // Ensure company fields exist
    if (!user.company || !manager.company || !req.user.company) {
      return res.status(400).json({ message: "Company not set for user/manager" });
    }

    // Ensure same company
    if (
      user.company.toString() !== req.user.company.toString() ||
      manager.company.toString() !== req.user.company.toString()
    ) {
      return res.status(403).json({ message: "Users must belong to the same company" });
    }

    // Ensure manager role
    if (manager.role !== 'Manager')
      return res.status(400).json({ message: "Assigned user is not a manager" });

    // Assign manager
    user.manager = managerId;
    await user.save();

    res.json({ message: "Manager assigned successfully", user });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: err.message });
  }
};
