@echo off
echo 🔍 Checking Environment Variables in Docker Container...

echo.
echo 📋 Checking if containers are running...
docker-compose -f docker-compose.dev.yml ps | findstr "zgobooking-app" >nul
if errorlevel 1 (
    echo ❌ No running containers found. Starting development environment...
    docker-compose -f docker-compose.dev.yml up -d
    timeout /t 10 /nobreak >nul
)

echo.
echo 🔍 Checking environment variables in container...
docker-compose -f docker-compose.dev.yml exec app env | findstr CLOUDINARY

echo.
echo 🔍 Checking if env.docker.dev file exists...
if exist "env.docker.dev" (
    echo ✅ env.docker.dev file exists
    echo 📄 First few lines of env.docker.dev:
    type env.docker.dev | findstr CLOUDINARY
) else (
    echo ❌ env.docker.dev file not found
)

echo.
echo 🔍 Checking container logs for environment issues...
docker-compose -f docker-compose.dev.yml logs app | findstr -i "cloudinary\|env\|error" | tail -10

echo.
echo ✅ Environment check completed!
pause 