# Architecture Guide

## Overview

This boilerplate uses a **monolithic full-stack architecture** with clear separation between backend and frontend, connected via Inertia.js.

## Technology Stack

### Backend
- **Elysia.js** - Fast, type-safe web framework for Bun
- **SQLite** - Embedded database (via `bun:sqlite`)
- **Drizzle ORM** - Type-safe SQL query builder
- **Custom Inertia Adapter** - Bridges backend with Svelte frontend

### Frontend
- **Svelte 5** - Reactive UI framework with modern runes syntax
- **TailwindCSS 4** - Utility-first CSS framework
- **Inertia.js** - SPA-like experience without building an API

## How It Works

### Request Flow

```
User Action
    ↓
Inertia Link/Form Submit
    ↓
[Frontend] Inertia Client (Svelte)
    ↓
HTTP Request (with X-Inertia header)
    ↓
[Backend] Elysia Route Handler
    ↓
Controller → Business Logic
    ↓
[Database] Drizzle ORM → SQLite
    ↓
Controller returns data
    ↓
[Backend] Inertia Adapter
    ↓
JSON Response (if X-Inertia) or HTML (initial load)
    ↓
[Frontend] Svelte Component receives props
    ↓
UI Update without full page reload
```

### Key Components

#### 1. Custom Inertia Server Adapter

Located in [`backend/inertia/`](../backend/inertia/):

- **`index.ts`** - Elysia plugin that registers Inertia helpers
- **`response.ts`** - Core Inertia class handling request/response
- **`handler.ts`** - Request handler wrapper

**How it works:**
```typescript
// Detects Inertia requests via X-Inertia header
if (request.headers.get('X-Inertia') === 'true') {
  // Return JSON with page component and props
  return { component, props, url, version }
}
// Initial page load - render HTML
return htmlTemplate
```

#### 2. Frontend Inertia Setup

Located in [`frontend/entry/index.ts`](../frontend/entry/index.ts):

```typescript
createInertiaApp({
  resolve: (name) => import(`../pages/${name}.svelte`),
  setup({ el, App, props }) {
    mount(App, { target: el, props })
  }
})
```

**Dynamic Component Resolution:**
- Uses Vite's `import.meta.glob` for code splitting
- Components loaded on-demand
- Automatic HMR in development

#### 3. Authentication Flow

**Session-based Authentication:**

```
Login POST
    ↓
authController.login()
    ↓
1. Verify credentials
2. Generate secure token
3. Store session in database
4. Set HTTP-only cookie
    ↓
Redirect to Dashboard
```

**Session Middleware:**
- Reads `auth_token` cookie
- Validates against database
- Attaches user to request context
- Checks session expiration

#### 4. Database Layer

**Using Drizzle ORM:**

```typescript
// Schema definition
export const users = sqliteTable('users', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  name: text('name').notNull(),
  email: text('email').notNull().unique()
})

// Query
const user = await db.query.users.findFirst({
  where: eq(users.email, 'user@example.com')
})
```

**Why Drizzle?**
- Type-safe queries
- Minimal runtime overhead
- Works with `bun:sqlite` (3-6x faster than better-sqlite3)
- Schema-based migrations

## Directory Structure Deep Dive

### Backend Structure

```
backend/
├── index.ts              # Entry point - starts server
├── app.ts                # App configuration + plugins
├── views/
│   └── app.html          # Root HTML template for Inertia
├── inertia/              # Custom Inertia.js server adapter
├── routes/
│   ├── index.ts          # Route aggregator
│   └── web/              # Web routes
│       ├── public.ts     # Public routes (no auth required)
│       └── auth.ts       # Auth routes (require authentication)
├── controllers/          # Business logic layer
│   ├── auth.controller.ts
│   ├── home.controller.ts
│   └── user.controller.ts
├── services/             # Reusable services
│   ├── inertia.service.ts  # Inertia rendering
│   └── eta.service.ts      # Eta template rendering
├── middleware/           # Request processing
│   └── auth.ts           # Authentication middleware
├── database/
│   ├── index.ts          # Database connection
│   ├── schema/           # Drizzle schema definitions
│   ├── migrations/       # SQL migration files
│   └── migrate.ts        # Migration runner
├── utils/                # Helper functions
│   ├── hash.ts           # Password hashing
│   └── token.ts          # Token generation
└── types/                # TypeScript type definitions
```

**Design Philosophy:**
- **Routes** - Thin: Define endpoints, apply middleware, call controllers
- **Middleware** - Cross-cutting concerns (auth, logging) applied via `.derive()`
- **Controllers** - Business logic, receive user from middleware
- **Services** - Reusable rendering logic (Inertia, Eta)
- **Utils** - Pure functions, reusable logic

### Frontend Structure

```
frontend/
├── entry/
│   └── index.ts          # Inertia app initialization
├── pages/                # Svelte page components
│   ├── Home.svelte
│   ├── Login.svelte
│   ├── Dashboard.svelte
│   └── Users/
│       ├── Index.svelte
│       ├── Create.svelte
│       ├── Edit.svelte
│       └── Show.svelte
├── components/           # Reusable UI components
│   ├── Layout.svelte     # Root layout wrapper
│   ├── NavLink.svelte   # Navigation link with active state
│   └── TextInput.svelte  # Form input with error display
└── styles/
    └── app.css           # TailwindCSS imports
```

**Component Patterns:**

**1. Page Components**
- Receive props from backend
- Use Inertia forms for submissions
- Navigate with `<Link>` component

**2. Layout Components**
- Wrap page content
- Provide navigation, footer, etc.
- Access shared props (auth user)

**3. UI Components**
- Reusable form inputs
- Presentational components
- No business logic

## Data Flow Examples

### 1. Navigation (Client-side)

```typescript
// User clicks <Link href="/about" />
[Frontend] Inertia intercepts click
    ↓
[Frontend] Sends XHR with X-Inertia: true header
    ↓
[Backend] Route handler returns { component: 'About', props: {} }
    ↓
[Frontend] Inertia receives JSON
    ↓
[Frontend] Svelte component swapped without full reload
```

### 2. Form Submission

```typescript
// User submits login form
[Frontend] useForm() creates Inertia form
    ↓
[Frontend] POST /login with X-Inertia: true
    ↓
[Backend] authController.login()
    ↓
[Backend] Validates credentials
    ↓
[Backend] Creates session, sets cookie
    ↓
[Backend] Returns redirect response
    ↓
[Frontend] Inertia handles redirect
    ↓
[Frontend] Navigates to new page
```

### 3. Protected Route

```typescript
// User visits /dashboard
[Backend] middleware/auth.ts
    ↓
[Backend] Reads auth_token cookie
    ↓
[Backend] Validates session in database
    ↓
[Backend] Attaches user to request context
    ↓
[Backend] Renders Dashboard component with { auth: { user } }
```

## Security Features

### 1. Session-based Authentication
- HTTP-only cookies prevent XSS
- Secure random tokens (crypto.randomBytes)
- Session expiration (30 days)
- Database-backed sessions (can revoke)

### 2. Password Hashing
- Uses Bun's built-in `passwordHash`
- Automatically uses best algorithm (argon2/bcrypt)
- No need for external libraries

### 3. CSRF Protection
- Session tokens prevent CSRF
- All state-changing operations require valid session

### 4. Input Validation
- TypeBox schemas for validation
- Type-safe request bodies
- Error handling on invalid input

## Performance Optimizations

### 1. Code Splitting
- Frontend components loaded on-demand
- Vite automatic chunking
- Faster initial load

### 2. Database
- Prepared statements via Drizzle
- Indexes on frequently queried columns
- Connection pooling (single connection)

### 3. Development
- Bun's `--watch` for instant backend reload
- Vite HMR for instant frontend updates
- Concurrent dev servers

## Extension Points

### Adding New Features

1. **New Route Group:**
   ```bash
   backend/routes/web/
   ├── products/        # Create new folder
   │   ├── index.ts
   │   └── [id].ts
   ```

2. **New Service:**
   ```bash
   backend/services/
   ├── email.service.ts     # Email sending
   ├── payment.service.ts   # Payment processing
   └── upload.service.ts    # File uploads
   ```

3. **New Middleware:**
   ```typescript
   backend/middleware/
   ├── logger.ts      # Request logging
   ├── cors.ts        # CORS handling
   └── rate-limit.ts  # Rate limiting
   ```

### Custom Inertia Extensions

The custom adapter can be extended:

```typescript
// backend/inertia/index.ts
export const inertia = (config: InertiaConfig) => {
  return new Elysia({ name: 'inertia' })
    .derive(({ request, set }) => ({
      render: (page, props) => inertiaHandler(request, set, config, page, props),
      // Add custom helpers
      back: () => set.headers['X-Inertia-Back'] = 'true',
      // Add shared props dynamically
      share: (key, value) => { /* ... */ }
    }))
}
```

## Testing Strategy

### Unit Tests
- Test controllers without HTTP layer
- Test utility functions
- Test validators

### Integration Tests
- Test full request/response cycle
- Test authentication flow
- Test CRUD operations

### Frontend Tests
- Test Svelte components
- Test form submissions
- Test navigation

## Deployment Considerations

### Production Build
```bash
bun run build
# - Frontend: Vite builds to public/build
# - Backend: Bundled to dist/
```

### Environment Variables
Required in production:
- `APP_KEY` - Should be random 32-char string
- `DB_PATH` - Absolute path to database
- `PORT` - Server port
- `APP_ENV=production`

### Database
- SQLite file should be on persistent storage
- Regular backups recommended
- Migration run on deploy

## Common Patterns

### Pattern 1: CRUD Resource

```typescript
// 1. Define schema (backend/database/schema/)
// 2. Generate migration (bun run db:generate)
// 3. Run migration (bun run db:migrate)
// 4. Create controller (backend/controllers/)
// 5. Create routes (backend/routes/web/auth.ts for protected routes)
// 6. Create pages (frontend/pages/)
```

### Pattern 2: Protected Route with Middleware

```typescript
// backend/routes/web/auth.ts
.group('/users', (app) => app
  .derive(async ({ cookie }) => {
    const user = await authMiddleware(cookie)
    if (!user) throw new Error('Unauthorized')
    return { user }
  })
  .get('/', async ({ user, request, set }: any) =>
    userController.index(user, request, set)
  )
)
```

### Pattern 3: Public Route

```typescript
// backend/routes/web/public.ts
.get('/home', async ({ cookie, request, set }: any) =>
  homeController.index(cookie, request, set)
)
```

### Pattern 4: Controller with Optional Auth

```typescript
// backend/controllers/home.controller.ts
async index(cookie: any, request: Request, set: any) {
  const user = await authMiddleware(cookie)  // Can be null
  return inertia.render(request, set, 'Home', {
    auth: { user }
  })
}

async dashboard(user: any, request: Request, set: any) {
  // User passed from middleware, guaranteed not null
  return inertia.render(request, set, 'Dashboard', {
    auth: { user }
  })
}
```

### Pattern 5: Form Validation

```typescript
// 1. Define validator (backend/validators/)
export const schema = Type.Object({
  name: Type.String({ minLength: 2 }),
  email: Type.String({ format: 'email' })
})

// 2. Use in route (backend/routes/web/)
.post('/users', async ({ body }) => {
  const validated = validate(schema, body)
  // ...
})

// 3. Display errors in Svelte
{#if form.errors.email}
  <p class="text-red-600">{form.errors.email}</p>
{/if}
```

## Troubleshooting Architecture Issues

### Problem: Page not found
- Check route is registered in `backend/routes/index.ts`
- Check page component exists in `frontend/pages/`
- Check component name matches (case-sensitive)

### Problem: Props not received
- Check controller returns correct data
- Check Inertia response format
- Check page component accepts props

### Problem: Auth not working
- Check cookie is being set (browser dev tools)
- Check session in database
- Check middleware is applied to route

### Problem: Database locked
- Only one process should access SQLite
- Close Drizzle Studio before running app
- Check for long-running transactions

## Best Practices

1. **Keep Routes Thin** - Delegate to controllers
2. **Validate Input** - Always validate user input
3. **Use Types** - Leverage TypeScript for type safety
4. **Handle Errors** - Use try/catch, return proper error responses
5. **Organize by Feature** - Group related routes/controllers
6. **Document Code** - JSDoc for complex functions
7. **Test Critical Paths** - Auth, CRUD, edge cases
8. **Use Environment Variables** - Never hardcode secrets

## Resources

- [Elysia.js Docs](https://elysiajs.com/)
- [Inertia.js Docs](https://inertiajs.com/)
- [Svelte Docs](https://svelte.dev/docs)
- [Drizzle ORM Docs](https://orm.drizzle.team/)
- [Bun Docs](https://bun.sh/docs)
