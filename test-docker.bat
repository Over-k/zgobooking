@echo off
echo 🧪 Testing Docker Setup for ZGoBooking...

echo.
echo 📋 Checking Docker installation...
docker --version
if errorlevel 1 (
    echo ❌ Docker is not installed or not running
    pause
    exit /b 1
)

echo.
echo 📋 Checking Docker Compose...
docker-compose --version
if errorlevel 1 (
    echo ❌ Docker Compose is not installed
    pause
    exit /b 1
)

echo.
echo 📋 Creating test environment file...
if not exist ".env" (
    echo Creating .env file...
    (
        echo DATABASE_URL="postgresql://postgres:postgres@localhost:5433/AtlasPostgres"
        echo SHADOW_DATABASE_URL="postgresql://postgres:postgres@localhost:5433/AtlasPostgres_shadow"
        echo REDIS_URL="redis://localhost:6379"
        echo NEXTAUTH_URL="http://localhost:3000"
        echo NEXTAUTH_SECRET="test-secret-key"
        echo CLOUDINARY_CLOUD_NAME="test"
        echo CLOUDINARY_API_KEY="test"
        echo CLOUDINARY_API_SECRET="test"
        echo SMTP_HOST="smtp.gmail.com"
        echo SMTP_PORT="587"
        echo SMTP_USER="test@gmail.com"
        echo SMTP_PASS="test"
    ) > .env
    echo ✅ .env file created
)

echo.
echo 📋 Creating necessary directories...
if not exist "uploads" mkdir uploads
if not exist "logs" mkdir logs
if not exist "ssl" mkdir ssl

echo.
echo 🚀 Starting development environment for testing...
docker-compose -f docker-compose.dev.yml up -d

echo.
echo ⏳ Waiting for services to start...
timeout /t 10 /nobreak >nul

echo.
echo 📊 Checking container status...
docker-compose -f docker-compose.dev.yml ps

echo.
echo ✅ Docker setup test completed!
echo 🌐 Your app should be available at: http://localhost:3000
echo 🗄️ Prisma Studio at: http://localhost:5555
echo.
echo To stop the containers, run: docker-compose -f docker-compose.dev.yml down
echo.
pause 