const jwt = require('jsonwebtoken');
const User = require('../models/User');

const auth = async (req, res, next) => {
  try {
    const token = req.header('Authorization')?.replace('Bearer ', '');
    
    if (!token) {
      return res.status(401).json({ 
        error: 'Access denied. No token provided.' 
      });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.userId).select('-password');
    
    if (!user) {
      return res.status(401).json({ 
        error: 'Invalid token. User not found.' 
      });
    }

    req.user = user;
    req.token = token;
    next();
  } catch (error) {
    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({ 
        error: 'Invalid token.' 
      });
    }
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({ 
        error: 'Token expired.' 
      });
    }
    res.status(500).json({ 
      error: 'Server error during authentication.' 
    });
  }
};

const optionalAuth = async (req, res, next) => {
  try {
    const token = req.header('Authorization')?.replace('Bearer ', '');
    
    if (!token) {
      req.user = null;
      return next();
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.userId).select('-password');
    
    req.user = user || null;
    req.token = token;
    next();
  } catch (error) {
    req.user = null;
    next();
  }
};

const requireProfile = async (req, res, next) => {
  try {
    if (!req.user) {
      return res.status(401).json({ 
        error: 'Authentication required.' 
      });
    }

    // Check if user has completed profile setup
    if (!req.user.emotionTags || req.user.emotionTags.length === 0) {
      return res.status(403).json({ 
        error: 'Profile setup required.',
        message: 'Please complete your profile setup before accessing this feature.'
      });
    }

    next();
  } catch (error) {
    res.status(500).json({ 
      error: 'Server error during profile verification.' 
    });
  }
};

const checkOnlineStatus = async (req, res, next) => {
  try {
    if (req.user) {
      req.user.isOnline = true;
      req.user.lastSeen = new Date();
      await req.user.save();
    }
    next();
  } catch (error) {
    next();
  }
};

module.exports = {
  auth,
  optionalAuth,
  requireProfile,
  checkOnlineStatus
};
