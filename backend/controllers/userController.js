// backend/controllers/userController.js

const jwt = require('jsonwebtoken');
const User = require('../models/userModel');
const generateToken = require('../utils/generateToken');
const asyncHandler = require('../middleware/asyncHandler');


// @desc    Register a new user
// @route   POST /api/auth/register
// @access  Public
const registerUser = asyncHandler(async (req, res) => {

  const { name, email, password } = req.body;

  // ✅ VALIDATION
  if (!name || !email || !password) {
    res.status(400);
    throw new Error("Please provide all fields");
  }

  // ✅ CHECK EXISTING USER
  const userExists = await User.findOne({ email });

  if (userExists) {
    res.status(400);
    throw new Error('User already exists');
  }

  // ✅ CREATE USER
  const user = await User.create({
    profile: { name },
    email,
    password,
  });

  if (user) {
    // ✅ Set cookie
    generateToken(res, user._id);

    // ✅ Send response
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


// @desc    Login user
// @route   POST /api/auth/login
// @access  Public
const loginUser = asyncHandler(async (req, res) => {

  const { email, password } = req.body;

  // ✅ VALIDATION
  if (!email || !password) {
    res.status(400);
    throw new Error("Email and password required");
  }

  const user = await User.findOne({ email });

  // ✅ CHECK PASSWORD
  if (user && (await user.matchPassword(password))) {

    // ✅ Set HttpOnly cookie
    generateToken(res, user._id);

    // ✅ Generate JWT for frontend (optional but useful)
    const token = jwt.sign(
      { userId: user._id },
      process.env.JWT_SECRET,
      { expiresIn: '30d' }
    );

    res.status(200).json({
      _id: user._id,
      name: user.profile.name,
      email: user.email,
      token,
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

  // ✅ SAFETY CHECK
  if (!req.user) {
    res.status(401);
    throw new Error("Not authorized");
  }

  const user = {
    _id: req.user._id,
    name: req.user.profile.name,
    email: req.user.email,
  };

  res.status(200).json(user);
});


// @desc    Logout user
// @route   POST /api/auth/logout
// @access  Public
const logoutUser = asyncHandler(async (req, res) => {

  res.cookie('jwt', '', {
    httpOnly: true,
    expires: new Date(0),
  });

  res.status(200).json({ message: 'Logged out successfully' });
});


module.exports = {
  registerUser,
  loginUser,
  getUserProfile,
  logoutUser
};