const asyncHandler = require('../middleware/asyncHandler');
const Post = require('../models/postModel');

// @desc    Get all posts
// @route   GET /api/community
const getPosts = asyncHandler(async (req, res) => {
  const posts = await Post.find({})
    .populate('user', 'name') // Get the user's name
    .sort({ createdAt: -1 }); // Newest first
  res.json(posts);
});

// @desc    Create a new post
// @route   POST /api/community
const createPost = asyncHandler(async (req, res) => {
  const { caption } = req.body;
  
  // The image path comes from Multer
  const imagePath = `/${req.file.path.replace(/\\/g, "/")}`;

  const post = await Post.create({
    user: req.user._id,
    image: imagePath,
    caption,
  });

  res.status(201).json(post);
});

// @desc    Like a post
// @route   PUT /api/community/:id/like
const likePost = asyncHandler(async (req, res) => {
  const post = await Post.findById(req.params.id);

  if (post) {
    // Check if already liked
    if (post.likes.includes(req.user._id)) {
      // Unlike
      post.likes = post.likes.filter(id => id.toString() !== req.user._id.toString());
    } else {
      // Like
      post.likes.push(req.user._id);
    }
    await post.save();
    res.json(post.likes);
  } else {
    res.status(404);
    throw new Error('Post not found');
  }
});

module.exports = { getPosts, createPost, likePost };