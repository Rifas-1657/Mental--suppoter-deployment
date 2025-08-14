const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true,
    match: [/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/, 'Please enter a valid email']
  },
  password: {
    type: String,
    required: true,
    minlength: 6
  },
  alias: {
    type: String,
    required: false,
    unique: true,
    minlength: 3,
    maxlength: 20,
    match: [/^[a-zA-Z0-9_-]+$/, 'Alias can only contain letters, numbers, underscores, and hyphens'],
    default: function() {
      return `user_${Math.random().toString(36).substr(2, 9)}`
    }
  },
  avatar: {
    type: String,
    default: 'default-avatar'
  },
  emotionTags: [{
    type: String,
    enum: [
      'anxiety', 'depression', 'stress', 'loneliness', 'grief', 
      'anger', 'fear', 'sadness', 'joy', 'hope', 'gratitude',
      'confusion', 'overwhelm', 'peace', 'excitement', 'calm'
    ]
  }],
  interests: [{
    type: String,
    maxlength: 50
  }],
  bio: {
    type: String,
    maxlength: 500,
    default: ''
  },
  isOnline: {
    type: Boolean,
    default: false
  },
  lastSeen: {
    type: Date,
    default: Date.now
  },
  isVerified: {
    type: Boolean,
    default: false
  },
  preferences: {
    allowAnonymousChat: {
      type: Boolean,
      default: true
    },
    notificationSettings: {
      email: {
        type: Boolean,
        default: true
      },
      push: {
        type: Boolean,
        default: true
      }
    },
    privacyLevel: {
      type: String,
      enum: ['public', 'friends', 'private'],
      default: 'friends'
    }
  },
  stats: {
    totalChats: {
      type: Number,
      default: 0
    },
    totalMessages: {
      type: Number,
      default: 0
    },
    matchesFound: {
      type: Number,
      default: 0
    },
    supportGiven: {
      type: Number,
      default: 0
    },
    supportReceived: {
      type: Number,
      default: 0
    }
  }
}, {
  timestamps: true
});

// Hash password before saving
userSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();
  
  try {
    const salt = await bcrypt.genSalt(12);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error) {
    next(error);
  }
});

// Compare password method
userSchema.methods.comparePassword = async function(candidatePassword) {
  return bcrypt.compare(candidatePassword, this.password);
};

// (Alias default is generated via schema default)

// Update lastSeen when user goes offline
userSchema.methods.updateLastSeen = function() {
  this.lastSeen = new Date();
  this.isOnline = false;
  return this.save();
};

// Get public profile (without sensitive data)
userSchema.methods.getPublicProfile = function() {
  return {
    _id: this._id,
    alias: this.alias,
    avatar: this.avatar,
    emotionTags: this.emotionTags,
    interests: this.interests,
    bio: this.bio,
    isOnline: this.isOnline,
    lastSeen: this.lastSeen,
    stats: this.stats,
    createdAt: this.createdAt
  };
};

module.exports = mongoose.model('User', userSchema);
