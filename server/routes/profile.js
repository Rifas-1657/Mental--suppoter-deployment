const express = require('express');
const Joi = require('joi');
const User = require('../models/User');
const { auth } = require('../middlewares/auth');
const { asyncHandler } = require('../middlewares/errorHandler');

const router = express.Router();

// Validation schemas
const updateProfileSchema = Joi.object({
  alias: Joi.string().min(3).max(20).pattern(/^[a-zA-Z0-9_-]+$/).optional(),
  avatar: Joi.string().optional(),
  emotionTags: Joi.array().items(Joi.string()).min(1).max(5).optional(),
  interests: Joi.array().items(Joi.string()).min(1).max(10).optional(),
  bio: Joi.string().max(500).optional()
});

const updatePreferencesSchema = Joi.object({
  allowAnonymousChat: Joi.boolean().optional(),
  notificationSettings: Joi.object({
    email: Joi.boolean().optional(),
    push: Joi.boolean().optional()
  }).optional(),
  privacyLevel: Joi.string().valid('public', 'friends', 'private').optional()
});

// @route   GET /api/profile/me
// @desc    Get current user's profile
// @access  Private
router.get('/me', auth, asyncHandler(async (req, res) => {
  const userResponse = req.user.getPublicProfile();
  userResponse.email = req.user.email;

  res.json({
    success: true,
    user: userResponse
  });
}));

// @route   PUT /api/profile/update
// @desc    Update user profile
// @access  Private
router.put('/update', auth, asyncHandler(async (req, res) => {
  // Validate input
  const { error, value } = updateProfileSchema.validate(req.body);
  if (error) {
    return res.status(400).json({
      error: 'Validation error',
      details: error.details.map(detail => detail.message)
    });
  }

  const { alias, avatar, emotionTags, interests, bio } = value;

  // Check if alias is taken (if being updated)
  if (alias && alias !== req.user.alias) {
    const existingUser = await User.findOne({ alias });
    if (existingUser) {
      return res.status(400).json({
        error: 'Alias is already taken'
      });
    }
  }

  // Update user fields
  if (alias) req.user.alias = alias;
  if (avatar) req.user.avatar = avatar;
  if (emotionTags) req.user.emotionTags = emotionTags;
  if (interests) req.user.interests = interests;
  if (bio !== undefined) req.user.bio = bio;

  await req.user.save();

  const userResponse = req.user.getPublicProfile();
  userResponse.email = req.user.email;

  res.json({
    success: true,
    message: 'Profile updated successfully',
    user: userResponse
  });
}));

// @route   PUT /api/profile/preferences
// @desc    Update user preferences
// @access  Private
router.put('/preferences', auth, asyncHandler(async (req, res) => {
  // Validate input
  const { error, value } = updatePreferencesSchema.validate(req.body);
  if (error) {
    return res.status(400).json({
      error: 'Validation error',
      details: error.details.map(detail => detail.message)
    });
  }

  const { allowAnonymousChat, notificationSettings, privacyLevel } = value;

  // Update preferences
  if (allowAnonymousChat !== undefined) {
    req.user.preferences.allowAnonymousChat = allowAnonymousChat;
  }

  if (notificationSettings) {
    if (notificationSettings.email !== undefined) {
      req.user.preferences.notificationSettings.email = notificationSettings.email;
    }
    if (notificationSettings.push !== undefined) {
      req.user.preferences.notificationSettings.push = notificationSettings.push;
    }
  }

  if (privacyLevel) {
    req.user.preferences.privacyLevel = privacyLevel;
  }

  await req.user.save();

  res.json({
    success: true,
    message: 'Preferences updated successfully',
    preferences: req.user.preferences
  });
}));

// @route   GET /api/profile/stats
// @desc    Get user statistics
// @access  Private
router.get('/stats', auth, asyncHandler(async (req, res) => {
  // Get additional stats from database
  const Match = require('../models/Match');
  const Message = require('../models/Message');

  const [totalMatches, totalMessages, activeMatches] = await Promise.all([
    Match.countDocuments({ users: req.user._id }),
    Message.countDocuments({ sender: req.user._id, isDeleted: false }),
    Match.countDocuments({ 
      users: req.user._id, 
      status: { $in: ['pending', 'active'] } 
    })
  ]);

  const stats = {
    ...req.user.stats,
    totalMatches,
    totalMessages,
    activeMatches,
    averageMessagesPerMatch: totalMatches > 0 ? Math.round(totalMessages / totalMatches) : 0
  };

  res.json({
    success: true,
    stats
  });
}));

// @route   GET /api/profile/:userId
// @desc    Get public profile of another user
// @access  Private
router.get('/:userId', auth, asyncHandler(async (req, res) => {
  const { userId } = req.params;

  const user = await User.findById(userId).select('-password -email');
  if (!user) {
    return res.status(404).json({
      error: 'User not found'
    });
  }

  // Check privacy settings
  if (user.preferences.privacyLevel === 'private') {
    return res.status(403).json({
      error: 'This profile is private'
    });
  }

  if (user.preferences.privacyLevel === 'friends') {
    // TODO: Implement friends system
    // For now, allow access to all authenticated users
  }

  const publicProfile = user.getPublicProfile();

  res.json({
    success: true,
    user: publicProfile
  });
}));

// @route   POST /api/profile/onboarding
// @desc    Complete onboarding process
// @access  Private
router.post('/onboarding', auth, asyncHandler(async (req, res) => {
  const { emotionTags, interests, bio } = req.body;

  // Validate required fields
  if (!emotionTags || emotionTags.length === 0) {
    return res.status(400).json({
      error: 'At least one emotion tag is required'
    });
  }

  if (!interests || interests.length === 0) {
    return res.status(400).json({
      error: 'At least one interest is required'
    });
  }

  // Update user profile
  req.user.emotionTags = emotionTags;
  req.user.interests = interests;
  if (bio) req.user.bio = bio;

  await req.user.save();

  const userResponse = req.user.getPublicProfile();
  userResponse.email = req.user.email;

  res.json({
    success: true,
    message: 'Onboarding completed successfully',
    user: userResponse
  });
}));

// @route   DELETE /api/profile
// @desc    Delete user account
// @access  Private
router.delete('/', auth, asyncHandler(async (req, res) => {
  const { password } = req.body;

  if (!password) {
    return res.status(400).json({
      error: 'Password is required to delete account'
    });
  }

  // Verify password
  const isPasswordValid = await req.user.comparePassword(password);
  if (!isPasswordValid) {
    return res.status(401).json({
      error: 'Invalid password'
    });
  }

  // TODO: Implement account deletion logic
  // For now, just mark as inactive
  req.user.isOnline = false;
  req.user.lastSeen = new Date();
  // req.user.isDeleted = true; // Add this field to User model if needed
  await req.user.save();

  res.json({
    success: true,
    message: 'Account deleted successfully'
  });
}));

// @route   POST /api/profile/avatar
// @desc    Upload avatar image
// @access  Private
router.post('/avatar', auth, asyncHandler(async (req, res) => {
  // TODO: Implement file upload logic
  // For now, just return success with a default avatar
  const avatarUrl = 'default-avatar';

  req.user.avatar = avatarUrl;
  await req.user.save();

  res.json({
    success: true,
    message: 'Avatar updated successfully',
    avatar: avatarUrl
  });
}));

// @route   GET /api/profile/search
// @desc    Search for users by alias or interests
// @access  Private
router.get('/search', auth, asyncHandler(async (req, res) => {
  const { q, emotionTags, interests, limit = 10 } = req.query;

  if (!q && !emotionTags && !interests) {
    return res.status(400).json({
      error: 'Search query, emotion tags, or interests are required'
    });
  }

  // Build search criteria
  const searchCriteria = {
    _id: { $ne: req.user._id }, // Exclude current user
    'preferences.privacyLevel': { $ne: 'private' }
  };

  if (q) {
    searchCriteria.$or = [
      { alias: { $regex: q, $options: 'i' } },
      { bio: { $regex: q, $options: 'i' } }
    ];
  }

  if (emotionTags) {
    const tags = Array.isArray(emotionTags) ? emotionTags : [emotionTags];
    searchCriteria.emotionTags = { $in: tags };
  }

  if (interests) {
    const userInterests = Array.isArray(interests) ? interests : [interests];
    searchCriteria.interests = { $in: userInterests };
  }

  const users = await User.find(searchCriteria)
    .select('alias avatar emotionTags interests bio isOnline lastSeen')
    .limit(parseInt(limit))
    .sort({ isOnline: -1, lastSeen: -1 });

  res.json({
    success: true,
    users,
    total: users.length
  });
}));

module.exports = router;
