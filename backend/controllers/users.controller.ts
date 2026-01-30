import getDb from '../database'
import { flash } from '../services/flash.service'
import authService from '../services/auth.service'
import { uuidv7 } from 'uuidv7'
import type { ControllerContext } from '../../types/controller.types'
 

export const usersController = {
  async index({ inertia, user }: ControllerContext) {
    const allUsers = await getDb()
      .selectFrom('users')
      .selectAll()
      .where('password', 'is not', null)
      .execute()
    return inertia('users/index', {
      auth: { user },
      users: allUsers
    })
  },

  async create({ inertia, user }: ControllerContext) {
    return inertia('users/create', {
      auth: { user }
    })
  },

  async store({ body, set }: ControllerContext & { body: { name: string; email: string; password: string } }) {
    try {
      const { name, email, password } = body

      if (!name || name.length < 2) {
        flash.set(set, 'error', 'Name must be at least 2 characters')
        return Response.redirect('/users/create', 303)
      }

      if (!email || !email.includes('@')) {
        flash.set(set, 'error', 'Invalid email')
        return Response.redirect('/users/create', 303)
      }

      if (!password || password.length < 8) {
        flash.set(set, 'error', 'Password must be at least 8 characters')
        return Response.redirect('/users/create', 303)
      }

      // Inline logic for single-use operation
      const hashedPassword = await authService.hashPassword(password)
      await getDb()
        .insertInto('users')
        .values({
          id: uuidv7(),
          name,
          email,
          password: hashedPassword,
          role: 'user'
        })
        .execute()

      flash.set(set, 'success', 'User created successfully')
      set.headers['Content-Type'] = 'application/json'
      return Response.redirect('/users', 303)
    } catch (error: unknown) {
      flash.set(set, 'error', error instanceof Error ? error.message : 'Failed to create user')
      return Response.redirect('/users/create', 303)
    }
  },

  async show({ inertia, user, params }: ControllerContext & { params: { id: string } }) {
    try {
      const targetUser = await this._show(params.id)
      return inertia('users/show', {
        auth: { user },
        user: targetUser
      })
    } catch (error: unknown) {
      return inertia('errors/404', {
        auth: { user },
        error: error instanceof Error ? error.message : 'User not found'
      })
    }
  },

  async edit({ inertia, user, params }: ControllerContext & { params: { id: string } }) {
    try {
      const targetUser = await this._show(params.id)
      return inertia('users/edit', {
        auth: { user },
        user: targetUser
      })
    } catch (error: unknown) {
      return inertia('errors/404', {
        auth: { user },
        error: error instanceof Error ? error.message : 'User not found'
      })
    }
  },

  async update({ body, params, set }: ControllerContext & { params: { id: string }; body: { name?: string; email?: string; password?: string } }) {
    try {
      // Inline logic for single-use operation
      const hashedPassword = body.password ? await authService.hashPassword(body.password) : undefined
      await getDb()
        .updateTable('users')
        .set({
          name: body.name,
          email: body.email,
          ...(hashedPassword && { password: hashedPassword })
        })
        .where('id', '=', params.id)
        .execute()

      flash.set(set, 'success', 'User updated successfully')
      set.headers['Content-Type'] = 'application/json'
      return Response.redirect(`/users/${params.id}`, 303)
    } catch (error: unknown) {
      flash.set(set, 'error', error instanceof Error ? error.message : 'Failed to update user')
      return Response.redirect(`/users/${params.id}/edit`, 303)
    }
  },

  async delete({ params, set }: ControllerContext & { params: { id: string } }) {
    try {
      // Inline logic for single-use operation
      await getDb()
        .deleteFrom('users')
        .where('id', '=', params.id)
        .execute()

      flash.set(set, 'success', 'User deleted successfully')
      set.headers['Content-Type'] = 'application/json'
      return Response.redirect('/users', 303)
    } catch (error: unknown) {
      flash.set(set, 'error', error instanceof Error ? error.message : 'Failed to delete user')
      return Response.redirect('/users', 303)
    }
  },

  // Private methods for business logic
  async _show(id: string) {
    const user = await getDb()
      .selectFrom('users')
      .selectAll()
      .where('id', '=', id)
      .executeTakeFirst()
    if (!user) throw new Error('User not found')
    return user
  }
}
