const express = require('express');
const jwt = require('jsonwebtoken');
const Joi = require('joi');
const User = require('../models/User');
const { auth } = require('../middlewares/auth');
const { errorHandler, asyncHandler } = require('../middlewares/errorHandler');

const router = express.Router();

// Validation schemas
const registerSchema = Joi.object({
  email: Joi.string().email().required(),
  password: Joi.string().min(6).required(),
  alias: Joi.string()
    .min(3)
    .max(20)
    .pattern(/^[a-zA-Z0-9_-]+$/)
    .optional(),
});

const loginSchema = Joi.object({
  email: Joi.string().email().required(),
  password: Joi.string().required(),
});

// Generate JWT token
const generateToken = (userId) => {
  return jwt.sign(
    { userId },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
  );
};

// @route   POST /api/auth/register
// @desc    Register a new user
// @access  Public
router.post(
  '/register',
  asyncHandler(async (req, res) => {
    // Validate input
    const { error, value } = registerSchema.validate(req.body);
    if (error) {
      return res.status(400).json({
        error: 'Validation error',
        details: error.details.map((detail) => detail.message),
      });
    }

    const { email, password, alias } = value;

    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({
        error: 'User already exists with this email',
      });
    }

    // Check if alias is taken
    if (alias) {
      const existingAlias = await User.findOne({ alias });
      if (existingAlias) {
        return res.status(400).json({
          error: 'Alias is already taken',
        });
      }
    }

    // Create new user
    const user = new User({
      email,
      password, // Make sure your User model hashes password on save
      alias: alias || undefined, // Let the model generate one if not provided
    });

    await user.save();

    // Generate token
    const token = generateToken(user._id);

    // Return user data (without password)
    const userResponse = user.getPublicProfile();
    userResponse.email = user.email; // Include email for registration

    res.status(201).json({
      success: true,
      message: 'User registered successfully',
      token,
      user: userResponse,
    });
  })
);

// @route   POST /api/auth/login
// @desc    Login user
// @access  Public
router.post(
  '/login',
  asyncHandler(async (req, res) => {
    // Validate input
    const { error, value } = loginSchema.validate(req.body);
    if (error) {
      return res.status(400).json({
        error: 'Validation error',
        details: error.details.map((detail) => detail.message),
      });
    }

    const { email, password } = value;

    // Find user by email
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({
        error: 'Invalid email or password',
      });
    }

    // Check password - assuming user.comparePassword is async and returns boolean
    const isPasswordValid = await user.comparePassword(password);
    if (!isPasswordValid) {
      return res.status(401).json({
        error: 'Invalid email or password',
      });
    }

    // Update online status
    user.isOnline = true;
    user.lastSeen = new Date();
    await user.save();

    // Generate token
    const token = generateToken(user._id);

    // Return user data
    const userResponse = user.getPublicProfile();
    userResponse.email = user.email;

    res.json({
      success: true,
      message: 'Login successful',
      token,
      user: userResponse,
    });
  })
);

// @route   POST /api/auth/logout
// @desc    Logout user
// @access  Private
router.post(
  '/logout',
  auth,
  asyncHandler(async (req, res) => {
    // Update user offline status
    req.user.isOnline = false;
    req.user.lastSeen = new Date();
    await req.user.save();

    res.json({
      success: true,
      message: 'Logout successful',
    });
  })
);

// @route   GET /api/auth/me
// @desc    Get current user
// @access  Private
router.get(
  '/me',
  auth,
  asyncHandler(async (req, res) => {
    const userResponse = req.user.getPublicProfile();
    userResponse.email = req.user.email;

    res.json({
      success: true,
      user: userResponse,
    });
  })
);

// @route   POST /api/auth/refresh
// @desc    Refresh JWT token
// @access  Private
router.post(
  '/refresh',
  auth,
  asyncHandler(async (req, res) => {
    // Generate new token
    const token = generateToken(req.user._id);

    res.json({
      success: true,
      message: 'Token refreshed successfully',
      token,
    });
  })
);

// @route   POST /api/auth/check-alias
// @desc    Check if alias is available
// @access  Public
router.post(
  '/check-alias',
  asyncHandler(async (req, res) => {
    const { alias } = req.body;

    if (!alias) {
      return res.status(400).json({
        error: 'Alias is required',
      });
    }

    // Validate alias format
    if (!/^[a-zA-Z0-9_-]+$/.test(alias)) {
      return res.status(400).json({
        error:
          'Alias can only contain letters, numbers, underscores, and hyphens',
      });
    }

    if (alias.length < 3 || alias.length > 20) {
      return res.status(400).json({
        error: 'Alias must be between 3 and 20 characters',
      });
    }

    // Check if alias exists
    const existingUser = await User.findOne({ alias });
    const isAvailable = !existingUser;

    res.json({
      success: true,
      isAvailable,
      alias,
    });
  })
);

// @route   POST /api/auth/forgot-password
// @desc    Request password reset
// @access  Public
router.post(
  '/forgot-password',
  asyncHandler(async (req, res) => {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({
        error: 'Email is required',
      });
    }

    const user = await User.findOne({ email });
    if (!user) {
      // Don't reveal if user exists or not for security
      return res.json({
        success: true,
        message:
          'If an account with that email exists, a password reset link has been sent.',
      });
    }

    // TODO: Implement password reset logic here
    res.json({
      success: true,
      message:
        'If an account with that email exists, a password reset link has been sent.',
    });
  })
);

// Error handling middleware
router.use(errorHandler);

module.exports = router;
