# Quick Reference Guide

> Fast lookup for common tasks. **For detailed guides, see [GETTING_STARTED.md](GETTING_STARTED.md).**

## 📑 Table of Contents

- [🚀 Quick Commands](#-quick-commands)
- [🆘 Need Help Fast?](#-need-help-fast)
- [📝 Common Patterns](#-common-code-patterns)
  - [Backend](#backend-patterns)
  - [Frontend](#frontend-patterns)
  - [Database](#database-patterns)
- [🎨 TailwindCSS](#-tailwindcss-quick-classes)
- [🔧 Utilities](#-utilities)
- [🐛 Quick Fixes](#-quick-fixes)
- [📁 File Locations](#-file-locations)

---

## 🚀 Quick Commands

```bash
# Development
bun run dev                # Start backend + frontend
bun run dev:backend        # Backend only (:3000)
bun run dev:frontend       # Frontend only (:5173)

# Database
bun run db:generate        # Generate migrations
bun run db:migrate          # Run migrations
bun run db:studio           # Open database GUI

# Build
bun run build              # Production build
bun run typecheck          # Type checking
```

---

## 🆘 Need Help Fast?

### Something Not Working?

| Problem | Quick Fix |
|---------|-----------|
| Port in use | Change `PORT` in `.env` |
| Database locked | Close Drizzle Studio, restart server |
| HMR not working | `rm -rf node_modules/.vite && bun run dev` |
| TypeScript errors | `bun install` && restart TS server |
| Page not found | Check route registered & page exists |
| Props not received | Check backend returns data |

### Can't Find Something?

| What | Where |
|------|-------|
| How to install? | [README.md](README.md) → Quick Start |
| Step-by-step guide | [GETTING_STARTED.md](GETTING_STARTED.md) |
| How it works? | [ARCHITECTURE.md](ARCHITECTURE.md) |
| Common questions | [FAQ.md](FAQ.md) |
| Contribute code | [CONTRIBUTING.md](CONTRIBUTING.md) |

---

## 📝 Common Code Patterns

### Backend Patterns

#### Add Route

`backend/routes/web/example.ts`:
```typescript
import { Elysia } from 'elysia'

export const exampleRoutes = new Elysia()
  .get('/example', ({ render }) => {
    return render('Example', { title: 'Example' })
  })
```

Register in `backend/routes/index.ts`:
```typescript
import { exampleRoutes } from './web/example'

export const routes = new Elysia()
  .use(exampleRoutes)
```

#### Protected Route

```typescript
import { getSessionUser } from '../middleware/auth'

.derive(async ({ cookie: { auth_token } }) => {
  const user = await getSessionUser(auth_token?.value || '')
  return { user }
})
.get('/dashboard', ({ render, user }) => {
  if (!user) return Response.redirect('/login', 303)
  return render('Dashboard', { auth: { user } })
})
```

#### Return JSON Response

```typescript
.get('/api/data', () => {
  return { data: [1, 2, 3] }
})
```

### Frontend Patterns

#### Create Page

`frontend/pages/Example.svelte`:
```svelte
<script lang="ts">
  import Layout from '@components/Layout.svelte'
  export let title: string
  export let auth: any
</script>

<Layout {auth}>
  <h1>{title}</h1>
</Layout>
```

#### Navigation

```svelte
<script lang="ts">
  import { Link } from '@inertiajs/svelte'
</script>

<!-- Link -->
<Link href="/about">About</Link>

<!-- Programmatic -->
<script lang="ts">
  import { router } from '@inertiajs/svelte'
  function goHome() {
    router.get('/')
  }
</script>
```

#### Form with Validation

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
    <p class="text-red-600">{form.errors.name}</p>
  {/if}
  <button disabled={form.processing}>
    {form.processing ? 'Saving...' : 'Save'}
  </button>
</form>
```

#### Show Loading State

```svelte
<script lang="ts">
  let loading = $state(false)

  async function fetchData() {
    loading = true
    // ...
    loading = false
  }
</script>

{#if loading}
  <p>Loading...</p>
{/if}
```

### Database Patterns

#### Query Examples

```typescript
import { db } from '../database'
import { users } from '../database/schema'
import { eq, and, or, desc } from 'drizzle-orm'

// Find all
const all = await db.query.users.findMany()

// Find one
const one = await db.query.users.findFirst({
  where: eq(users.id, 1)
})

// Find with conditions
const result = await db.query.users.findMany({
  where: eq(users.email, 'user@example.com')
})

// Multiple conditions
const users = await db.query.users.findMany({
  where: or(
    eq(users.role, 'admin'),
    eq(users.active, true)
  )
})

// Order by
const latest = await db.query.users.findMany({
  orderBy: [desc(users.createdAt)]
})

// Pagination
const page = await db.query.users.findMany({
  limit: 20,
  offset: 0
})

// Select specific columns
const safe = await db.query.users.findMany({
  columns: {
    id: true,
    name: true,
    // password excluded
  }
})
```

#### CRUD Operations

```typescript
// Create
await db.insert(users).values({
  name: 'John',
  email: 'john@example.com',
  password: await hashPassword('secret')
})

// Update
await db.update(users)
  .set({ name: 'Jane' })
  .where(eq(users.id, 1))

// Delete
await db.delete(users).where(eq(users.id, 1))

// Count
const count = await db.select({ count: sql`count(*)` }).from(users)
```

---

## 🎨 TailwindCSS Quick Classes

### Layout

```html
<div class="flex">                    <!-- flexbox -->
<div class="grid grid-cols-2">       <!-- 2 columns -->
<div class="container mx-auto">    <!-- centered with max-width -->
<div class="flex justify-between">  <!-- space-between -->
<div class="flex items-center">     <!-- vertical center -->
```

### Spacing

```html
<div class="p-4">     <!-- padding: 1rem -->
<div class="m-4">     <!-- margin: 1rem -->
<div class="px-4">    <!-- padding-x: 1rem -->
<div class="py-2">    <!-- padding-y: 0.5rem -->
<div class="gap-4">    <!-- gap: 1rem -->
```

### Typography

```html
<h1 class="text-2xl font-bold">     <!-- 24px, bold -->
<p class="text-gray-600">             <!-- gray-600 -->
<span class="text-sm">               <!-- 14px -->
<p class="font-mono">                <!-- monospace -->
```

### Colors

```html
<div class="bg-blue-500">            <!-- blue bg -->
<div class="text-white">             <!-- white text -->
<div class="bg-blue-500/50">         <!-- 50% opacity -->
<div class="border border-gray-300">
<div class="rounded-lg">             <!-- rounded corners -->
```

### Responsive

```html
<div class="md:flex">                <!-- flex on medium+ -->
<div class="lg:grid-cols-3">         <!-- 3 columns on large -->
<div class="hidden md:block">     <!-- hide on mobile -->
```

### States

```html
<button class="hover:bg-blue-600">       <!-- hover -->
<button class="focus:ring-2">          <!-- focus -->
<button class="disabled:opacity-50">   <!-- disabled -->
```

---

## 🔧 Utilities

### Password Hashing

```typescript
import { hashPassword, verifyPassword } from '../utils/hash'

// Hash
const hash = await hashPassword('password123')

// Verify
const isValid = await verifyPassword('password123', hash)
```

### Generate Token

```typescript
import { generateToken } from '../utils/token'

const token = generateToken()  // 64-char hex string
```

### Error Handling

```typescript
try {
  // Code
} catch (error) {
  set.status = 500
  return { error: error.message }
}
```

---

## 🐛 Quick Fixes

### Page Shows 404

```bash
# 1. Check route exists
cat backend/routes/web/myroute.ts

# 2. Check route registered
cat backend/routes/index.ts

# 3. Check page exists
ls frontend/pages/MyPage.svelte

# 4. Check component name matches
```

### Database Query Errors

```bash
# Reset database
rm database.sqlite
bun run db:migrate

# Check schema
cat backend/database/schema/index.ts
```

### Styles Not Applying

```bash
# 1. Check Tailwind config
cat tailwind.config.js

# 2. Check Vite directive
cat backend/views/app.html

# 3. Rebuild frontend
bun run build:frontend
```

### Auth Not Working

```bash
# 1. Check cookie (DevTools → Application → Cookies)
# 2. Check session in database
bun run db:studio

# 3. Check middleware applied
grep getSessionUser backend/routes/web/dashboard.ts
```

### Import Errors

```bash
# Reinstall dependencies
rm -rf node_modules bun.lock
bun install

# Restart TS server in VS Code
# Cmd/Ctrl + Shift + P → "TypeScript: Restart TS Server"
```

---

## 📁 File Locations

| What | Where |
|------|-------|
| **Routes** | `backend/routes/web/` |
| **Controllers** | `backend/controllers/` |
| **Middleware** | `backend/middleware/` |
| **Validators** | `backend/validators/` |
| **Database Schema** | `backend/database/schema/` |
| **Migrations** | `backend/database/migrations/` |
| **Utils** | `backend/utils/` |
| **Pages** | `frontend/pages/` |
| **Components** | `frontend/components/` |
| **HTML Template** | `backend/views/app.html` |
| **Entry Point** | `backend/index.ts` |
| **App Config** | `backend/app.ts` |
| **Environment** | `.env` |

---

## 💡 Pro Tips

### Speed Up Development

```bash
# Run database GUI
bun run db:studio

# Type checking in parallel
bun run typecheck &

# Build only frontend for quick testing
bun run build:frontend
```

### Debug Inertia

```javascript
// In browser console
Inertia.visit(url, {
  method: 'get',
  data: { test: true },
  headers: { 'X-Debug': true }
})
```

### Common Imports

```typescript
// Backend
import { Elysia } from 'elysia'
import { db } from '../database'
import { eq } from 'drizzle-orm'

// Frontend
import { Link } from '@inertiajs/svelte'
import { useForm } from '@inertiajs/svelte'
import { router } from '@inertiajs/svelte'
import Layout from '@components/Layout.svelte'
```

---

## 📚 More Documentation

- [README.md](README.md) - **Start here!**
- [GETTING_STARTED.md](GETTING_STARTED.md) - Step-by-step guide
- [ARCHITECTURE.md](ARCHITECTURE.md) - Technical deep dive
- [FAQ.md](FAQ.md) - 50+ common questions
- [CONTRIBUTING.md](CONTRIBUTING.md) - Contribution guidelines
- [CHANGELOG.md](CHANGELOG.md) - Version history

---

**Need more?** Check [FAQ.md](FAQ.md) or open an issue!
