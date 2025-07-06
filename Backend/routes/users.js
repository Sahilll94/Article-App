const express = require('express');
const User = require('../models/User');
const Article = require('../models/Article');
const { auth, optionalAuth } = require('../middleware/auth');
const {
  createPagination,
  formatErrorResponse,
  formatSuccessResponse
} = require('../utils/helpers');

const router = express.Router();

// @route   GET /api/users/username/:username
// @desc    Get user profile by username
// @access  Public
router.get('/username/:username', optionalAuth, async (req, res) => {
  try {
    const { username } = req.params;

    const user = await User.findOne({ username: username.toLowerCase() })
      .select('-password')
      .populate('followers', 'name email avatar username')
      .populate('following', 'name email avatar username');

    if (!user) {
      return res.status(404).json(
        formatErrorResponse('User not found', 404)
      );
    }

    // Get user's published articles count
    const publishedArticlesCount = await Article.countDocuments({
      author: user._id,
      status: 'published',
      visibility: 'public'
    });

    const userProfile = {
      ...user.toJSON(),
      publishedArticlesCount,
      followersCount: user.followers.length,
      followingCount: user.following.length
    };

    res.json(
      formatSuccessResponse('User profile retrieved successfully', userProfile, null, req.timezone)
    );
  } catch (error) {
    console.error('Get user profile by username error:', error);
    res.status(500).json(
      formatErrorResponse('Server error while retrieving user profile')
    );
  }
});

// @route   GET /api/users/:id
// @desc    Get user profile by ID
// @access  Public
router.get('/:id', optionalAuth, async (req, res) => {
  try {
    const { id } = req.params;

    const user = await User.findById(id)
      .select('-password')
      .populate('followers', 'name email avatar')
      .populate('following', 'name email avatar');

    if (!user) {
      return res.status(404).json(
        formatErrorResponse('User not found', 404)
      );
    }

    // Get user's published articles count
    const publishedArticlesCount = await Article.countDocuments({
      author: user._id,
      status: 'published',
      visibility: 'public'
    });

    const userProfile = {
      ...user.toJSON(),
      publishedArticlesCount,
      followersCount: user.followers.length,
      followingCount: user.following.length
    };

    res.json(
      formatSuccessResponse('User profile retrieved successfully', userProfile, null, req.timezone)
    );
  } catch (error) {
    console.error('Get user profile error:', error);
    res.status(500).json(
      formatErrorResponse('Server error while retrieving user profile')
    );
  }
});

// @route   GET /api/users/username/:username/articles
// @desc    Get user's published articles by username
// @access  Public
router.get('/username/:username/articles', async (req, res) => {
  try {
    const { username } = req.params;
    const {
      page = 1,
      limit = 10,
      sortBy = 'publishedAt',
      sortOrder = 'desc'
    } = req.query;

    // Check if user exists
    const user = await User.findOne({ username: username.toLowerCase() });
    if (!user) {
      return res.status(404).json(
        formatErrorResponse('User not found', 404)
      );
    }

    // Build query for published and public articles only
    const query = {
      author: user._id,
      status: 'published',
      visibility: 'public'
    };

    // Count total documents
    const total = await Article.countDocuments(query);
    const pagination = createPagination(page, limit, total);

    // Sort options
    const sortOptions = {};
    sortOptions[sortBy] = sortOrder === 'desc' ? -1 : 1;

    // Get articles
    const articles = await Article.find(query)
      .populate('author', 'name email avatar username')
      .sort(sortOptions)
      .skip(pagination.skip)
      .limit(pagination.itemsPerPage)
      .select('title slug excerpt featuredImage author status visibility tags category readTime views likeCount commentCount publishedAt createdAt updatedAt');

    res.json(
      formatSuccessResponse('User articles retrieved successfully', articles, pagination, req.timezone)
    );
  } catch (error) {
    console.error('Get user articles by username error:', error);
    res.status(500).json(
      formatErrorResponse('Server error while retrieving user articles')
    );
  }
});

// @route   GET /api/users/:id/articles
// @desc    Get user's published articles
// @access  Public
router.get('/:id/articles', async (req, res) => {
  try {
    const { id } = req.params;
    const {
      page = 1,
      limit = 10,
      sortBy = 'publishedAt',
      sortOrder = 'desc'
    } = req.query;

    // Check if user exists
    const user = await User.findById(id);
    if (!user) {
      return res.status(404).json(
        formatErrorResponse('User not found', 404)
      );
    }

    // Build query for published and public articles only
    const query = {
      author: id,
      status: 'published',
      visibility: 'public'
    };

    // Count total documents
    const total = await Article.countDocuments(query);
    const pagination = createPagination(page, limit, total);

    // Sort options
    const sortOptions = {};
    sortOptions[sortBy] = sortOrder === 'desc' ? -1 : 1;

    // Get articles
    const articles = await Article.find(query)
      .populate('author', 'name email avatar')
      .sort(sortOptions)
      .skip(pagination.skip)
      .limit(pagination.itemsPerPage)
      .select('title slug excerpt featuredImage author status visibility tags category readTime views likeCount commentCount publishedAt createdAt updatedAt');

    res.json(
      formatSuccessResponse('User articles retrieved successfully', articles, pagination, req.timezone)
    );
  } catch (error) {
    console.error('Get user articles error:', error);
    res.status(500).json(
      formatErrorResponse('Server error while retrieving user articles')
    );
  }
});

// @route   POST /api/users/:id/follow
// @desc    Follow/Unfollow user
// @access  Private
router.post('/:id/follow', auth, async (req, res) => {
  try {
    const { id } = req.params;

    if (id === req.user.id) {
      return res.status(400).json(
        formatErrorResponse('You cannot follow yourself', 400)
      );
    }

    const userToFollow = await User.findById(id);
    if (!userToFollow) {
      return res.status(404).json(
        formatErrorResponse('User not found', 404)
      );
    }

    const currentUser = await User.findById(req.user.id);

    // Check if already following
    const isFollowing = currentUser.following.includes(id);

    if (isFollowing) {
      // Unfollow
      currentUser.following.pull(id);
      userToFollow.followers.pull(req.user.id);
    } else {
      // Follow
      currentUser.following.push(id);
      userToFollow.followers.push(req.user.id);
    }

    await currentUser.save();
    await userToFollow.save();

    res.json(
      formatSuccessResponse(
        isFollowing ? 'User unfollowed successfully' : 'User followed successfully',
        {
          isFollowing: !isFollowing,
          followersCount: userToFollow.followers.length
        },
        null,
        req.timezone
      )
    );
  } catch (error) {
    console.error('Follow user error:', error);
    res.status(500).json(
      formatErrorResponse('Server error while processing follow request')
    );
  }
});

// @route   GET /api/users/:id/followers
// @desc    Get user's followers
// @access  Public
router.get('/:id/followers', async (req, res) => {
  try {
    const { id } = req.params;
    const {
      page = 1,
      limit = 20
    } = req.query;

    const user = await User.findById(id);
    if (!user) {
      return res.status(404).json(
        formatErrorResponse('User not found', 404)
      );
    }

    const total = user.followers.length;
    const pagination = createPagination(page, limit, total);

    const followers = await User.find({
      _id: { $in: user.followers }
    })
    .select('name email avatar bio')
    .skip(pagination.skip)
    .limit(pagination.itemsPerPage);

    res.json(
      formatSuccessResponse('Followers retrieved successfully', followers, pagination, req.timezone)
    );
  } catch (error) {
    console.error('Get followers error:', error);
    res.status(500).json(
      formatErrorResponse('Server error while retrieving followers')
    );
  }
});

// @route   GET /api/users/:id/following
// @desc    Get users that this user is following
// @access  Public
router.get('/:id/following', async (req, res) => {
  try {
    const { id } = req.params;
    const {
      page = 1,
      limit = 20
    } = req.query;

    const user = await User.findById(id);
    if (!user) {
      return res.status(404).json(
        formatErrorResponse('User not found', 404)
      );
    }

    const total = user.following.length;
    const pagination = createPagination(page, limit, total);

    const following = await User.find({
      _id: { $in: user.following }
    })
    .select('name email avatar bio')
    .skip(pagination.skip)
    .limit(pagination.itemsPerPage);

    res.json(
      formatSuccessResponse('Following retrieved successfully', following, pagination, req.timezone)
    );
  } catch (error) {
    console.error('Get following error:', error);
    res.status(500).json(
      formatErrorResponse('Server error while retrieving following')
    );
  }
});

// @route   GET /api/users/search
// @desc    Search users
// @access  Public
router.get('/search', async (req, res) => {
  try {
    const {
      q,
      page = 1,
      limit = 10
    } = req.query;

    if (!q || q.trim().length < 2) {
      return res.status(400).json(
        formatErrorResponse('Search query must be at least 2 characters long', 400)
      );
    }

    const searchRegex = new RegExp(q.trim(), 'i');
    const query = {
      $or: [
        { name: searchRegex },
        { email: searchRegex }
      ]
    };

    const total = await User.countDocuments(query);
    const pagination = createPagination(page, limit, total);

    const users = await User.find(query)
      .select('name email avatar bio articlesCount')
      .skip(pagination.skip)
      .limit(pagination.itemsPerPage);

    res.json(
      formatSuccessResponse('Users found', users, pagination, req.timezone)
    );
  } catch (error) {
    console.error('Search users error:', error);
    res.status(500).json(
      formatErrorResponse('Server error while searching users')
    );
  }
});

// @route   GET /api/users
// @desc    Get all users (with pagination)
// @access  Public
router.get('/', async (req, res) => {
  try {
    const {
      page = 1,
      limit = 10,
      sortBy = 'createdAt',
      sortOrder = 'desc'
    } = req.query;

    const total = await User.countDocuments();
    const pagination = createPagination(page, limit, total);

    // Sort options
    const sortOptions = {};
    sortOptions[sortBy] = sortOrder === 'desc' ? -1 : 1;

    const users = await User.find()
      .select('name email avatar bio articlesCount createdAt')
      .sort(sortOptions)
      .skip(pagination.skip)
      .limit(pagination.itemsPerPage);

    res.json(
      formatSuccessResponse('Users retrieved successfully', users, pagination, req.timezone)
    );
  } catch (error) {
    console.error('Get users error:', error);
    res.status(500).json(
      formatErrorResponse('Server error while retrieving users')
    );
  }
});

// @route   POST /api/users/:userId/follow
// @desc    Follow a user
// @access  Private
router.post('/:userId/follow', auth, async (req, res) => {
  try {
    const { userId } = req.params;
    const followerId = req.user.id;

    // Check if trying to follow self
    if (userId === followerId) {
      return res.status(400).json(
        formatErrorResponse('You cannot follow yourself', 400)
      );
    }

    // Check if user to follow exists
    const userToFollow = await User.findById(userId);
    if (!userToFollow) {
      return res.status(404).json(
        formatErrorResponse('User not found', 404)
      );
    }

    // Check if already following
    const follower = await User.findById(followerId);
    if (follower.following.includes(userId)) {
      return res.status(400).json(
        formatErrorResponse('You are already following this user', 400)
      );
    }

    // Add to following list of follower
    await User.findByIdAndUpdate(followerId, {
      $push: { following: userId }
    });

    // Add to followers list of user being followed
    await User.findByIdAndUpdate(userId, {
      $push: { followers: followerId }
    });

    res.json(
      formatSuccessResponse('User followed successfully', {
        userId,
        isFollowing: true
      }, null, req.timezone)
    );
  } catch (error) {
    console.error('Follow user error:', error);
    res.status(500).json(
      formatErrorResponse('Server error while following user')
    );
  }
});

// @route   DELETE /api/users/:userId/follow
// @desc    Unfollow a user
// @access  Private
router.delete('/:userId/follow', auth, async (req, res) => {
  try {
    const { userId } = req.params;
    const followerId = req.user.id;

    // Check if trying to unfollow self
    if (userId === followerId) {
      return res.status(400).json(
        formatErrorResponse('You cannot unfollow yourself', 400)
      );
    }

    // Check if user exists
    const userToUnfollow = await User.findById(userId);
    if (!userToUnfollow) {
      return res.status(404).json(
        formatErrorResponse('User not found', 404)
      );
    }

    // Check if actually following
    const follower = await User.findById(followerId);
    if (!follower.following.includes(userId)) {
      return res.status(400).json(
        formatErrorResponse('You are not following this user', 400)
      );
    }

    // Remove from following list of follower
    await User.findByIdAndUpdate(followerId, {
      $pull: { following: userId }
    });

    // Remove from followers list of user being unfollowed
    await User.findByIdAndUpdate(userId, {
      $pull: { followers: followerId }
    });

    res.json(
      formatSuccessResponse('User unfollowed successfully', {
        userId,
        isFollowing: false
      }, null, req.timezone)
    );
  } catch (error) {
    console.error('Unfollow user error:', error);
    res.status(500).json(
      formatErrorResponse('Server error while unfollowing user')
    );
  }
});

// @route   GET /api/users/:userId/followers
// @desc    Get user's followers
// @access  Public
router.get('/:userId/followers', async (req, res) => {
  try {
    const { userId } = req.params;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;

    const user = await User.findById(userId)
      .populate({
        path: 'followers',
        select: 'name email avatar username bio',
        options: {
          skip: (page - 1) * limit,
          limit: limit
        }
      });

    if (!user) {
      return res.status(404).json(
        formatErrorResponse('User not found', 404)
      );
    }

    const total = user.followers.length;
    const pagination = createPagination(page, limit, total);

    res.json(
      formatSuccessResponse('Followers retrieved successfully', user.followers, pagination, req.timezone)
    );
  } catch (error) {
    console.error('Get followers error:', error);
    res.status(500).json(
      formatErrorResponse('Server error while retrieving followers')
    );
  }
});

// @route   GET /api/users/:userId/following
// @desc    Get users that a user is following
// @access  Public
router.get('/:userId/following', async (req, res) => {
  try {
    const { userId } = req.params;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;

    const user = await User.findById(userId)
      .populate({
        path: 'following',
        select: 'name email avatar username bio',
        options: {
          skip: (page - 1) * limit,
          limit: limit
        }
      });

    if (!user) {
      return res.status(404).json(
        formatErrorResponse('User not found', 404)
      );
    }

    const total = user.following.length;
    const pagination = createPagination(page, limit, total);

    res.json(
      formatSuccessResponse('Following retrieved successfully', user.following, pagination, req.timezone)
    );
  } catch (error) {
    console.error('Get following error:', error);
    res.status(500).json(
      formatErrorResponse('Server error while retrieving following')
    );
  }
});

// @route   GET /api/users/:userId/follow-status
// @desc    Check if current user is following a specific user
// @access  Private
router.get('/:userId/follow-status', auth, async (req, res) => {
  try {
    const { userId } = req.params;
    const currentUserId = req.user.id;

    if (userId === currentUserId) {
      return res.json(
        formatSuccessResponse('Follow status retrieved', {
          isFollowing: false,
          isSelf: true
        }, null, req.timezone)
      );
    }

    const currentUser = await User.findById(currentUserId);
    const isFollowing = currentUser.following.includes(userId);

    res.json(
      formatSuccessResponse('Follow status retrieved', {
        isFollowing,
        isSelf: false
      }, null, req.timezone)
    );
  } catch (error) {
    console.error('Get follow status error:', error);
    res.status(500).json(
      formatErrorResponse('Server error while checking follow status')
    );
  }
});

module.exports = router;
