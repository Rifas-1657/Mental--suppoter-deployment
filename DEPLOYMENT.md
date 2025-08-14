# Deployment Guide

This guide covers deploying the Mental Health Support Matcher application to various platforms.

## 🚀 Quick Deployment Options

### Option 1: Docker Compose (Recommended for Development)

```bash
# Clone the repository
git clone <repository-url>
cd mental-health-support-matcher

# Set environment variables
export GEMINI_API_KEY=your-gemini-api-key

# Start all services
docker-compose up -d

# Access the application
# Frontend: http://localhost:3000
# Backend: http://localhost:5000
```

### Option 2: Manual Deployment

#### Prerequisites
- Node.js 18+
- MongoDB Atlas account
- Google Gemini API key
- Vercel account (for frontend)
- Render account (for backend)

## 📱 Frontend Deployment (Vercel)

### Step 1: Prepare the Frontend

1. **Build the application**
   ```bash
   cd client
   npm run build
   ```

2. **Configure environment variables in Vercel**
   - `VITE_API_URL`: Your backend API URL
   - `VITE_SOCKET_URL`: Your backend Socket.io URL
   - `VITE_APP_NAME`: Mental Health Support Matcher
   - `VITE_APP_VERSION`: 1.0.0

### Step 2: Deploy to Vercel

1. **Connect your GitHub repository to Vercel**
2. **Set build settings:**
   - Build Command: `npm run build`
   - Output Directory: `dist`
   - Install Command: `npm install`

3. **Deploy**
   - Vercel will automatically deploy on every push to main branch

## 🔧 Backend Deployment (Render)

### Step 1: Prepare the Backend

1. **Create a new Web Service on Render**
2. **Connect your GitHub repository**
3. **Configure the service:**

   **Build Command:**
   ```bash
   npm install
   ```

   **Start Command:**
   ```bash
   npm start
   ```

### Step 2: Environment Variables

Set these environment variables in Render:

```env
NODE_ENV=production
PORT=10000
MONGODB_URI=your_mongodb_atlas_uri
JWT_SECRET=your-super-secret-jwt-key
JWT_EXPIRES_IN=7d
GEMINI_API_KEY=your-gemini-api-key
CORS_ORIGIN=https://your-frontend-domain.vercel.app
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100
MAX_FILE_SIZE=5242880
```

### Step 3: Database Setup

1. **Create MongoDB Atlas cluster**
2. **Get connection string**
3. **Add to environment variables**

## 🐳 Docker Deployment

### Production Docker Compose

```yaml
version: '3.8'

services:
  mongodb:
    image: mongo:6.0
    container_name: mental-health-mongodb
    restart: unless-stopped
    environment:
      MONGO_INITDB_ROOT_USERNAME: admin
      MONGO_INITDB_ROOT_PASSWORD: ${MONGO_PASSWORD}
      MONGO_INITDB_DATABASE: mental-health-matcher
    volumes:
      - mongodb_data:/data/db
    networks:
      - mental-health-network

  server:
    build:
      context: ./server
      dockerfile: Dockerfile
    container_name: mental-health-server
    restart: unless-stopped
    environment:
      - NODE_ENV=production
      - PORT=5000
      - MONGODB_URI=mongodb://admin:${MONGO_PASSWORD}@mongodb:27017/mental-health-matcher?authSource=admin
      - JWT_SECRET=${JWT_SECRET}
      - GEMINI_API_KEY=${GEMINI_API_KEY}
      - CORS_ORIGIN=${FRONTEND_URL}
    ports:
      - "5000:5000"
    depends_on:
      - mongodb
    networks:
      - mental-health-network

  client:
    build:
      context: ./client
      dockerfile: Dockerfile
    container_name: mental-health-client
    restart: unless-stopped
    environment:
      - VITE_API_URL=${BACKEND_URL}
      - VITE_SOCKET_URL=${BACKEND_URL}
    ports:
      - "3000:3000"
    depends_on:
      - server
    networks:
      - mental-health-network

volumes:
  mongodb_data:

networks:
  mental-health-network:
    driver: bridge
```

### Deploy with Docker

```bash
# Set environment variables
export MONGO_PASSWORD=your-secure-password
export JWT_SECRET=your-super-secret-jwt-key
export GEMINI_API_KEY=your-gemini-api-key
export FRONTEND_URL=https://your-domain.com
export BACKEND_URL=https://your-api-domain.com

# Deploy
docker-compose -f docker-compose.prod.yml up -d
```

## 🔒 Security Considerations

### Environment Variables
- Never commit `.env` files to version control
- Use strong, unique secrets for production
- Rotate secrets regularly

### SSL/TLS
- Always use HTTPS in production
- Configure SSL certificates
- Enable HSTS headers

### Database Security
- Use strong passwords
- Enable network access controls
- Regular backups
- Monitor access logs

### API Security
- Rate limiting
- Input validation
- CORS configuration
- JWT token expiration

## 📊 Monitoring and Logging

### Application Monitoring
- Set up health checks
- Monitor response times
- Track error rates
- Set up alerts

### Database Monitoring
- Monitor connection pool
- Track query performance
- Set up backup alerts

### Logging
- Structured logging
- Log aggregation
- Error tracking
- Performance monitoring

## 🔄 CI/CD Pipeline

### GitHub Actions Example

```yaml
name: Deploy

on:
  push:
    branches: [main]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - uses: actions/setup-node@v2
        with:
          node-version: '18'
      - run: |
          cd server && npm install && npm test
          cd ../client && npm install && npm test

  deploy-backend:
    needs: test
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - name: Deploy to Render
        run: |
          # Deploy backend to Render
          # (Configure Render webhook)

  deploy-frontend:
    needs: test
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - name: Deploy to Vercel
        run: |
          # Deploy frontend to Vercel
          # (Configure Vercel webhook)
```

## 🚨 Troubleshooting

### Common Issues

1. **CORS Errors**
   - Check CORS_ORIGIN configuration
   - Ensure frontend URL is correct

2. **Database Connection Issues**
   - Verify MongoDB URI
   - Check network access
   - Validate credentials

3. **Socket.io Connection Issues**
   - Check WebSocket proxy configuration
   - Verify Socket.io URL
   - Check firewall settings

4. **Build Failures**
   - Check Node.js version
   - Verify dependencies
   - Check environment variables

### Support

For deployment issues:
1. Check the logs: `docker-compose logs`
2. Verify environment variables
3. Test locally first
4. Check platform-specific documentation

## 📈 Performance Optimization

### Frontend
- Enable gzip compression
- Use CDN for static assets
- Implement lazy loading
- Optimize bundle size

### Backend
- Enable compression
- Use connection pooling
- Implement caching
- Optimize database queries

### Database
- Create proper indexes
- Monitor query performance
- Use read replicas if needed
- Regular maintenance
