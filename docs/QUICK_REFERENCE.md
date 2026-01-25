# Quick Reference

## Commands

### Development
```bash
bun run dev              # Start dev server (port 3000)
bun run dev:ui           # Start dev server with UI
```

### Database
```bash
bun run db:generate      # Generate migrations from schema
bun run db:migrate       # Run migrations
bun run db:studio        # Open Drizzle Studio (GUI)
bun run db:push          # Push schema directly to DB
```

### Testing
```bash
bun run test:run         # Run all tests
bun run test:ui          # Run tests with UI
bun run test:coverage    # Run tests with coverage
```

### Build
```bash
bun run build            # Build for production
bun run preview          # Preview production build
```

## File Structure

### Backend
```
backend/
├── app.ts              # Main Elysia app
├── controllers/        # Route handlers
│   ├── auth.controller.ts
│   ├── dashboard.controller.ts
│   ├── google-auth.controller.ts
│   ├── public.controller.ts
│   ├── upload.controller.ts
│   └── users.controller.ts
├── database/
│   ├── index.ts        # DB connection
│   ├── schema/         # Drizzle schemas
│   └── migrations/     # DB migrations
├── inertia/            # Inertia.js integration
├── routes/
│   ├── index.ts        # Route composer
│   └── web/            # Web routes
│       ├── auth.ts     # Auth routes
│       └── public.ts   # Public routes
└── services/           # Business logic
    ├── auth.service.ts
    ├── eta.service.ts
    ├── flash.service.ts
    ├── google-oauth.service.ts
    ├── inertia.service.ts
    ├── resend.service.ts
    ├── s3.service.ts
    ├── smtp.service.ts
    └── storage.service.ts
```

### Frontend
```
frontend/
├── components/         # Reusable components
│   ├── DashboardLayout.svelte
│   └── NavLink.svelte
├── entry/             # Entry points
│   ├── app.ts
│   ├── index.ts
│   └── style.css
└── pages/             # Inertia pages
    ├── auth/          # Auth pages
    ├── errors/        # Error pages
    ├── users/         # User pages
    ├── about.svelte
    ├── dashboard.svelte
    ├── home.svelte
    └── profile.svelte
```

## Controller Pattern

```typescript
import { posts } from '../database/schema'
import db from '../database'
import { eq } from 'drizzle-orm'
import type { ControllerContext } from '../../types/controller.types'
import flash from '../services/flash.service'

export const postController = {
  async index(ctx: ControllerContext) {
    const items = await db.query.posts.findMany({
      with: { user: true },
      orderBy: (posts, { desc }) => [desc(posts.createdAt)]
    })
    return ctx.inertia('posts/index', {
      auth: { user: ctx.user },
      items
    })
  },

  async store(ctx: ControllerContext & { body: { title: string; content: string } }) {
    try {
      const { title, content } = ctx.body

      // Validation
      if (!title || title.length < 2) {
        flash.set(ctx.set, 'error', 'Title must be at least 2 characters')
        return Response.redirect('/posts/create', 303)
      }

      // Insert
      await db.insert(posts).values({
        id: Bun.randomUUIDv7(),
        title,
        content,
        userId: ctx.user.id,
        createdAt: new Date(),
        updatedAt: new Date()
      })

      flash.set(ctx.set, 'success', 'Post created successfully')
      ctx.set.headers['Content-Type'] = 'application/json'
      return Response.redirect('/posts', 303)
    } catch (error: unknown) {
      flash.set(ctx.set, 'error', error instanceof Error ? error.message : 'Failed to create post')
      return Response.redirect('/posts/create', 303)
    }
  }
}
```

## Page Pattern

```svelte
<script>
  import { router } from '@inertiajs/svelte'
  import { Plus, Edit, Trash2 } from 'lucide-svelte'
  import DashboardLayout from '@/components/DashboardLayout.svelte'
  let { flash, posts } = $props()
  let isLoading = $state(false)
</script>

<DashboardLayout title="Posts" subtitle="Kelola post Anda">
  {#if flash?.error}
    <div class="p-4 bg-red-500/10 border border-red-500/20 rounded-lg mb-4">{flash.error}</div>
  {/if}
  {#if flash?.success}
    <div class="p-4 bg-green-500/10 border border-green-500/20 rounded-lg mb-4">{flash.success}</div>
  {/if}

  <a href="/posts/create" use:inertia class="inline-flex items-center gap-2 px-6 py-3 bg-brand-600 text-white rounded-lg hover:bg-brand-700 mb-6">
    <Plus class="w-4 h-4" />
    Buat Post
  </a>

  <div class="space-y-4">
    {#each posts as post}
      <div class="bg-white rounded-lg p-6 shadow-sm border border-gray-100">
        <h3 class="text-xl font-bold text-gray-900 mb-1">{post.title}</h3>
        <p class="text-gray-600 text-sm">{post.content}</p>
      </div>
    {/each}
  </div>
</DashboardLayout>
```

## Database Queries

### Find Many
```typescript
const posts = await db.query.posts.findMany({
  with: { user: true },
  orderBy: (posts, { desc }) => [desc(posts.createdAt)]
})
```

### Find One
```typescript
const post = await db.query.posts.findFirst({
  where: eq(posts.id, id)
})
```

### Insert
```typescript
await db.insert(posts).values({
  id: Bun.randomUUIDv7(),
  title,
  content,
  userId: ctx.user.id,
  createdAt: new Date(),
  updatedAt: new Date()
})
```

### Update
```typescript
await db.update(posts)
  .set({ title, content, updatedAt: new Date() })
  .where(eq(posts.id, id))
```

### Delete
```typescript
await db.delete(posts).where(eq(posts.id, id))
```

## Inertia Navigation

### Links
```svelte
<a href="/posts" use:inertia>View Posts</a>
```

### Form Submission
```svelte
<script>
  import { router } from '@inertiajs/svelte'
  let form = $state({ title: '', content: '' })

  function submitForm() {
    router.post('/posts', form)
  }
</script>

<form onsubmit={(e) => { e.preventDefault(); submitForm(); }}>
  <input bind:value={form.title} />
  <textarea bind:value={form.content} />
  <button type="submit">Submit</button>
</form>
```

### Update & Delete
```svelte
<script>
  import { router } from '@inertiajs/svelte'
</script>

<button onclick={() => router.put(`/posts/${id}`, data)}>Update</button>
<button onclick={() => router.delete(`/posts/${id}`)}>Delete</button>
```

## Flash Messages

### Controller (Set)
```typescript
flash.set(ctx.set, 'error', 'Error message')
flash.set(ctx.set, 'success', 'Success message')
```

### Page (Display)
```svelte
{#if flash?.error}
  <div class="p-4 bg-red-500/10 border border-red-500/20 rounded-lg">{flash.error}</div>
{/if}
{#if flash?.success}
  <div class="p-4 bg-green-500/10 border border-green-500/20 rounded-lg">{flash.success}</div>
{/if}
```

## Lucide Icons

### Import
```svelte
<script>
  import { IconName } from 'lucide-svelte'
</script>
```

### Use
```svelte
<IconName class="w-5 h-5" />
```

### Common Icons
- `Plus` - Add/create
- `Edit` - Edit actions
- `Trash2` - Delete actions
- `User` - User-related
- `Search` - Search functionality
- `Settings` - Settings
- `Menu` - Navigation
- `X` - Close/cancel

## Built-in Controllers

| Controller | Purpose |
|------------|---------|
| `authController` | Login, register, logout, password reset |
| `googleAuthController` | Google OAuth integration |
| `dashboardController` | Dashboard & profile pages |
| `publicController` | Public pages (landing, home, about) |
| `usersController` | User management (CRUD) |
| `uploadController` | File uploads (images, files) |

## Built-in Services

| Service | Purpose |
|---------|---------|
| `authService` | Session management, authentication |
| `inertiaService` | Inertia.js integration |
| `flashService` | Flash message management |
| `etaService` | Eta template engine (SSR) |
| `resendService` | Email via Resend API |
| `smtpService` | Email via SMTP |
| `s3Service` | S3-compatible storage |
| `storageService` | Local file storage |
| `googleOauthService` | Google OAuth integration |

## Validation Patterns

### Required Field
```typescript
if (!value) {
  flash.set(ctx.set, 'error', 'Field is required')
  return Response.redirect('/path', 303)
}
```

### String Length
```typescript
if (!value || value.length < 2) {
  flash.set(ctx.set, 'error', 'Must be at least 2 characters')
  return Response.redirect('/path', 303)
}
```

### Email Format
```typescript
if (!email || !email.includes('@')) {
  flash.set(ctx.set, 'error', 'Invalid email')
  return Response.redirect('/path', 303)
}
```

### Password Minimum
```typescript
if (!password || password.length < 8) {
  flash.set(ctx.set, 'error', 'Password must be at least 8 characters')
  return Response.redirect('/path', 303)
}
```

## Route Pattern

```typescript
import { Elysia } from 'elysia'
import { postController } from "../../controllers/post.controller"
import authService from '../../services/auth.service'

export const postRoutes = (app: Elysia<any>) => app
  .group('/posts', (app) => app
    .derive(async ({ cookie }) => {
      const token = (cookie?.auth_token?.value as string) || ''
      const user = await authService.getSessionUser(token)
      if (!user) throw new Error('Unauthorized')
      return { user }
    })
    .get('/', async (ctx) => await postController.index(ctx as unknown as ControllerContext))
    .get('/create', async (ctx) => await postController.create(ctx as unknown as ControllerContext))
    .post('/', async (ctx) => await postController.store(ctx as unknown as ControllerContext & { body: any }))
    .get('/:id/edit', async (ctx) => await postController.edit(ctx as unknown as ControllerContext & { params: { id: string } }))
    .put('/:id', async (ctx) => await postController.update(ctx as unknown as ControllerContext & { params: { id: string }; body: any }))
    .delete('/:id', async (ctx) => await postController.delete(ctx as unknown as ControllerContext & { params: { id: string } }))
  )
```

## Environment Variables

```env
# Server
PORT=3000
NODE_ENV=development

# Database
DATABASE_URL=file:./storage/database.sqlite

# Google OAuth
GOOGLE_CLIENT_ID=your_client_id
GOOGLE_REDIRECT_URI=http://localhost:3000/auth/google/callback

# Email (Resend)
RESEND_API_KEY=your_resend_api_key

# Storage (S3)
S3_ACCESS_KEY=your_access_key
S3_SECRET_KEY=your_secret_key
S3_BUCKET=your_bucket
S3_REGION=us-east-1
```

## Tech Stack

| Layer | Technology | Version |
|-------|-----------|---------|
| Runtime | Bun | Latest |
| Backend | Elysia | v1.4.22 |
| Frontend | Svelte | v5.0.0 |
| Styling | Tailwind CSS | v4.1.18 |
| SPA | Inertia.js | v2.3.11 |
| Database | SQLite | v12.6.2 |
| ORM | Drizzle ORM | v0.45.1 |
| Testing | Vitest | Latest |
| Icons | Lucide Icons | Latest |

## Common Issues

### "Module not found"
- Check import paths
- Ensure file exists
- Use correct extension (.ts, .svelte)

### "Cannot read property"
- Check if data is passed from controller
- Use optional chaining `data?.property`
- Verify props are destructured correctly

### "Flash message not showing"
- Ensure `flash` prop is received in page
- Check if `flash.set()` is called with correct parameters
- Verify redirect happens after setting flash

### "Route not found"
- Check route is registered in `backend/routes/web/`
- Verify route is imported in `backend/routes/index.ts`
- Check URL path matches route definition

## Resources

- [Architecture](ARCHITECTURE.md)
- [Getting Started](GETTING_STARTED.md)
- [FAQ](FAQ.md)
- [Testing](TESTING.md)
- [Skills](../skills/)
- [Workflow](../workflow/)