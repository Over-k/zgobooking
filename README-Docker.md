# 🐳 ZGoBooking Docker Setup

This guide will help you run the entire ZGoBooking project in Docker containers.

## 📋 Prerequisites

- [Docker](https://docs.docker.com/get-docker/) (version 20.10 or higher)
- [Docker Compose](https://docs.docker.com/compose/install/) (version 2.0 or higher)

## 🚀 Quick Start

### Option 1: Using the Setup Script (Recommended)

**Windows:**
```cmd
# Run the setup script
scripts\docker-setup.bat
```

**Linux/Mac:**
```bash
# Make the script executable
chmod +x scripts/docker-setup.sh

# Run the setup script
./scripts/docker-setup.sh
```

### Option 2: Manual Setup

1. **Create environment file:**
   ```bash
   cp .env.docker.example .env.docker
   # Edit .env.docker with your actual values
   ```

2. **Start development environment:**
   ```bash
   docker-compose -f docker-compose.dev.yml up -d
   ```

3. **Start production environment:**
   ```bash
   docker-compose up -d
   ```

## 🎯 How to Use the Docker App

### 📱 Application Access

Once the containers are running, you can access:

- **Main Application**: http://localhost:3000
- **Admin Dashboard**: http://localhost:3000/admin
- **User Dashboard**: http://localhost:3000/dashboard
- **Prisma Studio** (Dev only): http://localhost:5555

### 🔧 Management Commands

#### Windows Scripts (Recommended)

```cmd
# Start all services
scripts\start-docker.bat

# Stop all services
scripts\stop-docker.bat

# View logs
scripts\logs-docker.bat

# Reset everything (clean slate)
scripts\reset-docker.bat

# Check environment variables
scripts\check-env.bat

# Fix seeding issues
scripts\fix-seeding.bat
```

#### Manual Docker Commands

```bash
# Start services
docker-compose up -d                    # Production
docker-compose -f docker-compose.dev.yml up -d  # Development

# Stop services
docker-compose down
docker-compose -f docker-compose.dev.yml down

# View logs
docker-compose logs -f app
docker-compose logs -f db
docker-compose logs -f redis

# Execute commands in containers
docker-compose exec app npm run dev     # Start dev server
docker-compose exec app npx prisma studio  # Open Prisma Studio
docker-compose exec app npm run seed    # Seed database
```

### 🗄️ Database Management

```bash
# Run migrations
docker-compose exec app npx prisma migrate deploy

# Generate Prisma client
docker-compose exec app npx prisma generate

# Seed database
docker-compose exec app npm run seed

# Reset database (WARNING: Deletes all data)
docker-compose exec app npx prisma migrate reset

# Open Prisma Studio
docker-compose exec app npx prisma studio
```

### 🔍 Monitoring & Debugging

```bash
# Check container status
docker-compose ps

# View resource usage
docker stats

# Check application health
curl http://localhost:3000/api/health

# View real-time logs
docker-compose logs -f --tail=100

# Access container shell
docker-compose exec app sh
docker-compose exec db psql -U postgres -d AtlasPostgres
```

## 🏗️ Architecture

The Docker setup includes:

- **App**: Next.js application (port 3000)
- **DB**: PostgreSQL database (port 5433)
- **Redis**: Cache server (port 6379)
- **Nginx**: Reverse proxy (port 80/443) - Production only
- **Prisma Studio**: Database management (port 5555) - Development only

## 🔧 Configuration

### Environment Variables

The project uses multiple environment files for different scenarios:

- `.env.docker` - Production environment
- `.env.docker.dev` - Development environment  
- `.env.docker.test` - Testing environment
- `.env.docker.example` - Template file

**Create your environment file:**
```bash
cp .env.docker.example .env.docker
# Edit .env.docker with your actual values
```

**Required Environment Variables:**
```env
# Database
DATABASE_URL="postgresql://postgres:postgres@db:5432/AtlasPostgres"
SHADOW_DATABASE_URL="postgresql://postgres:postgres@db:5432/AtlasPostgres_shadow"

# Redis
REDIS_URL="redis://redis:6379"

# NextAuth
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="your-secret-key-here"

# Cloudinary (Required for image uploads)
CLOUDINARY_CLOUD_NAME="your-cloud-name"
CLOUDINARY_API_KEY="your-api-key"
CLOUDINARY_API_SECRET="your-api-secret"

# SMTP (Required for email notifications)
SMTP_HOST="smtp.gmail.com"
SMTP_PORT="587"
SMTP_USER="your-email@gmail.com"
SMTP_PASS="your-app-password"
```

### Ports

- **3000**: Next.js application
- **5433**: PostgreSQL database
- **6379**: Redis cache
- **5555**: Prisma Studio (development)
- **80**: Nginx (production)

## 🛠️ Development Workflow

### Start Development Environment

```bash
docker-compose -f docker-compose.dev.yml up -d
```

**Features:**
- Hot reloading enabled
- Source code mounted for live changes
- Prisma Studio available at http://localhost:5555
- All development dependencies included
- Volume mounting for instant code changes

### Development Commands

```bash
# Start development server
docker-compose exec app npm run dev

# Run tests
docker-compose exec app npm test

# Run linting
docker-compose exec app npm run lint

# Build for production
docker-compose exec app npm run build
```

## 🚀 Production Deployment

### Start Production Environment

```bash
docker-compose up -d
```

**Features:**
- Optimized production build
- Nginx reverse proxy with rate limiting
- Security headers
- Gzip compression
- Health checks
- Multi-stage build for smaller image size

### Production Considerations

1. **Environment Variables**: Update all environment variables with production values
2. **SSL Certificates**: Add SSL certificates to `./ssl/` directory
3. **Database Backups**: Set up regular database backups
4. **Monitoring**: Configure monitoring and logging
5. **Scaling**: Use Docker Swarm or Kubernetes for scaling

## 🔄 Alternative Configurations

### Different Ports

If you have port conflicts, use alternative configurations:

```bash
# Use ports 3001, 5434, 6380
docker-compose -f docker-compose.alt-ports.yml up -d

# Use ports 8080, 5435, 6381  
docker-compose -f docker-compose.alt-ports2.yml up -d
```

### Simple Setup (No Nginx)

For development or testing without Nginx:

```bash
docker-compose -f docker-compose.simple.yml up -d
```

### Testing Environment

```bash
docker-compose -f docker-compose.test.yml up -d
```

## 📊 Monitoring

### Health Checks

All services include health checks:

```bash
# Check service health
docker-compose ps

# View health check logs
docker-compose exec app curl http://localhost:3000/api/health
```

### Performance Monitoring

```bash
# View resource usage
docker stats

# Monitor logs in real-time
docker-compose logs -f --tail=100
```

## 🔍 Troubleshooting

### Common Issues

1. **Port Conflicts**
   ```bash
   # Check what's using the ports
   netstat -tulpn | grep :3000
   netstat -tulpn | grep :5433
   
   # Use alternative ports
   docker-compose -f docker-compose.alt-ports.yml up -d
   ```

2. **Database Connection Issues**
   ```bash
   # Check database status
   docker-compose exec db pg_isready -U postgres
   
   # Reset database
   docker-compose down -v
   docker-compose up -d
   ```

3. **Build Issues**
   ```bash
   # Clean build
   docker-compose build --no-cache
   
   # Remove all images
   docker system prune -a
   ```

4. **Seeding Issues**
   ```bash
   # Run the fix script
   scripts\fix-seeding.bat
   
   # Or manually check environment
   scripts\check-env.bat
   ```

5. **Permission Issues**
   ```bash
   # Fix file permissions
   sudo chown -R $USER:$USER .
   chmod +x scripts/docker-setup.sh
   ```

### Reset Everything

```bash
# Stop and remove all containers, networks, and volumes
docker-compose down -v
docker-compose -f docker-compose.dev.yml down -v
docker system prune -a --volumes

# Rebuild and start
docker-compose up -d --build
```

## 📁 File Structure

```
zgobooking/
├── Dockerfile                 # Production Dockerfile
├── Dockerfile.dev            # Development Dockerfile
├── docker-compose.yml        # Production compose
├── docker-compose.dev.yml    # Development compose
├── docker-compose.simple.yml # Simple setup (no Nginx)
├── docker-compose.alt-ports.yml  # Alternative ports
├── docker-compose.alt-ports2.yml # More alternative ports
├── docker-compose.test.yml   # Testing environment
├── nginx.conf               # Nginx configuration
├── .dockerignore            # Docker ignore file
├── .env.docker.example      # Environment template
├── .env.docker              # Production environment
├── .env.docker.dev          # Development environment
├── .env.docker.test         # Testing environment
├── scripts/
│   ├── docker-setup.bat     # Windows setup script
│   ├── docker-setup.sh      # Linux/Mac setup script
│   ├── start-docker.bat     # Start services
│   ├── stop-docker.bat      # Stop services
│   ├── logs-docker.bat      # View logs
│   ├── reset-docker.bat     # Reset everything
│   ├── check-env.bat        # Check environment
│   └── fix-seeding.bat      # Fix seeding issues
└── README-Docker.md         # This file
```

## 🔐 Security

### Production Security Checklist

- [ ] Change default passwords
- [ ] Use strong NEXTAUTH_SECRET
- [ ] Enable SSL/TLS
- [ ] Configure firewall rules
- [ ] Set up regular backups
- [ ] Use production-grade database passwords
- [ ] Configure proper CORS settings
- [ ] Set up monitoring and alerting

## 🎯 Quick Reference

### Essential Commands

```bash
# Start everything
scripts\start-docker.bat

# Stop everything  
scripts\stop-docker.bat

# View logs
scripts\logs-docker.bat

# Reset when things go wrong
scripts\reset-docker.bat

# Check environment
scripts\check-env.bat
```

### Access Points

- **App**: http://localhost:3000
- **Admin**: http://localhost:3000/admin
- **Dashboard**: http://localhost:3000/dashboard
- **Prisma Studio**: http://localhost:5555 (dev only)
- **Health Check**: http://localhost:3000/api/health

### Database Commands

```bash
# Seed data
docker-compose exec app npm run seed

# Open Prisma Studio
docker-compose exec app npx prisma studio

# Run migrations
docker-compose exec app npx prisma migrate deploy
```

This Docker setup provides a complete development and production environment for the ZGoBooking application with all necessary services, monitoring, and management tools. 