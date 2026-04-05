// backend/controllers/pickupController.js

const Pickup = require('../models/pickupModel');
const Identification = require('../models/identificationModel');
const asyncHandler = require('../middleware/asyncHandler');


// @desc    Schedule a pickup
// @route   POST /api/pickups
// @access  Private
const createPickup = asyncHandler(async (req, res) => {

  const { items, address, scheduledAt } = req.body;

  // ✅ AUTH CHECK (VERY IMPORTANT)
  if (!req.user) {
    res.status(401);
    throw new Error("Not authorized");
  }

  // ✅ VALIDATION
  if (!items || items.length === 0) {
    res.status(400);
    throw new Error("No items provided");
  }

  if (!address) {
    res.status(400);
    throw new Error("Address is required");
  }

  if (!scheduledAt) {
    res.status(400);
    throw new Error("Schedule date required");
  }

  const pickup = await Pickup.create({
    userId: req.user._id,
    items,
    address,
    scheduledAt,
    status: 'pending'
  });

  res.status(201).json(pickup);
});


// @desc    Get user stats (My Impact)
// @route   GET /api/pickups/impact
// @access  Private
const getMyImpact = asyncHandler(async (req, res) => {

  // ✅ AUTH CHECK
  if (!req.user) {
    res.status(401);
    throw new Error("Not authorized");
  }

  // 1. Total scans
  const totalScans = await Identification.countDocuments({
    userId: req.user._id
  });

  // 2. Total pickups
  const totalPickups = await Pickup.countDocuments({
    userId: req.user._id
  });

  // 3. CO2 saved (safe calculation)
  const co2Saved = Number(totalScans * 0.5).toFixed(1);

  // 4. Recent pickups
  const recentPickups = await Pickup.find({
    userId: req.user._id
  })
    .sort({ createdAt: -1 })
    .limit(3);

  res.status(200).json({
    totalScans,
    totalPickups,
    co2Saved,
    recentPickups
  });
});


module.exports = {
  createPickup,
  getMyImpact
};