# Gym Web App — Frontend Specification

Version: 1.0
Goal: Build a modern, premium frontend interface for a gym training web application.

The name of the app is "VICCS - GlassFit Pro".

---

## 1. Product Overview

This project is a SaaS-style gym training web application with two user roles:

- This app should be 100% compatible with look and feel for mobile as for desktop. The user should be able to use and have the same experiêncie in any device.

- Student (Client Dashboard)
- Professor (Admin Dashboard)

The system must function as a web app (PWA-ready structure), focused exclusively on frontend architecture and UI/UX implementation.

The experience must feel like a premium Apple product: fluid, minimal, elegant, modern.

---

## 2. Design Philosophy

### Visual Direction

- Inspired by Apple "Liquid Glass" aesthetic
- Advanced glassmorphism (real blur layers, depth hierarchy)
- Soft shadows and layered transparency
- Rounded corners (lg to 2xl scale)
- Elegant typography (Inter or SF Pro style)
- High-end microinteractions
- Natural easing animations
- Minimalistic layout with strong grid logic
- Native dark mode

### UX Goals

- Intuitive navigation
- Clear visual hierarchy
- Low cognitive load
- Smooth transitions between states
- Instant visual feedback
- Premium product feel (not template-like)

---

## 3. Tech Stack (Frontend Only)

Use modern, scalable, optimized technologies:

- Next.js (App Router)
- React
- TypeScript
- TailwindCSS
- Framer Motion (animations)
- ShadCN/UI (base components)
- Zustand or Context API (state management)

Code must be modular, scalable, and production-ready.

---

## 4. Authentication UI

### Login / Register Screen

Features:

- Name
- Email
- Password
- Role selection (Student or Professor)

Design:

- Centered glass card
- Smooth entrance animation
- Minimal input fields
- Elegant error states
- Subtle gradient background

---

## 5. Student Dashboard (Client View)

### Main Page

Header:

- Dynamic greeting (e.g., “Good morning, [Name] 👋”)

Core Section:

- "Weekly Training" card
- Organized by days of the week
- Grid layout with fluid responsiveness

Each Exercise Card must include:

- Exercise name
- Number of sets
- Repetitions
- Embedded instructional video
- Instructional image
- “Mark as completed” button
- Completion animation
- Progress bar logic

### Weekly Progress Component

- Visual progress percentage
- Animated updates
- Clean minimal style

---

## 6. Professor Dashboard (Admin Panel)

Layout:

- Elegant sidebar navigation
- Main content panel with grid system
- Animated transitions between sections

Sidebar Sections:

- Overview
- Students
- Exercises
- Weekly Training Builder
- Content Library

---

## 7. Admin Functionalities (UI Only)

### Student Management

- Create student
- Edit student
- Remove student
- View student progress

### Exercise Management

- Add exercise
- Edit exercise
- Delete exercise
- Upload video (UI mock)
- Upload image (UI mock)
- Define default sets and reps

### Weekly Training Builder

- Assign exercises per student
- Organize by weekday
- Drag and drop interface
- Dynamic update simulation

---

## 8. Real-Time UX Simulation

Even without backend integration, simulate:

- Optimistic UI updates
- Dynamic state refresh
- Loading skeletons (glass style)
- Success / error animated states
- Smooth removal and insertion transitions

---

## 9. Component Architecture

Create reusable components:

- GlassCard
- ExerciseCard
- WeeklyProgress
- DashboardLayout
- SidebarNav
- AnimatedButton
- UploadModal
- DragDropWorkoutList
- GreetingHeader

Follow atomic design principles.

---

## 10. Responsiveness

- Mobile-first architecture
- Student dashboard fully usable on mobile
- Admin dashboard optimized for desktop/tablet
- Fluid breakpoints
- Adaptive grid

---

## 11. Performance Requirements

- Avoid heavy UI libraries
- Minimize re-renders
- Use dynamic imports when possible
- Keep bundle lightweight
- Optimize animations for 60fps

---

## 12. Experience Benchmark

The final UI must feel like:

- A premium startup product
- Comparable in refinement to Apple ecosystem apps
- Ready for real-world SaaS launch

Avoid generic templates.
Prioritize originality and elegance.

---

End of Specification.
