# Aizy Frontend

A modern, responsive React application built with Next.js, featuring beautiful animations and intuitive user interface.

## 🎨 Technology Stack

- **Next.js 15.3.3**: React framework with App Router
- **React 19**: Latest React features
- **Tailwind CSS**: Utility-first CSS framework
- **Framer Motion**: Advanced animations
- **Zustand**: Lightweight state management
- **Lucide React**: Beautiful icon library

## 🏗️ Project Structure

```
frontend/
├── app/                    # Next.js App Router
├── components/             # Reusable UI components
├── lib/                   # Utility functions
├── public/                # Static assets
├── styles/                # Global styles
├── hooks/                 # Custom React hooks
├── store/                 # Zustand store configuration
└── __tests__/             # Test files
```

## ✨ Features

### Core Functionality
- **Responsive Design**: Mobile-first approach with Tailwind CSS
- **Modern UI/UX**: Clean, intuitive interface design
- **Smooth Animations**: Framer Motion powered interactions
- **State Management**: Zustand for global state
- **Email Integration**: EmailJS and Resend for communications
- **Toast Notifications**: React-Toastify for user feedback

### Performance Optimizations
- **Turbopack**: Ultra-fast development builds
- **Next.js 15**: Latest optimizations and features
- **Code Splitting**: Automatic route-based splitting
- **Image Optimization**: Next.js built-in image optimization

## 🚀 Getting Started

### Prerequisites
- Node.js (v18 or higher)
- npm or yarn package manager

### Installation

1. **Navigate to frontend directory**
   ```bash
   cd frontend
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Start development server**
   ```bash
   npm run dev
   ```

4. **Open in browser**
   ```
   http://localhost:3000
   ```

## 📜 Available Scripts

| Script | Description |
|--------|-------------|
| `npm run dev` | Start development server with Turbopack |
| `npm run build` | Build for production |
| `npm run start` | Start production server |
| `npm run lint` | Run ESLint |
| `npm test` | Run Jest tests |
| `npm run test:watch` | Run tests in watch mode |
| `npm run test:coverage` | Generate test coverage report |

## 🎯 Component Architecture

### Design System
- **Consistent Spacing**: Tailwind spacing scale
- **Color Palette**: Carefully selected brand colors
- **Typography**: Geist font family for optimal readability
- **Icons**: Lucide React for consistent iconography

### State Management
- **Zustand Store**: Lightweight global state management
- **Local State**: React hooks for component-specific state
- **Server State**: Next.js data fetching patterns

### Animation System
- **Framer Motion**: Page transitions and micro-interactions
- **CSS Transitions**: Smooth hover and focus states
- **Performance**: Optimized animations for 60fps

## 🧪 Testing Framework

### Testing Stack
- **Jest**: Testing framework
- **React Testing Library**: Component testing utilities
- **Jest DOM**: DOM testing matchers
- **User Event**: User interaction simulation

### Test Structure
```
__tests__/
├── components/           # Component unit tests
├── pages/               # Page integration tests
├── utils/               # Utility function tests
└── setup.js             # Test configuration
```

### Running Tests
```bash
# Run all tests
npm test

# Watch mode
npm run test:watch

# Coverage report
npm run test:coverage
```

## 📱 Responsive Design

### Breakpoints
- **Mobile**: 320px - 767px
- **Tablet**: 768px - 1023px
- **Desktop**: 1024px+

### Design Principles
- Mobile-first development
- Progressive enhancement
- Accessible design patterns
- Performance-optimized images

## 🔧 Development Guidelines

### Code Style
- **ESLint**: Configured with Next.js rules
- **Prettier**: Code formatting (recommended)
- **TypeScript**: Type safety (if applicable)

### File Naming Conventions
- **Components**: PascalCase (e.g., `UserProfile.jsx`)
- **Pages**: kebab-case (e.g., `user-profile.js`)
- **Utilities**: camelCase (e.g., `formatDate.js`)

### Component Structure
```jsx
// Import statements
import React from 'react';
import { motion } from 'framer-motion';

// Component definition
const ComponentName = ({ props }) => {
  // Hooks and state
  // Event handlers
  // Render logic
  
  return (
    <motion.div>
      {/* JSX content */}
    </motion.div>
  );
};

export default ComponentName;
```

## 🌐 Environment Configuration

### Development Environment
- **Hot Reload**: Instant updates during development
- **Error Overlay**: Detailed error information
- **Fast Refresh**: Preserve component state during edits

### Production Build
- **Static Generation**: Pre-rendered pages for performance
- **Bundle Optimization**: Automatic code splitting
- **Asset Optimization**: Compressed images and assets

## 📦 Key Dependencies

### UI/UX
- **framer-motion**: Advanced animations
- **lucide-react**: Icon library
- **react-icons**: Additional icons
- **react-toastify**: Toast notifications

### Functionality
- **@emailjs/browser**: Client-side email service
- **jsonwebtoken**: JWT handling
- **zustand**: State management

### Development
- **@testing-library/react**: Testing utilities
- **eslint-config-next**: Next.js ESLint configuration
- **tailwindcss**: Utility-first CSS

## 🎨 Design Credits

The beautiful UI/UX design and visual elements were created by **Annie Angel Yarram** ([@Annie2936](https://github.com/Annie2936)), including:
- Logo design and branding
- User interface layouts
- Color schemes and typography
- Interactive design elements

## 🔄 Build Process

### Development Build
```bash
npm run dev
```
- Turbopack for ultra-fast builds
- Hot module replacement
- Source maps for debugging

### Production Build
```bash
npm run build
npm run start
```
- Optimized bundle sizes
- Static page generation
- Asset compression

## 📈 Performance Optimization

- **Next.js Image Component**: Automatic image optimization
- **Code Splitting**: Route-based automatic splitting
- **Bundle Analysis**: Built-in bundle analyzer
- **Core Web Vitals**: Optimized for Google's metrics
