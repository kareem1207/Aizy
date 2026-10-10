# 🚀 Aizy

<div align="center">
  <img src="public/app-logo.jpg" alt="Aizy Logo" width="200" height="200"/>
  
  *A Modern Full-Stack Platform with AI-Powered Data Analytics*
  
  [![Next.js](https://img.shields.io/badge/Next.js-15.3.3-black?style=flat-square&logo=next.js)](https://nextjs.org/)
  [![React](https://img.shields.io/badge/React-19.0.0-blue?style=flat-square&logo=react)](https://reactjs.org/)
  [![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-3.4-38B2AC?style=flat-square&logo=tailwind-css)](https://tailwindcss.com/)
  [![Express.js](https://img.shields.io/badge/Express.js-4.21.2-green?style=flat-square&logo=express)](https://expressjs.com/)
  [![Python](https://img.shields.io/badge/Python-3.8+-yellow?style=flat-square&logo=python)](https://python.org/)
  [![MongoDB](https://img.shields.io/badge/MongoDB-Latest-green?style=flat-square&logo=mongodb)](https://mongodb.com/)
  [![MySQL](https://img.shields.io/badge/MySQL-Latest-blue?style=flat-square&logo=mysql)](https://mysql.com/)
  [![Prisma](https://img.shields.io/badge/Prisma-ORM-2D3748?style=flat-square&logo=prisma)](https://prisma.io/)
</div>

## 📋 Project Overview

Aizy is a comprehensive full-stack platform that combines modern web technologies with powerful data analytics capabilities. The platform features a beautiful, responsive frontend built with Next.js and React, a robust Express.js backend with dual database architecture (MongoDB for products, MySQL with Prisma ORM for users), and advanced Python-based data processing and machine learning components.

## 🏗️ System Architecture

<div align="center">
  <img src="docs/system_architecture_flowchart.png" alt="Aizy System Architecture" width="1000"/>
  <p><em>Complete system architecture showing data flow and component interactions</em></p>
</div>

### Architecture Overview

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│                 │    │                 │    │                 │
│   Frontend      │────│   Backend       │────│   Python        │
│   (Next.js)     │    │   (Express.js)  │    │   (Data/ML)     │
│                 │    │                 │    │                 │
└─────────────────┘    └─────────────────┘    └─────────────────┘
         │                       │                       │
         │                       │                       │
    ┌────▼────┐            ┌─────▼─────┐         ┌──────▼──────┐
    │ React   │            │ MongoDB   │         │ FastAPI     │
    │ Zustand │            │ (Products)│         │ Scikit-Learn│
    │ Tailwind│            │           │         │ Pandas      │
    └─────────┘            │ MySQL     │         └─────────────┘
                           │ (Users)   │
                           │ Prisma ORM│
                           └───────────┘
```

## 📁 Directory Structure

```
aizy/
├── 📂 frontend/              # Next.js React application
│   ├── app/                  # App Router pages
│   ├── components/           # Reusable UI components
│   ├── public/              # Static assets and images
│   └── package.json         # Frontend dependencies
│
├── 📂 backend/               # Express.js API server
│   ├── routes/              # API route definitions
│   ├── config/              # Database configuration
│   ├── models/              # Database models
│   └── package.json         # Backend dependencies
│
├── 📂 python/                # Data science & ML scripts
│   ├── scripts/             # Data processing scripts
│   ├── models/              # ML models
│   ├── api/                 # FastAPI endpoints
│   └── requirements.txt     # Python dependencies
│
├── 📂 public/                # Shared static assets
│   ├── app-logo.png         # Application logo
│   ├── screenshots/         # Application screenshots
│   └── outputs/             # Generated output images
│
└── 📄 README.md             # This file
```

## ✨ Features

### 🎨 Frontend Features
- **Modern UI/UX**: Beautiful, responsive design with Tailwind CSS
- **Smooth Animations**: Framer Motion powered interactions
- **State Management**: Zustand for efficient global state
- **Email Integration**: EmailJS and Resend for communications
- **Toast Notifications**: User-friendly feedback system
- **Mobile-First**: Responsive design across all devices

### 🔧 Backend Features
- **RESTful API**: Express.js with comprehensive endpoints
- **Authentication**: JWT-based secure authentication
- **Dual Database**: MongoDB for products, MySQL with Prisma ORM for users
- **Prisma ORM**: Type-safe database access and migrations
- **File Upload**: Multer for file handling
- **CORS Support**: Cross-origin resource sharing
- **Error Handling**: Centralized error management

### 🐍 Python Features
- **Data Analytics**: Pandas-powered data processing
- **Machine Learning**: Scikit-learn integration
- **Visualization**: Matplotlib chart generation
- **API Integration**: FastAPI for ML model serving
- **Statistical Analysis**: Statsmodels for advanced analytics

## 🧪 Try it without any setup (demo mode)

Aizy ships with a **demo mode** that runs the entire store in your browser: product catalogue, sign-in, seller tools, admin tools, the AI fashion stylist and the sales forecaster. No MongoDB, MySQL, Python or backend is needed, and nothing leaves your browser (data lives in `localStorage`).

```bash
cd frontend
npm install
npm run dev          # demo mode is the default -> http://localhost:3000
```

Demo accounts (password `demo1234`): `customer@aizy.demo`, `seller@aizy.demo`, `admin@aizy.demo`. The login page also has one-click buttons. No payments exist anywhere in the app: orders only reserve stock.

Build the static site that is hosted on GitHub Pages with `npm run build:pages` (output in `frontend/out`).

### Run the real API without databases

The Express API can also run entirely in memory (handy for development and tests):

```bash
cd backend
npm install
npm run dev:memory   # http://localhost:5000, demo accounts seeded, data resets on restart
```

Then start the frontend with `NEXT_PUBLIC_API_MODE=live` (see `frontend/.env.example`).

## 🚀 Quick Start

### Prerequisites
- **Node.js** (v18 or higher)
- **Python** (3.8 or higher)
- **MongoDB** (local or cloud instance)
- **MySQL** (local or cloud instance)
- **npm** or **yarn** package manager

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/yourusername/aizy.git
   cd aizy
   ```

2. **Install root dependencies**
   ```bash
   npm install
   ```

3. **Setup Frontend**
   ```bash
   cd frontend
   npm install
   npm run dev
   ```
   Frontend will run on `http://localhost:3000`

4. **Setup Backend**
   ```bash
   cd backend
   npm install
   # Create .env file with your MongoDB URI, MySQL credentials, and JWT secret
   npm run dev
   ```
   Backend will run on `http://localhost:5000`

5. **Setup Python Environment**
   ```bash
   cd python
   python -m venv aizy_env
   source aizy_env/bin/activate  # On Windows: aizy_env\Scripts\activate
   pip install -r requirements.txt
   ```

## 📸 Screenshots & Outputs

### Application Interface

#### Homepage & Authentication
<div align="center">
  <img src="public/output/Homepage.png" alt="Homepage" width="600"/>
  <p><em>Clean and intuitive homepage design</em></p>
  
  <img src="public/output/login page.png" alt="Login Page" width="500"/>
  <p><em>Secure user authentication interface</em></p>
  
  <img src="public/output/signup page.jpg" alt="Signup Page" width="500"/>
  <p><em>User registration with comprehensive form validation</em></p>
</div>

#### Dashboard Interfaces
<div align="center">
  <img src="public/output/admin dashboard.png" alt="Admin Dashboard" width="650"/>
  <p><em>Comprehensive admin control panel with analytics</em></p>
  
  <img src="public/output/user dashboard.png" alt="User Dashboard" width="650"/>
  <p><em>Personalized user dashboard with activity overview</em></p>
  
  <img src="public/output/seller dashboard.jpg" alt="Seller Dashboard" width="650"/>
  <p><em>Advanced seller management and analytics dashboard</em></p>
</div>

#### AI-Powered Features
<div align="center">
  <img src="public/output/ai fashion assistant.png" alt="AI Fashion Assistant" width="600"/>
  <p><em>Intelligent fashion recommendation system</em></p>
  
  <img src="public/output/seller ai assistant.png" alt="Seller AI Assistant" width="600"/>
  <p><em>AI-powered seller tools and insights</em></p>
</div>

#### Product Management
<div align="center">
  <img src="public/output/create new product page.png" alt="Create Product Page" width="580"/>
  <p><em>Intuitive product creation interface</em></p>
  
  <img src="public/output/add new admin page.png" alt="Add New Admin Page" width="580"/>
  <p><em>Admin user management and role assignment</em></p>
  
  <img src="public/output/seller tools.jpg" alt="Seller Tools" width="580"/>
  <p><em>Comprehensive seller management tools</em></p>
</div>

#### Search & Navigation
<div align="center">
  <img src="public/output/Search bar.png" alt="Search Bar" width="550"/>
  <p><em>Advanced search functionality with filters</em></p>
  
</div>

### Mobile Responsive Design
<div align="center">
  <img src="public/output/mobile page 1.png" alt="Mobile Interface 1" width="300" style="margin: 10px;"/>
  <img src="public/output/mobile page 2.png" alt="Mobile Interface 2" width="300" style="margin: 10px;"/>
  <p><em>Mobile-optimized interfaces across different screen sizes</em></p>
</div>

## 🔄 Workflows

### Data Processing Workflow
```mermaid
graph TD
    A[Data Input] --> B[Python Processing]
    B --> C[Data Cleaning]
    C --> D[Feature Engineering]
    D --> E[ML Model Training]
    E --> F[Model Deployment]
    F --> G[API Integration]
    G --> H[Frontend Visualization]
```

### User Authentication Flow
```mermaid
graph TD
    A[User Login] --> B[Backend Validation]
    B --> C[JWT Generation]
    C --> D[Token Storage]
    D --> E[Protected Routes]
    E --> F[API Requests]
    F --> G[Data Response]
```

## 🧪 Testing

### Frontend Testing
```bash
cd frontend
npm test              # Run all tests
npm run test:watch    # Watch mode
npm run test:coverage # Coverage report
```

### Backend Testing
```bash
cd backend
npm test              # API tests (in-memory data, no databases needed)
npm run lint          # Code linting
```

### Python Testing
```bash
cd python
pytest                # Run all tests
pytest --cov         # Coverage report
```

## 📦 Tech Stack Details

### Frontend Stack
- **Next.js 15.3.3**: React framework with App Router
- **React 19**: Latest React features
- **Tailwind CSS**: Utility-first CSS framework
- **Framer Motion**: Advanced animations
- **Zustand**: Lightweight state management
- **Lucide React**: Beautiful icons

### Backend Stack
- **Express.js 4.21.2**: Web framework
- **MongoDB**: NoSQL database for products and analytics
- **MySQL**: Relational database for user management
- **Prisma ORM**: Type-safe database access and schema management
- **Mongoose**: MongoDB object modeling for products
- **JWT**: Authentication tokens
- **Argon2**: Password hashing
- **Multer**: File upload handling

### Python Stack
- **Pandas**: Data manipulation
- **NumPy**: Numerical computing
- **Scikit-learn**: Machine learning
- **Matplotlib**: Data visualization
- **FastAPI**: Modern API framework
- **Statsmodels**: Statistical analysis

## 🎨 Design Credits

**Design & Visual Excellence by:**

### Annie Angel Yarram
[![GitHub](https://img.shields.io/badge/GitHub-Annie2936-black?style=flat-square&logo=github)](https://github.com/Annie2936)

Annie Angel Yarram is the creative force behind Aizy's stunning visual identity and user experience. Her contributions include:

- **🎨 Logo Design**: Created the distinctive Aizy brand identity
- **🖥️ Frontend Design**: Designed the complete user interface and user experience
- **📱 UI/UX Implementation**: Implemented responsive design patterns and interactive elements
- **🌈 Visual Branding**: Developed color schemes, typography, and visual guidelines
- **✨ Animation Design**: Crafted smooth animations and micro-interactions

*Annie's design expertise has been instrumental in creating Aizy's professional and user-friendly interface that seamlessly combines functionality with aesthetic appeal.*

## 🔐 Environment Configuration

### Backend Environment (`backend/.env`)
See [`backend/.env.example`](backend/.env.example) for every option. The essentials:
```env
PORT=5000
DATA_MODE=db                       # or "memory" to run without databases
MONGO_URL=mongodb://localhost:27017/aizy        # products and orders
SQL_DATABASE_URL=mysql://user:password@localhost:3306/aizy   # users (Prisma)
JWT_SECRET=a-long-random-string    # required in production
ADMIN_EMAIL=you@example.com        # creates the first admin on startup
ADMIN_PASSWORD=at-least-8-chars
RESEND_API_KEY=                    # optional: emails sign-up codes
CORS_ORIGINS=http://localhost:3000
```

### Frontend Environment (`frontend/.env.local`)
See [`frontend/.env.example`](frontend/.env.example).
```env
NEXT_PUBLIC_API_MODE=live          # "demo" (default) needs no backend
NEXT_PUBLIC_BACKEND_API=http://localhost:5000
NEXT_PUBLIC_AI_API=http://127.0.0.1:8000
```

### Python Environment
```env
DATA_PATH=/path/to/data
MODEL_PATH=/path/to/models
API_HOST=localhost
API_PORT=8000
```

## 🗄️ Database Architecture

### MongoDB (Products & Analytics)
- **Products Collection**: Product catalog, inventory, and metadata
- **Analytics Collection**: User behavior and interaction data
- **Sessions Collection**: Analytics session tracking

### MySQL (User Management via Prisma)
- **Users Table**: User profiles, authentication data
- **Sessions Table**: User session management
- **Roles Table**: User permissions and access control

### Prisma ORM Benefits
- **Type Safety**: Auto-generated TypeScript types
- **Schema Migrations**: Version-controlled database changes
- **Query Builder**: Intuitive and safe database queries
- **Connection Pooling**: Optimized database connections

## 📚 Documentation

- **[Backend Documentation](backend/README.md)**: Complete backend API guide
- **[Frontend Documentation](frontend/README.md)**: Frontend development guide
- **[Python Documentation](python/README.md)**: Data science and ML guide

## 🤝 Contributing

We welcome contributions to Aizy! Please see our individual component documentation for specific contribution guidelines:

1. **Fork the repository**
2. **Create a feature branch**
3. **Make your changes**
4. **Add tests for new features**
5. **Submit a pull request**

### Development Guidelines
- Follow the existing code style and conventions
- Add appropriate tests for new functionality
- Update documentation as needed
- Ensure all tests pass before submitting

## 📋 Code of Conduct

We expect all contributors to follow our [Code of Conduct](./CODE_OF_CONDUCT.md).  
Aizy is a respectful, inclusive, and source-available project.

## 📄 License

This project is released under the **Aizy Source-Available Non-Commercial License (ASNCL) v1.0**.  
Please see [LICENSE.md](./LICENSE.md) for full details.

🔒 **Usage is restricted** strictly to educational and research purposes only.  
📧 Contact [@kareem1207](https://github.com/kareem1207) for custom usage permissions.

## 🙏 Acknowledgments

- **Annie Angel Yarram** ([@Annie2936](https://github.com/Annie2936)) - Lead Designer and Frontend Developer
- The open-source community for the amazing tools and libraries
- Contributors and testers who help improve the platform

## 📞 Support

For support, please open an issue on GitHub or contact the development team.

---

<div align="center">
  <p>Built with ❤️ by the Aizy team</p>
  <p>Design Excellence by <a href="https://github.com/Annie2936">Annie Angel Yarram</a></p>
</div>
  <p>Design Excellence by <a href="https://github.com/Annie2936">Annie Angel Yarram</a></p>
</div>
