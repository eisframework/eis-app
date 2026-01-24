# Controller Guide for AI

## Project-Specific Patterns

This guide is specific to the laju-elysia project using Inertia + Svelte + Drizzle ORM.

## Core Principles

1. **Use Inertia for all authenticated routes** - `ctx.inertia('page', props)`
2. **Flash pattern for errors** - `flash.set(ctx.set, type, message)` + `Response.redirect(url, 303)`
3. **Separate public/private methods** - Private methods (with `_`) only for:
   - Complex logic (auth, hashing, token generation)
   - Code reusable from multiple places
   - For simple CRUD, use inline logic in public methods
4. **Use Drizzle ORM** - Import from `../database/schema` and use `db.query.table.find*()`
5. **UUIDv7 for IDs** - Use `uuidv7()` for generating IDs
6. **Controllers are exported objects** - Not classes, use `export const controller = { ... }`

## Controller Structure

```typescript
import { table } from '../database/schema'
import db from '../database'
import { eq } from 'drizzle-orm'
import { hashPassword } from '../utils/hash.util'
import type { ControllerContext } from '../../types/controller.types'
import { uuidv7 } from 'uuidv7'
import flash from '../services/flash.service'

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
  async _store(body: InputType) { },
  async _update(id: string, body: InputType) { },
  async _delete(id: string) { }
}
```

## Method Patterns

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
async store(ctx: ControllerContext & { body: { name: string; email: string } }) {
  try {
    const newItem = await this._store(ctx.body)
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
    await this._update(ctx.params.id, ctx.body)
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
    await this._delete(ctx.params.id)
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

### _store()
```typescript
async _store(body: { name: string; email: string; password: string }) {
  const hashedPassword = await hashPassword(body.password)
  const [newItem] = await db
    .insert(table)
    .values({
      id: uuidv7(),
      name: body.name,
      email: body.email,
      password: hashedPassword
    })
    .returning()
  return newItem
}
```

### _show()
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

### _update()
```typescript
async _update(id: string, body: { name?: string; email?: string; password?: string }) {
  const hashedPassword = body.password ? await hashPassword(body.password) : undefined
  await db
    .update(table)
    .set({
      name: body.name,
      email: body.email,
      ...(hashedPassword && { password: hashedPassword })
    })
    .where(eq(table.id, id))
}
```

### _delete()
```typescript
async _delete(id: string) {
  await db.delete(table).where(eq(table.id, id))
}
```

## Flash Message Pattern

```typescript
import flash from '../services/flash.service'

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
import { hashPassword, verifyPassword } from '../utils/hash.util'
import { generateToken } from '../utils/token.util'
import type { ControllerContext } from '../../types/controller.types'
import { uuidv7 } from 'uuidv7'
import flash from '../services/flash.service'
```

## Quick Reference

| Method | Returns | Error Handling |
|--------|---------|----------------|
| index | `ctx.inertia()` | `ctx.inertia('errors/404')` |
| create | `ctx.inertia()` | `ctx.inertia('errors/404')` |
| store | `Response.redirect()` | `flash.set()` + redirect |
| show | `ctx.inertia()` | `ctx.inertia('errors/404')` |
| edit | `ctx.inertia()` | `ctx.inertia('errors/404')` |
| update | `Response.redirect()` | `flash.set()` + redirect |
| delete | `Response.redirect()` | `flash.set()` + redirect |

## Auth Token Pattern (for login/register)

```typescript
// Set auth token cookie
ctx.cookie!.auth_token.value = result.token
ctx.cookie!.auth_token.httpOnly = true
ctx.cookie!.auth_token.path = '/'
ctx.cookie!.auth_token.maxAge = 60 * 60 * 24 * 30
```