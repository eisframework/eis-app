# FAQ - Frequently Asked Questions

## General

### What is EIS Framework?

EIS (Elysia Inertia Svelte) is a full-stack framework that combines:
- **Elysia** - Fast backend server on Bun runtime
- **Inertia.js** - SPA-like experience without building a separate API
- **Svelte 5** - Modern reactive frontend with runes
- **Drizzle ORM** - Type-safe database queries

### Why use EIS Framework?

- **Fast Development** - Built-in controllers, services, and patterns
- **Type-Safe** - TypeScript throughout, Drizzle ORM for database
- **Modern** - Svelte 5, Inertia.js v2, Bun runtime
- **No API Needed** - Inertia.js handles data sharing between backend and frontend
- **Batteries Included** - Auth, OAuth, email, storage, and more

### What's the difference between EIS and traditional frameworks?

Traditional frameworks (Laravel, Express, etc.) often require:
- Building separate REST APIs
- Managing API client code
- Handling API versioning

EIS Framework:
- Uses Inertia.js to share data directly
- No separate API layer needed
- Pages receive props from controllers
- SPA-like experience with server-side rendering

## Getting Started

### How do I add a new page?

1. Create controller method in `backend/controllers/`
2. Add route in `backend/routes/web/`
3. Create page in `frontend/pages/`
4. Visit the URL

See `skills/create-svelte-inertia-page.md` for detailed guide.

### How do I create a controller?

1. Create file in `backend/controllers/` (e.g., `post.controller.ts`)
2. Export object with methods:
```typescript
export const postController = {
  async index(ctx: ControllerContext) { },
  async store(ctx: ControllerContext & { body: any }) { }
}
```

See `skills/create-controller.md` for detailed guide.

### How do I add database fields?

1. Edit `backend/database/schema/index.ts`
2. Run `bun run db:generate` (generates migration)
3. Run `bun run db:migrate` (runs migration)

## Development

### Where do I start?

1. Read `docs/GETTING_STARTED.md`
2. Check `docs/ARCHITECTURE.md` for project structure
3. Look at existing controllers/pages for examples
4. Use `docs/QUICK_REFERENCE.md` for quick lookup

### How do I run the dev server?

```bash
bun run dev
```

Server runs on `http://localhost:3000`

### How do I run tests?

```bash
bun run test:run    # Run all tests
bun run test:ui     # Run tests with UI
bun run test:coverage  # Run tests with coverage
```

### How do I debug?

- Use `console.log()` in controllers
- Check browser console for errors
- Use `bun run dev:ui` for dev server UI
- Check network tab for Inertia requests

## Database

### How do I query the database?

Using Drizzle ORM:

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

### How do I add a new table?

1. Add table definition in `backend/database/schema/index.ts`
2. Run `bun run db:generate`
3. Run `bun run db:migrate`

### How do I reset the database?

```bash
rm storage/database.sqlite
bun run db:migrate
```

## Authentication

### How does authentication work?

1. User logs in → `authController.login()` creates session
2. Token stored in `auth_token` cookie
3. Middleware validates token on protected routes
4. User passed to controller as `ctx.user`

### How do I protect routes?

Add auth middleware in route definition:

```typescript
.derive(async ({ cookie }) => {
  const token = (cookie?.auth_token?.value as string) || ''
  const user = await authService.getSessionUser(token)
  if (!user) throw new Error('Unauthorized')
  return { user }
})
```

### How do I get the current user?

In controller: `ctx.user`
In page: `auth.user` (from props)

## Frontend

### How do I use Inertia navigation?

```svelte
<!-- Links -->
<a href="/posts" use:inertia>View Posts</a>

<!-- Form submission -->
<script>
  import { router } from '@inertiajs/svelte'
  let form = $state({ title: '', content: '' })

  function submitForm() {
    router.post('/posts', form)
  }
</script>

<!-- Update & Delete -->
<button onclick={() => router.put(`/posts/${id}`, data)}>Update</button>
<button onclick={() => router.delete(`/posts/${id}`)}>Delete</button>
```

### How do I display flash messages?

```svelte
{#if flash?.error}
  <div class="p-4 bg-red-500/10 border border-red-500/20 rounded-lg">{flash.error}</div>
{/if}
{#if flash?.success}
  <div class="p-4 bg-green-500/10 border border-green-500/20 rounded-lg">{flash.success}</div>
{/if}
```

### How do I use icons?

Using Lucide Icons:

```svelte
<script>
  import { Plus, Edit, Trash2 } from 'lucide-svelte'
</script>

<Plus class="w-4 h-4" />
<Edit class="w-5 h-5" />
<Trash2 class="w-6 h-6" />
```

## Common Issues

### "Module not found" error

- Check import paths
- Ensure file exists
- Use correct extension (.ts, .svelte)

### "Cannot read property" error

- Check if data is passed from controller
- Use optional chaining `data?.property`
- Verify props are destructured correctly

### Flash message not showing

- Ensure `flash` prop is received in page
- Check if `flash.set()` is called with correct parameters
- Verify redirect happens after setting flash

### Route not found

- Check route is registered in `backend/routes/web/`
- Verify route is imported in `backend/routes/index.ts`
- Check URL path matches route definition

### Page not rendering

- Check if page exists in `frontend/pages/`
- Verify controller returns Inertia response
- Check browser console for errors
- Ensure props are passed correctly

### Data not showing in page

- Check if data is passed from controller
- Verify props are destructured: `let { data } = $props()`
- Use optional chaining: `data?.property`

## Deployment

### How do I deploy to production?

1. Build: `bun run build`
2. Set environment variables in `.env.production`
3. Deploy to Vercel/Netlify
4. Run migrations: `bun run db:migrate`

### What environment variables do I need?

```env
PORT=3000
NODE_ENV=production
DATABASE_URL=file:./storage/database.sqlite
GOOGLE_CLIENT_ID=your_client_id
GOOGLE_REDIRECT_URI=https://yourdomain.com/auth/google/callback
RESEND_API_KEY=your_resend_api_key
S3_ACCESS_KEY=your_access_key
S3_SECRET_KEY=your_secret_key
S3_BUCKET=your_bucket
S3_REGION=us-east-1
```

## Best Practices

### Should I use built-in services?

Yes! Always check if a built-in service exists before creating new ones:
- `authService` - Session management
- `inertiaService` - Inertia.js integration
- `flashService` - Flash messages
- `resendService` / `smtpService` - Email
- `s3Service` / `storageService` - File storage

### How should I name controllers?

Use camelCase for imports:
- File: `post.controller.ts`
- Import: `postController`

### How should I name services?

Use camelCase for imports:
- File: `google-oauth.service.ts`
- Import: `googleOauthService`

### Should I validate input?

Yes! Always validate at the start of controller methods:

```typescript
if (!title || title.length < 2) {
  flash.set(ctx.set, 'error', 'Title must be at least 2 characters')
  return Response.redirect('/posts/create', 303)
}
```

### Should I write tests?

Yes! Write tests for:
- Controller methods
- Service methods
- Critical user flows

See `docs/TESTING.md` for testing guide.

## Resources

### Documentation

- [Architecture](ARCHITECTURE.md)
- [Getting Started](GETTING_STARTED.md)
- [Quick Reference](QUICK_REFERENCE.md)
- [Testing](TESTING.md)

### Skills

- [Create Controller](../skills/create-controller.md)
- [Create Svelte Inertia Page](../skills/create-svelte-inertia-page.md)
- [Eta Template Engine SSR](../skills/eta-template-engine-ssr.md)

### Workflow

- [INIT_AGENT](../workflow/INIT_AGENT.md)
- [TASK_AGENT](../workflow/TASK_AGENT.md)
- [MANAGER_AGENT](../workflow/MANAGER_AGENT.md)

## Support

### Where can I get help?

- Check this FAQ
- Read documentation in `docs/`
- Look at examples in existing controllers/pages
- Check `skills/` for implementation guides

### How do I report issues?

Check if the issue is:
1. A bug - Report with steps to reproduce
2. A feature request - Suggest implementation
3. Documentation issue - Point out what's unclear

## Advanced

### Can I use SSR?

Yes! Use Eta template engine for SSR:

```typescript
import etaService from '../services/eta.service'

const html = await etaService.render('template.html', data)
```

See `skills/eta-template-engine-ssr.md` for details.

### Can I use external APIs?

Yes! Use `fetch()` or create a service:

```typescript
const response = await fetch('https://api.example.com/data')
const data = await response.json()
```

### Can I use WebSockets?

Yes! Elysia supports WebSockets. Add WebSocket plugin to your app.

### Can I use other databases?

Yes! Drizzle ORM supports PostgreSQL, MySQL, and more. Update `drizzle.config.ts` and schema.

### Can I use other icon libraries?

Lucide Icons is the default, but you can use any icon library. Just install and import.

### Can I customize the layout?

Yes! Create your own layout component or modify `DashboardLayout.svelte` in `frontend/components/`.