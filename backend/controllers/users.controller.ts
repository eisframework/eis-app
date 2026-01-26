import { users } from '../database/schema'
import db from '../database'
import { eq } from 'drizzle-orm'
import { flash } from '../services/flash.service'
import type { ControllerContext } from '../../types/controller.types'
 

export const usersController = {
  async index(ctx: ControllerContext) {
    const allUsers = await db.query.users.findMany({
      columns: {
        password: false
      }
    })
    return ctx.inertia('users/index', {
      auth: { user: ctx.user },
      users: allUsers
    })
  },

  async create(ctx: ControllerContext) {
    return ctx.inertia('users/create', {
      auth: { user: ctx.user }
    })
  },

  async store(ctx: ControllerContext & { body: { name: string; email: string; password: string } }) {
    try {
      const { name, email, password } = ctx.body

      if (!name || name.length < 2) {
        flash.set(ctx.set, 'error', 'Name must be at least 2 characters')
        return Response.redirect('/users/create', 303)
      }

      if (!email || !email.includes('@')) {
        flash.set(ctx.set, 'error', 'Invalid email')
        return Response.redirect('/users/create', 303)
      }

      if (!password || password.length < 8) {
        flash.set(ctx.set, 'error', 'Password must be at least 8 characters')
        return Response.redirect('/users/create', 303)
      }

      // Inline logic for single-use operation
      const hashedPassword = await Bun.password.hash(password)
      await db
        .insert(users)
        .values({
          id: Bun.randomUUIDv7(),
          name,
          email,
          password: hashedPassword
        })

      flash.set(ctx.set, 'success', 'User created successfully')
      ctx.set.headers['Content-Type'] = 'application/json'
      return Response.redirect('/users', 303)
    } catch (error: unknown) {
      flash.set(ctx.set, 'error', error instanceof Error ? error.message : 'Failed to create user')
      return Response.redirect('/users/create', 303)
    }
  },

  async show(ctx: ControllerContext & { params: { id: string } }) {
    try {
      const targetUser = await this._show(ctx.params.id)
      return ctx.inertia('users/show', {
        auth: { user: ctx.user },
        user: targetUser
      })
    } catch (error: unknown) {
      return ctx.inertia('errors/404', {
        auth: { user: ctx.user },
        error: error instanceof Error ? error.message : 'User not found'
      })
    }
  },

  async edit(ctx: ControllerContext & { params: { id: string } }) {
    try {
      const targetUser = await this._show(ctx.params.id)
      return ctx.inertia('users/edit', {
        auth: { user: ctx.user },
        user: targetUser
      })
    } catch (error: unknown) {
      return ctx.inertia('errors/404', {
        auth: { user: ctx.user },
        error: error instanceof Error ? error.message : 'User not found'
      })
    }
  },

  async update(ctx: ControllerContext & { params: { id: string }; body: { name?: string; email?: string; password?: string } }) {
    try {
      // Inline logic for single-use operation
      const hashedPassword = ctx.body.password ? await Bun.password.hash(ctx.body.password) : undefined
      await db
        .update(users)
        .set({
          name: ctx.body.name,
          email: ctx.body.email,
          ...(hashedPassword && { password: hashedPassword })
        })
        .where(eq(users.id, ctx.params.id))

      flash.set(ctx.set, 'success', 'User updated successfully')
      ctx.set.headers['Content-Type'] = 'application/json'
      return Response.redirect(`/users/${ctx.params.id}`, 303)
    } catch (error: unknown) {
      flash.set(ctx.set, 'error', error instanceof Error ? error.message : 'Failed to update user')
      return Response.redirect(`/users/${ctx.params.id}/edit`, 303)
    }
  },

  async delete(ctx: ControllerContext & { params: { id: string } }) {
    try {
      // Inline logic for single-use operation
      await db.delete(users).where(eq(users.id, ctx.params.id))

      flash.set(ctx.set, 'success', 'User deleted successfully')
      ctx.set.headers['Content-Type'] = 'application/json'
      return Response.redirect('/users', 303)
    } catch (error: unknown) {
      flash.set(ctx.set, 'error', error instanceof Error ? error.message : 'Failed to delete user')
      return Response.redirect('/users', 303)
    }
  },

  // Private methods for business logic
  async _show(id: string) {
    const user = await db.query.users.findFirst({
      where: eq(users.id, id),
      columns: {
        password: false
      }
    })
    if (!user) throw new Error('User not found')
    return user
  }
}
