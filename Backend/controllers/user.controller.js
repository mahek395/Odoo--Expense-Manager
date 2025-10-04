const User = require("../models/User");

exports.getUsers = async (req, res) => {
  try {
    // Only return users from the same company as logged-in user
    const users = await User.find({ company: req.user.company })
      .select("-password") // hide password
      .populate("manager", "name email");

    res.json(users);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
