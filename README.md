# ZgoBooking - Event Booking Platform

[![Live Demo](https://img.shields.io/badge/Live%20Demo-zgobooking.vercel.app-blue)](https://zgobooking.vercel.app)
[![GitHub](https://img.shields.io/badge/GitHub-Over--k%2Fzgobooking-green)](https://github.com/Over-k/zgobooking)

ZgoBooking is a comprehensive event booking and management platform that enables users to discover, book, and manage events seamlessly. Built with modern web technologies, it provides event organizers with powerful tools to create and manage their events while offering attendees an intuitive booking experience with real-time communication capabilities.

## 🚀 Features

- **Event Discovery**: Browse and search events by category, location, date, and preferences
- **Seamless Booking**: Complete event booking system with availability management
- **Event Management**: Comprehensive tools for event organizers to create and manage events
- **Real-time Communication**: Direct messaging between event organizers and attendees
- **User Profiles**: Detailed profiles for both event organizers and attendees
- **Admin Dashboard**: Advanced admin panel with analytics, user management, and event oversight
- **Payment Ready**: Built-in payment system integration for secure transactions
- **Notification System**: Real-time notifications for bookings, updates, and messages

## 🛠️ Tech Stack

- **Frontend**: Next.js 15, React 18, TypeScript
- **Styling**: Tailwind CSS, Radix UI Components
- **Backend**: Next.js API Routes
- **Database**: PostgreSQL with Prisma ORM
- **Caching**: Redis
- **Authentication**: NextAuth.js
- **Image Storage**: Cloudinary
- **Forms**: React Hook Form with Zod validation
- **Deployment**: Vercel
- **Containerization**: Docker

## 📸 Screenshots

### Home Page
![Home Page](./public/screenshots/home.PNG)

### Dashboard
![Dashboard](./public/screenshots/dashboard.PNG)

### Admin Panel
![Admin Panel](./public/screenshots/admin.PNG)

### User Management
![User Management](./public/screenshots/admin.users.PNG)

### Messages
![Messages](./public/screenshots/messages.PNG)

### Notifications
![Notifications](./public/screenshots/notifications.PNG)

## 🏗️ Project Structure

```
zgobooking/
├── src/
│   ├── app/                    # Next.js 13+ App Router
│   │   ├── api/               # API routes
│   │   ├── admin/             # Admin dashboard pages
│   │   ├── auth/              # Authentication pages
│   │   ├── dashboard/         # User dashboard
│   │   └── ...
│   ├── components/            # Reusable UI components
│   │   ├── ui/               # Base UI components
│   │   ├── auth/             # Authentication components
│   │   ├── booking/          # Booking-related components
│   │   └── ...
│   ├── lib/                   # Utility functions and configurations
│   ├── hooks/                 # Custom React hooks
│   ├── types/                 # TypeScript type definitions
│   └── context/              # React context providers
├── prisma/                    # Database schema and migrations
├── public/                    # Static assets
├── docker-compose.yml         # Docker configuration
└── ...
```

## 🚀 Getting Started

### Prerequisites

- Node.js 18+ 
- npm or yarn
- PostgreSQL database
- Redis server
- Cloudinary account

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/Over-k/zgobooking.git
   cd zgobooking
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Environment Setup**
   
   Copy the environment file and configure your variables:
   ```bash
   cp .env.example .env.local
   ```

   Configure the following environment variables in `.env.local`:
   ```env
   # Database
   DATABASE_URL="postgresql://username:password@localhost:5432/zgobooking"
   
   # NextAuth
   NEXTAUTH_SECRET="your-secret-key"
   NEXTAUTH_URL="http://localhost:3000"
   
   # Cloudinary
   CLOUDINARY_CLOUD_NAME="your-cloud-name"
   CLOUDINARY_API_KEY="your-api-key"
   CLOUDINARY_API_SECRET="your-api-secret"
   
   # Redis
   REDIS_URL="redis://localhost:6379"
   
   # Email (Nodemailer)
   EMAIL_SERVER_USER="your-email"
   EMAIL_SERVER_PASSWORD="your-password"
   EMAIL_SERVER_HOST="smtp.gmail.com"
   EMAIL_SERVER_PORT=587
   EMAIL_FROM="noreply@zgobooking.com"
   ```

4. **Database Setup**
   ```bash
   # Push the schema to your database
   npx prisma db push
   
   # Seed the database (optional)
   npm run seed
   ```

5. **Start the development server**
   ```bash
   npm run dev
   ```

   Open [http://localhost:3000](http://localhost:3000) in your browser.

## 🐳 Docker Deployment

### Development with Docker

```bash
# Start all services
docker-compose -f docker-compose.dev.yml up

# Or use the simple configuration
docker-compose -f docker-compose.simple.yml up
```

### Production with Docker

```bash
# Build and start production containers
docker-compose up -d

# View logs
docker-compose logs -f
```

## 📊 Database Schema

The application uses Prisma ORM with PostgreSQL. Key models include:

- **User**: User accounts, profiles, and authentication
- **Event**: Event listings with details, categories, and availability
- **Booking**: Event booking records, status tracking, and management
- **Message**: Real-time messaging system between organizers and attendees
- **Review**: Event reviews and ratings from attendees
- **Notification**: User notifications for bookings, events, and updates

To view the database schema:
```bash
npx prisma studio
```

## 🔧 Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run lint` - Run ESLint
- `npm run seed` - Seed the database

## 🏗️ Key Features

### Event Management
- Event creation and listing with detailed information
- Category-based event organization
- Availability and capacity management
- Event analytics and performance tracking

### Booking System
- Event search and filtering by multiple criteria
- Real-time availability checking
- Booking confirmation and ticket generation
- Booking history and management

### User Experience
- Intuitive event discovery interface
- User profiles with booking history
- Event favorites and wishlist functionality
- Mobile-responsive design

### Communication
- Direct messaging between organizers and attendees
- Event updates and announcements
- Automated booking confirmations
- Review and rating system

## 🔒 Security Features

- JWT-based authentication
- Password hashing with bcrypt
- Rate limiting on API endpoints
- Input validation with Zod
- CSRF protection

## 🚀 Deployment

The application is deployed on Vercel with the following configuration:

- **Frontend**: Vercel hosting
- **Database**: PostgreSQL (managed service)
- **Redis**: Redis Cloud or managed Redis
- **Images**: Cloudinary CDN

### Deploy to Vercel

1. Connect your GitHub repository to Vercel
2. Configure environment variables in Vercel dashboard
3. Deploy automatically on push to main branch

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/new-feature`
3. Commit your changes: `git commit -am 'Add new feature'`
4. Push to the branch: `git push origin feature/new-feature`
5. Submit a pull request

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- [Next.js](https://nextjs.org/) for the amazing React framework
- [Prisma](https://prisma.io/) for the excellent database toolkit
- [Tailwind CSS](https://tailwindcss.com/) for the utility-first CSS framework
- [Radix UI](https://radix-ui.com/) for the accessible UI components

## 📞 Support

For support, email aitmiloudkhaled@gmail.com or create an issue on GitHub.

## 📄 Topics

`nextjs` `typescript` `prisma` `postgresql` `redis` `event-booking` `booking-system` `event-management` `real-time-messaging` `tailwindcss` `docker` `cloudinary` `nextauth` `react` `fullstack` `event-platform` `ticket-booking` `event-discovery`

---

**Live Demo**: [zgobooking.vercel.app](https://zgobooking.vercel.app)  
**Repository**: [github.com/Over-k/zgobooking](https://github.com/Over-k/zgobooking)