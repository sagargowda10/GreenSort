// backend/routes/locationRoutes.js
const express = require('express');
const router = express.Router();
const {
  getLocations,
  createLocation,
} = require('../controllers/locationController');
const { protect } = require('../middleware/authMiddleware');

// Public: Search/Get locations
router.get('/', getLocations);

// Protected: Add a location
router.post('/', protect, createLocation);

module.exports = router;