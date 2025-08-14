const mongoose = require('mongoose');

const chatRoomSchema = new mongoose.Schema({
  match: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Match',
    required: true
  },
  participants: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  }],
  roomId: {
    type: String,
    required: true,
    unique: true
  },
  isActive: {
    type: Boolean,
    default: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  lastMessageAt: {
    type: Date,
    default: Date.now
  },
  messageCount: {
    type: Number,
    default: 0
  },
  settings: {
    allowAnonymous: {
      type: Boolean,
      default: true
    },
    autoArchive: {
      type: Boolean,
      default: true
    },
    archiveAfterHours: {
      type: Number,
      default: 24
    }
  },
  metadata: {
    topic: {
      type: String,
      maxlength: 100
    },
    emotionTags: [{
      type: String,
      enum: [
        'anxiety', 'depression', 'stress', 'loneliness', 'grief', 
        'anger', 'fear', 'sadness', 'joy', 'hope', 'gratitude',
        'confusion', 'overwhelm', 'peace', 'excitement', 'calm'
      ]
    }],
    supportType: {
      type: String,
      enum: ['listening', 'advice', 'encouragement', 'shared_experience', 'general'],
      default: 'general'
    }
  }
}, {
  timestamps: true
});

// Generate unique room ID
chatRoomSchema.pre('save', function(next) {
  if (!this.roomId) {
    this.roomId = `room_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }
  next();
});

// Update last message timestamp
chatRoomSchema.methods.updateLastMessage = function() {
  this.lastMessageAt = new Date();
  this.messageCount += 1;
  return this.save();
};

// Check if room should be archived
chatRoomSchema.methods.shouldArchive = function() {
  if (!this.settings.autoArchive) return false;
  
  const now = new Date();
  const hoursSinceLastMessage = (now - this.lastMessageAt) / (1000 * 60 * 60);
  return hoursSinceLastMessage >= this.settings.archiveAfterHours;
};

// Archive room
chatRoomSchema.methods.archive = function() {
  this.isActive = false;
  return this.save();
};

// Get room summary for display
chatRoomSchema.methods.getSummary = function() {
  return {
    roomId: this.roomId,
    isActive: this.isActive,
    messageCount: this.messageCount,
    lastMessageAt: this.lastMessageAt,
    createdAt: this.createdAt,
    metadata: this.metadata
  };
};

// Check if user is participant
chatRoomSchema.methods.isParticipant = function(userId) {
  return this.participants.some(participant => 
    participant.toString() === userId.toString()
  );
};

module.exports = mongoose.model('ChatRoom', chatRoomSchema);
