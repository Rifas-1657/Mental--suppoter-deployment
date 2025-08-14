# Mental Health Support Matcher

A full-stack application that helps students anonymously connect with each other for mental health support.

## 🚀 Features

- **Anonymous Peer Matching**: Connect with peers based on shared emotional experiences
- **Real-time Chat**: Secure, anonymous messaging with Socket.io
- **Emotion-Based Matching**: AI-powered matching using Google Gemini API
- **User Profiles**: Customizable support profiles with emotion tags
- **Mobile-First Design**: Fully responsive UI with Material UI
- **Dark Mode**: Toggle between light and dark themes

## 🏗️ Project Structure

```
mental-health-support-matcher/
├── client/                 # React.js Frontend
│   ├── src/
│   │   ├── components/     # Reusable UI components
│   │   ├── pages/         # Page components
│   │   ├── hooks/         # Custom React hooks
│   │   ├── services/      # API service calls
│   │   ├── utils/         # Helper functions
│   │   ├── context/       # Context providers
│   │   ├── assets/        # Images, logos, icons
│   │   └── styles/        # Global styles
│   └── package.json
├── server/                # Node.js Backend
│   ├── routes/           # API route handlers
│   ├── controllers/      # Business logic
│   ├── services/         # Database & external services
│   ├── models/           # Mongoose models
│   ├── middlewares/      # Authentication & error handling
│   ├── utils/            # Helper functions
│   ├── config/           # Database & environment setup
│   ├── socket/           # Socket.io setup
│   └── package.json
└── README.md
```

## 🛠️ Tech Stack

### Frontend
- React.js 18+ with Vite
- Material UI (MUI)
- React Router DOM
- Socket.io Client
- Context API for state management

### Backend
- Node.js with Express
- MongoDB with Mongoose
- Socket.io for real-time chat
- JWT Authentication
- Google Gemini API integration

## 🚀 Quick Start

### Prerequisites
- Node.js 18+
- MongoDB Atlas account
- Google Gemini API key

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd mental-health-support-matcher
   ```

2. **Setup Backend**
   ```bash
   cd server
   npm install
   cp .env.example .env
   # Edit .env with your credentials
   npm run dev
   ```

3. **Setup Frontend**
   ```bash
   cd client
   npm install
   cp .env.example .env
   # Edit .env with your backend URL
   npm run dev
   ```

## 📱 Features Overview

### Authentication
- Secure JWT-based authentication
- Email/password registration and login
- Protected routes

### Matchmaking
- Emotion-based peer matching
- AI-powered sentiment analysis
- Anonymous profile creation

### Real-time Chat
- End-to-end encrypted messaging
- Anonymous aliases
- Message history
- Typing indicators

### User Experience
- Mobile-first responsive design
- Dark/light mode toggle
- Fast onboarding (under 2 minutes)
- Intuitive navigation

## 🔒 Security Features

- JWT token authentication
- Password hashing with bcrypt
- CORS protection
- Rate limiting
- Input validation
- Anonymous messaging

## 🧪 Testing

```bash
# Backend tests
cd server
npm test

# Frontend tests
cd client
npm test
```

## 🚀 Deployment

### Frontend (Vercel)
- Connect GitHub repository
- Set environment variables
- Deploy automatically

### Backend (Render)
- Connect GitHub repository
- Set environment variables
- Configure build commands

## 📄 Environment Variables

### Backend (.env)
```
PORT=5000
MONGODB_URI=your_mongodb_atlas_uri
JWT_SECRET=your_jwt_secret
GEMINI_API_KEY=your_gemini_api_key
NODE_ENV=development
```

### Frontend (.env)
```
VITE_API_URL=http://localhost:5000
VITE_SOCKET_URL=http://localhost:5000
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Commit your changes
4. Push to the branch
5. Create a Pull Request

## 📄 License

This project is licensed under the MIT License.

## 🆘 Support

For support, email support@mentalhealthmatcher.com or create an issue in the repository.
