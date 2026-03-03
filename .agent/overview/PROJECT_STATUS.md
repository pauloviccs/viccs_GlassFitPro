# Project Overview

## Project Name

viccs_GlassFitPro

## Description

GlassFit Pro is a modern, responsive web application designed for managing workouts, personal training, and fitness routines. It provides distinct experiences: a student portal for viewing assigned workouts, tracking progress, and interacting socially, and an admin/professor portal for comprehensive management of users, exercises, and workout plans. The application uses sleek glassmorphic aesthetics and leverages Supabase as a backend-as-a-service for secure authentication, real-time database updates, Storage, RPC functions, and Row Level Security (RLS).

Recent implemented work includes a social feed system (`FeedTab`, `FeedPostCard`, `FeedCommentsModal`) allowing students to create posts with images, mention other users, like, and comment, as well as view public student profiles (`PublicProfile`).

## Tech Stack

- **Languages:** TypeScript, HTML, CSS
- **Frameworks:** React 18, Vite, Tailwind CSS, shadcn/ui, Radix UI Primitives, Framer Motion
- **Tools:** Zustand, TanStack React Query, React Router v6, React Hook Form, Zod, Vitest, ESLint, PostCSS, react-easy-crop, emoji-picker-react, recharts, date-fns, embla-carousel-react
- **Services:** Supabase (Database, Auth, Storage, Edge Functions/RPC)

## Folder Structure

```text
viccs_GlassFitPro/
├── .agent/
│   └── overview/           # AI Agent related files and automation overviews
├── public/                 # Static public assets
├── src/                    # Main application source code
│   ├── components/         # Reusable UI components
│   │   ├── admin/          # Sub-components for admin specific flows (AdminLayout)
│   │   ├── student/        # Sub-components for student workflows (ProgressTab, ProfileTab, feed components)
│   │   │   └── feed/       # Social feed components (FeedTab, FeedPostCard, CreatePostModal, FeedCommentsModal)
│   │   └── ui/             # Base shadcn/ui components (50+ components, e.g. dialog, drawer, carousel)
│   ├── contexts/           # React contexts (e.g., AuthContext)
│   ├── data/               # Static or mock data definitions
│   ├── hooks/              # Custom React hooks
│   ├── lib/                # Utility functions, helpers, Supabase client
│   ├── pages/              # Route components
│   │   ├── admin/          # Admin views (AdminWorkouts, AdminExercises, AdminStudents)
│   │   ├── student/        # Student views (PublicProfile)
│   │   ├── Index.tsx       # Landing page / routing orchestrator
│   │   ├── Login.tsx       # Authentication view
│   │   └── NotFound.tsx    # 404 Route
│   ├── services/           # Service integrations (e.g. feedService.ts)
│   ├── store/              # Zustand global state management
│   ├── test/               # Vitest test files and setup
│   ├── types/              # TypeScript interfaces and global type definitions
│   ├── App.tsx             # Main application wrapper and router definition
│   ├── index.css           # Global CSS and Tailwind directives
│   ├── main.tsx            # React DOM mounting entry point
│   └── vite-env.d.ts       # Vite ambient typings
├── database_schema.sql     # Core database DDL schema and Row Level Security policies
├── package.json            # Dependencies and scripts
├── tailwind.config.ts      # Tailwind framework configurations
├── tsconfig.*.json         # TypeScript compiler configurations
├── postcss.config.js       # PostCSS configuration
├── eslint.config.js        # ESLint configurations
├── vite.config.ts          # Vite bundler configurations
├── vitest.config.ts        # Vitest configurations
├── vercel.json             # Vercel deployment configuration
└── .env                    # Environment variables
```
