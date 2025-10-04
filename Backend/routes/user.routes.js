const express = require('express');
const router = express.Router();
const User = require('../models/User');
const { protect } = require('../middlewares/auth.middleware'); // JWT auth middleware

// GET /api/users → Get all users
router.get('/', protect, async (req, res) => {
  try {
    const users = await User.find().select('-password'); // Exclude password
    res.json({ users }); // Must return an object with "users" key
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

// DELETE /api/users/:id → Delete user
router.delete('/:id', protect, async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ message: 'User not found' });

    await user.remove();
    res.json({ message: 'User deleted successfully' });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

// PUT /api/users/:id/toggle → Toggle user status (active/inactive)
router.put('/:id/toggle', protect, async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ message: 'User not found' });

    user.status = user.status === 'inactive' ? 'active' : 'inactive';
    await user.save();

    res.json({ user });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
