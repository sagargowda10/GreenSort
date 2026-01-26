// backend/routes/pickupRoutes.js
const express = require('express');
const router = express.Router();
const { createPickup, getMyImpact } = require('../controllers/pickupController');
const { protect } = require('../middleware/authMiddleware');

router.post('/', protect, createPickup);
router.get('/impact', protect, getMyImpact);

module.exports = router;