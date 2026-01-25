# Project Initialization Workflow

Panduan lengkap untuk memulai project baru dengan EIS Framework.

## Scope Enforcement

**INIT_AGENT CAN:**
- ✅ Create project infrastructure
- ✅ Setup GitHub Actions workflow
- ✅ Setup testing infrastructure
- ✅ Create documentation (README, PRD, TDD, PROGRESS, ui-kit)
- ✅ Setup design system
- ✅ Create layout components
- ✅ Customize auth pages
- ✅ Git init and first commit

**INIT_AGENT CANNOT:**
- ❌ Implement features or write code
- ❌ Create controllers, pages, routes
- ❌ Manage changes or update PRD/TDD after initialization
- ❌ Deploy to production
- ❌ Create release notes

**If asked to do something outside scope:**
```
❌ REJECTED: "Tolong implementasi fitur ini"

RESPONSE: "Saya tidak bisa implementasi fitur atau menulis code. 
Itu adalah tanggung jawab TASK_AGENT. 
Silakan mention @workflow/TASK_AGENT.md untuk implementasi fitur."
```

**Note:** INIT_AGENT hanya untuk setup project awal. Setelah initialization selesai, gunakan TASK_AGENT untuk implementasi fitur.

## Tech Stack

- **Svelte**: v5.0.0 (with runes `$state`, `$props`)
- **Tailwind CSS**: v4.1.18
- **Inertia.js**: v2.3.11
- **Vite**: v5
- **TypeScript**: v5.9.3 (full-stack)
- **Elysia**: v1.4.22 (backend server)
- **Drizzle ORM**: v0.45.1 (database ORM)
- **better-sqlite3**: v12.6.2 (SQLite database driver)
- **Bun**: Fast JavaScript runtime
- **Lucide Icons**: Default icon library

## Initialization Steps

Ikuti urutan ini saat memulai project baru:

### 1. Initialize Project

Buat project EIS baru.

### 2. Create/Replace README.md

Tanyakan user untuk:
- Nama project
- Deskripsi project
- Fitur utama

Buat `README.md` dengan konten:
- Nama dan deskripsi project
- Quick start guide (installation, usage)
- Tech stack
- List fitur

### 3. Create workflow/PRD.md

Dokumen Product Requirements yang berisi:
- Objectives dan goals
- List fitur
- Success criteria
- **Design specifications** (branding colors, typography, design system, visual identity)

### 4. Create workflow/TDD.md

Dokumen Technical Design yang berisi:
- Technical architecture dan system design
- Database schema dan relationships
- API endpoints dan routes
- Data models dan flow
- Security considerations
- Technical specifications dari PRD.md

### 5. Create workflow/ui-kit.html

Dokumen UI Design System yang berisi:
- Color palette dan theme tokens
- Typography styles (headings, body text)
- Button styles dan variants
- Form input styles
- Card dan container styles
- Status badges dan feedback components
- Layout patterns dan spacing
- Icon usage guidelines

### 6. Create workflow/PROGRESS.md

Template tracking development:

```markdown
# Development Progress

## Completed
- [x] Initial setup
- [x] README.md created
- [x] workflow/PRD.md created
- [x] workflow/TDD.md created
- [x] workflow/ui-kit.html created
- [x] workflow/PROGRESS.md created

## In Progress
- [ ] Feature 1

## Pending
- [ ] Feature 2

---

## Features

### Posts
- [ ] Pages: index.svelte, form.svelte
- [ ] Controller: PostController (index, create, store, edit, update, destroy)
- [ ] Routes: GET /posts, GET /posts/create, POST /posts, GET /posts/:id/edit, PUT /posts/:id, DELETE /posts/:id

### Users
- [ ] Pages: index.svelte, form.svelte
- [ ] Controller: UserController (index, create, store, edit, update, destroy)
- [ ] Routes: GET /users, GET /users/create, POST /users, GET /users/:id/edit, PUT /users/:id, DELETE /users/:id

### [Feature Name]
- [ ] Pages: index.svelte, form.svelte
- [ ] Controller: [Feature]Controller (index, create, store, edit, update, destroy)
- [ ] Routes: GET /[feature], GET /[feature]/create, POST /[feature], GET /[feature]/:id/edit, PUT /[feature]/:id, DELETE /[feature]/:id

---

## Migrations
### Completed
- [ ] migration_name

### Pending
- [ ] migration_name
```


### 7. Review Documentation

Minta user review dan approve:
- `README.md` - Project overview, features, tech stack
- `workflow/PRD.md` - Requirements, design specifications
- `workflow/TDD.md` - Technical design document (architecture, database, API)
- `workflow/ui-kit.html` - UI design system dan components
- `workflow/PROGRESS.md` - Development tracking template

**Tunggu konfirmasi user sebelum melanjutkan ke step berikutnya**


### 8. Create Migrations

Buat migration files untuk database schema berdasarkan `workflow/TDD.md`.

Gunakan Drizzle ORM untuk migrations:
```bash
bun run db:generate
```

### 9. Run Migrations

```bash
bun run db:migrate
```

### 10. Setup Design System

Konfigurasi theme:
- Update `tailwind.config.js` dengan branding colors, typography, dan design tokens dari `workflow/PRD.md` dan `workflow/ui-kit.html`
- Import Tailwind directives di `frontend/entry/style.css`



### 11. Create Layout Components

Buat layout components di `frontend/components/`:
- Ikuti design system dari `workflow/ui-kit.html`
- Apply branding colors, typography, dan design tokens dari PRD.md

### 12. Customize Built-in Auth Pages

Update built-in auth pages untuk match design system dari `workflow/ui-kit.html`:

- `frontend/pages/auth/login.svelte` - Sesuaikan dengan branding colors, typography, dan design tokens
- `frontend/pages/auth/register.svelte` - Gunakan components dari ui-kit.html
- `frontend/pages/auth/forgot-password.svelte` - Apply visual identity dari PRD.md
- `frontend/pages/auth/reset-password.svelte` - Ikuti layout patterns dari ui-kit.html

**Gunakan Layout Components** yang sudah dibuat di step 11 untuk konsistensi.

### 13. Setup GitHub Actions Workflow

Setup automated testing dan deployment workflow:

**Copy GitHub Actions workflow:**
```bash
# Copy workflow sample ke .github/workflows
cp -r github-workflow-sample/workflows .github/
```

**Setup GitHub Secrets:**
1. Buka repository di GitHub
2. Settings → Secrets and variables → Actions
3. Tambahkan secrets:
   - `SSH_HOST` - IP address server Anda
   - `SSH_USER` - Username SSH server
   - `SSH_PRIVATE_KEY` - Private key SSH
   - `SLACK_WEBHOOK` - (Opsional) Slack webhook URL

**Testing infrastructure sudah termasuk:**
- Vitest (unit tests)
- Testing Library (integration tests)

**Note:** GitHub Actions akan otomatis run tests setiap kali Anda push ke GitHub. Deployment hanya akan terjadi jika semua tests pass.

### 14. Git Init and First Commit

```bash
git init
git add .
git commit -m "Initial commit: Project setup"
```

### 15. Start Dev Server

```bash
bun run dev
```

### 16. Complete Initialization

**Proses INIT AGENT selesai!**

Setelah dev server berjalan dengan baik:
1. Tutup session ini
2. Buka session baru dan mulai dengan: **"Hai @[workflow/TASK_AGENT.md] yuk kita kerja"**
3. Lanjutkan implementasi fitur sesuai `workflow/PROGRESS.md`

**Workflow setelah initialization:**
```
TASK_AGENT (implement fitur)
    ↓ Test lokal (opsional)
    ↓ Push ke GitHub
    ↓
GitHub Actions CI (automated testing)
    ↓ Runs unit, integration, E2E tests
    ↓
GitHub Actions CI (automated deployment)
    ↓ Deploy ke production (hanya jika tests pass)
    ↓ Run smoke tests
    ↓ Auto-rollback jika fail
    ↓
MANAGER_AGENT (release notes)
    ↓ Update CHANGELOG.md
```

**Note:** Referensi:
- `skills/testing-guide.md` - Panduan menulis test
- `skills/deployment-guide.md` - Panduan deployment

## Important Notes

- **Selalu ikuti urutan ini** - Jangan skip steps
- **Tunggu approval user** sebelum melanjutkan setelah step 7 (Review Documentation)
- **Gunakan built-in functionality** - Cek dulu apakah controller/page/service sudah ada sebelum membuat baru
- **Test sebelum commit** - Pastikan semua berjalan dengan baik sebelum commit
- **Default PORT** - EIS Framework default PORT adalah 3000 (lihat `.env.example`), user bisa mengganti port di `.env` file jika diperlukan
- **GitHub Actions Testing** - Tests run otomatis via GitHub Actions CI setiap kali push
- **Deployment Automation** - Deployment hanya terjadi jika semua tests pass
- **Auto-rollback** - GitHub Actions akan auto-rollback jika deployment fail

## API Action Guidelines

**Gunakan Inertia Router** untuk:
- Pindah halaman (navigation)
- Form submission yang perlu redirect ke halaman lain
- GET request untuk load data di halaman baru
- Actions yang mengubah state dan perlu update halaman

**Gunakan Fetch API** untuk:
- Actions yang tidak memerlukan pindah halaman
- Form submission dengan stay-on-page behavior
- AJAX requests untuk update data tanpa reload
- Real-time updates, live search, autocomplete
- Actions yang hanya perlu response JSON (success/error message)
- Modal actions, dropdown actions, inline actions



## Core Principle: Maximize Existing Functionality

**ALWAYS check and use existing controllers, pages, and services before creating new ones.** This is the most important rule in EIS Framework development.

**Why?**
- Avoids redundant code
- Maintains consistency
- Reduces maintenance burden
- Leverages tested, built-in functionality

**Built-in Controllers:**
- `publicController` - Public pages (landing, home, about, pricing, features, contact)
- `authController` - Authentication (login, register, logout, password reset, impersonate)
- `googleAuthController` - Google OAuth integration
- `dashboardController` - Dashboard & profile pages
- `usersController` - User management
- `uploadController` - File uploads (images & files)

**Built-in Services:**
- `authService` - Authentication (login, register, password reset, OAuth, session management)
- `inertiaService` - Inertia.js integration
- `flashService` - Flash messages
- `etaService` - Eta template engine (SSR)
- `resendService` - Resend email provider
- `smtpService` - SMTP email transport
- `s3Service` - S3-compatible storage
- `storageService` - Local file storage
- `googleOauthService` - Google OAuth service
 

**Built-in Auth Pages:**
- `frontend/pages/auth/login.svelte` - Login page (customize according to design system)
- `frontend/pages/auth/register.svelte` - Registration page (customize according to design system)
- `frontend/pages/auth/forgot-password.svelte` - Forgot password (customize according to design system)
- `frontend/pages/auth/reset-password.svelte` - Reset password (customize according to design system)

**Note:** These pages should be customized in step 10 to match the design system from `workflow/ui-kit.html` and branding specifications from `workflow/PRD.md`.

**Built-in Migrations:**
- `0000_abnormal_sway.sql` - Users table (id [text], name, email, password, phone, role, timestamps)
- `0001_faithful_natasha_romanoff.sql` - Sessions table (id, user_id, token, expires_at, created_at)
- Additional migrations for assets, password reset tokens, etc.

**Rule:** If functionality exists, **use or modify** existing code instead of creating redundant controllers/services/middlewares/pages.


## Common Implementation Patterns

### File Upload Pattern

When a table needs a file field (e.g., `posts.thumbnail`, `users.avatar`), the field should store the **URL directly**, not the `asset_id`.

```typescript
// UploadController returns:
{
  success: true,
  data: {
    id: "uuid",
    type: "image",
    url: "https://example.com/assets/uuid.webp",  // ← Store this URL
    mime_type: "image/webp",
    name: "uuid.webp",
    size: 12345,
    user_id: 1,
    storage_key: "assets/uuid.webp",
    created_at: 1234567890,
    updated_at: 1234567890
  }
}
```

**Database Schema Example:**
```typescript
// backend/database/schema/index.ts
import { sqliteTable, text, integer } from 'drizzle-orm/sqlite-core'
import { sql } from 'drizzle-orm'

export const posts = sqliteTable('posts', {
  id: text('id').primaryKey(),
  title: text('title').notNull(),
  content: text('content').notNull(),
  thumbnail: text('thumbnail'),  // ← Store URL here, NOT asset_id
  userId: text('user_id').references(() => users.id, { onDelete: 'cascade' }),
  createdAt: integer('created_at', { mode: 'timestamp' })
    .notNull()
    .default(sql`(unixepoch())`),
  updatedAt: integer('updated_at', { mode: 'timestamp' })
    .notNull()
    .default(sql`(unixepoch())`)
})
```


**Example: Creating Post System**

1. **Check PROGRESS.md**: Find "Post system" in Phase 3
2. **Check existing files**:
   - Controller: `backend/controllers/post.controller.ts` (create if not exists)
   - Page: `frontend/pages/posts/index.svelte` (create if not exists)
   - Route: Check `backend/routes/web/` for `/posts` routes

3. **Create Controller** (following `skills/create-controller.md`):
```typescript
import { posts } from '../database/schema'
import db from '../database'
import { eq } from 'drizzle-orm'
import type { ControllerContext } from '../../types/controller.types'
import flash from '../services/flash.service'

export const postController = {
  async index(ctx: ControllerContext) {
    const posts = await db.query.posts.findMany({
      with: { user: true },
      orderBy: (posts, { desc }) => [desc(posts.createdAt)]
    })
    return ctx.inertia('posts/index', {
      auth: { user: ctx.user },
      posts
    })
  },

  async store(ctx: ControllerContext & { body: { title: string; content: string } }) {
    try {
      const { title, content } = ctx.body

      if (!title || title.length < 2) {
        flash.set(ctx.set, 'error', 'Title must be at least 2 characters')
        return Response.redirect('/posts/create', 303)
      }

      if (!content || content.length < 10) {
        flash.set(ctx.set, 'error', 'Content must be at least 10 characters')
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

4. **Create Pages** (following `skills/create-svelte-inertia-page.md` and `workflow/ui-kit.html`):

**Index Page** (`frontend/pages/posts/index.svelte`):
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

**Form Page** (`frontend/pages/posts/form.svelte`):
```svelte
<script>
  import { router } from '@inertiajs/svelte'
  import DashboardLayout from '@/components/DashboardLayout.svelte'
  let { flash, post } = $props()
  let isEdit = !!post
  let form = $state({
    title: post?.title || '',
    content: post?.content || ''
  })
  let isLoading = $state(false)

  function submitForm() {
    isLoading = true
    const url = isEdit ? `/posts/${post.id}` : '/posts'
    const method = isEdit ? router.put : router.post
    method(url, form, {
      onFinish: () => isLoading = false
    })
  }
</script>

<DashboardLayout title={isEdit ? 'Edit Post' : 'Buat Post'} subtitle={isEdit ? 'Edit post Anda' : 'Buat post baru'}>
  {#if flash?.error}
    <div class="p-4 bg-red-500/10 border border-red-500/20 rounded-lg mb-4">{flash.error}</div>
  {/if}

  <div class="bg-white rounded-lg p-8 shadow-sm border border-gray-100">
    <form onsubmit={(e) => { e.preventDefault(); submitForm(); }}>
      <div class="space-y-4">
        <div>
          <label class="block text-sm font-medium mb-2">Title</label>
          <input bind:value={form.title} type="text" class="w-full px-4 py-3 rounded-lg border focus:outline-none" placeholder="Enter title" required />
        </div>
        <div>
          <label class="block text-sm font-medium mb-2">Content</label>
          <textarea bind:value={form.content} rows="6" class="w-full px-4 py-3 rounded-lg border focus:outline-none" placeholder="Enter content" required></textarea>
        </div>
        <div class="flex gap-3">
          <a href="/posts" use:inertia class="flex-1 px-6 py-3 border border-gray-200 rounded-lg text-center">
            Batal
          </a>
          <button type="submit" disabled={isLoading} class="flex-1 px-6 py-3 bg-brand-600 text-white rounded-lg disabled:opacity-50">
            {#if isLoading}Saving...{:else}{isEdit ? 'Update' : 'Simpan'}{/if}
          </button>
        </div>
      </div>
    </form>
  </div>
</DashboardLayout>
```

5. **Add Routes** (in `backend/routes/web/`):
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

## Next Steps

Setelah project initialization selesai, lanjutkan dengan:
1. Implementasi fitur pertama sesuai `workflow/PROGRESS.md`
2. Gunakan `workflow/TASK_AGENT.md` untuk panduan implementasi fitur
3. Update `workflow/PROGRESS.md` setelah setiap fitur selesai