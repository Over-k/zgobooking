#!/bin/bash

# Docker Setup Script for ZGoBooking
echo "🚀 Setting up ZGoBooking with Docker..."

# Check if Docker is installed
if ! command -v docker &> /dev/null; then
    echo "❌ Docker is not installed. Please install Docker first."
    exit 1
fi

# Check if Docker Compose is installed
if ! command -v docker-compose &> /dev/null; then
    echo "❌ Docker Compose is not installed. Please install Docker Compose first."
    exit 1
fi

# Create necessary directories
echo "📁 Creating necessary directories..."
mkdir -p uploads logs ssl

# Create .env file if it doesn't exist
if [ ! -f .env ]; then
    echo "📝 Creating .env file..."
    cat > .env << EOF
# Database
DATABASE_URL="postgresql://postgres:postgres@localhost:5433/AtlasPostgres"
SHADOW_DATABASE_URL="postgresql://postgres:postgres@localhost:5433/AtlasPostgres_shadow"

# Redis
REDIS_URL="redis://localhost:6379"

# NextAuth
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="your-secret-key-here-change-in-production"

# Cloudinary (replace with your actual values)
CLOUDINARY_CLOUD_NAME="your-cloud-name"
CLOUDINARY_API_KEY="your-api-key"
CLOUDINARY_API_SECRET="your-api-secret"

# SMTP (replace with your actual values)
SMTP_HOST="smtp.gmail.com"
SMTP_PORT="587"
SMTP_USER="your-email@gmail.com"
SMTP_PASS="your-app-password"
EOF
    echo "✅ .env file created. Please update it with your actual values."
fi

# Function to run database migrations
run_migrations() {
    echo "🗄️ Running database migrations..."
    docker-compose exec app npx prisma migrate deploy
    docker-compose exec app npx prisma generate
}

# Function to seed the database
seed_database() {
    echo "🌱 Seeding database..."
    docker-compose exec app npm run seed
}

# Function to show status
show_status() {
    echo "📊 Container Status:"
    docker-compose ps
}

# Function to show logs
show_logs() {
    echo "📋 Application Logs:"
    docker-compose logs -f app
}

# Main menu
while true; do
    echo ""
    echo "🔧 ZGoBooking Docker Management"
    echo "1. Start development environment"
    echo "2. Start production environment"
    echo "3. Stop all containers"
    echo "4. Run database migrations"
    echo "5. Seed database"
    echo "6. Show container status"
    echo "7. Show application logs"
    echo "8. Clean up (remove containers and volumes)"
    echo "9. Exit"
    echo ""
    read -p "Choose an option (1-9): " choice

    case $choice in
        1)
            echo "🚀 Starting development environment..."
            docker-compose -f docker-compose.dev.yml up -d
            echo "✅ Development environment started!"
            echo "🌐 Access your app at: http://localhost:3000"
            echo "🗄️ Prisma Studio at: http://localhost:5555"
            ;;
        2)
            echo "🚀 Starting production environment..."
            docker-compose up -d
            echo "✅ Production environment started!"
            echo "🌐 Access your app at: http://localhost:80"
            ;;
        3)
            echo "🛑 Stopping all containers..."
            docker-compose down
            docker-compose -f docker-compose.dev.yml down
            echo "✅ All containers stopped!"
            ;;
        4)
            if docker-compose ps | grep -q "zgobooking-app"; then
                run_migrations
            else
                echo "❌ No running containers found. Start the environment first."
            fi
            ;;
        5)
            if docker-compose ps | grep -q "zgobooking-app"; then
                seed_database
            else
                echo "❌ No running containers found. Start the environment first."
            fi
            ;;
        6)
            show_status
            ;;
        7)
            show_logs
            ;;
        8)
            echo "🧹 Cleaning up containers and volumes..."
            docker-compose down -v
            docker-compose -f docker-compose.dev.yml down -v
            docker system prune -f
            echo "✅ Cleanup completed!"
            ;;
        9)
            echo "👋 Goodbye!"
            exit 0
            ;;
        *)
            echo "❌ Invalid option. Please choose 1-9."
            ;;
    esac
done 