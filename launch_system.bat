@echo off
echo 🚀 CV Job Matching System - Full Stack Launcher
echo ================================================
echo.

REM Set colors for better visibility
color 0A

echo 📋 System Requirements Check:
echo.

REM Check Python
python --version >nul 2>&1
if %ERRORLEVEL% neq 0 (
    echo ❌ Python is not installed or not in PATH
    echo Please install Python 3.8+ from https://python.org/
    pause
    exit /b 1
) else (
    echo ✅ Python found
)

REM Check Node.js
node --version >nul 2>&1
if %ERRORLEVEL% neq 0 (
    echo ❌ Node.js is not installed or not in PATH
    echo Please install Node.js 18+ from https://nodejs.org/
    pause
    exit /b 1
) else (
    echo ✅ Node.js found
)

echo.
echo 🎯 Starting CV Job Matching System...
echo.

REM Get current directory
set "PROJECT_DIR=%~dp0"

echo 📍 Project Directory: %PROJECT_DIR%
echo.

REM Start Backend API
echo 🔧 Starting Backend API Server...
start "CV Matching API" cmd /k "cd /d "%PROJECT_DIR%cv_match_API" && echo 🤖 Starting FastAPI Backend... && echo 📡 API will be available at: http://localhost:8000 && echo. && python main.py"

REM Wait a moment for backend to start
echo ⏳ Waiting for backend to initialize...
timeout /t 5 /nobreak > nul

REM Start Frontend
echo 🌐 Starting Frontend Server...
start "CV Matching Frontend" cmd /k "cd /d "%PROJECT_DIR%cv-matching-frontend" && echo 🎨 Starting Next.js Frontend... && echo 🌐 Frontend will be available at: http://localhost:3000 && echo 🔗 Connecting to API at: http://localhost:8000 && echo. && npm run dev"

echo.
echo ✅ System Launch Complete!
echo.
echo 📊 Services Status:
echo   🤖 Backend API: http://localhost:8000
echo   🌐 Frontend UI: http://localhost:3000
echo.
echo 📖 API Documentation: http://localhost:8000/docs
echo 🔍 Health Check: http://localhost:8000/health
echo.
echo 💡 Usage:
echo   1. Open http://localhost:3000 in your browser
echo   2. Upload CV and Job Description files
echo   3. Get AI-powered matching score
echo.
echo ⚠️  Note: Keep this window open to monitor the system
echo 🛑 To stop: Close the API and Frontend command windows
echo.
pause
