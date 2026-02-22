# Project Overview

## Project Name

viccs_GlassFitPro

## Description

GlassFit Pro is a modern, responsive web application for managing workouts and fitness training. It features dedicated portals for students to access their workouts and for administrators/professors to manage students, exercises, and workout schedules. The application employs a sleek glassmorphic UI design and utilizes Supabase as a backend for real-time data persistence and authentication.

## Tech Stack

- **Languages:** TypeScript, HTML, CSS
- **Frameworks/Libraries:** React (Vite), Framer Motion, Tailwind CSS, shadcn/ui, Radix UI
- **State Management:** Zustand, React Context
- **Tools:** Vite, Lucide React, ESLint
- **Services:** Supabase (Database, Auth, RLS)

## Folder Structure

```text
viccs_GlassFitPro/
├── .agent/                # AI Agent related files and workflows
├── public/                # Static public assets
├── src/                   # Main application source code
│   ├── components/        # Reusable view components (UI, layouts, widgets)
│   ├── contexts/          # React contexts (AuthContext.tsx)
│   ├── data/              # Initial or static data files
│   ├── hooks/             # Custom React hooks
│   ├── lib/               # Utility scripts (Supabase client configuration)
│   ├── pages/             # Route pages (Login, Dashboard, Admin pages, NotFound)
│   ├── store/             # Zustand state management
│   ├── test/              # Tests and test utilities
│   ├── types/             # TypeScript interfaces and definitions
│   ├── App.tsx            # App router and providers wrapper
│   ├── index.css          # Global styles + Tailwind directives
│   └── main.tsx           # React mounting entry point
├── database_schema.sql    # Core database DDL schema and Row Level Security policies
├── vercel.json            # Deployment config for Single Page Application routing
├── package.json           # Dependencies and scripts definitions
├── tailwind.config.ts     # Tailwind framework configurations
├── tsconfig.json          # Core TypeScript rules
└── vite.config.ts         # Vite bundler configurations
```
