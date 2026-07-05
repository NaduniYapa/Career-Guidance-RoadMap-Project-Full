# Career Guidance Roadmap Platform

A comprehensive web application designed to help students and professionals plan their career paths and develop skills through personalized learning roadmaps, mentorship, and community engagement.

## 🎯 Features

- **Career Selection & Roadmap Generation**: Interactive career selection with personalized learning roadmaps
- **Skill Tracking**: Monitor and track skill development across different career phases
- **Learning Phases**: Structured learning curriculum with progression tracking
- **Community Forum**: Discuss career paths, share experiences, and ask questions
- **Chatbot Assistant**: Intelligent chatbot for instant career guidance and support
- **Professional Dashboard**: Dedicated interface for mentors and professionals
- **Admin Panel**: Full administrative control over users, content, and system configuration
- **User Authentication**: Secure login/registration with JWT-based authentication
- **Notifications**: Real-time notifications for forum replies, messages, and updates

## 🛠️ Tech Stack

- **Frontend**: Next.js 15, React 19, Tailwind CSS 4
- **Backend**: Next.js API Routes
- **Database**: PostgreSQL
- **Authentication**: JWT (jsonwebtoken)
- **Security**: bcryptjs for password hashing
- **File Storage**: AWS S3
- **UI Components**: Heroicons, Framer Motion for animations
- **Validation**: Zod

## 📋 Prerequisites

- Node.js 18+
- PostgreSQL 12+
- npm or yarn
- AWS S3 credentials (optional, for file uploads)

## 🚀 Getting Started

### 1. Clone the Repository

```bash
git clone <repository-url>
cd career-guidance-roadmap-platform
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Environment Setup

Create a `.env.local` file in the root directory with the following variables:

```env
# Database
DATABASE_URL=postgresql://user:password@localhost:5432/career_platform

# JWT
JWT_SECRET=your_jwt_secret_key_here

# AWS S3 (optional)
AWS_ACCESS_KEY_ID=your_aws_access_key
AWS_SECRET_ACCESS_KEY=your_aws_secret_key
AWS_S3_BUCKET=your_bucket_name
AWS_REGION=us-east-1

# Application
NODE_ENV=development
```

### 4. Initialize Database

```bash
# Initialize schema (required for both dev and production)
npm run db:init

# Seed demo data (DEVELOPMENT ONLY - do not run in production!)
npm run db:seed
```

**⚠️ Important:** The `db:seed` command creates demo users and test data. **Never run this in production!** It's only for development and testing environments.

### 5. Run Development Server

```bash
npm run dev
```

The application will be available at [http://localhost:3000](http://localhost:3000)

## 📚 Available Scripts

```bash
# Development
npm run dev          # Start development server

# Production
npm run build        # Build for production
npm run start        # Start production server
npm run lint         # Run ESLint

# Database Management
npm run db:init      # Initialize database schema
npm run db:seed      # Seed initial data
npm run db:reset     # Reset database

# Data Migration
npm run migrate:careers    # Migrate career data
npm run migrate:users      # Migrate user data
npm run migrate:chatbot    # Migrate chatbot responses
npm run migrate:phases     # Migrate learning phases
npm run migrate:resources  # Migrate resource types
npm run verify:migration   # Verify migration status
```

## 📁 Project Structure

```
├── src/
│   ├── app/                      # Next.js app directory
│   │   ├── api/                  # API routes
│   │   ├── components/           # Reusable React components
│   │   ├── dashboard/            # Dashboard pages
│   │   ├── auth/                 # Authentication pages
│   │   └── admin/                # Admin panel
│   ├── lib/                      # Utility functions and helpers
│   │   ├── api-client.js         # API client wrapper
│   │   ├── auth.js               # Authentication utilities
│   │   ├── db.js                 # Database connection
│   │   └── roadmap-engine.js     # Roadmap generation logic
│   ├── constants.js              # Application constants
│   └── engine.js                 # Core business logic
├── scripts/                      # Database and migration scripts
├── package.json
└── next.config.js
```

## 🔐 Authentication

The platform uses JWT-based authentication. After login, users receive a token that must be included in subsequent API requests.

### Authentication Endpoints

- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login
- `POST /api/auth/logout` - User logout
- `GET /api/auth/me` - Get current user info

## 📖 API Documentation

### Careers API

- `GET /api/careers` - List all careers
- `POST /api/careers` - Create new career (admin)

### Users API

- `GET /api/users/[username]` - Get user profile
- `GET /api/users/[username]/skills` - Get user skills
- `GET /api/users/professionals` - List professionals

### Forum API

- `GET /api/forum/posts` - List forum posts
- `POST /api/forum/posts` - Create new post
- `GET /api/forum/posts/[id]` - Get post details
- `POST /api/forum/posts/[id]/replies` - Reply to post

### Roadmap API

- `POST /api/roadmap/generate` - Generate personalized roadmap
- `GET /api/roadmap/progress` - Get roadmap progress

### Learning Phases API

- `GET /api/learning-phases` - List all learning phases

### Notifications API

- `GET /api/notifications` - Get user notifications
- `PUT /api/notifications/[id]/read` - Mark notification as read

## 🤖 Chatbot

The integrated chatbot provides instant career guidance. Access it from the dashboard chat interface.

## 👥 User Roles

- **Guest**: View landing page and resources
- **Student**: Full access to career roadmaps, learning paths, and community
- **Professional**: Mentorship and professional dashboard
- **Admin**: System administration and content management

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit changes (`git commit -m 'Add amazing feature'`)
4. Push to branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📝 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 📧 Contact & Support

For questions, issues, or suggestions, please open an issue on GitHub or contact the development team.

## 🚢 Deployment

### Deploying to Production

1. Build the application:

   ```bash
   npm run build
   ```

2. Start production server:

   ```bash
   npm run start
   ```

3. For cloud deployment (Vercel, AWS, etc.), ensure:
   - All environment variables are configured
   - Database is accessible and initialized
   - Build completes without errors

## 📈 Roadmap

- [ ] Mobile app (React Native)
- [ ] Video tutorials integration
- [ ] AI-powered skill assessment (planned)
- [ ] Peer mentorship matching
- [ ] Job recommendations
- [ ] Certificate generation

## ✨ Acknowledgments

Built as part of the Program Construction course at the University.
