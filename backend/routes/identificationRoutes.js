// backend/routes/identificationRoutes.js
const express = require('express');
const router = express.Router();
const { identifyWaste, getHistory } = require('../controllers/identificationController');
const { protect } = require('../middleware/authMiddleware');
const upload = require('../middleware/uploadMiddleware');

// POST /api/identify - Protected + File Upload
// 'image' is the key name we must use in Postman/Thunder Client
router.post('/', protect, upload.single('image'), identifyWaste);

// GET /api/identify/history - Protected
router.get('/history', protect, getHistory);


// POST route that accepts a single file named 'image'
router.post('/identify', upload.single('image'), identifyWaste);

module.exports = router;