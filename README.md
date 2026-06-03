# LMS Frontend - Learning Management System

React-based frontend for the Learning Management System.

## Tech Stack
- React 18
- React Router DOM (routing)
- Axios (HTTP client)
- Zustand (state management)
- Vite (build tool)

## Project Structure

```
src/
├── components/
│   ├── auth/           # Protected routes
│   └── layout/         # Layout components (Navbar, Footer)
├── pages/
│   ├── auth/           # Login, Register
│   ├── courses/        # Course listing, details, my courses
│   └── Dashboard.jsx   # User dashboard
├── services/           # API service layers
│   ├── api.js          # Axios instance with interceptors
│   ├── authService.js  # Authentication APIs
│   ├── courseService.js
│   └── enrollmentService.js
├── store/              # Zustand state management
│   └── authStore.js    # Auth state
├── App.jsx             # Main app component
└── main.jsx            # Entry point
```

## Setup Instructions

### 1. Install Dependencies
```bash
cd LMS_frontend
npm install
```

### 2. Configure Environment
Copy `.env.example` to `.env`:
```bash
copy .env.example .env
```

The default API URL is `http://localhost:5000/api`

### 3. Start Development Server
```bash
npm run dev
```

Frontend will run on `http://localhost:3000`

### 4. Build for Production
```bash
npm run build
```

## Features

### Authentication
- User registration with role selection (Student/Instructor)
- Login with JWT tokens
- Protected routes
- Persistent auth state

### Courses
- Browse all available courses
- Search and filter courses
- View course details
- Enroll in courses
- View enrolled courses

### Dashboard
- Personalized user dashboard
- Quick stats and actions
- Course progress tracking

## Available Routes
- `/login` - Login page
- `/register` - Registration page
- `/dashboard` - User dashboard (protected)
- `/courses` - Browse all courses
- `/courses/:id` - Course detail page
- `/my-courses` - Enrolled courses (protected)

## State Management
Uses Zustand for global state management with persistence:
- Auth state (user, token, isAuthenticated)
- Automatic localStorage sync

## API Integration
Axios instance with:
- Automatic token injection
- Request/response interceptors
- Auto-logout on 401 errors
- Proxy configuration for development
