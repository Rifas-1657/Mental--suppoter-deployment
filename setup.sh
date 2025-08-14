#!/bin/bash

# Mental Health Support Matcher Setup Script
echo "🚀 Setting up Mental Health Support Matcher..."

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    print_error "Node.js is not installed. Please install Node.js 18+ first."
    exit 1
fi

# Check Node.js version
NODE_VERSION=$(node -v | cut -d'v' -f2 | cut -d'.' -f1)
if [ "$NODE_VERSION" -lt 18 ]; then
    print_error "Node.js version 18+ is required. Current version: $(node -v)"
    exit 1
fi

print_success "Node.js version check passed: $(node -v)"

# Check if npm is installed
if ! command -v npm &> /dev/null; then
    print_error "npm is not installed. Please install npm first."
    exit 1
fi

print_success "npm version: $(npm -v)"

# Setup Server
print_status "Setting up server..."
cd server

# Install server dependencies
print_status "Installing server dependencies..."
npm install

# Create .env file if it doesn't exist
if [ ! -f .env ]; then
    print_status "Creating server .env file..."
    cp env.example .env
    print_warning "Please update server/.env with your actual credentials"
else
    print_success "Server .env file already exists"
fi

cd ..

# Setup Client
print_status "Setting up client..."
cd client

# Install client dependencies
print_status "Installing client dependencies..."
npm install

# Create .env file if it doesn't exist
if [ ! -f .env ]; then
    print_status "Creating client .env file..."
    cp env.example .env
    print_success "Client .env file created"
else
    print_success "Client .env file already exists"
fi

cd ..

# Create .env.test for server if it doesn't exist
if [ ! -f server/.env.test ]; then
    print_status "Creating server test environment file..."
    cat > server/.env.test << EOF
NODE_ENV=test
MONGODB_URI_TEST=mongodb://localhost:27017/test
JWT_SECRET=test-secret-key
GEMINI_API_KEY=test-gemini-key
CORS_ORIGIN=http://localhost:3000
EOF
    print_success "Server test environment file created"
fi

# Make setup script executable
chmod +x setup.sh

print_success "Setup completed successfully!"
echo ""
print_status "Next steps:"
echo "1. Update server/.env with your MongoDB URI and Gemini API key"
echo "2. Update client/.env with your backend URLs"
echo "3. Start the development servers:"
echo "   - Server: cd server && npm run dev"
echo "   - Client: cd client && npm run dev"
echo ""
print_status "For production deployment:"
echo "1. Use Docker: docker-compose up -d"
echo "2. Or deploy to Vercel (frontend) and Render (backend)"
echo ""
print_success "Happy coding! 🎉"
