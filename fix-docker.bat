@echo off
echo 🔧 Fixing Docker Setup for ZGoBooking...

echo.
echo 🧹 Cleaning up failed builds...
docker-compose down -v
docker-compose -f docker-compose.dev.yml down -v
docker system prune -f
docker builder prune -f

echo.
echo 🚀 Starting with simple Docker setup...
docker-compose -f docker-compose.simple.yml up -d --build

echo.
echo ⏳ Waiting for services to start...
timeout /t 15 /nobreak >nul

echo.
echo 📊 Checking container status...
docker-compose -f docker-compose.simple.yml ps

echo.
echo ✅ Simple Docker setup completed!
echo 🌐 Your app should be available at: http://localhost:3000
echo.
echo If this works, you can also try the development environment later.
echo.
pause 