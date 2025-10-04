// controllers/auth.controller.js
const User = require('../models/User');
const Company = require('../models/Company');
const jwt = require('jsonwebtoken');
const axios = require('axios');

const generateToken = (id, role) => {
  return jwt.sign({ id, role }, process.env.JWT_SECRET, { expiresIn: "1d" });
};

exports.register = async (req, res) => {
  try {
    const { name, email, password, role, companyName, country } = req.body;

    // Check if user already exists
    const userExists = await User.findOne({ email });
    if (userExists) return res.status(400).json({ message: "User already exists" });

    // Create user
    const user = await User.create({ name, email, password, role: role || 'Admin' });

    // If role is Admin, create company automatically
    if (user.role === 'Admin') {
      // Fetch country currency from API
      let currency = 'USD'; // default fallback
      try {
        const response = await axios.get('https://restcountries.com/v3.1/all?fields=name,currencies');
        const countryData = response.data.find(c => c.name.common === country);
        if (countryData) currency = Object.keys(countryData.currencies)[0];
      } catch (err) {
        console.log("Error fetching currency, using default USD");
      }

      // Create company
      const company = await Company.create({
        name: companyName,
        country,
        currency,
        admin: user._id
      });

      // Link admin to company
      user.company = company._id;
      await user.save();
    }

    res.status(201).json({
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      company: user.company,
      token: generateToken(user._id, user.role)
    });

  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });

    if (!user || !(await user.matchPassword(password))) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    res.json({
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      company: user.company,
      token: generateToken(user._id, user.role)
    });

  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
