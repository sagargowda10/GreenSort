// backend/controllers/userController.js
const jwt = require('jsonwebtoken'); // <--- 1. ADDED THIS IMPORT
const User = require('../models/userModel');
const generateToken = require('../utils/generateToken');
const asyncHandler = require('../middleware/asyncHandler');

// @desc    Register a new user
// @route   POST /api/auth/register
// @access  Public
const registerUser = asyncHandler(async (req, res) => {
  const { name, email, password } = req.body;

  const userExists = await User.findOne({ email });

  if (userExists) {
    res.status(400);
    throw new Error('User already exists');
  }

  const user = await User.create({
    'profile.name': name,
    email,
    password,
  });

  if (user) {
    generateToken(res, user._id);

    res.status(201).json({
      _id: user._id,
      name: user.profile.name,
      email: user.email,
    });
  } else {
    res.status(400);
    throw new Error('Invalid user data');
  }
});

// @desc    Authenticate user & get token (login)
// @route   POST /api/auth/login
// @access  Public
const loginUser = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  const user = await User.findOne({ email });

  if (user && (await user.matchPassword(password))) {
    // This sets the HttpOnly cookie (keep this!)
    generateToken(res, user._id);

    // <--- 2. NEW: Generate token string to send in JSON
    const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, {
      expiresIn: '30d',
    });

    res.status(200).json({
      _id: user._id,
      name: user.profile.name,
      email: user.email,
      token: token, // <--- Sending the token to you!
    });
  } else {
    res.status(401);
    throw new Error('Invalid email or password');
  }
});

// @desc    Get user profile
// @route   GET /api/auth/profile
// @access  Private
const getUserProfile = asyncHandler(async (req, res) => {
  const user = {
    _id: req.user._id,
    name: req.user.profile.name,
    email: req.user.email,
  };

  res.status(200).json(user);
});

module.exports = {
  registerUser,
  loginUser,
  getUserProfile,
};