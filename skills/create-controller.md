# Controller Guide for AI

## Project-Specific Patterns

This guide is specific to the laju-elysia project using Inertia + Svelte + Drizzle ORM.

## Core Principles

1. **Use Inertia for authenticated routes** - `inertia('page', props)`
2. **Use view.render() for static HTML pages** - `view.render('page.html')`
3. **Flash pattern for errors** - `flash.set(set, 'error', message)` + `Response.redirect(url, 303)`
4. **Separate public/private methods** - Private methods (with `_`) only for:
   - Logic used from >1 public method (e.g., `_show()` called by both `show()` and `edit()`)
   - Complex logic (auth, hashing, token generation, business rules)
   - For simple CRUD single-use operations, use inline logic in public methods
5. **Use Drizzle ORM** - Import from `../database/schema` and use `db.query.table.find*()`
6. **Bun.randomUUIDv7() for IDs** - Use `Bun.randomUUIDv7()` for generating IDs
7. **Controllers are exported objects** - Not classes, use `export const controller = { ... }`
8. **Use Bun APIs** - Prefer Bun native APIs over Node.js APIs
9. **Manual validation in controllers** - Validate input at the beginning of each method before business logic
10. **Service layer for complex logic** - Move complex business logic to services (e.g., `authService`)
11. **Method naming conventions** - Use `get`/`post` prefixes for HTTP methods when appropriate
12. **SQLite .returning() support** - SQLite DOES support `.returning()` in Drizzle. Use it like PostgreSQL:
   ```typescript
   const [newUser] = await db.insert(users).values({ ... }).returning()
   ```

## Controller Structure

```typescript
import { table } from '../database/schema'
import db from '../database'
import { eq } from 'drizzle-orm'
import type { ControllerContext } from '../../types/controller.types'
import { flash } from '../services/flash.service'
import { view } from '../services/eta.service'

export const controllerName = {
  // Public methods (routes) - destructure directly, no ctx parameter
  async index({ inertia, user }: ControllerContext) { },
  async create({ inertia, user }: ControllerContext) { },
  async store({ body, set }: ControllerContext & { body: { name: string; email: string; password: string } }) { },
  async show({ inertia, user, params }: ControllerContext & { params: { id: string } }) { },
  async edit({ inertia, user, params }: ControllerContext & { params: { id: string } }) { },
  async update({ body, params, set }: ControllerContext & { params: { id: string }; body: { name?: string; email?: string } }) { },
  async delete({ params, set }: ControllerContext & { params: { id: string } }) { },

  // Private methods (business logic)
  async _show(id: string) { }
}
```

**Best Practice:** Always destructure parameters directly in the function signature (`{ inertia, user }`) instead of using `ctx` parameter. This makes the code cleaner and more explicit about what properties are being used.

## Method Patterns

### Static Page Rendering (no authentication)
```typescript
async landing() {
  return view.render('index.html')
}

async about() {
  return view.render('about.html')
}
```

### index() - List
```typescript
async index({ inertia, user }: ControllerContext) {
  const items = await db.query.table.findMany({
    columns: { password: false }
  })
  return inertia('items/index', {
    auth: { user },
    items
  })
}
```

### create() - Show Form
```typescript
async create({ inertia, user }: ControllerContext) {
  return inertia('items/create', {
    auth: { user }
  })
}
```

### store() - Create (302)
```typescript
async store({ body, set }: ControllerContext & { body: { name: string; email: string; password: string } }) {
  try {
    // Validate input
    const { name, email, password } = body

    if (!name || name.length < 2) {
      flash.set(set, 'error', 'Name must be at least 2 characters')
      return Response.redirect('/items/create', 303)
    }

    if (!email || !email.includes('@')) {
      flash.set(set, 'error', 'Invalid email')
      return Response.redirect('/items/create', 303)
    }

    if (!password || password.length < 8) {
      flash.set(set, 'error', 'Password must be at least 8 characters')
      return Response.redirect('/items/create', 303)
    }

    // Inline logic for single-use operation
    const hashedPassword = await Bun.password.hash(password)
    const [newItem] = await db
      .insert(table)
      .values({
        id: Bun.randomUUIDv7(),
        name,
        email,
        password: hashedPassword
      })
      .returning()

    flash.set(set, 'success', 'Item created successfully')
    set.headers['Content-Type'] = 'application/json'
    return Response.redirect('/items', 303)
  } catch (error: unknown) {
    flash.set(set, 'error', error instanceof Error ? error.message : 'Failed to create item')
    return Response.redirect('/items/create', 303)
  }
}
```

### show() - Single Resource
```typescript
async show({ inertia, user, params }: ControllerContext & { params: { id: string } }) {
  try {
    const item = await this._show(params.id)
    return inertia('items/show', {
      auth: { user },
      item
    })
  } catch (error: unknown) {
    return inertia('errors/404', {
      auth: { user },
      error: error instanceof Error ? error.message : 'Item not found'
    })
  }
}
```

### edit() - Show Edit Form
```typescript
async edit({ inertia, user, params }: ControllerContext & { params: { id: string } }) {
  try {
    const item = await this._show(params.id)
    return inertia('items/edit', {
      auth: { user },
      item
    })
  } catch (error: unknown) {
    return inertia('errors/404', {
      auth: { user },
      error: error instanceof Error ? error.message : 'Item not found'
    })
  }
}
```

### update() - Update (303)
```typescript
async update({ body, params, set }: ControllerContext & { params: { id: string }; body: { name?: string; email?: string } }) {
  try {
    // Inline logic for single-use operation
    const hashedPassword = body.password ? await Bun.password.hash(body.password) : undefined
    await db
      .update(table)
      .set({
        name: body.name,
        email: body.email,
        ...(hashedPassword && { password: hashedPassword })
      })
      .where(eq(table.id, params.id))

    flash.set(set, 'success', 'Item updated successfully')
    set.headers['Content-Type'] = 'application/json'
    return Response.redirect(`/items/${params.id}`, 303)
  } catch (error: unknown) {
    flash.set(set, 'error', error instanceof Error ? error.message : 'Failed to update item')
    return Response.redirect(`/items/${params.id}/edit`, 303)
  }
}
```

### delete() - Delete (303)
```typescript
async delete({ params, set }: ControllerContext & { params: { id: string } }) {
  try {
    // Inline logic for single-use operation
    await db.delete(table).where(eq(table.id, params.id))

    flash.set(set, 'success', 'Item deleted successfully')
    set.headers['Content-Type'] = 'application/json'
    return Response.redirect('/items', 303)
  } catch (error: unknown) {
    flash.set(set, 'error', error instanceof Error ? error.message : 'Failed to delete item')
    return Response.redirect('/items', 303)
  }
}
```

## Private Methods

### _show() - Used by both show() and edit()
```typescript
async _show(id: string) {
  const item = await db.query.table.findFirst({
    where: eq(table.id, id),
    columns: { password: false }
  })
  if (!item) throw new Error('Item not found')
  return item
}
```

## Validation Patterns

### Common Validations

```typescript
// Required field
if (!value) {
  flash.set(set, 'error', 'Field is required')
  return Response.redirect('/path', 303)
}

// String length
if (!value || value.length < 2) {
  flash.set(set, 'error', 'Must be at least 2 characters')
  return Response.redirect('/path', 303)
}

// Email format
if (!email || !email.includes('@')) {
  flash.set(set, 'error', 'Invalid email')
  return Response.redirect('/path', 303)
}

// Password minimum length
if (!password || password.length < 8) {
  flash.set(set, 'error', 'Password must be at least 8 characters')
  return Response.redirect('/path', 303)
}

// Password confirmation
if (password !== password_confirmation) {
  flash.set(set, 'error', 'Passwords do not match')
  return Response.redirect('/path', 303)
}
```

### Validation Order

1. Extract values from `body`
2. Validate each field
3. Return early with flash message if invalid
4. Continue to business logic if all valid

## Flash Message Pattern

```typescript
import { flash } from '../services/flash.service'

// Set flash message
flash.set(set, 'error', 'Error message')
flash.set(set, 'success', 'Success message')

// Redirect after setting flash
return Response.redirect('/path', 303)
```

## Common Imports

```typescript
import { table } from '../database/schema'
import db from '../database'
import { eq } from 'drizzle-orm'
import type { ControllerContext } from '../../types/controller.types'
import { flash } from '../services/flash.service'  // Named import
import { view } from '../services/eta.service'      // For static HTML pages
import authService from '../services/auth.service' // Default import for services
```

## Bun APIs Reference

| Purpose | API | Example |
|---------|-----|---------|
| UUID v7 | `Bun.randomUUIDv7()` | `const id = Bun.randomUUIDv7()` |
| Password hash | `Bun.password.hash()` | `await Bun.password.hash(password)` |
| Password verify | `Bun.password.verify()` | `await Bun.password.verify(password, hash)` |
| File read | `Bun.file().text()` | `await Bun.file(path).text()` |
| File write | `Bun.write()` | `await Bun.write(path, buffer)` |
| Crypto random | `crypto.randomUUID()` | `crypto.randomUUID()` |

## Method Naming Conventions

Use `get`/`post` prefixes for HTTP methods when appropriate:

```typescript
export const authController = {
  async getLogin({ inertia }: ControllerContext) {
    return inertia('auth/login', {})
  },

  async postLogin({ body, set, cookie }: ControllerContext & { body: LoginInput }) {
    // Handle login logic
    return Response.redirect('/home', 303)
  }
}
```

## API Response Patterns

For API endpoints that return JSON (not Inertia):

```typescript
async postImpersonate(ctx: ControllerContext & { body: { userId: string } }) {
  if (!ctx.user) {
    ctx.set.status = 401
    return { error: 'Unauthorized' }
  }

  if (ctx.user.role !== 'admin') {
    ctx.set.status = 403
    return { error: 'Admin only' }
  }

  try {
    const result = await authService.impersonate(ctx.body.userId)
    return Response.json({ user: result.user, token: result.token })
  } catch (error: unknown) {
    ctx.set.status = 400
    return { error: error instanceof Error ? error.message : 'Impersonation failed' }
  }
}
```

## Service Layer Pattern

For complex business logic, move it to services:

```typescript
import authService from '../services/auth.service'  // Default import for auth service
import flash from '../services/flash.service'       // Can also use default import

export const authController = {
  async postLogin({ body, set, cookie }: ControllerContext & { body: LoginInput }) {
    try {
      const { email, password } = body

      // Validate input first
      if (!email || !email.includes('@')) {
        flash.set(set, 'error', 'Invalid email')
        return Response.redirect('/login', 303)
      }

      if (!password || password.length < 1) {
        flash.set(set, 'error', 'Password is required')
        return Response.redirect('/login', 303)
      }

      const result = await authService.login(body)
      authService.setAuthCookie(result.token, cookie!)
      return Response.redirect('/home', 303)
    } catch (error: unknown) {
      flash.set(set, 'error', error instanceof Error ? error.message : 'Login failed')
      return Response.redirect('/login', 303)
    }
  }
}
```

## Cookie Handling Patterns

Use service methods for cookie management:

```typescript
// Set auth token cookie
authService.setAuthCookie(result.token, ctx.cookie!)

// Remove auth token cookie
authService.removeAuthCookie(ctx.cookie!)
```

The `authService.setAuthCookie()` method handles:
- Setting cookie value
- Making it httpOnly
- Setting path to '/'
- Setting maxAge to 30 days

## Quick Reference

| Method | Returns | Error Handling | Validation |
|--------|---------|----------------|------------|
| index | `inertia()` | `inertia('errors/404')` | N/A |
| create | `inertia()` | `inertia('errors/404')` | N/A |
| store | `Response.redirect()` | `flash.set()` + redirect | ✅ Manual validation |
| show | `inertia()` | `inertia('errors/404')` | N/A |
| edit | `inertia()` | `inertia('errors/404')` | N/A |
| update | `Response.redirect()` | `flash.set()` + redirect | ✅ Manual validation |
| delete | `Response.redirect()` | `flash.set()` + redirect | N/A |

---

## Controller Testing Guide

**IMPORTANT:** See `skills/testing-guide.md` for complete testing patterns and pitfalls.

### Test File Structure

```typescript
import { describe, test, expect, beforeEach, afterEach, vi } from 'bun:test'
import { controllerName } from '../../../backend/controllers/controller.controller'
import type { ControllerContext } from '../../../types/controller.types'
import db from '../../../backend/database'
import { users, sessions, passwordResetTokens } from '../../../backend/database/schema'

// Mock flash service (works because setup.ts doesn't import it)
vi.mock('../../../backend/services/flash.service', () => ({
  default: {
    set: vi.fn()
  }
}))

// ⚠️ DON'T mock database - vi.mock doesn't work reliably when setup.ts imports db first
// Use real database with cleanup instead

describe('Controller Name', () => {
  let mockContext: ControllerContext & { body: any; params: any }

  beforeEach(() => {
    mockContext = {
      user: { id: '1', name: 'Test User', email: 'test@example.com', role: 'user' },
      body: {},
      query: {},
      params: {},
      headers: {},
      set: { headers: {} },
      inertia: vi.fn(() => new Response()),
      request: new Request('http://localhost'),
      cookie: { auth_token: {} }  // Required for auth-related tests
    }
    vi.clearAllMocks()
  })

  // CRITICAL: Clean up database after each test
  afterEach(async () => {
    await db.delete(passwordResetTokens)
    await db.delete(sessions)
    await db.delete(users)
  })

  // Tests go here...
})
```

### Testing Patterns

#### Pattern 1: Test Inertia Page Rendering

```typescript
describe('index', () => {
  test('should render index page', async () => {
    await controller.index(mockContext)

    expect(mockContext.inertia).toHaveBeenCalledWith('items/index', {
      auth: { user: mockContext.user },
      items: expect.any(Array)
    })
  })
})
```

#### Pattern 2: Test Validation Errors

```typescript
describe('store', () => {
  test('should validate name length', async () => {
    mockContext.body = {
      name: 'A',  // Too short
      email: 'test@example.com',
      password: 'password123'
    }

    const result = await controller.store(mockContext)

    expect(result).toBeInstanceOf(Response)
    expect(result.status).toBe(303)
  })

  test('should validate email format', async () => {
    mockContext.body = {
      name: 'Test User',
      email: 'invalid-email',  // Missing @
      password: 'password123'
    }

    const result = await controller.store(mockContext)

    expect(result).toBeInstanceOf(Response)
    expect(result.status).toBe(303)
  })
})
```

#### Pattern 3: Test Successful Operations

```typescript
test('should create item successfully and redirect', async () => {
  mockContext.body = {
    name: 'Test User',
    email: 'test@example.com',
    password: 'password123'
  }

  const result = await controller.store(mockContext)

  expect(result).toBeInstanceOf(Response)
  expect(result.status).toBe(303)
  expect(result.headers.get('Location')).toBe('/items')
})
```

#### Pattern 4: Test with Database Data (show/edit)

```typescript
describe('show', () => {
  test('should render show page', async () => {
    // Create test data first
    const testId = 'test-id-show'
    await db.insert(users).values({
      id: testId,
      name: 'Test User',
      email: 'show@example.com',
      password: 'hashed_password'
    })

    mockContext.params = { id: testId }

    await controller.show(mockContext)

    expect(mockContext.inertia).toHaveBeenCalledWith('items/show', {
      auth: { user: mockContext.user },
      item: expect.any(Object)
    })
  })

  test('should render 404 page if not found', async () => {
    mockContext.params = { id: 'nonexistent' }

    await controller.show(mockContext)

    expect(mockContext.inertia).toHaveBeenCalledWith('errors/404', {
      auth: { user: mockContext.user },
      error: 'Item not found'
    })
  })
})
```

#### Pattern 5: Test with Service Mocks (Auth Controller)

For controllers that use services (like authService), mock the service:

```typescript
// Mock auth service (works because setup.ts doesn't import it directly)
vi.mock('../../../backend/services/auth.service', () => ({
  default: {
    login: vi.fn(),
    register: vi.fn(),
    logout: vi.fn(),
    setAuthCookie: vi.fn(),
    removeAuthCookie: vi.fn(),
    getSessionUser: vi.fn()
  }
}))

describe('postLogin', () => {
  test('should login successfully with valid credentials', async () => {
    const authService = (await import('../../../backend/services/auth.service')).default
    mockContext.body = {
      email: 'test@example.com',
      password: 'password123'
    }
    mockContext.cookie = { auth_token: {} }  // Ensure cookie is initialized

    authService.login = vi.fn().mockResolvedValue({
      user: { id: '1', email: 'test@example.com', name: 'Test User' },
      token: 'test-token'
    })

    const result = await authController.postLogin(mockContext)

    expect(authService.login).toHaveBeenCalledWith(mockContext.body)
    expect(result.status).toBe(303)
    expect(result.headers.get('Location')).toBe('/home')
  })
})
```

### Critical Testing Rules

1. **DON'T mock database with vi.mock** - It doesn't work when setup.ts imports db first
2. **DO use real database with afterEach cleanup** - Prevents state leaking
3. **DO mock services NOT imported by setup.ts** - flash.service, auth.service work
4. **DO create test data in tests that need it** - For show/edit tests
5. **DO use vi.clearAllMocks() in beforeEach** - Reset mock state
6. **DO delete in correct order** - Child tables first (passwordResetTokens → sessions → users)
7. **DO initialize cookie object** - `cookie: { auth_token: {} }` for auth-related tests

### Test Checklist

- [ ] Import from `bun:test` (not vitest)
- [ ] Mock flash.service with vi.mock
- [ ] DON'T mock database - use real db with cleanup
- [ ] Add afterEach to clean database (delete in correct order: passwordResetTokens → sessions → users)
- [ ] Create mockContext with all required fields including `cookie: { auth_token: {} }`
- [ ] Test validation errors (name, email, password)
- [ ] Test successful operations
- [ ] Test 404 cases for show/edit
- [ ] Create test data for tests that need existing records
- [ ] Use `vi.clearAllMocks()` in beforeEach