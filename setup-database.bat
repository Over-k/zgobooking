@echo off
echo 🗄️ Setting up Database for ZGoBooking...

echo.
echo 📋 Checking if containers are running...
docker-compose ps | findstr "zgobooking-app" >nul
if errorlevel 1 (
    docker-compose -f docker-compose.dev.yml ps | findstr "zgobooking-app" >nul
    if errorlevel 1 (
        docker-compose -f docker-compose.simple.yml ps | findstr "zgobooking-app" >nul
        if errorlevel 1 (
            echo ❌ No running containers found. Please start the environment first.
            echo Run: docker-compose -f docker-compose.dev.yml up -d
            pause
            exit /b 1
        ) else (
            set COMPOSE_FILE=docker-compose.simple.yml
        )
    ) else (
        set COMPOSE_FILE=docker-compose.dev.yml
    )
) else (
    set COMPOSE_FILE=docker-compose.yml
)

echo ✅ Using compose file: %COMPOSE_FILE%

echo.
echo 🔄 Resetting database...
docker-compose -f %COMPOSE_FILE% exec app npx prisma migrate reset --force

echo.
echo 📊 Running migrations...
docker-compose -f %COMPOSE_FILE% exec app npx prisma migrate deploy

echo.
echo 🔧 Generating Prisma client...
docker-compose -f %COMPOSE_FILE% exec app npx prisma generate

echo.
echo 🌱 Seeding database...
docker-compose -f %COMPOSE_FILE% exec app npm run seed

echo.
echo ✅ Database setup completed successfully!
echo 🌐 Your application is ready at: http://localhost:3000
echo.
pause 