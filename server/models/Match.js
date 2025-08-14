const mongoose = require('mongoose');

const matchSchema = new mongoose.Schema({
  users: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  }],
  compatibility: {
    emotionMatch: {
      type: Number,
      min: 0,
      max: 100,
      default: 0
    },
    interestMatch: {
      type: Number,
      min: 0,
      max: 100,
      default: 0
    },
    overallScore: {
      type: Number,
      min: 0,
      max: 100,
      default: 0
    }
  },
  sharedEmotions: [{
    type: String,
    enum: [
      'anxiety', 'depression', 'stress', 'loneliness', 'grief', 
      'anger', 'fear', 'sadness', 'joy', 'hope', 'gratitude',
      'confusion', 'overwhelm', 'peace', 'excitement', 'calm'
    ]
  }],
  sharedInterests: [{
    type: String
  }],
  status: {
    type: String,
    enum: ['pending', 'active', 'completed', 'declined'],
    default: 'pending'
  },
  chatRoom: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'ChatRoom'
  },
  initiatedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  matchedAt: {
    type: Date,
    default: Date.now
  },
  lastActivity: {
    type: Date,
    default: Date.now
  },
  duration: {
    type: Number, // in minutes
    default: 0
  },
  feedback: {
    helpful: {
      type: Boolean,
      default: null
    },
    rating: {
      type: Number,
      min: 1,
      max: 5,
      default: null
    },
    comment: {
      type: String,
      maxlength: 500
    }
  }
}, {
  timestamps: true
});

// Ensure users array has exactly 2 unique users
matchSchema.pre('save', function(next) {
  if (this.users.length !== 2) {
    return next(new Error('Match must have exactly 2 users'));
  }
  
  if (this.users[0].equals(this.users[1])) {
    return next(new Error('Users cannot match with themselves'));
  }
  
  next();
});

// Calculate compatibility score
matchSchema.methods.calculateCompatibility = function() {
  const user1 = this.users[0];
  const user2 = this.users[1];
  
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
  
  this.compatibility = {
    emotionMatch: Math.round(emotionMatch),
    interestMatch: Math.round(interestMatch),
    overallScore: Math.round(overallScore)
  };
  
  this.sharedEmotions = emotionIntersection;
  this.sharedInterests = interestIntersection;
  
  return this;
};

// Update last activity
matchSchema.methods.updateActivity = function() {
  this.lastActivity = new Date();
  return this.save();
};

// Get match duration in minutes
matchSchema.methods.getDuration = function() {
  const now = new Date();
  const duration = Math.floor((now - this.matchedAt) / (1000 * 60));
  this.duration = duration;
  return duration;
};

// Check if match is still active (within 24 hours)
matchSchema.methods.isActive = function() {
  const now = new Date();
  const hoursSinceActivity = (now - this.lastActivity) / (1000 * 60 * 60);
  return hoursSinceActivity < 24 && this.status === 'active';
};

module.exports = mongoose.model('Match', matchSchema);
