# GymPro

A modern workout and fitness progress tracker built for lifters who want a clean, fast, and distraction-free experience. Log workouts, monitor strength progression, manage training templates, and visualize long-term performance through an intuitive interface.

---

## Overview

GymPro is a full-stack fitness tracking application built with React, TypeScript, Vite, Tailwind CSS, and Supabase.

The application focuses on simplicity, performance, and scalability while providing everything needed to track workouts, estimate one-rep maxes, manage exercises, and analyze training progress.

---

## Features

### Workout Tracking

- Log workouts with sets, reps, and weight
- Automatic workout volume calculations
- Built-in rest timer
- Personal Record (PR) detection
- Complete workout history

### Exercise Management

- Built-in exercise library
- Custom exercise creation
- Workout templates and routines
- Search and filtering

### Progress Analytics

- Estimated One Rep Max (1RM)
- Strength progression
- Volume analytics
- Interactive charts
- Body weight tracking

### Authentication

- Email & Password authentication
- Secure user accounts
- Protected routes
- Session management

### Data Management

- Cloud synchronization
- Persistent workout history
- CSV / JSON export
- Backup and restore support

---

## Tech Stack

### Frontend

- React 19
- TypeScript
- Vite
- Tailwind CSS v4
- Motion

### UI

- Base UI
- Radix UI
- shadcn/ui
- Lucide React

### Backend

- Supabase
- PostgreSQL
- Supabase Authentication

### Visualization

- Recharts

### Drag & Drop

- dnd-kit

---

## Project Structure

This project structure reflects the current working tree, including hidden files and generated folders, excluding Git internals.

```text
full-project-structure-listing/
|-- assets/
|   `-- gym.png
|-- src/
|   |-- components/
|   |   |-- Auth/
|   |   |   |-- AuthModal.tsx
|   |   |   `-- LoginPage.tsx
|   |   |-- Dashboard/
|   |   |   `-- DashboardView.tsx
|   |   |-- Data/
|   |   |   `-- ImportExportModal.tsx
|   |   |-- Exercises/
|   |   |   `-- ExerciseLibraryView.tsx
|   |   |-- History/
|   |   |   `-- HistoryView.tsx
|   |   |-- Progress/
|   |   |   `-- ProgressView.tsx
|   |   |-- Settings/
|   |   |   `-- SettingsView.tsx
|   |   |-- ui/
|   |   |   |-- ConfirmModal.tsx
|   |   |   |-- CustomSelect.tsx
|   |   |   |-- glassmorphism-trust-hero.tsx
|   |   |   `-- select.tsx
|   |   |-- Workout/
|   |   |   |-- ExerciseSelectorModal.tsx
|   |   |   |-- StartWorkoutModal.tsx
|   |   |   |-- TemplateManagerView.tsx
|   |   |   `-- WorkoutLogger.tsx
|   |   |-- Navigation.tsx
|   |   `-- RestTimerBar.tsx
|   |-- data/
|   |   `-- defaultData.ts
|   |-- lib/
|   |   |-- calculations.ts
|   |   |-- storage.ts
|   |   |-- supabase.ts
|   |   |-- supabaseSync.ts
|   |   `-- utils.ts
|   |-- App.tsx
|   |-- index.css
|   |-- main.tsx
|   |-- types.ts
|   `-- vite-env.d.ts
|-- supabase/
|   |-- .temp/
|   |   |-- gotrue-version
|   |   |-- linked-project.json
|   |   |-- pooler-url
|   |   |-- postgres-version
|   |   |-- project-ref
|   |   |-- rest-version
|   |   |-- storage-migration
|   |   `-- storage-version
|   `-- migrations/
|       `-- 0001_initial_schema.sql
|-- .env.example
|-- .gitignore
|-- bun.lock
|-- index.html
|-- metadata.json
|-- package-lock.json
|-- package.json
|-- README.md
|-- tsconfig.json
`-- vite.config.ts
```

---

## Getting Started

### Prerequisites

- Node.js 20+
- npm

### Installation

```bash
git clone <repository-url>

cd gym-progress-tracker

npm install
```

---

## Environment Variables

Create a `.env` file in the project root.

```env
VITE_SUPABASE_URL=your_supabase_project_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
```

---

## Development

Start the development server:

```bash
npm run dev
```

Build the project:

```bash
npm run build
```

Preview the production build:

```bash
npm run preview
```

Run TypeScript checks:

```bash
npm run lint
```

---

## Database

GymPro uses **Supabase PostgreSQL** as its primary database.

Core entities include:

- Users
- Workouts
- Exercises
- Workout Templates
- Personal Records
- Body Measurements

Supabase provides:

- Authentication
- PostgreSQL Database
- Row Level Security (RLS)
- Real-time capabilities
- REST and client APIs

---

## Available Scripts

| Command           | Description                  |
| ----------------- | ---------------------------- |
| `npm run dev`     | Start the development server |
| `npm run build`   | Create a production build    |
| `npm run preview` | Preview the production build |
| `npm run lint`    | Run TypeScript type checking |

---

## Design Principles

GymPro is designed around a few core ideas:

- Minimal interface
- Fast interactions
- Responsive design
- Clean data visualization
- Long-term progress tracking
- Scalable architecture

---

## Future Improvements

- AI workout recommendations
- Progressive overload insights
- Nutrition tracking
- Calendar view
- Offline support
- Workout sharing

---

## License

This project is licensed under the MIT License.
