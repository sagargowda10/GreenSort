const asyncHandler = require('../middleware/asyncHandler');
const Post = require('../models/postModel');

// @desc    Get all posts
// @route   GET /api/community
const getPosts = asyncHandler(async (req, res) => {
  const posts = await Post.find({})
    .populate('user', 'name')
    .sort({ createdAt: -1 });

  res.json(posts);
});


// @desc    Create a new post
// @route   POST /api/community
const createPost = asyncHandler(async (req, res) => {
  const { caption } = req.body;

  // ✅ Check user authentication
  if (!req.user) {
    res.status(401);
    throw new Error("Not authorized");
  }

  // ✅ Safe image handling (prevents crash)
  const imagePath = req.file
    ? `/${req.file.path.replace(/\\/g, "/")}`
    : null;

  const post = await Post.create({
    user: req.user._id,
    image: imagePath,
    caption,
  });

  res.status(201).json(post);
});


// @desc    Like / Unlike a post
// @route   PUT /api/community/:id/like
const likePost = asyncHandler(async (req, res) => {
  const post = await Post.findById(req.params.id);

  // ✅ Check if post exists
  if (!post) {
    res.status(404);
    throw new Error("Post not found");
  }

  // ✅ Check user authentication
  if (!req.user) {
    res.status(401);
    throw new Error("Not authorized");
  }

  // ✅ Safe like check (ObjectId comparison)
  const alreadyLiked = post.likes.some(
    (id) => id.toString() === req.user._id.toString()
  );

  if (alreadyLiked) {
    // Unlike
    post.likes = post.likes.filter(
      (id) => id.toString() !== req.user._id.toString()
    );
  } else {
    // Like
    post.likes.push(req.user._id);
  }

  await post.save();

  res.json(post.likes);
});


module.exports = { getPosts, createPost, likePost };