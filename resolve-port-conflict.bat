@echo off
echo 🔧 Resolving Port Conflicts for ZGoBooking...

echo.
echo 📋 Checking for processes using port 3000...
netstat -ano | findstr :3000 >nul
if not errorlevel 1 (
    echo ⚠️ Port 3000 is in use. Attempting to free it...
    
    REM Kill any Node.js processes that might be using port 3000
    taskkill /F /IM node.exe >nul 2>&1
    echo ✅ Killed Node.js processes
    
    REM Wait a moment for the port to be released
    timeout /t 3 /nobreak >nul
)

echo.
echo 📋 Checking for processes using port 5433...
netstat -ano | findstr :5433 >nul
if not errorlevel 1 (
    echo ⚠️ Port 5433 is in use. Attempting to free it...
    
    REM Kill any PostgreSQL processes
    taskkill /F /IM postgres.exe >nul 2>&1
    echo ✅ Killed PostgreSQL processes
    
    REM Wait a moment for the port to be released
    timeout /t 3 /nobreak >nul
)

echo.
echo 📋 Checking for processes using port 6379...
netstat -ano | findstr :6379 >nul
if not errorlevel 1 (
    echo ⚠️ Port 6379 is in use. Attempting to free it...
    
    REM Kill any Redis processes
    taskkill /F /IM redis-server.exe >nul 2>&1
    echo ✅ Killed Redis processes
    
    REM Wait a moment for the port to be released
    timeout /t 3 /nobreak >nul
)

echo.
echo 🧹 Cleaning up Docker containers...
docker-compose down
docker-compose -f docker-compose.dev.yml down
docker-compose -f docker-compose.simple.yml down

echo.
echo 🚀 Starting development environment...
docker-compose -f docker-compose.dev.yml up -d

echo.
echo ⏳ Waiting for services to start...
timeout /t 10 /nobreak >nul

echo.
echo 📊 Checking container status...
docker-compose -f docker-compose.dev.yml ps

echo.
echo ✅ Development environment started successfully!
echo 🌐 Access your app at: http://localhost:3000
echo 🗄️ Prisma Studio at: http://localhost:5555
echo.
echo If you still have issues, try:
echo 1. Restart your computer
echo 2. Use the simple setup: docker-compose -f docker-compose.simple.yml up -d
echo.
pause 