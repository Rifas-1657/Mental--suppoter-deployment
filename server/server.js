const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const compression = require('compression');
const morgan = require('morgan');
const http = require('http');
const socketIo = require('socket.io');
require('dotenv').config();

const { GoogleGenerativeAI } = require('@google/generative-ai');

const authRoutes = require('./routes/auth');
const matchRoutes = require('./routes/match');
const chatRoutes = require('./routes/chat');
const profileRoutes = require('./routes/profile');
const { setupSocketHandlers } = require('./socket/socketHandlers');
const { errorHandler } = require('./middlewares/errorHandler');

const app = express();
const server = http.createServer(app);
const io = socketIo(server, {
  cors: {
    origin: process.env.CORS_ORIGIN || "http://localhost:3000",
    methods: ["GET", "POST"]
  }
});

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
.then(() => console.log('✅ Connected to MongoDB'))
.catch(err => console.error('❌ MongoDB connection error:', err));

// Middleware
app.use(helmet());
app.use(compression());
app.use(morgan('combined'));
app.use(cors({
  origin: process.env.CORS_ORIGIN || "http://localhost:3000",
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"],
  credentials: true
}));

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Rate limiting (relaxed in development to avoid 429 during local testing)
const limiter = rateLimit({
  windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS) || 15 * 60 * 1000,
  max: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS) || 100,
  standardHeaders: true,
  legacyHeaders: false,
  message: 'Too many requests from this IP, please try again later.'
});
if (process.env.NODE_ENV === 'production') {
  app.use('/api/', limiter);
}

// Health check
app.get('/health', (req, res) => {
  res.status(200).json({
    status: 'OK',
    message: 'Mental Health Support Matcher API is running',
    timestamp: new Date().toISOString()
  });
});

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/match', matchRoutes);
app.use('/api/chat', chatRoutes);
app.use('/api/profile', profileRoutes);

// Gemini API Route
app.post('/api/gemini', async (req, res) => {
  const { prompt, emotions = [], persona = 'support' } = req.body || {};
  if (!prompt || typeof prompt !== 'string') {
    return res.status(400).json({ error: 'Prompt is required' });
  }

  const buildFallback = () => {
    const emo = Array.isArray(emotions) && emotions.length > 0 ? emotions.join(', ') : 'your feelings';
    const personaText =
      persona === 'motivation'
        ? 'Here’s a quick boost: you have overcome hard things before. Pick one tiny step and do it now. I believe in you.'
        : persona === 'entertainment'
        ? "Let’s keep it light for a moment. What’s a show, song, or meme that always makes you smile? I can suggest a fun distraction."
        : 'I’m here with you. It sounds tough, but you’re not alone. Share as much or as little as you like—one moment at a time.';
    return `Based on ${emo}: ${personaText}`;
  };

  try {
    if (!process.env.GEMINI_API_KEY) {
      // No key in env → graceful fallback
      return res.json({ response: buildFallback() });
    }

    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
    const model = genAI.getGenerativeModel({ model: process.env.GEMINI_MODEL || 'gemini-1.5-flash' });
    const result = await model.generateContent([{ text: prompt }]);
    const text = result?.response?.text?.();
    if (!text) {
      return res.json({ response: buildFallback() });
    }
    res.json({ response: text });
  } catch (err) {
    console.error('Gemini API error:', err?.message || err);
    // Soft fallback instead of 500 to avoid error bubbles in UI
    res.json({ response: buildFallback() });
  }
});

// Socket.io setup
setupSocketHandlers(io);

// Error handling middleware
app.use(errorHandler);

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({
    error: 'Route not found',
    message: `Cannot ${req.method} ${req.originalUrl}`
  });
});

let PORT = parseInt(process.env.PORT, 10) || 5000;

const start = () => {
  server.listen(PORT, () => {
    console.log(`🚀 Server running on port ${PORT}`);
    console.log(`📱 Environment: ${process.env.NODE_ENV}`);
    console.log(`🔗 API URL: http://localhost:${PORT}`);
    console.log(`💬 Socket.io ready for real-time chat`);
  });
};

server.on('error', (err) => {
  if (err && err.code === 'EADDRINUSE') {
    console.warn(`Port ${PORT} is in use. Trying ${PORT + 1}...`);
    PORT += 1;
    setTimeout(start, 300);
  } else {
    console.error('Server error:', err);
    process.exit(1);
  }
});

start();

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('SIGTERM received, shutting down gracefully');
  server.close(() => {
    console.log('Process terminated');
    mongoose.connection.close();
  });
});

module.exports = { app, server, io };
