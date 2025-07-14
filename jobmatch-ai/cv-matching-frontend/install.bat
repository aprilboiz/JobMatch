@echo off
echo 🚀 Installing CV Matching Frontend...
echo.

REM Check if Node.js is installed
node --version >nul 2>&1
if %ERRORLEVEL% neq 0 (
    echo ❌ Node.js is not installed. Please install Node.js first.
    echo Download from: https://nodejs.org/
    pause
    exit /b 1
)

echo ✅ Node.js found
echo.

REM Install dependencies
echo 📦 Installing dependencies...
npm install

if %ERRORLEVEL% neq 0 (
    echo ❌ Failed to install dependencies
    pause
    exit /b 1
)

echo.
echo ✅ Dependencies installed successfully!
echo.
echo 🎯 Next steps:
echo    1. Make sure CV Matching API is running on http://localhost:8000
echo    2. Run: npm run dev
echo    3. Open: http://localhost:3000
echo.
pause
