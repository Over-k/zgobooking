@echo off
echo 🔧 Fixing Seeding Issues...

echo.
echo 🛑 Stopping all containers...
docker-compose down
docker-compose -f docker-compose.dev.yml down
docker-compose -f docker-compose.simple.yml down
docker-compose -f docker-compose.test.yml down

echo.
echo 🧹 Cleaning up...
docker system prune -f

echo.
echo 🔍 Verifying environment file...
if not exist "env.docker.dev" (
    echo ❌ env.docker.dev file not found!
    echo Please make sure you have created env.docker.dev with your Cloudinary credentials.
    pause
    exit /b 1
)

echo ✅ env.docker.dev file found

echo.
echo 🚀 Starting development environment with proper environment variables...
docker-compose -f docker-compose.dev.yml up -d --build

echo.
echo ⏳ Waiting for services to start...
timeout /t 15 /nobreak >nul

echo.
echo 🔍 Checking environment variables in container...
docker-compose -f docker-compose.dev.yml exec app env | findstr CLOUDINARY

echo.
echo 🗄️ Running database migrations...
docker-compose -f docker-compose.dev.yml exec app npx prisma migrate deploy
docker-compose -f docker-compose.dev.yml exec app npx prisma generate

echo.
echo 🌱 Seeding database with proper environment...
docker-compose -f docker-compose.dev.yml exec app npm run seed

echo.
echo ✅ Seeding fix completed!
echo 🌐 Your app should be available at: http://localhost:3000
pause 