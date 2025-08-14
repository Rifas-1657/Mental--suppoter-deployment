const jwt = require('jsonwebtoken');
const User = require('../models/User');
const ChatRoom = require('../models/ChatRoom');
const Message = require('../models/Message');
const Match = require('../models/Match');
const geminiService = require('../services/geminiService');

const connectedUsers = new Map(); // socketId -> userId
const userSockets = new Map(); // userId -> socketId
const typingUsers = new Map(); // roomId -> Set of typing users

// Keep a reference to io for helpers
let ioInstance = null;

const setupSocketHandlers = (io) => {
  ioInstance = io;
  // Authentication middleware
  io.use(async (socket, next) => {
    try {
      const token = socket.handshake.auth.token;
      if (!token) {
        return next(new Error('Authentication error'));
      }

      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      const user = await User.findById(decoded.userId);
      
      if (!user) {
        return next(new Error('User not found'));
      }

      socket.userId = user._id;
      socket.user = user;
      next();
    } catch (error) {
      next(new Error('Authentication error'));
    }
  });

  io.on('connection', (socket) => {
    console.log(`User connected: ${socket.user.alias} (${socket.userId})`);

    // Store user connection
    connectedUsers.set(socket.id, socket.userId);
    userSockets.set(socket.userId.toString(), socket.id);

    // Update user online status (avoid parallel save on same doc)
    User.findByIdAndUpdate(
      socket.userId,
      { $set: { isOnline: true, lastSeen: new Date() } },
      { new: true }
    ).then((updated) => {
      if (updated) {
        socket.user = updated;
      }
    }).catch((err) => {
      console.error('Failed to set user online:', err);
    });

    // Join user's active chat rooms
    joinUserRooms(socket);

    // Handle joining a specific chat room
    socket.on('join_room', async (data) => {
      try {
        const { roomId } = data;
        const chatRoom = await ChatRoom.findOne({ 
          roomId, 
          participants: socket.userId,
          isActive: true 
        });

        if (!chatRoom) {
          socket.emit('error', { message: 'Room not found or access denied' });
          return;
        }

        socket.join(roomId);
        socket.emit('room_joined', { roomId });
        
        // Send room info
        const messages = await Message.find({ 
          chatRoom: chatRoom._id,
          isDeleted: false 
        })
        .sort({ createdAt: -1 })
        .limit(50)
        .populate('sender', 'alias avatar');

        socket.emit('room_messages', {
          roomId,
          messages: messages.reverse().map(msg => msg.getPublicMessage())
        });

        console.log(`User ${socket.user.alias} joined room ${roomId}`);
      } catch (error) {
        console.error('Join room error:', error);
        socket.emit('error', { message: 'Failed to join room' });
      }
    });

    // Handle leaving a room
    socket.on('leave_room', (data) => {
      const { roomId } = data;
      socket.leave(roomId);
      socket.emit('room_left', { roomId });
      console.log(`User ${socket.user.alias} left room ${roomId}`);
    });

    // Handle sending messages
    socket.on('send_message', async (data) => {
      try {
        const { roomId, content, messageType = 'text' } = data;

        const chatRoom = await ChatRoom.findOne({ 
          roomId, 
          participants: socket.userId,
          isActive: true 
        });

        if (!chatRoom) {
          socket.emit('error', { message: 'Room not found or access denied' });
          return;
        }

        // Analyze message with Gemini
        const analysis = await geminiService.analyzeEmotion(content);
        const crisisCheck = await geminiService.detectCrisis(content);

        // Create message
        const message = new Message({
          chatRoom: chatRoom._id,
          sender: socket.userId,
          content,
          messageType,
          isAnonymous: true,
          senderAlias: socket.user.alias,
          senderAvatar: socket.user.avatar,
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

        // Broadcast message to room
        const publicMessage = message.getPublicMessage();
        io.to(roomId).emit('new_message', {
          roomId,
          message: publicMessage
        });

        // Handle crisis detection
        if (crisisCheck.isCrisis) {
          socket.emit('crisis_detected', {
            level: crisisCheck.crisisLevel,
            recommendations: crisisCheck.recommendations,
            requiresImmediateAttention: crisisCheck.requiresImmediateAttention
          });
        }

        // Generate response suggestions for the other user
        if (analysis.supportType !== 'general') {
          const suggestions = await geminiService.generateResponseSuggestions(
            content, 
            analysis.emotion, 
            analysis.supportType
          );
          
          // Send suggestions to other participants
          socket.to(roomId).emit('response_suggestions', {
            suggestions: suggestions.suggestions
          });
        }

        console.log(`Message sent in room ${roomId} by ${socket.user.alias}`);
      } catch (error) {
        console.error('Send message error:', error);
        socket.emit('error', { message: 'Failed to send message' });
      }
    });

    // Handle typing indicators
    socket.on('typing_start', (data) => {
      const { roomId } = data;
      if (!typingUsers.has(roomId)) {
        typingUsers.set(roomId, new Set());
      }
      typingUsers.get(roomId).add(socket.userId.toString());
      
      socket.to(roomId).emit('user_typing', {
        roomId,
        userId: socket.userId,
        alias: socket.user.alias
      });
    });

    socket.on('typing_stop', (data) => {
      const { roomId } = data;
      if (typingUsers.has(roomId)) {
        typingUsers.get(roomId).delete(socket.userId.toString());
        if (typingUsers.get(roomId).size === 0) {
          typingUsers.delete(roomId);
        }
      }
      
      socket.to(roomId).emit('user_stopped_typing', {
        roomId,
        userId: socket.userId
      });
    });

    // Handle message reactions
    socket.on('react_to_message', async (data) => {
      try {
        const { messageId, reaction } = data;
        const message = await Message.findById(messageId);
        
        if (!message) {
          socket.emit('error', { message: 'Message not found' });
          return;
        }

        // Check if user is in the same chat room
        const chatRoom = await ChatRoom.findById(message.chatRoom);
        if (!chatRoom.participants.includes(socket.userId)) {
          socket.emit('error', { message: 'Access denied' });
          return;
        }

        await message.addReaction(socket.userId, reaction);
        
        // Broadcast reaction to room
        io.to(chatRoom.roomId).emit('message_reaction', {
          messageId,
          reaction: {
            user: socket.userId,
            reaction,
            timestamp: new Date()
          }
        });
      } catch (error) {
        console.error('Reaction error:', error);
        socket.emit('error', { message: 'Failed to add reaction' });
      }
    });

    // Handle message read receipts
    socket.on('mark_read', async (data) => {
      try {
        const { messageId } = data;
        const message = await Message.findById(messageId);
        
        if (!message) {
          socket.emit('error', { message: 'Message not found' });
          return;
        }

        await message.markAsRead(socket.userId);
        
        // Broadcast read receipt
        const chatRoom = await ChatRoom.findById(message.chatRoom);
        io.to(chatRoom.roomId).emit('message_read', {
          messageId,
          readBy: socket.userId
        });
      } catch (error) {
        console.error('Mark read error:', error);
        socket.emit('error', { message: 'Failed to mark message as read' });
      }
    });

    // Handle user status updates
    socket.on('update_status', async (data) => {
      try {
        const { status } = data;
        const updated = await User.findByIdAndUpdate(
          socket.userId,
          { $set: { isOnline: status === 'online', lastSeen: new Date() } },
          { new: true }
        );
        if (updated) {
          socket.user = updated;
        }

        // Broadcast status to all connected users
        io.emit('user_status_changed', {
          userId: socket.userId,
          alias: socket.user.alias,
          isOnline: status === 'online',
          lastSeen: updated?.lastSeen || new Date()
        });
      } catch (error) {
        console.error('Status update error:', error);
      }
    });

    // Handle disconnection
    socket.on('disconnect', async () => {
      console.log(`User disconnected: ${socket.user.alias} (${socket.userId})`);

      // Remove from connected users
      connectedUsers.delete(socket.id);
      userSockets.delete(socket.userId.toString());

      // Update user offline status (avoid parallel save on same doc)
      try {
        await User.findByIdAndUpdate(
          socket.userId,
          { $set: { isOnline: false, lastSeen: new Date() } },
          { new: false }
        );
      } catch (err) {
        console.error('Failed to set user offline:', err);
      }

      // Remove from typing indicators
      for (const [roomId, typingSet] of typingUsers.entries()) {
        typingSet.delete(socket.userId.toString());
        if (typingSet.size === 0) {
          typingUsers.delete(roomId);
        }
      }

      // Broadcast offline status
      io.emit('user_status_changed', {
        userId: socket.userId,
        alias: socket.user.alias,
        isOnline: false,
        lastSeen: socket.user.lastSeen
      });
    });
  });
};

// Helper function to join user's active rooms
const joinUserRooms = async (socket) => {
  try {
    const activeRooms = await ChatRoom.find({
      participants: socket.userId,
      isActive: true
    });

    for (const room of activeRooms) {
      socket.join(room.roomId);
    }

    console.log(`User ${socket.user.alias} joined ${activeRooms.length} active rooms`);
  } catch (error) {
    console.error('Error joining user rooms:', error);
  }
};

// Helper function to get online users
const getOnlineUsers = () => {
  return Array.from(userSockets.keys());
};

// Helper function to send message to specific user
const sendToUser = (userId, event, data) => {
  const socketId = userSockets.get(userId.toString());
  if (socketId && ioInstance) {
    ioInstance.to(socketId).emit(event, data);
  }
};

module.exports = {
  setupSocketHandlers,
  getOnlineUsers,
  sendToUser
};
