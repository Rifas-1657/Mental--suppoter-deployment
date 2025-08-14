const express = require('express');
const Joi = require('joi');
const ChatRoom = require('../models/ChatRoom');
const Message = require('../models/Message');
const Match = require('../models/Match');
const { auth } = require('../middlewares/auth');
const { asyncHandler } = require('../middlewares/errorHandler');
const geminiService = require('../services/geminiService');

const router = express.Router();

// Validation schemas
const sendMessageSchema = Joi.object({
  content: Joi.string().min(1).max(2000).required(),
  messageType: Joi.string().valid('text', 'image', 'file').default('text')
});

const getMessagesSchema = Joi.object({
  page: Joi.number().min(1).default(1),
  limit: Joi.number().min(1).max(100).default(50)
});

// @route   GET /api/chat/rooms
// @desc    Get user's active chat rooms
// @access  Private
router.get('/rooms', auth, asyncHandler(async (req, res) => {
  const chatRooms = await ChatRoom.find({
    participants: req.user._id,
    isActive: true
  })
  .populate([
    { path: 'match', select: 'users compatibility sharedEmotions status' },
    { path: 'participants', select: 'alias avatar isOnline lastSeen' }
  ])
  .sort({ lastMessageAt: -1 });

  // Format chat rooms for response
  const formattedRooms = chatRooms.map(room => {
    const otherParticipant = room.participants.find(participant => 
      participant._id.toString() !== req.user._id.toString()
    );

    return {
      _id: room._id,
      roomId: room.roomId,
      otherParticipant,
      match: room.match,
      messageCount: room.messageCount,
      lastMessageAt: room.lastMessageAt,
      createdAt: room.createdAt,
      metadata: room.metadata
    };
  });

  res.json({
    success: true,
    rooms: formattedRooms,
    total: formattedRooms.length
  });
}));

// @route   GET /api/chat/:roomId
// @desc    Get messages from a specific chat room
// @access  Private
router.get('/:roomId', auth, asyncHandler(async (req, res) => {
  const { roomId } = req.params;
  const { error, value } = getMessagesSchema.validate(req.query);
  
  if (error) {
    return res.status(400).json({
      error: 'Validation error',
      details: error.details.map(detail => detail.message)
    });
  }

  const { page, limit } = value;

  // Check if user has access to this room
  const chatRoom = await ChatRoom.findOne({
    roomId,
    participants: req.user._id,
    isActive: true
  });

  if (!chatRoom) {
    return res.status(404).json({
      error: 'Chat room not found or access denied'
    });
  }

  // Get messages with pagination
  const skip = (page - 1) * limit;
  const messages = await Message.find({
    chatRoom: chatRoom._id,
    isDeleted: false
  })
  .sort({ createdAt: -1 })
  .skip(skip)
  .limit(limit)
  .populate('sender', 'alias avatar');

  // Get total message count
  const totalMessages = await Message.countDocuments({
    chatRoom: chatRoom._id,
    isDeleted: false
  });

  // Mark messages as read
  const unreadMessages = messages.filter(msg => 
    !msg.readBy.some(read => read.user.toString() === req.user._id.toString())
  );

  for (const message of unreadMessages) {
    await message.markAsRead(req.user._id);
  }

  res.json({
    success: true,
    room: chatRoom.getSummary(),
    messages: messages.reverse().map(msg => msg.getPublicMessage()),
    pagination: {
      page,
      limit,
      total: totalMessages,
      pages: Math.ceil(totalMessages / limit)
    }
  });
}));

// @route   POST /api/chat/:roomId/message
// @desc    Send a message to a chat room
// @access  Private
router.post('/:roomId/message', auth, asyncHandler(async (req, res) => {
  const { roomId } = req.params;
  
  // Validate input
  const { error, value } = sendMessageSchema.validate(req.body);
  if (error) {
    return res.status(400).json({
      error: 'Validation error',
      details: error.details.map(detail => detail.message)
    });
  }

  const { content, messageType } = value;

  // Check if user has access to this room
  const chatRoom = await ChatRoom.findOne({
    roomId,
    participants: req.user._id,
    isActive: true
  });

  if (!chatRoom) {
    return res.status(404).json({
      error: 'Chat room not found or access denied'
    });
  }

  // Analyze message with Gemini
  const analysis = await geminiService.analyzeEmotion(content);
  const crisisCheck = await geminiService.detectCrisis(content);

  // Create message
  const message = new Message({
    chatRoom: chatRoom._id,
    sender: req.user._id,
    content,
    messageType,
    isAnonymous: true,
    senderAlias: req.user.alias,
    senderAvatar: req.user.avatar,
    metadata: {
      emotion: analysis.emotion,
      sentiment: analysis.sentiment,
      urgency: crisisCheck.isCrisis ? 'crisis' : analysis.urgency,
      supportType: analysis.supportType
    },
    aiAnalysis: {
      emotionDetected: analysis.emotion,
      sentimentScore: analysis.confidence,
      urgencyLevel: crisisCheck.crisisLevel,
      analyzedAt: new Date()
    }
  });

  await message.save();

  // Update chat room
  await chatRoom.updateLastMessage();

  // Update match activity
  const match = await Match.findOne({ chatRoom: chatRoom._id });
  if (match) {
    await match.updateActivity();
  }

  // Update user stats
  req.user.stats.totalMessages += 1;
  await req.user.save();

  // Populate message for response
  await message.populate('sender', 'alias avatar');

  res.status(201).json({
    success: true,
    message: 'Message sent successfully',
    message: message.getPublicMessage()
  });
}));

// @route   PUT /api/chat/message/:messageId
// @desc    Edit a message
// @access  Private
router.put('/message/:messageId', auth, asyncHandler(async (req, res) => {
  const { messageId } = req.params;
  const { content } = req.body;

  if (!content || content.trim().length === 0) {
    return res.status(400).json({
      error: 'Message content is required'
    });
  }

  // Find message
  const message = await Message.findById(messageId);
  if (!message) {
    return res.status(404).json({
      error: 'Message not found'
    });
  }

  // Check if user is the sender
  if (message.sender.toString() !== req.user._id.toString()) {
    return res.status(403).json({
      error: 'You can only edit your own messages'
    });
  }

  // Check if message is too old to edit (24 hours)
  const hoursSinceCreation = (new Date() - message.createdAt) / (1000 * 60 * 60);
  if (hoursSinceCreation > 24) {
    return res.status(400).json({
      error: 'Messages can only be edited within 24 hours'
    });
  }

  // Update message
  await message.edit(content);

  res.json({
    success: true,
    message: 'Message updated successfully',
    message: message.getPublicMessage()
  });
}));

// @route   DELETE /api/chat/message/:messageId
// @desc    Delete a message
// @access  Private
router.delete('/message/:messageId', auth, asyncHandler(async (req, res) => {
  const { messageId } = req.params;

  // Find message
  const message = await Message.findById(messageId);
  if (!message) {
    return res.status(404).json({
      error: 'Message not found'
    });
  }

  // Check if user is the sender
  if (message.sender.toString() !== req.user._id.toString()) {
    return res.status(403).json({
      error: 'You can only delete your own messages'
    });
  }

  // Soft delete message
  await message.softDelete();

  res.json({
    success: true,
    message: 'Message deleted successfully'
  });
}));

// @route   POST /api/chat/message/:messageId/reaction
// @desc    Add reaction to a message
// @access  Private
router.post('/message/:messageId/reaction', auth, asyncHandler(async (req, res) => {
  const { messageId } = req.params;
  const { reaction } = req.body;

  if (!['heart', 'thumbsup', 'hug', 'pray', 'lightbulb'].includes(reaction)) {
    return res.status(400).json({
      error: 'Invalid reaction type'
    });
  }

  // Find message
  const message = await Message.findById(messageId);
  if (!message) {
    return res.status(404).json({
      error: 'Message not found'
    });
  }

  // Check if user has access to the chat room
  const chatRoom = await ChatRoom.findById(message.chatRoom);
  if (!chatRoom.participants.includes(req.user._id)) {
    return res.status(403).json({
      error: 'Access denied'
    });
  }

  // Add reaction
  await message.addReaction(req.user._id, reaction);

  res.json({
    success: true,
    message: 'Reaction added successfully',
    reactions: message.reactions
  });
}));

// @route   DELETE /api/chat/message/:messageId/reaction
// @desc    Remove reaction from a message
// @access  Private
router.delete('/message/:messageId/reaction', auth, asyncHandler(async (req, res) => {
  const { messageId } = req.params;

  // Find message
  const message = await Message.findById(messageId);
  if (!message) {
    return res.status(404).json({
      error: 'Message not found'
    });
  }

  // Check if user has access to the chat room
  const chatRoom = await ChatRoom.findById(message.chatRoom);
  if (!chatRoom.participants.includes(req.user._id)) {
    return res.status(403).json({
      error: 'Access denied'
    });
  }

  // Remove reaction
  await message.removeReaction(req.user._id);

  res.json({
    success: true,
    message: 'Reaction removed successfully',
    reactions: message.reactions
  });
}));

// @route   POST /api/chat/:roomId/summarize
// @desc    Get AI summary of chat conversation
// @access  Private
router.post('/:roomId/summarize', auth, asyncHandler(async (req, res) => {
  const { roomId } = req.params;

  // Check if user has access to this room
  const chatRoom = await ChatRoom.findOne({
    roomId,
    participants: req.user._id,
    isActive: true
  });

  if (!chatRoom) {
    return res.status(404).json({
      error: 'Chat room not found or access denied'
    });
  }

  // Get recent messages
  const messages = await Message.find({
    chatRoom: chatRoom._id,
    isDeleted: false
  })
  .sort({ createdAt: -1 })
  .limit(100);

  if (messages.length === 0) {
    return res.json({
      success: true,
      summary: 'No messages to summarize'
    });
  }

  // Generate summary using Gemini
  const summary = await geminiService.summarizeChat(messages.reverse());

  res.json({
    success: true,
    summary,
    messageCount: messages.length
  });
}));

// @route   POST /api/chat/:roomId/suggestions
// @desc    Get AI response suggestions
// @access  Private
router.post('/:roomId/suggestions', auth, asyncHandler(async (req, res) => {
  const { roomId } = req.params;
  const { context, emotion, supportType } = req.body;

  // Check if user has access to this room
  const chatRoom = await ChatRoom.findOne({
    roomId,
    participants: req.user._id,
    isActive: true
  });

  if (!chatRoom) {
    return res.status(404).json({
      error: 'Chat room not found or access denied'
    });
  }

  // Get response suggestions from Gemini
  const suggestions = await geminiService.generateResponseSuggestions(
    context || '',
    emotion || 'neutral',
    supportType || 'general'
  );

  res.json({
    success: true,
    suggestions: suggestions.suggestions
  });
}));

module.exports = router;
