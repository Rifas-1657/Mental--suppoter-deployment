const mongoose = require('mongoose');

const messageSchema = new mongoose.Schema({
  chatRoom: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'ChatRoom',
    required: true
  },
  sender: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  content: {
    type: String,
    required: true,
    maxlength: 2000
  },
  messageType: {
    type: String,
    enum: ['text', 'image', 'file', 'system', 'typing'],
    default: 'text'
  },
  isAnonymous: {
    type: Boolean,
    default: true
  },
  senderAlias: {
    type: String,
    required: true
  },
  senderAvatar: {
    type: String,
    default: 'default-avatar'
  },
  metadata: {
    emotion: {
      type: String,
      enum: [
        'anxiety', 'depression', 'stress', 'loneliness', 'grief', 
        'anger', 'fear', 'sadness', 'joy', 'hope', 'gratitude',
        'confusion', 'overwhelm', 'peace', 'excitement', 'calm',
        'neutral'
      ],
      default: 'neutral'
    },
    sentiment: {
      type: String,
      enum: ['positive', 'negative', 'neutral'],
      default: 'neutral'
    },
    urgency: {
      type: String,
      enum: ['low', 'medium', 'high', 'crisis'],
      default: 'low'
    },
    supportType: {
      type: String,
      enum: ['listening', 'advice', 'encouragement', 'shared_experience', 'general'],
      default: 'general'
    }
  },
  reactions: [{
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    reaction: {
      type: String,
      enum: ['heart', 'thumbsup', 'hug', 'pray', 'lightbulb']
    },
    timestamp: {
      type: Date,
      default: Date.now
    }
  }],
  isEdited: {
    type: Boolean,
    default: false
  },
  editedAt: {
    type: Date
  },
  isDeleted: {
    type: Boolean,
    default: false
  },
  deletedAt: {
    type: Date
  },
  readBy: [{
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    readAt: {
      type: Date,
      default: Date.now
    }
  }],
  aiAnalysis: {
    emotionDetected: {
      type: String,
      enum: [
        'anxiety', 'depression', 'stress', 'loneliness', 'grief', 
        'anger', 'fear', 'sadness', 'joy', 'hope', 'gratitude',
        'confusion', 'overwhelm', 'peace', 'excitement', 'calm',
        'neutral'
      ]
    },
    sentimentScore: {
      type: Number,
      min: -1,
      max: 1
    },
    urgencyLevel: {
      type: String,
      enum: ['low', 'medium', 'high', 'crisis']
    },
    suggestions: [{
      type: String,
      maxlength: 200
    }],
    analyzedAt: {
      type: Date
    }
  }
}, {
  timestamps: true
});

// Index for efficient querying
messageSchema.index({ chatRoom: 1, createdAt: -1 });
messageSchema.index({ sender: 1, createdAt: -1 });

// Set sender alias and avatar before saving
messageSchema.pre('save', function(next) {
  if (this.isNew && this.isAnonymous) {
    // Generate anonymous alias if not provided
    if (!this.senderAlias) {
      this.senderAlias = `Anonymous_${Math.random().toString(36).substr(2, 6)}`;
    }
  }
  next();
});

// Mark message as read
messageSchema.methods.markAsRead = function(userId) {
  const existingRead = this.readBy.find(read => 
    read.user.toString() === userId.toString()
  );
  
  if (!existingRead) {
    this.readBy.push({
      user: userId,
      readAt: new Date()
    });
  }
  
  return this.save();
};

// Add reaction
messageSchema.methods.addReaction = function(userId, reaction) {
  // Remove existing reaction from this user
  this.reactions = this.reactions.filter(r => 
    r.user.toString() !== userId.toString()
  );
  
  // Add new reaction
  this.reactions.push({
    user: userId,
    reaction: reaction,
    timestamp: new Date()
  });
  
  return this.save();
};

// Remove reaction
messageSchema.methods.removeReaction = function(userId) {
  this.reactions = this.reactions.filter(r => 
    r.user.toString() !== userId.toString()
  );
  return this.save();
};

// Soft delete message
messageSchema.methods.softDelete = function() {
  this.isDeleted = true;
  this.deletedAt = new Date();
  return this.save();
};

// Edit message
messageSchema.methods.edit = function(newContent) {
  this.content = newContent;
  this.isEdited = true;
  this.editedAt = new Date();
  return this.save();
};

// Get public message (without sensitive data)
messageSchema.methods.getPublicMessage = function() {
  return {
    _id: this._id,
    content: this.isDeleted ? '[Message deleted]' : this.content,
    messageType: this.messageType,
    isAnonymous: this.isAnonymous,
    senderAlias: this.senderAlias,
    senderAvatar: this.senderAvatar,
    metadata: this.metadata,
    reactions: this.reactions,
    isEdited: this.isEdited,
    editedAt: this.editedAt,
    isDeleted: this.isDeleted,
    readBy: this.readBy.length,
    createdAt: this.createdAt,
    updatedAt: this.updatedAt
  };
};

// Check if message needs urgent attention
messageSchema.methods.needsUrgentAttention = function() {
  return this.metadata.urgency === 'crisis' || 
         this.metadata.urgency === 'high' ||
         this.aiAnalysis?.urgencyLevel === 'crisis';
};

module.exports = mongoose.model('Message', messageSchema);
