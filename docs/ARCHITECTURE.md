# EIS Framework Architecture

## Overview

EIS (Elysia Inertia Svelte) is a full-stack framework that combines:
- **Elysia** - Fast backend server (Bun runtime)
- **Inertia.js** - SPA-like experience without building an API
- **Svelte 5** - Modern reactive frontend with runes
- **Drizzle ORM** - Type-safe database queries
- **Bun** - JavaScript runtime for backend

## Project Structure

```
laju-elysia/
├── backend/                 # Backend (Elysia + Drizzle)
│   ├── app.ts             # Main Elysia application
│   ├── controllers/       # Route handlers
│   │   ├── auth.controller.ts
│   │   ├── dashboard.controller.ts
│   │   ├── google-auth.controller.ts
│   │   ├── public.controller.ts
│   │   ├── upload.controller.ts
│   │   └── users.controller.ts
│   ├── database/          # Database layer
│   │   ├── index.ts      # DB connection
│   │   ├── schema/       # Drizzle schemas
│   │   └── migrations/    # Database migrations
│   ├── inertia/          # Inertia.js integration
│   ├── routes/           # Route definitions
│   │   ├── index.ts      # Route composer
│   │   └── web/          # Web routes
│   │       ├── auth.ts   # Authenticated routes
│   │       └── public.ts # Public routes
│   └── services/         # Business logic
│       ├── auth.service.ts
│       ├── eta.service.ts
│       ├── flash.service.ts
│       ├── google-oauth.service.ts
│       ├── inertia.service.ts
│       ├── resend.service.ts
│       ├── s3.service.ts
│       ├── smtp.service.ts
│       └── storage.service.ts
├── frontend/              # Frontend (Svelte + Inertia)
│   ├── components/       # Reusable components
│   │   ├── DashboardLayout.svelte
│   │   └── NavLink.svelte
│   ├── entry/            # Entry points
│   │   ├── app.ts
│   │   ├── index.ts
│   │   └── style.css
│   └── pages/            # Inertia pages
│       ├── auth/         # Auth pages
│       ├── errors/       # Error pages
│       ├── users/        # User management
│       ├── about.svelte
│       ├── dashboard.svelte
│       ├── home.svelte
│       └── profile.svelte
├── public/               # Static files
├── storage/              # Local file storage
├── tests/                # Test files
│   ├── backend/          # Backend tests
│   ├── frontend/         # Frontend tests
│   ├── integration/      # Integration tests
│   └── unit/             # Unit tests
├── types/                # TypeScript types
│   ├── controller.types.ts
│   └── inertia.d.ts
├── skills/               # Skill guides
│   ├── create-controller.md
│   ├── create-svelte-inertia-page.md
│   └── eta-template-engine-ssr.md
├── workflow/             # Workflow documentation
│   ├── INIT_AGENT.md
│   ├── MANAGER_AGENT.md
│   ├── TASK_AGENT.md
│   ├── PRD.md
│   ├── TDD.md
│   └── PROGRESS.md
├── docs/                 # Documentation
│   ├── ARCHITECTURE.md
│   ├── CHANGELOG.md
│   ├── CONTRIBUTING.md
│   ├── DATABASE.md
│   ├── FAQ.md
│   ├── GETTING_STARTED.md
│   ├── QUICK_REFERENCE.md
│   ├── SSR_WITH_ETA.md
│   └── TESTING.md
├── .env.example          # Environment variables template
├── .env.production       # Production environment
├── .env.test             # Test environment
├── bun.lock              # Dependency lock file
├── drizzle.config.ts     # Drizzle configuration
├── package.json          # Dependencies & scripts
├── svelte.config.js      # Svelte configuration
├── tsconfig.json         # TypeScript configuration
├── vite.config.ts        # Vite configuration
└── vitest.config.ts      # Vitest configuration
```

## Data Flow

### Request Flow

```
User Browser
    ↓
Inertia.js Request (with data)
    ↓
Elysia Server (backend/app.ts)
    ↓
Route Handler (backend/routes/web/)
    ↓
Controller Method (backend/controllers/)
    ↓
Service Layer (backend/services/)
    ↓
Database Query (Drizzle ORM)
    ↓
Inertia Response (with props)
    ↓
Svelte Page (frontend/pages/)
    ↓
Rendered HTML
```

### Authentication Flow

```
User Login
    ↓
authController.login()
    ↓
authService.authenticate()
    ↓
Set auth_token cookie
    ↓
Inertia redirect to dashboard
    ↓
authService.getSessionUser() (middleware)
    ↓
Pass user to controller
    ↓
Render page with auth data
```

## Key Components

### Backend (Elysia)

**Main Application** (`backend/app.ts`):
- Static file serving
- Cookie handling
- Inertia.js integration
- Server configuration (port 3000)

**Controllers** (`backend/controllers/`):
- Handle HTTP requests
- Call services for business logic
- Return Inertia responses or JSON
- Use flash messages for errors/success

**Services** (`backend/services/`):
- Business logic layer
- Database operations
- External API integrations (OAuth, email, storage)
- Session management

**Routes** (`backend/routes/web/`):
- Group routes by domain (auth, public)
- Apply middleware (authentication)
- Map to controller methods

### Frontend (Svelte + Inertia)

**Pages** (`frontend/pages/`):
- Receive props from backend
- Use Svelte 5 runes (`$state`, `$props`)
- Handle form submissions with Inertia router
- Display data and handle user interactions

**Components** (`frontend/components/`):
- Reusable UI components
- Layouts (DashboardLayout)
- Navigation (NavLink)

## Database Layer (Drizzle ORM)

**Schema** (`backend/database/schema/`):
- Type-safe table definitions
- Relationships and constraints
- Default values (timestamps, IDs)

**Migrations** (`backend/database/migrations/`):
- Version-controlled schema changes
- Run with `bun run db:migrate`
- Generate with `bun run db:generate`

**Queries**:
```typescript
// Find many
const posts = await db.query.posts.findMany({
  with: { user: true },
  orderBy: (posts, { desc }) => [desc(posts.createdAt)]
})

// Find one
const post = await db.query.posts.findFirst({
  where: eq(posts.id, id)
})

// Insert
await db.insert(posts).values({ title, content })

// Update
await db.update(posts).set({ title }).where(eq(posts.id, id))

// Delete
await db.delete(posts).where(eq(posts.id, id))
```

## Inertia.js Integration

**Backend** (`backend/inertia/`):
- Handle Inertia requests
- Pass props to pages
- Handle partial reloads

**Frontend**:
- Use `@inertiajs/svelte` for navigation
- `router.get()`, `router.post()`, `router.put()`, `router.delete()`
- `use:inertia` directive on links
- Access props via `$props()`

## Built-in Services

### Authentication (`auth.service.ts`)
- Session management
- User authentication
- Password hashing/verification
- Token generation/validation

### Inertia (`inertia.service.ts`)
- Inertia response handling
- Page rendering
- Props sharing

### Flash (`flash.service.ts`)
- Flash message management
- Error/success notifications

### Email (`resend.service.ts`, `smtp.service.ts`)
- Email sending (Resend API or SMTP)
- Template rendering

### Storage (`storage.service.ts`, `s3.service.ts`)
- Local file storage
- S3-compatible storage
- File upload/download

### OAuth (`google-oauth.service.ts`)
- Google OAuth integration
- Token exchange
- User profile fetching

## Tech Stack

| Layer | Technology | Version |
|-------|-----------|---------|
| Runtime | Bun | Latest |
| Backend | Elysia | v1.4.22 |
| Frontend | Svelte | v5.0.0 |
| Styling | Tailwind CSS | v4.1.18 |
| SPA | Inertia.js | v2.3.11 |
| Build Tool | Vite | v5 |
| Database | SQLite (better-sqlite3) | v12.6.2 |
| ORM | Drizzle ORM | v0.45.1 |
| Testing | Vitest | Latest |
| Icons | Lucide Icons | Latest |

## Security

### Authentication
- Cookie-based sessions (httpOnly)
- JWT tokens for API access
- Password hashing with Bun APIs

### Authorization
- Middleware-based route protection
- User roles and permissions
- Session validation

### Data Protection
- SQL injection prevention (Drizzle ORM)
- XSS protection (Svelte)
- CSRF protection (Inertia.js)

## Performance

### Optimization
- Static file caching
- Database query optimization
- Lazy loading components
- Code splitting (Vite)

### Monitoring
- Request logging
- Error tracking
- Performance metrics

## Deployment

### Development
```bash
bun run dev          # Start dev server (port 3000)
bun run test:run     # Run tests
bun run db:migrate   # Run migrations
```

### Production
- Build with Vite
- Deploy to Vercel/Netlify
- Environment variables in `.env.production`
- Database migrations before deploy

## Extending the Framework

### Adding New Features
1. Create controller in `backend/controllers/`
2. Add routes in `backend/routes/web/`
3. Create pages in `frontend/pages/`
4. Update database schema if needed
5. Run migrations
6. Add tests

### Using Built-in Services
- Import from `backend/services/`
- Follow existing patterns
- Check `skills/` for guides

## Best Practices

1. **Use built-in services** before creating new ones
2. **Follow naming conventions** (camelCase for imports)
3. **Validate input** in controllers before processing
4. **Use flash messages** for user feedback
5. **Test thoroughly** before committing
6. **Keep documentation updated**
7. **Use Svelte 5 runes** for reactivity
8. **Prefer Lucide Icons** over other icon libraries