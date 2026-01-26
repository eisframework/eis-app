# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

EIS (Elysia Inertia Svelte) is a full-stack framework combining:
- **Elysia** (Bun-based backend server)
- **Inertia.js** (SPA without API separation)
- **Svelte 5** (reactive frontend)

## Common Commands

```bash
# Development (starts both backend on port 3000 and frontend with hot reload)
bun run dev

# Build
bun run build                # Build frontend for production
bun run build:frontend       # Same as build

# Testing
bun run test                 # Run tests (watch mode)
bun run test:run             # Run tests once
bun run test:ui              # Run tests with Vitest UI
bun run test:coverage        # Generate coverage report
bun run test path/to/test    # Run specific test file

# Database
bun run db:generate          # Generate migrations from schema changes
bun run db:migrate           # Run pending migrations
bun run db:studio            # Open Drizzle Studio (database GUI)

# Type checking
bun run typecheck            # Svelte type checking
```

## Architecture

### Request Flow

1. **Route** (`backend/routes/web/*.ts`) → **Controller** (`backend/controllers/*.ts`) → **Service** (`backend/services/*.ts`)
2. Controllers use `ctx.inertia()` to render Svelte pages located in `frontend/pages/`
3. Pages receive data via `$props()` - these are the props passed from the controller's `ctx.inertia()` call

### Controller Pattern

Controllers receive a `ControllerContext` (defined in `types/controller.types.ts`):

```typescript
export interface ControllerContext {
  user?: AuthUser
  body?: unknown
  query?: Record<string, string>
  params?: Record<string, string>
  headers: Record<string, string | undefined>
  set: ResponseSet
  cookie?: AppCookieStore
  inertia: InertiaHandler  // Call this to render Inertia pages
  request: Request
}
```

To render a page: `return ctx.inertia('page/path', { prop1, prop2 })`

The page path maps to `frontend/pages/page/path.svelte`.

### Adding New Features

1. **Create Svelte page** in `frontend/pages/`
2. **Create controller** in `backend/controllers/*.controller.ts`
3. **Register route** in appropriate `backend/routes/web/*.ts` file

### Services Architecture

- `auth.service.ts` - Authentication, sessions, password reset
- `storage.service.ts` / `s3.service.ts` - File uploads (switch via import)
- `resend.service.ts` / `smtp.service.ts` - Email (switch via import)
- `inertia.service.ts` - Inertia.js integration
- `flash.service.ts` - Flash messages

Switching email/storage providers is done by changing the import - both have identical APIs.

### Frontend Patterns

- Pages use Svelte 5 `$props()` to receive controller data
- Use `import { page } from '@inertiajs/svelte'` for Inertia navigation
- `Layout.svelte` wraps all pages
- Dark mode is built-in with system preference detection

### Database

- **SQLite** with **Drizzle ORM**
- Schemas in `backend/database/schema/`
- Migrations in `backend/database/migrations/`
- After schema changes, run `bun run db:generate` then `bun run db:migrate`

### Key Configuration Files

- `drizzle.config.ts` - Database configuration
- `vite.config.ts` - Frontend build with TailwindCSS v4
- `tsconfig.json` - TypeScript with path aliases
