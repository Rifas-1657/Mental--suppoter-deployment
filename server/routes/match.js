const express = require('express');
const Joi = require('joi');
const User = require('../models/User');
const Match = require('../models/Match');
const ChatRoom = require('../models/ChatRoom');
const { auth, requireProfile } = require('../middlewares/auth');
const { asyncHandler } = require('../middlewares/errorHandler');
const geminiService = require('../services/geminiService');

const router = express.Router();

// Validation schemas
const findMatchesSchema = Joi.object({
  emotionTags: Joi.array().items(Joi.string()).min(1).max(5).optional(),
  interests: Joi.array().items(Joi.string()).min(1).max(5).optional(),
  limit: Joi.number().min(1).max(20).default(10)
});

const createMatchSchema = Joi.object({
  targetUserId: Joi.string().required()
});

// @route   GET /api/match/emotions
// @desc    Get available emotion tags
// @access  Public
router.get('/emotions', asyncHandler(async (req, res) => {
  const emotions = [
    { value: 'anxiety', label: 'Anxiety', color: '#FF6B6B' },
    { value: 'depression', label: 'Depression', color: '#4ECDC4' },
    { value: 'stress', label: 'Stress', color: '#45B7D1' },
    { value: 'loneliness', label: 'Loneliness', color: '#96CEB4' },
    { value: 'grief', label: 'Grief', color: '#FFEAA7' },
    { value: 'anger', label: 'Anger', color: '#DDA0DD' },
    { value: 'fear', label: 'Fear', color: '#98D8C8' },
    { value: 'sadness', label: 'Sadness', color: '#F7DC6F' },
    { value: 'joy', label: 'Joy', color: '#BB8FCE' },
    { value: 'hope', label: 'Hope', color: '#85C1E9' },
    { value: 'gratitude', label: 'Gratitude', color: '#F8C471' },
    { value: 'confusion', label: 'Confusion', color: '#A9CCE3' },
    { value: 'overwhelm', label: 'Overwhelm', color: '#F1948A' },
    { value: 'peace', label: 'Peace', color: '#82E0AA' },
    { value: 'excitement', label: 'Excitement', color: '#F7DC6F' },
    { value: 'calm', label: 'Calm', color: '#AED6F1' }
  ];

  res.json({
    success: true,
    emotions
  });
}));

// @route   GET /api/match/find
// @desc    Find potential matches based on emotions and interests
// @access  Private
router.get('/find', auth, requireProfile, asyncHandler(async (req, res) => {
  // Validate query parameters
  const { error, value } = findMatchesSchema.validate(req.query);
  if (error) {
    return res.status(400).json({
      error: 'Validation error',
      details: error.details.map(detail => detail.message)
    });
  }

  const { emotionTags, interests, limit } = value;

  // Build match criteria
  const matchCriteria = {
    _id: { $ne: req.user._id }, // Exclude current user
    isOnline: true, // Only online users
    'preferences.allowAnonymousChat': true
  };

  // Add emotion tags filter if provided
  if (emotionTags && emotionTags.length > 0) {
    matchCriteria.emotionTags = { $in: emotionTags };
  }

  // Add interests filter if provided
  if (interests && interests.length > 0) {
    matchCriteria.interests = { $in: interests };
  }

  // Find potential matches
  const potentialMatches = await User.find(matchCriteria)
    .select('alias avatar emotionTags interests bio isOnline lastSeen stats')
    .limit(limit)
    .sort({ isOnline: -1, lastSeen: -1 });

  // Calculate compatibility scores
  const matchesWithScores = potentialMatches.map(match => {
    const compatibility = calculateCompatibility(req.user, match);
    return {
      ...match.toObject(),
      compatibility
    };
  });

  // Sort by compatibility score
  matchesWithScores.sort((a, b) => b.compatibility.overallScore - a.compatibility.overallScore);

  // Get AI suggestions for better matching
  const suggestions = await geminiService.suggestMatches(
    req.user.emotionTags,
    req.user.interests
  );

  res.json({
    success: true,
    matches: matchesWithScores,
    suggestions,
    total: matchesWithScores.length
  });
}));

// @route   POST /api/match/create
// @desc    Create a new match with another user
// @access  Private
router.post('/create', auth, requireProfile, asyncHandler(async (req, res) => {
  // Validate input
  const { error, value } = createMatchSchema.validate(req.body);
  if (error) {
    return res.status(400).json({
      error: 'Validation error',
      details: error.details.map(detail => detail.message)
    });
  }

  const { targetUserId } = value;

  // Check if target user exists and has completed profile
  const targetUser = await User.findById(targetUserId);
  if (!targetUser) {
    return res.status(404).json({
      error: 'Target user not found'
    });
  }

  if (!targetUser.emotionTags || targetUser.emotionTags.length === 0) {
    return res.status(400).json({
      error: 'Target user has not completed profile setup'
    });
  }

  // Check if match already exists
  const existingMatch = await Match.findOne({
    users: { $all: [req.user._id, targetUserId] }
  });

  if (existingMatch) {
    return res.status(400).json({
      error: 'Match already exists',
      match: existingMatch
    });
  }

  // Create new match
  const match = new Match({
    users: [req.user._id, targetUserId],
    initiatedBy: req.user._id
  });

  // Calculate compatibility
  match.calculateCompatibility();
  await match.save();

  // Create chat room
  const chatRoom = new ChatRoom({
    match: match._id,
    participants: [req.user._id, targetUserId],
    metadata: {
      emotionTags: match.sharedEmotions,
      supportType: 'general'
    }
  });

  await chatRoom.save();

  // Update match with chat room
  match.chatRoom = chatRoom._id;
  await match.save();

  // Update user stats
  req.user.stats.matchesFound += 1;
  targetUser.stats.matchesFound += 1;
  await Promise.all([req.user.save(), targetUser.save()]);

  // Populate match data
  await match.populate([
    { path: 'users', select: 'alias avatar emotionTags interests bio' },
    { path: 'initiatedBy', select: 'alias' },
    { path: 'chatRoom', select: 'roomId' }
  ]);

  res.status(201).json({
    success: true,
    message: 'Match created successfully',
    match: {
      ...match.toObject(),
      chatRoom: chatRoom.getSummary()
    }
  });
}));

// @route   GET /api/match/my-matches
// @desc    Get user's current matches
// @access  Private
router.get('/my-matches', auth, asyncHandler(async (req, res) => {
  const matches = await Match.find({
    users: req.user._id,
    status: { $in: ['pending', 'active'] }
  })
  .populate([
    { path: 'users', select: 'alias avatar emotionTags interests bio isOnline lastSeen' },
    { path: 'initiatedBy', select: 'alias' },
    { path: 'chatRoom', select: 'roomId isActive lastMessageAt messageCount' }
  ])
  .sort({ lastActivity: -1 });

  // Format matches for response
  const formattedMatches = matches.map(match => {
    const otherUser = match.users.find(user => 
      user._id.toString() !== req.user._id.toString()
    );

    return {
      _id: match._id,
      otherUser,
      compatibility: match.compatibility,
      sharedEmotions: match.sharedEmotions,
      sharedInterests: match.sharedInterests,
      status: match.status,
      initiatedBy: match.initiatedBy,
      matchedAt: match.matchedAt,
      lastActivity: match.lastActivity,
      chatRoom: match.chatRoom,
      isActive: match.isActive()
    };
  });

  res.json({
    success: true,
    matches: formattedMatches,
    total: formattedMatches.length
  });
}));

// @route   PUT /api/match/:matchId/status
// @desc    Update match status (accept/decline/complete)
// @access  Private
router.put('/:matchId/status', auth, asyncHandler(async (req, res) => {
  const { matchId } = req.params;
  const { status } = req.body;

  if (!['pending', 'active', 'completed', 'declined'].includes(status)) {
    return res.status(400).json({
      error: 'Invalid status'
    });
  }

  const match = await Match.findOne({
    _id: matchId,
    users: req.user._id
  });

  if (!match) {
    return res.status(404).json({
      error: 'Match not found'
    });
  }

  // Update match status
  match.status = status;
  if (status === 'active') {
    match.lastActivity = new Date();
  }
  await match.save();

  // Update chat room if needed
  if (status === 'declined' && match.chatRoom) {
    const chatRoom = await ChatRoom.findById(match.chatRoom);
    if (chatRoom) {
      chatRoom.isActive = false;
      await chatRoom.save();
    }
  }

  res.json({
    success: true,
    message: 'Match status updated successfully',
    match
  });
}));

// @route   DELETE /api/match/:matchId
// @desc    Delete a match
// @access  Private
router.delete('/:matchId', auth, asyncHandler(async (req, res) => {
  const { matchId } = req.params;

  const match = await Match.findOne({
    _id: matchId,
    users: req.user._id
  });

  if (!match) {
    return res.status(404).json({
      error: 'Match not found'
    });
  }

  // Archive chat room
  if (match.chatRoom) {
    const chatRoom = await ChatRoom.findById(match.chatRoom);
    if (chatRoom) {
      chatRoom.isActive = false;
      await chatRoom.save();
    }
  }

  // Update match status
  match.status = 'completed';
  await match.save();

  res.json({
    success: true,
    message: 'Match deleted successfully'
  });
}));

// Helper function to calculate compatibility between two users
const calculateCompatibility = (user1, user2) => {
  // Emotion match calculation
  const emotionIntersection = user1.emotionTags.filter(tag => 
    user2.emotionTags.includes(tag)
  );
  const emotionUnion = [...new Set([...user1.emotionTags, ...user2.emotionTags])];
  const emotionMatch = emotionUnion.length > 0 ? 
    (emotionIntersection.length / emotionUnion.length) * 100 : 0;

  // Interest match calculation
  const interestIntersection = user1.interests.filter(interest => 
    user2.interests.includes(interest)
  );
  const interestUnion = [...new Set([...user1.interests, ...user2.interests])];
  const interestMatch = interestUnion.length > 0 ? 
    (interestIntersection.length / interestUnion.length) * 100 : 0;

  // Overall score (weighted average)
  const overallScore = (emotionMatch * 0.7) + (interestMatch * 0.3);

  return {
    emotionMatch: Math.round(emotionMatch),
    interestMatch: Math.round(interestMatch),
    overallScore: Math.round(overallScore),
    sharedEmotions: emotionIntersection,
    sharedInterests: interestIntersection
  };
};

module.exports = router;
