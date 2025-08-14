@echo off
echo 🚀 Setting up Mental Health Support Matcher...

REM Check if Node.js is installed
node --version >nul 2>&1
if %errorlevel% neq 0 (
    echo [ERROR] Node.js is not installed. Please install Node.js 18+ first.
    pause
    exit /b 1
)

echo [SUCCESS] Node.js version check passed: 
node --version

REM Check if npm is installed
npm --version >nul 2>&1
if %errorlevel% neq 0 (
    echo [ERROR] npm is not installed. Please install npm first.
    pause
    exit /b 1
)

echo [SUCCESS] npm version:
npm --version

REM Setup Server
echo [INFO] Setting up server...
cd server

REM Install server dependencies
echo [INFO] Installing server dependencies...
call npm install

REM Create .env file if it doesn't exist
if not exist .env (
    echo [INFO] Creating server .env file...
    copy env.example .env
    echo [WARNING] Please update server/.env with your actual credentials
) else (
    echo [SUCCESS] Server .env file already exists
)

cd ..

REM Setup Client
echo [INFO] Setting up client...
cd client

REM Install client dependencies
echo [INFO] Installing client dependencies...
call npm install

REM Create .env file if it doesn't exist
if not exist .env (
    echo [INFO] Creating client .env file...
    copy env.example .env
    echo [SUCCESS] Client .env file created
) else (
    echo [SUCCESS] Client .env file already exists
)

cd ..

REM Create .env.test for server if it doesn't exist
if not exist server\.env.test (
    echo [INFO] Creating server test environment file...
    (
        echo NODE_ENV=test
        echo MONGODB_URI_TEST=mongodb://localhost:27017/test
        echo JWT_SECRET=test-secret-key
        echo GEMINI_API_KEY=test-gemini-key
        echo CORS_ORIGIN=http://localhost:3000
    ) > server\.env.test
    echo [SUCCESS] Server test environment file created
)

echo [SUCCESS] Setup completed successfully!
echo.
echo [INFO] Next steps:
echo 1. Update server/.env with your MongoDB URI and Gemini API key
echo 2. Update client/.env with your backend URLs
echo 3. Start the development servers:
echo    - Server: cd server ^&^& npm run dev
echo    - Client: cd client ^&^& npm run dev
echo.
echo [INFO] For production deployment:
echo 1. Use Docker: docker-compose up -d
echo 2. Or deploy to Vercel (frontend) and Render (backend)
echo.
echo [SUCCESS] Happy coding! 🎉
pause
