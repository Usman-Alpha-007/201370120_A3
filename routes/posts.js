const express = require('express');
const router = express.Router();
const Post = require('../models/Post');
const { authMiddleware } = require('./auth');


router.post('/', authMiddleware, async (req, res) => {
  try {
    const { title, content } = req.body;
    const userId = req.userData.userId;

    const newPost = new Post({
      title,
      content,
      author: userId,
    });

    await newPost.save();

    res.status(201).json({ message: 'Post created successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

router.get('/', async (req, res) => {
  try {
    const posts = await Post.find().populate('author', 'username');
    res.status(200).json({ posts });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Retrieve a specific post by ID (GET)
router.get('/:postId', async (req, res) => {
  try {
    const postId = req.params.postId;
    const post = await Post.findById(postId).populate('author', 'username');

    if (!post) {
      return res.status(404).json({ message: 'Post not found' });
    }

    res.status(200).json({ post });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Update a post by ID (PUT)
router.put('/:postId', authMiddleware, async (req, res) => {
  try {
    const postId = req.params.postId;
    const { title, content } = req.body;

    const post = await Post.findById(postId);

    if (!post) {
      return res.status(404).json({ message: 'Post not found' });
    }

    if (post.author.toString() !== req.userData.userId) {
      return res.status(403).json({ message: 'Not authorized to update this post' });
    }

    post.title = title;
    post.content = content;
    await post.save();

    res.status(200).json({ message: 'Post updated successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});


router.delete('/:postId', authMiddleware, async (req, res) => {
  try {
    const postId = req.params.postId;

    const post = await Post.findById(postId);

    if (!post) {
      return res.status(404).json({ message: 'Post not found' });
    }

    if (post.author.toString() !== req.userData.userId) {
      return res.status(403).json({ message: 'Not authorized to delete this post' });
    }

    await post.remove();

    res.status(200).json({ message: 'Post deleted successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
