// backend/controllers/pickupController.js
const Pickup = require('../models/pickupModel');
const Identification = require('../models/identificationModel');
const asyncHandler = require('../middleware/asyncHandler');

// @desc    Schedule a pickup
// @route   POST /api/pickups
// @access  Private
const createPickup = asyncHandler(async (req, res) => {
  const { items, address, scheduledAt } = req.body;

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
  // 1. Count total identifications (Scans)
  const totalScans = await Identification.countDocuments({ userId: req.user._id });

  // 2. Count total pickups
  const totalPickups = await Pickup.countDocuments({ userId: req.user._id });

  // 3. Calculate estimated CO2 saved (Mock calculation: 0.5kg per scan)
  const co2Saved = (totalScans * 0.5).toFixed(1);

  // 4. Get recent activity
  const recentPickups = await Pickup.find({ userId: req.user._id })
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