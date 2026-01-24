# Frequently Asked Questions

## General Questions

### Why this stack?

**Elysia.js** - 16x faster than Express, great TypeScript support
**Inertia.js** - SPA experience without building an API
**Svelte 5** - Less boilerplate, better performance than React
**SQLite** - Zero configuration, perfect for small-medium apps
**Bun** - Ultra-fast runtime, all-in-one tool

### Who is this for?

- Developers who want full-stack TypeScript
- Teams who want simple deployment (no separate frontend/backend)
- Projects that don't need microservices complexity
- Anyone who wants modern, fast development experience

### When should I NOT use this?

- Need complex real-time features (use WebSocket instead)
- Building microservices architecture
- Team is more comfortable with traditional REST APIs
- Need very high write concurrency (SQLite limitations)

## Installation & Setup

### Bun isn't working?

```bash
# Try reinstalling
curl -fsSL https://bun.sh/install | bash

# Or use npm (slower)
npm install -g bun
```

### Port already in use?

```bash
# Change in .env
PORT=3001

# Or kill process using port
lsof -ti:3000 | xargs kill -9  # Mac/Linux
```

### Database migration errors?

```bash
# Delete database and start fresh
rm database.sqlite
bun run db:migrate

# Or check migration file
cat backend/database/migrations/0000_*.sql
```

### HMR not working?

```bash
# Clear Vite cache
rm -rf node_modules/.vite

# Restart dev server
bun run dev
```

## Development

### How do I add environment variables?

1. Add to `.env` file:
```bash
MY_VAR=value
```

2. Use in code:
```typescript
const myVar = process.env.MY_VAR
```

3. Add to `.env.example` for others

### How do I debug?

**Backend:**
```typescript
console.log('User:', user)
// Or use debugger
debugger
```

**Frontend:**
```svelte
<script lang="ts">
  console.log('Props:', $props)
</script>
```

**Or use VS Code debugger:**
- Set breakpoints in code
- Press F5 to start debugging

### How do I use absolute imports?

```typescript
// Already configured!
import { db } from '@/database'  // Works
import { Button } from '@components/Button.svelte'
```

### Where do I put static files?

Put images, fonts, etc. in `public/`:

```
public/
├── images/
│   └── logo.png
└── fonts/
    └── custom.woff
```

Access via:
```html
<img src="/images/logo.png" />
```

## Backend

### How do I add a new route?

Create `backend/routes/web/myroute.ts`:

```typescript
import { Elysia } from 'elysia'

export const myRoutes = new Elysia()
  .get('/my-page', ({ render }) => {
    return render('MyPage', { title: 'My Page' })
  })
```

Register in `backend/routes/index.ts`:

```typescript
import { myRoutes } from './web/myroute'

export const routes = new Elysia()
  .use(myRoutes)
```

### How do I add middleware?

Create `backend/middleware/myMiddleware.ts`:

```typescript
export const myMiddleware = async ({ request, set }) => {
  // Do something before request
  console.log('Request:', request.url)

  // Or modify response
  set.headers['X-Custom'] = 'value'
}
```

Use in route:

```typescript
.use(myMiddleware)
.get('/protected', ({ render }) => {
  // ...
})
```

### How do I handle errors?

```typescript
// In route
.get('/users', async ({ render, set }) => {
  try {
    const users = await userController.index()
    return render('Users/Index', { users })
  } catch (error) {
    set.status = 500
    return render('Errors/500', { error: error.message })
  }
})
```

Or globally in `backend/app.ts`:

```typescript
.onError(({ code, error, set }) => {
  if (code === 'INTERNAL_SERVER_ERROR') {
    set.status = 500
    return { error: error.message }
  }
})
```

### How do I add validation?

```typescript
// backend/validators/user.validator.ts
import { Type } from '@sinclair/typebox'

export const createUserSchema = Type.Object({
  name: Type.String({ minLength: 2, maxLength: 100 }),
  email: Type.String({ format: 'email' }),
  age: Type.Integer({ minimum: 18 })
})

// In route
.post('/users', async ({ body, set }) => {
  const validated = validate(createUserSchema, body)
  if (validated.errors) {
    set.status = 422
    return { errors: validated.errors }
  }
  // ...
})
```

### How do I use sessions?

```typescript
import { getSessionUser } from '../middleware/auth'

// Get current user
const user = await getSessionUser(auth_token?.value)

// Check if authenticated
if (!user) {
  return Response.redirect('/login', 303)
}

// User object
console.log(user.id, user.name, user.email)
```

## Frontend

### How do I create a reusable component?

`frontend/components/Card.svelte`:

```svelte
<script lang="ts">
  interface Props {
    title: string
    variant?: 'primary' | 'secondary'
  }

  export let title: Props['title']
  export let variant: Props['variant'] = 'primary'

  const classes = {
    primary: 'bg-blue-500 text-white',
    secondary: 'bg-gray-200 text-gray-800'
  }
</script>

<div class="p-4 rounded {classes[variant]}">
  <h2 class="text-xl font-bold">{title}</h2>
  <slot />
</div>
```

Usage:

```svelte
<Card title="Hello" variant="primary">
  <p>Content here</p>
</Card>
```

### How do I handle forms?

```svelte
<script lang="ts">
  import { useForm } from '@inertiajs/svelte'

  const form = useForm({
    name: '',
    email: ''
  })

  function submit() {
    form.post('/users')
  }
</script>

<form on:submit|preventDefault={submit}>
  <input type="text" bind:value={form.name} />
  {#if form.errors.name}
    <p class="error">{form.errors.name}</p>
  {/if}

  <input type="email" bind:value={form.email} />

  <button disabled={form.processing}>
    {form.processing ? 'Saving...' : 'Save'}
  </button>
</form>
```

### How do I navigate programmatically?

```svelte
<script lang="ts">
  import { router } from '@inertiajs/svelte'

  function goBack() {
    router.visit('/previous')
  }

  function goHome() {
    router.get('/')
  }

  function reload() {
    router.reload()
  }
</script>
```

### How do I show loading states?

```svelte
<script lang="ts">
  import { useForm } from '@inertiajs/svelte'

  const form = useForm({ /* ... */ })
</script>

{#if form.processing}
  <div class="spinner">Loading...</div>
{/if}

<button disabled={form.processing}>
  Submit
</button>
```

### How do I access shared props?

```svelte
<script lang="ts">
  // Auth user is passed to all pages
  export let auth: { user: any }

  $: isLoggedIn = !!auth?.user
</script>

{#if isLoggedIn}
  <p>Welcome, {auth.user.name}!</p>
{/if}
```

## Database

### How do I query with Drizzle?

```typescript
import { users } from '../database/schema'
import { db } from '../database'
import { eq, and, or } from 'drizzle-orm'

// Find all
const allUsers = await db.query.users.findMany()

// Find one
const user = await db.query.users.findFirst({
  where: eq(users.email, 'user@example.com')
})

// Find with relations
const userWithPosts = await db.query.users.findFirst({
  where: eq(users.id, 1),
  with: {
    posts: true
  }
})

// Complex conditions
const result = await db.query.users.findMany({
  where: or(
    eq(users.role, 'admin'),
    and(eq(users.role, 'user'), eq(users.active, true))
  )
})

// Pagination
const users = await db.query.users.findMany({
  limit: 10,
  offset: 20
})

// Ordering
const users = await db.query.users.findMany({
  orderBy: [desc(users.createdAt)]
})
```

### How do I create a migration?

1. Define schema in `backend/database/schema/`
2. Run: `bun run db:generate`
3. Review generated SQL in `backend/database/migrations/`
4. Run: `bun run db:migrate`

### How do I rollback a migration?

Currently, manual rollback:

```bash
# Open migration file
cat backend/database/migrations/0000_*.sql

# Create reverse SQL manually
# Then run via CLI
sqlite3 database.sqlite
DROP TABLE IF EXISTS users;
```

### How do I seed the database?

Create `backend/database/seed.ts`:

```typescript
import { db } from './index'
import { users } from './schema'

async function seed() {
  await db.insert(users).values([
    {
      name: 'Admin',
      email: 'admin@example.com',
      password: await hashPassword('password')
    }
  ])
}

seed()
```

Run: `bun run backend/database/seed.ts`

### How do I view database data?

```bash
# Using Drizzle Studio
bun run db:studio

# Or using SQLite CLI
sqlite3 database.sqlite
.tables
SELECT * FROM users;
```

## Authentication

### How does authentication work?

1. User submits login form
2. Backend validates credentials
3. Backend creates session in database
4. Backend sets HTTP-only cookie
5. Subsequent requests include cookie
6. Backend validates session and attaches user to request

### How do I logout?

```svelte
<script lang="ts">
  import { router } from '@inertiajs/svelte'

  function logout() {
    router.post('/logout')
  }
</script>

<form method="POST" action="/logout">
  <button type="submit">Logout</button>
</form>
```

### How do I implement remember me?

Extend sessions table:

```typescript
export const sessions = sqliteTable('sessions', {
  // ...
  rememberMe: integer('remember_me', { mode: 'boolean' })
})
```

Set longer expiration for remember me:

```typescript
const expiresAt = new Date()
expiresAt.setDate(expiresAt.getDate() + rememberMe ? 30 : 1)
```

### How do I implement roles/permissions?

Add roles to users table:

```typescript
export const users = sqliteTable('users', {
  // ...
  role: text('role', { enum: ['admin', 'user'] }).notNull()
})
```

Check in middleware:

```typescript
if (user.role !== 'admin') {
  return Response.redirect('/', 403)
}
```

## Deployment

### How do I deploy?

1. **Build for production:**
```bash
bun run build
```

2. **Set environment:**
```bash
export APP_ENV=production
export APP_DEBUG=false
```

3. **Run:**
```bash
bun run dist/index.js
```

### How do I use PM2?

```bash
# Install PM2
npm install -g pm2

# Start
pm2 start dist/index.js --name elysia-app

# View logs
pm2 logs elysia-app

# Restart
pm2 restart elysia-app
```

### How do I deploy to Vercel/Railway?

**Vercel (frontend only):**
```bash
bun run build:frontend
vercel
```

**Railway (full stack):**
1. Connect GitHub repo
2. Set root directory to `.`
3. Build command: `bun run build`
4. Start command: `bun run dist/index.js`

### How do I handle database in production?

- Use absolute path: `DB_PATH=/var/www/database.sqlite`
- Set proper permissions: `chmod 600 database.sqlite`
- Regular backups: `cp database.sqlite backup.sqlite`
- Consider PostgreSQL for high-traffic sites

## Troubleshooting

### Page not found (404)

- Check route is registered
- Check page component exists
- Check component name matches (case-sensitive)

### Props not received

- Check backend returns data
- Check Inertia response format
- Check component accepts props

### Authentication not working

- Check cookie is set (browser DevTools)
- Check session in database
- Check middleware is applied

### CSS not loading

- Check TailwindCSS content paths
- Check `@vite` directive in `app.html`
- Run `bun run build:frontend` and rebuild

### TypeScript errors

- Run `bun install` to ensure types installed
- Restart TS server in VS Code
- Check `tsconfig.json` paths

### Hot reload not working

- Clear cache: `rm -rf node_modules/.vite`
- Restart dev server
- Check file watcher limits

## Performance

### How do I optimize database queries?

```typescript
// Select only needed columns
const users = await db.query.users.findMany({
  columns: {
    id: true,
    name: true,
    // Don't select password!
  }
})

// Use indexes
CREATE INDEX idx_users_email ON users(email);

// Use pagination
.limit(20)
.offset(page * 20)
```

### How do I implement caching?

```typescript
// Simple in-memory cache
const cache = new Map()

async function getUsers() {
  if (cache.has('users')) {
    return cache.get('users')
  }

  const users = await db.query.users.findMany()
  cache.set('users', users)
  return users
}
```

### How do I lazy load components?

```svelte
<script lang="ts">
  import { onMount } from 'svelte'

  let HeavyComponent = $state(null)

  onMount(async () => {
    // Load on demand
    const module = await import('./HeavyComponent.svelte')
    HeavyComponent = module.default
  })
</script>

{#if HeavyComponent}
  <svelte:component this={HeavyComponent} />
{/if}
```

## Additional Resources

- [ARCHITECTURE.md](ARCHITECTURE.md) - Deep dive into architecture
- [GETTING_STARTED.md](GETTING_STARTED.md) - Setup guide
- [CONTRIBUTING.md](CONTRIBUTING.md) - Contribution guidelines
- [README.md](README.md) - Project overview
- [Elysia Docs](https://elysiajs.com/)
- [Inertia Docs](https://inertiajs.com/)
- [Svelte Docs](https://svelte.dev/docs)
- [Drizzle Docs](https://orm.drizzle.team/)

Still have questions? [Open an issue](https://github.com/your-repo/issues/new)!
