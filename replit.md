# SOC Dashboard Application

## Overview

This is a Security Operations Center (SOC) dashboard application for managing security alerts, incidents, and investigations. The platform provides real-time metrics tracking (MTTD/MTTR), alert triage workflows, and incident investigation capabilities. Built as a full-stack TypeScript application with a React frontend and Express backend.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture
- **Framework**: React 18 with TypeScript
- **Routing**: Wouter (lightweight router)
- **State Management**: TanStack React Query for server state
- **Styling**: Tailwind CSS with shadcn/ui component library (New York style)
- **Charts**: Recharts for data visualization
- **Animations**: Framer Motion for transitions
- **Build Tool**: Vite with hot module replacement

The frontend follows a page-based structure in `client/src/pages/` with shared components in `client/src/components/`. Custom hooks in `client/src/hooks/` handle data fetching and mutations. Path aliases are configured: `@/` maps to `client/src/`, `@shared/` maps to `shared/`.

### Backend Architecture
- **Framework**: Express 5 on Node.js
- **API Design**: RESTful endpoints defined in `shared/routes.ts` with Zod schema validation
- **Database ORM**: Drizzle ORM with PostgreSQL
- **Development**: tsx for TypeScript execution, Vite middleware for HMR

Routes are registered in `server/routes.ts` and storage operations are abstracted through `server/storage.ts`. The API follows a typed contract pattern where route definitions in `shared/routes.ts` include request/response schemas validated by Zod.

### Data Layer
- **Database**: PostgreSQL (configured via DATABASE_URL environment variable)
- **Schema**: Defined in `shared/schema.ts` using Drizzle's pgTable
- **Migrations**: Managed via drizzle-kit with `npm run db:push`
- **Validation**: drizzle-zod generates Zod schemas from database tables

Core entities:
- `users` - SOC analysts and managers
- `alerts` - Security alerts with severity, status, and disposition
- `incidents` - Security incidents with lifecycle timestamps for metrics

### Authentication
- Simple client-side authentication with localStorage persistence
- Protected routes redirect unauthenticated users to login
- Default credentials: admin/admin (for development)

### Build System
- Development: `npm run dev` runs tsx with Vite middleware
- Production: `npm run build` uses esbuild for server bundling and Vite for client
- Output: Server bundle to `dist/index.cjs`, client assets to `dist/public/`

## External Dependencies

### Database
- PostgreSQL via `DATABASE_URL` environment variable
- Connection pool managed through node-postgres (`pg`)
- Session storage available via connect-pg-simple

### UI Framework
- shadcn/ui components configured in `components.json`
- Radix UI primitives for accessible components
- Tailwind CSS with custom theme variables in `client/src/index.css`

### Key Runtime Dependencies
- `drizzle-orm` + `drizzle-zod` - Database operations and validation
- `@tanstack/react-query` - Data fetching and caching
- `recharts` - Dashboard charts and metrics visualization
- `framer-motion` - Page transitions and animations
- `date-fns` - Date formatting and manipulation
- `zod` - Runtime type validation for API contracts