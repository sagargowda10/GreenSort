const express = require('express');
const router = express.Router();
const { getPosts, createPost, likePost } = require('../controllers/postController');
const { protect } = require('../middleware/authMiddleware');
const upload = require('../middleware/uploadMiddleware');

router.route('/')
  .get(getPosts)
  .post(protect, upload.single('image'), createPost);

router.put('/:id/like', protect, likePost);

module.exports = router;