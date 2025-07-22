@echo off
setlocal enabledelayedexpansion

echo 🚀 Setting up ZGoBooking with Docker...

REM Check if Docker is installed
docker --version >nul 2>&1
if errorlevel 1 (
    echo ❌ Docker is not installed. Please install Docker first.
    pause
    exit /b 1
)

REM Check if Docker Compose is installed
docker-compose --version >nul 2>&1
if errorlevel 1 (
    echo ❌ Docker Compose is not installed. Please install Docker Compose first.
    pause
    exit /b 1
)

REM Create necessary directories
echo 📁 Creating necessary directories...
if not exist "uploads" mkdir uploads
if not exist "logs" mkdir logs
if not exist "ssl" mkdir ssl

REM Check if environment files exist, if not create them
if not exist "env.docker" (
    echo ❌ env.docker file not found. Please create it with your environment variables.
    echo See env.docker.example for reference.
    pause
    exit /b 1
)

:menu
echo.
echo 🔧 ZGoBooking Docker Management
echo 1. Start development environment
echo 2. Start production environment
echo 3. Start simple environment ^(fallback^)
echo 4. Start test environment
echo 5. Stop all containers
echo 6. Run database migrations
echo 7. Seed database
echo 8. Show container status
echo 9. Show application logs
echo 10. Clean up ^(remove containers and volumes^)
echo 11. Exit
echo.
set /p choice="Choose an option (1-11): "

if "%choice%"=="1" goto dev
if "%choice%"=="2" goto prod
if "%choice%"=="3" goto simple
if "%choice%"=="4" goto test
if "%choice%"=="5" goto stop
if "%choice%"=="6" goto migrate
if "%choice%"=="7" goto seed
if "%choice%"=="8" goto status
if "%choice%"=="9" goto logs
if "%choice%"=="10" goto cleanup
if "%choice%"=="11" goto exit
echo ❌ Invalid option. Please choose 1-11.
goto menu

:dev
echo 🚀 Starting development environment...
docker-compose -f docker-compose.dev.yml up -d
echo ✅ Development environment started!
echo 🌐 Access your app at: http://localhost:3000
echo 🗄️ Prisma Studio at: http://localhost:5555
pause
goto menu

:prod
echo 🚀 Starting production environment...
docker-compose up -d
echo ✅ Production environment started!
echo 🌐 Access your app at: http://localhost:80
pause
goto menu

:simple
echo 🚀 Starting simple environment...
docker-compose -f docker-compose.simple.yml up -d
echo ✅ Simple environment started!
echo 🌐 Access your app at: http://localhost:3000
pause
goto menu

:test
echo 🚀 Starting test environment...
docker-compose -f docker-compose.test.yml up -d
echo ✅ Test environment started!
echo 🌐 Access your app at: http://localhost:3000
pause
goto menu

:stop
echo 🛑 Stopping all containers...
docker-compose down
docker-compose -f docker-compose.dev.yml down
docker-compose -f docker-compose.simple.yml down
docker-compose -f docker-compose.test.yml down
echo ✅ All containers stopped!
pause
goto menu

:migrate
docker-compose ps | findstr "zgobooking-app" >nul
if errorlevel 1 (
    docker-compose -f docker-compose.dev.yml ps | findstr "zgobooking-app" >nul
    if errorlevel 1 (
        docker-compose -f docker-compose.simple.yml ps | findstr "zgobooking-app" >nul
        if errorlevel 1 (
            docker-compose -f docker-compose.test.yml ps | findstr "zgobooking-app" >nul
            if errorlevel 1 (
                echo ❌ No running containers found. Start the environment first.
                pause
                goto menu
            ) else (
                echo 🗄️ Running database migrations...
                docker-compose -f docker-compose.test.yml exec app npx prisma migrate deploy
                docker-compose -f docker-compose.test.yml exec app npx prisma generate
            )
        ) else (
            echo 🗄️ Running database migrations...
            docker-compose -f docker-compose.simple.yml exec app npx prisma migrate deploy
            docker-compose -f docker-compose.simple.yml exec app npx prisma generate
        )
    ) else (
        echo 🗄️ Running database migrations...
        docker-compose -f docker-compose.dev.yml exec app npx prisma migrate deploy
        docker-compose -f docker-compose.dev.yml exec app npx prisma generate
    )
) else (
    echo 🗄️ Running database migrations...
    docker-compose exec app npx prisma migrate deploy
    docker-compose exec app npx prisma generate
)
pause
goto menu

:seed
docker-compose ps | findstr "zgobooking-app" >nul
if errorlevel 1 (
    docker-compose -f docker-compose.dev.yml ps | findstr "zgobooking-app" >nul
    if errorlevel 1 (
        docker-compose -f docker-compose.simple.yml ps | findstr "zgobooking-app" >nul
        if errorlevel 1 (
            docker-compose -f docker-compose.test.yml ps | findstr "zgobooking-app" >nul
            if errorlevel 1 (
                echo ❌ No running containers found. Start the environment first.
                pause
                goto menu
            ) else (
                echo 🌱 Seeding database...
                docker-compose -f docker-compose.test.yml exec app npm run seed
            )
        ) else (
            echo 🌱 Seeding database...
            docker-compose -f docker-compose.simple.yml exec app npm run seed
        )
    ) else (
        echo 🌱 Seeding database...
        docker-compose -f docker-compose.dev.yml exec app npm run seed
    )
) else (
    echo 🌱 Seeding database...
    docker-compose exec app npm run seed
)
pause
goto menu

:status
echo 📊 Container Status:
docker-compose ps
docker-compose -f docker-compose.dev.yml ps
docker-compose -f docker-compose.simple.yml ps
docker-compose -f docker-compose.test.yml ps
pause
goto menu

:logs
echo 📋 Application Logs:
docker-compose logs -f app
goto menu

:cleanup
echo 🧹 Cleaning up containers and volumes...
docker-compose down -v
docker-compose -f docker-compose.dev.yml down -v
docker-compose -f docker-compose.simple.yml down -v
docker-compose -f docker-compose.test.yml down -v
docker system prune -f
echo ✅ Cleanup completed!
pause
goto menu

:exit
echo 👋 Goodbye!
exit /b 0 