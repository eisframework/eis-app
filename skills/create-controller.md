# Controller Guide for AI

## Project-Specific Patterns

This guide is specific to the laju-elysia project using Inertia + Svelte + Drizzle ORM.

## Core Principles

1. **Use Inertia for authenticated routes** - `ctx.inertia('page', props)`
2. **Use view.render() for static HTML pages** - `view.render('page.html')`
3. **Flash pattern for errors** - `flash.set(ctx.set, type, message)` + `Response.redirect(url, 303)`
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

## Controller Structure

```typescript
import { table } from '../database/schema'
import db from '../database'
import { eq } from 'drizzle-orm'
import type { ControllerContext } from '../../types/controller.types'
import { flash } from '../services/flash.service'
import { view } from '../services/eta.service'

export const controllerName = {
  // Public methods (routes)
  async index(ctx: ControllerContext) { },
  async create(ctx: ControllerContext) { },
  async store(ctx: ControllerContext & { body: InputType }) { },
  async show(ctx: ControllerContext & { params: { id: string } }) { },
  async edit(ctx: ControllerContext & { params: { id: string } }) { },
  async update(ctx: ControllerContext & { params: { id: string }; body: InputType }) { },
  async delete(ctx: ControllerContext & { params: { id: string } }) { },

  // Private methods (business logic)
  async _show(id: string) { }
}
```

## Method Patterns

### Static Page Rendering (no authentication)
```typescript
async landing() {
  return view.render('index.html')
}

async about(ctx: ControllerContext) {
  return view.render('about.html')
}
```

### index() - List
```typescript
async index(ctx: ControllerContext) {
  const items = await db.query.table.findMany({
    columns: { password: false }
  })
  return ctx.inertia('items/index', {
    auth: { user: ctx.user },
    items
  })
}
```

### create() - Show Form
```typescript
async create(ctx: ControllerContext) {
  return ctx.inertia('items/create', {
    auth: { user: ctx.user }
  })
}
```

### store() - Create (302)
```typescript
async store(ctx: ControllerContext & { body: { name: string; email: string; password: string } }) {
  try {
    // Validate input
    const { name, email, password } = ctx.body

    if (!name || name.length < 2) {
      flash.set(ctx.set, 'error', 'Name must be at least 2 characters')
      return Response.redirect('/items/create', 303)
    }

    if (!email || !email.includes('@')) {
      flash.set(ctx.set, 'error', 'Invalid email')
      return Response.redirect('/items/create', 303)
    }

    if (!password || password.length < 8) {
      flash.set(ctx.set, 'error', 'Password must be at least 8 characters')
      return Response.redirect('/items/create', 303)
    }

    // Inline logic for single-use operation
    const hashedPassword = await Bun.password.hash(password)
    await db
      .insert(table)
      .values({
        id: Bun.randomUUIDv7(),
        name,
        email,
        password: hashedPassword
      })

    flash.set(ctx.set, 'success', 'Item created successfully')
    ctx.set.headers['Content-Type'] = 'application/json'
    return Response.redirect('/items', 303)
  } catch (error: unknown) {
    flash.set(ctx.set, 'error', error instanceof Error ? error.message : 'Failed to create item')
    return Response.redirect('/items/create', 303)
  }
}
```

### show() - Single Resource
```typescript
async show(ctx: ControllerContext & { params: { id: string } }) {
  try {
    const item = await this._show(ctx.params.id)
    return ctx.inertia('items/show', {
      auth: { user: ctx.user },
      item
    })
  } catch (error: unknown) {
    return ctx.inertia('errors/404', {
      auth: { user: ctx.user },
      error: error instanceof Error ? error.message : 'Item not found'
    })
  }
}
```

### edit() - Show Edit Form
```typescript
async edit(ctx: ControllerContext & { params: { id: string } }) {
  try {
    const item = await this._show(ctx.params.id)
    return ctx.inertia('items/edit', {
      auth: { user: ctx.user },
      item
    })
  } catch (error: unknown) {
    return ctx.inertia('errors/404', {
      auth: { user: ctx.user },
      error: error instanceof Error ? error.message : 'Item not found'
    })
  }
}
```

### update() - Update (303)
```typescript
async update(ctx: ControllerContext & { params: { id: string }; body: { name?: string; email?: string } }) {
  try {
    // Inline logic for single-use operation
    const hashedPassword = ctx.body.password ? await Bun.password.hash(ctx.body.password) : undefined
    await db
      .update(table)
      .set({
        name: ctx.body.name,
        email: ctx.body.email,
        ...(hashedPassword && { password: hashedPassword })
      })
      .where(eq(table.id, ctx.params.id))

    flash.set(ctx.set, 'success', 'Item updated successfully')
    ctx.set.headers['Content-Type'] = 'application/json'
    return Response.redirect(`/items/${ctx.params.id}`, 303)
  } catch (error: unknown) {
    flash.set(ctx.set, 'error', error instanceof Error ? error.message : 'Failed to update item')
    return Response.redirect(`/items/${ctx.params.id}/edit`, 303)
  }
}
```

### delete() - Delete (303)
```typescript
async delete(ctx: ControllerContext & { params: { id: string } }) {
  try {
    // Inline logic for single-use operation
    await db.delete(table).where(eq(table.id, ctx.params.id))

    flash.set(ctx.set, 'success', 'Item deleted successfully')
    ctx.set.headers['Content-Type'] = 'application/json'
    return Response.redirect('/items', 303)
  } catch (error: unknown) {
    flash.set(ctx.set, 'error', error instanceof Error ? error.message : 'Failed to delete item')
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
  flash.set(ctx.set, 'error', 'Field is required')
  return Response.redirect('/path', 303)
}

// String length
if (!value || value.length < 2) {
  flash.set(ctx.set, 'error', 'Must be at least 2 characters')
  return Response.redirect('/path', 303)
}

// Email format
if (!email || !email.includes('@')) {
  flash.set(ctx.set, 'error', 'Invalid email')
  return Response.redirect('/path', 303)
}

// Password minimum length
if (!password || password.length < 8) {
  flash.set(ctx.set, 'error', 'Password must be at least 8 characters')
  return Response.redirect('/path', 303)
}

// Password confirmation
if (password !== password_confirmation) {
  flash.set(ctx.set, 'error', 'Passwords do not match')
  return Response.redirect('/path', 303)
}
```

### Validation Order

1. Extract values from `ctx.body`
2. Validate each field
3. Return early with flash message if invalid
4. Continue to business logic if all valid

## Flash Message Pattern

```typescript
import { flash } from '../services/flash.service'

// Set flash message
flash.set(ctx.set, 'error', 'Error message')
flash.set(ctx.set, 'success', 'Success message')

// Redirect after setting flash
return Response.redirect('/path', 303)
```

## Common Imports

```typescript
import { table } from '../database/schema'
import db from '../database'
import { eq } from 'drizzle-orm'
import type { ControllerContext } from '../../types/controller.types'
import { flash } from '../services/flash.service'
import { view } from '../services/eta.service'
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
  async getLogin(ctx: ControllerContext) {
    return ctx.inertia('auth/login', {})
  },

  async postLogin(ctx: ControllerContext & { body: LoginInput }) {
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
import authService from '../services/auth.service'

export const authController = {
  async postLogin(ctx: ControllerContext & { body: LoginInput }) {
    try {
      const result = await authService.login(ctx.body)
      authService.setAuthCookie(result.token, ctx.cookie!)
      return Response.redirect('/home', 303)
    } catch (error: unknown) {
      flash.set(ctx.set, 'error', error instanceof Error ? error.message : 'Login failed')
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
| index | `ctx.inertia()` | `ctx.inertia('errors/404')` | N/A |
| create | `ctx.inertia()` | `ctx.inertia('errors/404')` | N/A |
| store | `Response.redirect()` | `flash.set()` + redirect | ✅ Manual validation |
| show | `ctx.inertia()` | `ctx.inertia('errors/404')` | N/A |
| edit | `ctx.inertia()` | `ctx.inertia('errors/404')` | N/A |
| update | `Response.redirect()` | `flash.set()` + redirect | ✅ Manual validation |
| delete | `Response.redirect()` | `flash.set()` + redirect | N/A |