# Project Overview

## Project Name

**viccs_GlassFitPro**

## Description

GlassFit Pro is a modern, responsive web application designed for managing workouts, personal training, and fitness routines. It provides distinct experiences: a student portal for viewing and executing assigned workouts, and an admin/professor portal for comprehensive management of users, exercises, and workout plans. The application uses a sleek glassmorphic aesthetics, leveraging Supabase as a backend-as-a-service for secure authentication, real-time database updates, and Row Level Security (RLS).

Recent updates include:

- Fixing the authentication redirect loop to ensure proper routing based on user role.
- Syncing real-time student progress and aggregated statistics (Total Students, Registered Exercises, Active Workouts) directly to the Admin Dashboard.
- Polished overall UX and responsive design across device sizes.

## Tech Stack

- **Languages:** TypeScript, HTML, CSS
- **Frontend Framework:** React 18 (Vite bundler)
- **Styling:** Tailwind CSS, shadcn/ui, Radix UI Primitives, Framer Motion (animations)
- **State Management & Data Fetching:** Zustand, React Context, TanStack React Query
- **Routing:** React Router v6
- **Forms & Validation:** React Hook Form, zod
- **Backend/Services:** Supabase (PostgreSQL Database, Auth, Row Level Security)
- **Testing:** Vitest, Testing Library
- **Tooling:** ESLint, PostCSS

## Current Features Implemented

- **Authentication System:** Secure login mapping users to "admin" or "student" roles via Supabase.
- **Admin Portal (`/admin`):**
  - **Overview Dashboard:** Displays dynamic, real-time statistics and recent student activities.
  - **Student Management:** Full CRUD operations for student profiles.
  - **Exercise Management:** Library of predefined exercises with details.
  - **Workout Management:** Assigning and building customized workout plans for students.
- **Student Portal (`/student`):**
  - **Student Dashboard:** Viewing active customized workouts and daily assignments.

## Folder Structure

```text
viccs_GlassFitPro/
├── .agent/                # AI Agent related files and automation overviews
├── public/                # Static public assets (e.g., icons, images)
├── src/                   # Main application source code
│   ├── components/        # Reusable UI components (shadcn/ui, widgets, layouts)
│   ├── contexts/          # React contexts (e.g., AuthContext for session management)
│   ├── data/              # Static or mock data definitions
│   ├── hooks/             # Custom React hooks
│   ├── lib/               # Utility functions, helpers, Supabase client initialization
│   ├── pages/             # Route components
│   │   ├── admin/         # Admin views (AdminOverview, AdminStudents, AdminExercises, AdminWorkouts)
│   │   ├── student/       # Student views (StudentDashboard)
│   │   ├── Index.tsx      # Landing page / routing orchestrator
│   │   ├── Login.tsx      # Authentication view
│   │   └── NotFound.tsx   # 404 Route
│   ├── store/             # Zustand global state management
│   ├── test/              # Vitest test files and setup
│   ├── types/             # TypeScript interfaces and global type definitions
│   ├── vite-env.d.ts      # Vite ambient typings
│   ├── App.tsx            # Main application wrapper and router definition
│   ├── index.css          # Global CSS and Tailwind directives
│   └── main.tsx           # React DOM mounting entry point
├── database_schema.sql    # Core database DDL schema and Row Level Security (RLS) policies
├── vercel.json            # Vercel deployment configuration for SPA routing
├── package.json           # Dependencies and NPM scripts
├── tailwind.config.ts     # Tailwind framework configurations and theme settings
├── tsconfig.*.json        # TypeScript compiler configurations
├── postcss.config.js      # PostCSS configuration
├── eslint.config.js       # ESLint configurations
└── vite.config.ts         # Vite bundler configurations
```
