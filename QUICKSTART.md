# Quick Start Guide

Get the Mental Health Support Matcher running in 5 minutes! 🚀

## ⚡ Prerequisites

- **Node.js 18+** - [Download here](https://nodejs.org/)
- **MongoDB Atlas** - [Sign up here](https://www.mongodb.com/atlas)
- **Google Gemini API** - [Get API key here](https://makersuite.google.com/app/apikey)

## 🎯 Quick Setup

### 1. Clone & Setup

```bash
# Clone the repository
git clone <repository-url>
cd mental-health-support-matcher

# Run setup script (Windows)
setup.bat

# OR run setup script (Mac/Linux)
chmod +x setup.sh
./setup.sh
```

### 2. Configure Environment

**Backend Configuration:**
```bash
cd server
cp env.example .env
```

Edit `server/.env`:
```env
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/mental-health-matcher
GEMINI_API_KEY=your-gemini-api-key-here
JWT_SECRET=your-super-secret-jwt-key
```

**Frontend Configuration:**
```bash
cd client
cp env.example .env
```

Edit `client/.env`:
```env
VITE_API_URL=http://localhost:5000
VITE_SOCKET_URL=http://localhost:5000
```

### 3. Start Development Servers

**Terminal 1 - Backend:**
```bash
cd server
npm run dev
```

**Terminal 2 - Frontend:**
```bash
cd client
npm run dev
```

### 4. Access the Application

- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:5000
- **API Documentation**: http://localhost:5000/api/docs

## 🐳 Docker Quick Start

### Option 1: Full Stack with Docker Compose

```bash
# Set environment variable
export GEMINI_API_KEY=your-gemini-api-key

# Start all services
docker-compose up -d

# Access the application
# Frontend: http://localhost:3000
# Backend: http://localhost:5000
```

### Option 2: Development with Docker

```bash
# Build and start development containers
docker-compose -f docker-compose.dev.yml up -d

# View logs
docker-compose logs -f
```

## 🧪 Testing the Application

### 1. Create a Test Account

1. Go to http://localhost:3000
2. Click "Get Started"
3. Fill in registration form:
   - Email: `test@example.com`
   - Password: `password123`
   - Alias: `testuser`

### 2. Complete Onboarding

1. Select emotion tags (e.g., "anxiety", "stress")
2. Add interests (e.g., "reading", "music")
3. Write a short bio
4. Choose avatar

### 3. Find Matches

1. Browse available matches
2. View compatibility scores
3. Connect with peers
4. Start anonymous chat

### 4. Test Real-time Features

1. Open multiple browser tabs
2. Log in with different accounts
3. Start a chat conversation
4. Test typing indicators
5. Verify message delivery

## 🔧 API Testing

### Using Postman/Insomnia

**Base URL:** `http://localhost:5000`

**Authentication Endpoints:**
```http
POST /api/auth/register
POST /api/auth/login
GET /api/auth/me
```

**Matchmaking Endpoints:**
```http
GET /api/match/emotions
GET /api/match/find
POST /api/match/create
```

**Chat Endpoints:**
```http
GET /api/chat/rooms
GET /api/chat/:roomId
POST /api/chat/:roomId/message
```

### Using curl

```bash
# Register a user
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"password123","alias":"testuser"}'

# Login
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"password123"}'

# Get matches (with token)
curl -X GET http://localhost:5000/api/match/find \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

## 🎨 Customization

### Theme Customization

Edit `client/src/styles/theme.js`:
```javascript
export const theme = createTheme({
  palette: {
    primary: {
      main: '#your-primary-color',
    },
    secondary: {
      main: '#your-secondary-color',
    },
  },
})
```

### Feature Flags

Edit `client/.env`:
```env
VITE_ENABLE_CRISIS_DETECTION=true
VITE_ENABLE_AI_SUGGESTIONS=true
VITE_ENABLE_ANALYTICS=false
```

### API Configuration

Edit `server/.env`:
```env
RATE_LIMIT_MAX_REQUESTS=100
MAX_FILE_SIZE=5242880
JWT_EXPIRES_IN=7d
```

## 🚨 Troubleshooting

### Common Issues

**1. MongoDB Connection Error**
```bash
# Check MongoDB URI format
mongodb+srv://username:password@cluster.mongodb.net/database?retryWrites=true&w=majority
```

**2. CORS Error**
```bash
# Check CORS_ORIGIN in server/.env
CORS_ORIGIN=http://localhost:3000
```

**3. Socket.io Connection Error**
```bash
# Check VITE_SOCKET_URL in client/.env
VITE_SOCKET_URL=http://localhost:5000
```

**4. Build Errors**
```bash
# Clear node_modules and reinstall
rm -rf node_modules package-lock.json
npm install
```

**5. Port Already in Use**
```bash
# Kill process on port 3000
npx kill-port 3000

# Kill process on port 5000
npx kill-port 5000
```

### Debug Mode

**Backend Debug:**
```bash
cd server
DEBUG=* npm run dev
```

**Frontend Debug:**
```bash
cd client
npm run dev -- --debug
```

### Logs

**View Docker Logs:**
```bash
# All services
docker-compose logs

# Specific service
docker-compose logs server
docker-compose logs client
```

## 📱 Mobile Testing

### Responsive Design

1. Open browser dev tools
2. Toggle device toolbar
3. Test on different screen sizes:
   - iPhone SE (375px)
   - iPhone 12 Pro (390px)
   - iPad (768px)
   - Desktop (1200px+)

### PWA Features

The app includes PWA features:
- Offline support
- Install prompt
- Push notifications (coming soon)

## 🔒 Security Checklist

- [ ] JWT_SECRET is strong and unique
- [ ] MongoDB has proper authentication
- [ ] CORS is properly configured
- [ ] Rate limiting is enabled
- [ ] Input validation is working
- [ ] HTTPS is used in production

## 📊 Performance Monitoring

### Frontend Metrics

- Lighthouse score: 90+
- First Contentful Paint: < 1.5s
- Largest Contentful Paint: < 2.5s
- Cumulative Layout Shift: < 0.1

### Backend Metrics

- Response time: < 200ms
- Database queries: < 50ms
- Memory usage: < 512MB
- CPU usage: < 50%

## 🚀 Next Steps

### Development

1. **Add Features:**
   - Video chat integration
   - Group support sessions
   - Crisis intervention tools
   - Professional referral system

2. **Improve AI:**
   - Better emotion detection
   - Personalized suggestions
   - Crisis prediction models
   - Sentiment analysis

3. **Enhance UX:**
   - Accessibility improvements
   - Dark mode refinements
   - Mobile optimizations
   - Performance optimizations

### Production

1. **Deploy to Cloud:**
   - Frontend: Vercel
   - Backend: Render
   - Database: MongoDB Atlas

2. **Set up Monitoring:**
   - Error tracking (Sentry)
   - Performance monitoring
   - User analytics
   - Health checks

3. **Security Hardening:**
   - SSL certificates
   - Security headers
   - Rate limiting
   - Input sanitization

## 📞 Support

### Getting Help

- **Documentation**: [README.md](README.md)
- **Issues**: [GitHub Issues](link-to-issues)
- **Discussions**: [GitHub Discussions](link-to-discussions)
- **Email**: support@mentalhealthmatcher.com

### Community

- **Discord**: [Join our community](link-to-discord)
- **Twitter**: [@MentalHealthMatcher](link-to-twitter)
- **Blog**: [Updates and tutorials](link-to-blog)

---

**Happy coding! 🎉**

Your Mental Health Support Matcher is now ready to help students connect and support each other. Remember to test thoroughly and gather user feedback to improve the experience.
