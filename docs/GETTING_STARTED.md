# Getting Started Guide

Welcome! This guide will walk you through setting up and using the Elysia + Inertia + Svelte boilerplate.

## Prerequisites

Before you begin, ensure you have:

- **Bun** v1.0.0 or higher - [Install Bun](https://bun.sh/docs/installation)
- Basic knowledge of TypeScript
- Familiarity with Svelte (optional but helpful)
- Code editor (VS Code recommended)

## Installation

### 1. Clone or Create Project

```bash
# If cloning from repository
git clone <your-repo-url>
cd learn-elysia

# OR starting fresh
bun create elysia learn-elysia
cd learn-elysia
```

### 2. Install Dependencies

```bash
bun install
```

This installs:
- Backend: Elysia.js, Drizzle ORM, TypeBox
- Frontend: Svelte 5, Inertia.js, TailwindCSS
- Dev tools: Vite, TypeScript, ESLint

### 3. Environment Setup

Copy the example environment file:

```bash
cp .env.example .env
```

Edit `.env` with your settings:

```bash
# App Configuration
APP_NAME="My App"
APP_ENV=development
APP_DEBUG=true
APP_KEY=change-this-to-a-random-32-character-string
APP_VERSION=1.0.0

# Database
DB_PATH=./database.sqlite

# Server
PORT=3000
HOST=localhost
```

**Important:** Generate a secure `APP_KEY`:

```bash
# On Linux/Mac
openssl rand -base64 32

# Or use Bun
bun -e "console.log(require('crypto').randomBytes(32).toString('base64'))"
```

### 4. Database Setup

Generate and run migrations:

```bash
# Generate migration files
bun run db:generate

# Run migrations
bun run db:migrate
```

This creates:
- `database.sqlite` - SQLite database file
- `users` table - User accounts
- `sessions` table - User sessions

### 5. Start Development Server

```bash
bun run dev
```

This starts:
- Backend: http://localhost:3000
- Frontend (Vite): http://localhost:5173

Open your browser to http://localhost:3000

## Project Structure Overview

```
learn-elysia/
├── backend/              # Your server-side code
│   ├── routes/          # URL → Controller mappings
│   ├── controllers/     # Business logic
│   ├── database/        # Database setup & migrations
│   ├── middleware/      # Request processing (auth, etc.)
│   ├── validators/      # Input validation schemas
│   ├── inertia/         # Custom Inertia adapter
│   ├── utils/           # Helper functions
│   └── views/           # HTML templates (just app.html)
├── frontend/            # Your Svelte components
│   ├── pages/           # Page components (Home, Login, etc.)
│   ├── components/      # Reusable UI components
│   ├── entry/           # App initialization
│   └── styles/          # Global CSS
├── public/              # Static assets (images, etc.)
└── tests/               # Your tests
```

## Understanding the Stack

### Backend: Elysia.js

**What is it?**
Fast, type-safe web framework for Bun.

**Why use it?**
- 16x faster than Express
- First-class TypeScript support
- Simple, elegant API

**Example:**
```typescript
// backend/routes/web/home.ts
export const homeRoutes = new Elysia()
  .get('/', ({ render }) => {
    return render('Home', { title: 'Welcome' })
  })
```

### Database: SQLite + Drizzle

**What is it?**
- SQLite: Embedded database (no separate server needed)
- Drizzle: Type-safe ORM/query builder

**Why use it?**
- Zero configuration
- Type-safe queries
- Fast (3-6x faster than better-sqlite3)

**Example:**
```typescript
// Query with Drizzle
const users = await db.query.users.findMany()
const user = await db.query.users.findFirst({
  where: eq(users.email, 'user@example.com')
})
```

### Frontend: Svelte 5

**What is it?**
Reactive UI framework with modern syntax.

**Why use it?**
- Less boilerplate than React
- Built-in reactivity
- Great performance

**Example:**
```svelte
<script lang="ts">
  let count = 0
  // No useState needed!
</script>

<button on:click={() => count++}>
  Clicks: {count}
</button>
```

### The Bridge: Inertia.js

**What is it?**
Lets you build SPAs without building an API.

**How it works:**
1. Frontend requests page via Inertia
2. Backend returns component + props (JSON)
3. Frontend renders Svelte component
4. No full page reload!

**Example:**
```typescript
// Backend
.get('/users', async ({ render }) => {
  const users = await db.query.users.findMany()
  return render('Users/Index', { users })
})

// Frontend - receives `users` as props
<script lang="ts">
  export let users: User[]
</script>

{#each users as user}
  <p>{user.name}</p>
{/each}
```

## Common Tasks

### Task 1: Create a New Page

**Step 1: Create Svelte Component**

`frontend/pages/About.svelte`:
```svelte
<script lang="ts">
  import Layout from '@components/Layout.svelte'
  export let auth: any
</script>

<Layout {auth}>
  <h1>About Us</h1>
  <p>This is the about page.</p>
</Layout>
```

**Step 2: Add Route**

`backend/routes/web/about.ts`:
```typescript
import { Elysia } from 'elysia'

export const aboutRoutes = new Elysia()
  .get('/about', ({ render }) => {
    return render('About', {})
  })
```

**Step 3: Register Route**

`backend/routes/index.ts`:
```typescript
import { aboutRoutes } from './web/about'

export const routes = new Elysia()
  .use(homeRoutes)
  .use(aboutRoutes)  // Add this
```

That's it! Visit http://localhost:3000/about

### Task 2: Create Protected Route

```typescript
// backend/routes/web/dashboard.ts
import { Elysia } from 'elysia'
import { getSessionUser } from '../../middleware/auth'

export const dashboardRoutes = new Elysia()
  .derive(async ({ cookie: { auth_token } }) => {
    const user = await getSessionUser(auth_token?.value || '')
    return { user }
  })
  .get('/dashboard', ({ render, user }) => {
    // Redirect if not authenticated
    if (!user) {
      return Response.redirect('/login', 303)
    }

    return render('Dashboard', { auth: { user } })
  })
```

### Task 3: Add Form Handling

**Backend Route:**
```typescript
.post('/contact', async ({ body, set }) => {
  // Validate input
  if (!body.email || !body.message) {
    set.status = 400
    return { error: 'Email and message required' }
  }

  // Process form
  // ...

  return Response.redirect('/contact/success', 303)
})
```

**Frontend Form:**
```svelte
<script lang="ts">
  import { useForm } from '@inertiajs/svelte'

  const form = useForm({
    email: '',
    message: ''
  })

  function submit() {
    form.post('/contact')
  }
</script>

<form on:submit|preventDefault={submit}>
  <input type="email" bind:value={form.email} />
  <textarea bind:value={form.message}></textarea>

  {#if form.errors.email}
    <p class="error">{form.errors.email}</p>
  {/if}

  <button disabled={form.processing}>Send</button>
</form>
```

### Task 4: Add Database Table

**Step 1: Define Schema**

`backend/database/schema/posts.ts`:
```typescript
import { sqliteTable, text, integer } from 'drizzle-orm/sqlite-core'
import { sql } from 'drizzle-orm'

export const posts = sqliteTable('posts', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  title: text('title').notNull(),
  content: text('content').notNull(),
  createdAt: integer('created_at', { mode: 'timestamp' })
    .notNull()
    .default(sql`(unixepoch())`)
})
```

**Step 2: Export Schema**

`backend/database/schema/index.ts`:
```typescript
export * from './users'
export * from './sessions'
export * from './posts'  // Add this
```

**Step 3: Generate Migration**

```bash
bun run db:generate
```

**Step 4: Run Migration**

```bash
bun run db:migrate
```

**Step 5: Use in Code**

```typescript
import { posts } from '../database/schema'
import { db } from '../database'
import { eq } from 'drizzle-orm'

// Create
await db.insert(posts).values({
  title: 'My Post',
  content: 'Post content'
})

// Read
const allPosts = await db.query.posts.findMany()
const singlePost = await db.query.posts.findFirst({
  where: eq(posts.id, 1)
})

// Update
await db.update(posts)
  .set({ title: 'Updated' })
  .where(eq(posts.id, 1))

// Delete
await db.delete(posts).where(eq(posts.id, 1))
```

### Task 5: Add Navigation Link

```svelte
<script lang="ts">
  import { Link } from '@inertiajs/svelte'
</script>

<!-- Navigation without page reload -->
<Link href="/about">About</Link>

<!-- With active state styling -->
<Link href="/about" class="nav-link">
  About
</Link>

<!-- External link (opens in new tab) -->
<a href="https://example.com" target="_blank">
  External
</a>
```

## Authentication

### Registration

```bash
# Visit http://localhost:3000/register
# Fill out form
# Submit
# You'll be logged in automatically
```

### Login

```bash
# Visit http://localhost:3000/login
# Enter email/password
# Submit
# Session cookie set
# Redirected to dashboard
```

### Protecting Routes

```typescript
import { getSessionUser } from '../middleware/auth'

// In your route
.derive(async ({ cookie: { auth_token } }) => {
  const user = await getSessionUser(auth_token?.value || '')
  return { user }
})
.get('/protected', ({ render, user }) => {
  if (!user) return Response.redirect('/login', 303)
  return render('Protected', { auth: { user } })
})
```

### Accessing Auth User in Svelte

```svelte
<script lang="ts">
  export let auth: { user: any }

  $: isAuthenticated = !!auth?.user
</script>

{#if isAuthenticated}
  <p>Welcome, {auth.user.name}!</p>
{:else}
  <p>Please <a href="/login">login</a></p>
{/if}
```

## Styling with TailwindCSS

### Adding Styles

```svelte
<div class="bg-blue-500 text-white p-4 rounded-lg">
  <h1 class="text-2xl font-bold">Styled Heading</h1>
  <p class="mt-2">Styled paragraph</p>
</div>
```

### Custom Components

`frontend/components/Button.svelte`:
```svelte
<script lang="ts">
  export let variant: 'primary' | 'secondary' = 'primary'
  export let onClick: () => void = () => {}

  const base = "px-4 py-2 rounded font-medium"
  const variants = {
    primary: "bg-blue-600 text-white hover:bg-blue-700",
    secondary: "bg-gray-200 text-gray-800 hover:bg-gray-300"
  }
</script>

<button
  class="{base} {variants[variant]}"
  on:click={onClick}
>
  <slot />
</button>
```

Usage:
```svelte
<Button variant="primary" on:click={handleClick}>
  Click Me
</Button>
```

## Database Operations

### Using Drizzle Studio

View and edit data visually:

```bash
bun run db:studio
```

Opens at http://localhost:4983

### Raw SQL

```typescript
import db from '../database'

const result = db.query('SELECT * FROM users WHERE email = ?', ['user@example.com'])
```

### Transactions

```typescript
import db from '../database'

db.transaction(() => {
  db.insert(posts).values({ title: 'Post 1' })
  db.insert(posts).values({ title: 'Post 2' })
  // Both succeed or both fail
})
```

## Debugging

### Enable Debug Mode

In `.env`:
```bash
APP_DEBUG=true
```

### Console Logging

```typescript
// Backend
console.log('User:', user)

// Frontend (Svelte)
console.log('Props:', JSON.stringify($props))
```

### Network Tab

1. Open browser DevTools (F12)
2. Go to Network tab
3. Look for requests with `X-Inertia: true` header
4. View response to see component + props

### Vue/React DevTools Alternative

Use [Svelte DevTools](https://marketplace.visualstudio.com/items?itemName=geddski.svelte-vscode) for VS Code

## Common Issues

### Issue: Port Already in Use

```bash
# Change port in .env
PORT=3001
```

### Issue: Database Locked

```bash
# Close other processes using database
# Close Drizzle Studio
# Restart server
```

### Issue: HMR Not Working

```bash
# Clear Vite cache
rm -rf node_modules/.vite
bun run dev
```

### Issue: TypeScript Errors

```bash
# Reinstall node modules
rm -rf node_modules bun.lock
bun install

# Restart TypeScript server in VS Code
# Cmd/Ctrl + Shift + P → "TypeScript: Restart TS Server"
```

## Next Steps

1. **Explore the code:**
   - Read [`ARCHITECTURE.md`](ARCHITECTURE.md) for deep dive
   - Check example pages in `frontend/pages/`
   - Review controllers in `backend/controllers/`

2. **Customize for your project:**
   - Update `backend/views/app.html` title
   - Modify `frontend/components/Layout.svelte`
   - Add your own routes and pages

3. **Learn more:**
   - [Elysia.js Documentation](https://elysiajs.com/)
   - [Inertia.js Documentation](https://inertiajs.com/)
   - [Svelte Documentation](https://svelte.dev/docs)
   - [Drizzle ORM Documentation](https://orm.drizzle.team/)

4. **Deploy:**
   - Build for production: `bun run build`
   - Set `APP_ENV=production` in `.env`
   - Use process manager (PM2, systemd, etc.)

## Getting Help

- Check [`ARCHITECTURE.md`](ARCHITECTURE.md) for technical details
- Review example code in `backend/` and `frontend/`
- Open an issue on GitHub
- Ask in community forums

Happy coding! 🚀
