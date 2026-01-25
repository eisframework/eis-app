# Getting Started with EIS Framework

Welcome to EIS (Elysia Inertia Svelte) Framework! This guide will help you get up and running quickly.

## Prerequisites

- **Bun** v1.0.0 or higher - JavaScript runtime
- **Node.js** (optional, for some tools)
- **Git** - Version control

## Installation

### 1. Clone the Repository

```bash
git clone https://github.com/maulanashalihin/eis-framework.git
cd laju-elysia
```

### 2. Install Dependencies

```bash
bun install
```

### 3. Setup Environment

Copy the example environment file:

```bash
cp .env.example .env
```

Edit `.env` with your configuration:

```env
# Server
PORT=3000
NODE_ENV=development

# Database
DATABASE_URL=file:./storage/database.sqlite

# Google OAuth (optional)
GOOGLE_CLIENT_ID=your_client_id
GOOGLE_REDIRECT_URI=http://localhost:3000/auth/google/callback

# Email (optional - Resend)
RESEND_API_KEY=your_resend_api_key

# Storage (optional - S3)
S3_ACCESS_KEY=your_access_key
S3_SECRET_KEY=your_secret_key
S3_BUCKET=your_bucket
S3_REGION=us-east-1
```

### 4. Run Database Migrations

```bash
bun run db:generate  # Generate migrations from schema
bun run db:migrate   # Run migrations
```

### 5. Start Development Server

```bash
bun run dev
```

Visit `http://localhost:3000` in your browser.

## Project Structure

```
laju-elysia/
├── backend/          # Elysia backend
│   ├── controllers/ # Route handlers
│   ├── services/    # Business logic
│   ├── routes/      # Route definitions
│   └── database/    # Drizzle ORM
├── frontend/         # Svelte frontend
│   ├── components/  # Reusable components
│   ├── pages/       # Inertia pages
│   └── entry/       # Entry points
└── docs/            # Documentation
```

## Your First Feature

Let's create a simple "Posts" feature.

### Step 1: Create Database Schema

Edit `backend/database/schema/index.ts`:

```typescript
import { sqliteTable, text, integer } from 'drizzle-orm/sqlite-core'
import { sql } from 'drizzle-orm'

export const posts = sqliteTable('posts', {
  id: text('id').primaryKey(),
  title: text('title').notNull(),
  content: text('content').notNull(),
  userId: text('user_id').references(() => users.id, { onDelete: 'cascade' }),
  createdAt: integer('created_at', { mode: 'timestamp' })
    .notNull()
    .default(sql`(unixepoch())`),
  updatedAt: integer('updated_at', { mode: 'timestamp' })
    .notNull()
    .default(sql`(unixepoch())`)
})
```

Generate and run migration:

```bash
bun run db:generate
bun run db:migrate
```

### Step 2: Create Controller

Create `backend/controllers/post.controller.ts`:

```typescript
import { posts } from '../database/schema'
import db from '../database'
import { eq } from 'drizzle-orm'
import type { ControllerContext } from '../../types/controller.types'
import flash from '../services/flash.service'

export const postController = {
  async index(ctx: ControllerContext) {
    const allPosts = await db.query.posts.findMany({
      with: { user: true },
      orderBy: (posts, { desc }) => [desc(posts.createdAt)]
    })
    return ctx.inertia('posts/index', {
      auth: { user: ctx.user },
      posts: allPosts
    })
  },

  async store(ctx: ControllerContext & { body: { title: string; content: string } }) {
    try {
      const { title, content } = ctx.body

      if (!title || title.length < 2) {
        flash.set(ctx.set, 'error', 'Title must be at least 2 characters')
        return Response.redirect('/posts/create', 303)
      }

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

### Step 3: Add Routes

Create `backend/routes/web/posts.ts`:

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
  )
```

Import in `backend/routes/index.ts`:

```typescript
import { Elysia } from 'elysia'
import { publicRoutes } from './web/public'
import { authRoutes } from './web/auth'
import { postRoutes } from './web/posts'

export const app = new Elysia()
  .use(publicRoutes)
  .use(authRoutes)
  .use(postRoutes)
```

### Step 4: Create Pages

Create `frontend/pages/posts/index.svelte`:

```svelte
<script>
  import { router } from '@inertiajs/svelte'
  import { Plus, Edit, Trash2 } from 'lucide-svelte'
  import DashboardLayout from '@/components/DashboardLayout.svelte'
  let { flash, posts } = $props()
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
        <div class="flex justify-between items-start mb-3">
          <div>
            <h3 class="text-xl font-bold text-gray-900 mb-1">{post.title}</h3>
            <div class="text-sm text-gray-500">
              {post.user.name} • {new Date(post.createdAt).toLocaleDateString()}
            </div>
          </div>
          <div class="flex gap-2">
            <a href={`/posts/${post.id}/edit`} use:inertia class="px-4 py-2 border border-gray-200 rounded-lg hover:border-brand-600 hover:text-brand-600 text-sm">
              <Edit class="w-4 h-4" />
            </a>
            <button onclick={() => { if (confirm('Are you sure?')) router.delete(`/posts/${post.id}`) }} class="px-4 py-2 border border-red-200 rounded-lg hover:bg-red-50 hover:text-red-600 text-sm">
              <Trash2 class="w-4 h-4" />
            </button>
          </div>
        </div>
        <p class="text-gray-600 text-sm">{post.content}</p>
      </div>
    {/each}
  </div>
</DashboardLayout>
```

### Step 5: Test Your Feature

Visit `http://localhost:3000/posts` to see your new feature in action!

## Common Commands

```bash
# Development
bun run dev              # Start dev server (port 3000)
bun run dev:ui           # Start dev server with UI

# Database
bun run db:generate      # Generate migrations from schema
bun run db:migrate       # Run migrations
bun run db:studio        # Open Drizzle Studio (GUI)

# Testing
bun run test:run         # Run all tests
bun run test:ui          # Run tests with UI
bun run test:coverage    # Run tests with coverage

# Build
bun run build            # Build for production
```

## Built-in Controllers & Services

### Controllers
- `authController` - Authentication (login, register, logout)
- `googleAuthController` - Google OAuth
- `dashboardController` - Dashboard & profile
- `publicController` - Public pages
- `usersController` - User management
- `uploadController` - File uploads

### Services
- `authService` - Session management
- `inertiaService` - Inertia.js integration
- `flashService` - Flash messages
- `etaService` - Eta template engine (SSR)
- `resendService` / `smtpService` - Email
- `s3Service` / `storageService` - File storage
- `googleOauthService` - Google OAuth

## Next Steps

1. **Read the Architecture** - `docs/ARCHITECTURE.md`
2. **Check Skills** - `skills/` folder for guides
3. **Explore Examples** - Look at existing controllers/pages
4. **Write Tests** - `docs/TESTING.md`
5. **Deploy** - Check deployment guide in README.md

## Need Help?

- Check `docs/FAQ.md` for common questions
- See `docs/QUICK_REFERENCE.md` for quick lookup
- Read `docs/ARCHITECTURE.md` for deep dive
- Check `skills/` for implementation guides

Happy coding! 🚀