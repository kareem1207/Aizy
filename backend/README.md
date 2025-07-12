# Aizy Backend

A robust Express.js backend API powering the Aizy platform with dual database architecture: MongoDB for products and MySQL with Prisma ORM for user management.

## 🏗️ Architecture Overview

```
backend/
├── app.js              # Main application entry point
├── config/             # Database and configuration files
├── routes/             # API route definitions
├── models/             # Database models (Mongoose & Prisma)
├── middleware/         # Custom middleware functions
├── prisma/             # Prisma schema and migrations
│   ├── schema.prisma   # Database schema
│   └── migrations/     # Database migrations
└── package.json        # Dependencies and scripts
```

## 🗄️ Database Architecture

### Dual Database System

#### MongoDB (Products & Analytics)
- **Products Collection**: Product catalog, inventory, and metadata
- **Analytics Collection**: User behavior and interaction data
- **Sessions Collection**: Analytics session tracking
- **Connection**: Via Mongoose ODM

#### MySQL (User Management)
- **Users Table**: User profiles, authentication data
- **Sessions Table**: User session management
- **Roles Table**: User permissions and access control
- **Connection**: Via Prisma ORM for type-safe database access

### Database Flow
```
┌─────────────────┐    ┌─────────────────┐
│   Frontend      │    │   Backend       │
│   Requests      │────│   Express.js    │
└─────────────────┘    └─────────────────┘
                              │
                              ├─── User Auth ───┐
                              │                 │
                              │                 ▼
                              │         ┌─────────────┐
                              │         │   MySQL     │
                              │         │ (Prisma ORM)│
                              │         │   Users     │
                              │         └─────────────┘
                              │
                              └─── Products ───┐
                                              │
                                              ▼
                                      ┌─────────────┐
                                      │  MongoDB    │
                                      │ (Mongoose)  │
                                      │  Products   │
                                      └─────────────┘
```

## 🚀 Features

- **RESTful API** built with Express.js
- **Dual Database System**: MongoDB for products, MySQL for users
- **Prisma ORM**: Type-safe database access with auto-generated types
- **Mongoose ODM**: Flexible MongoDB object modeling
- **JWT Authentication** for secure user sessions
- **Password Hashing** with Argon2
- **File Upload** support with Multer
- **CORS** enabled for frontend integration
- **OTP Generation** for verification processes
- **Database Migrations** with Prisma Migrate

## 📡 API Endpoints

### Authentication Routes (`/auth`)
- User registration and login (MySQL via Prisma)
- JWT token management
- Password reset functionality
- OTP verification
- Session management

### Product Routes (`/api/products`)
- Product CRUD operations (MongoDB via Mongoose)
- Product listing and search
- Category management
- Inventory tracking

### User Routes (`/api/users`)
- User profile management (MySQL via Prisma)
- User preferences
- Account settings

## 🛠️ Setup Instructions

### Prerequisites
- Node.js (v16 or higher)
- MongoDB (local or cloud instance)
- MySQL (local or cloud instance)
- npm or yarn package manager

### Installation

1. **Clone and navigate to backend directory**
   ```bash
   cd backend
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Environment Configuration**
   Create a `.env` file in the backend directory:
   ```env
   PORT=5000
   # MongoDB for products
   MONGODB_URI=your_mongodb_connection_string
   # MySQL for users
   DATABASE_URL="mysql://username:password@localhost:3306/aizy_users"
   JWT_SECRET=your_jwt_secret_key
   ```

4. **Database Setup**
   
   **Setup Prisma (MySQL)**
   ```bash
   # Generate Prisma client
   npx prisma generate
   
   # Run database migrations
   npx prisma migrate dev
   
   # (Optional) Seed the database
   npx prisma db seed
   ```
   
   **MongoDB** will be connected automatically via Mongoose

5. **Start the development server**
   ```bash
   npm run dev
   ```

The server will start on `http://localhost:5000`

## 📦 Dependencies

### Core Dependencies
- **express**: Web framework for Node.js
- **mongoose**: MongoDB object modeling for products
- **@prisma/client**: Type-safe MySQL database client for users
- **prisma**: Database toolkit and migration system
- **jsonwebtoken**: JWT implementation
- **argon2**: Password hashing
- **dotenv**: Environment variable management
- **cors**: Cross-origin resource sharing
- **multer**: File upload handling
- **otp-generator**: OTP generation utility

### Database Integration
- **MongoDB + Mongoose**: Product catalog and analytics
- **MySQL + Prisma**: User management and authentication

## 🔧 Development Guidelines

### Project Structure
```
backend/
├── config/
│   ├── mongodb.config.js    # MongoDB connection
│   └── prisma.config.js     # Prisma configuration
├── routes/
│   ├── user.routes.js       # User auth routes (Prisma/MySQL)
│   └── product.routes.js    # Product routes (Mongoose/MongoDB)
├── models/
│   ├── mongoose/            # MongoDB schemas
│   │   ├── Product.js
│   │   └── Analytics.js
│   └── prisma/              # Auto-generated Prisma models
├── prisma/
│   ├── schema.prisma        # Database schema
│   ├── migrations/          # Database migrations
│   └── seed.js              # Database seeding
├── middleware/              # Custom middleware
└── app.js                   # Application entry point
```

### Database Usage Patterns

#### For User Operations (MySQL/Prisma)
```javascript
import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

// Create user
const user = await prisma.user.create({
  data: { email, hashedPassword, name }
});
```

#### For Product Operations (MongoDB/Mongoose)
```javascript
import Product from '../models/mongoose/Product.js';

// Create product
const product = new Product({ name, description, price });
await product.save();
```

## 🔒 Security Features

- **JWT Authentication**: Secure token-based authentication
- **Password Hashing**: Argon2 for secure password storage
- **Database Security**: Prisma for SQL injection prevention
- **CORS Configuration**: Controlled cross-origin requests
- **Request Validation**: Input validation and sanitization
- **Connection Pooling**: Optimized database connections

## 📝 Development Scripts

- `npm run dev`: Start development server with auto-reload
- `npm test`: Run test suite
- `npm run lint`: Code linting
- `npx prisma generate`: Generate Prisma client
- `npx prisma migrate dev`: Run database migrations
- `npx prisma studio`: Open Prisma Studio (database GUI)

## 🌐 CORS Configuration

Currently configured for:
- Origin: `http://localhost:3000` (Frontend development)
- Methods: GET, POST, PUT, DELETE
- Headers: Content-Type, Authorization
- Credentials: Enabled

## 📋 Environment Variables

| Variable | Description | Required |
|----------|-------------|----------|
| `PORT` | Server port number | No (default: 5000) |
| `MONGODB_URI` | MongoDB connection string | Yes |
| `DATABASE_URL` | MySQL connection string for Prisma | Yes |
| `JWT_SECRET` | JWT signing secret | Yes |

## 🔄 Database Operations

### Prisma Operations (Users)
```bash
# Generate client after schema changes
npx prisma generate

# Create and apply migrations
npx prisma migrate dev --name init

# Reset database
npx prisma migrate reset

# View database in browser
npx prisma studio
```

### MongoDB Operations (Products)
- Automatic connection via Mongoose
- Schema validation through Mongoose models
- Flexible document structure for product variations

## 🤝 Contributing

1. Follow the existing code structure
2. Use Prisma for user-related database operations
3. Use Mongoose for product-related database operations
4. Implement proper error handling for both databases
5. Add appropriate middleware for new routes
6. Maintain consistent API response format
7. Update Prisma schema for user table changes
8. Update Mongoose models for product schema changes
