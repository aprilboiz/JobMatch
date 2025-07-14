@echo off
echo 🚀 Starting CV Matching Frontend...
echo.

REM Check if node_modules exists
if not exist "node_modules" (
    echo ❌ Dependencies not installed. Running install first...
    call install.bat
    if %ERRORLEVEL% neq 0 exit /b 1
    echo.
)

echo 🔥 Starting development server...
echo 📱 Frontend will be available at: http://localhost:3000
echo 🔗 Make sure API is running at: http://localhost:8000
echo.
echo Press Ctrl+C to stop the server
echo.

npm run dev
