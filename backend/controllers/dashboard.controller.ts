import authService from '../services/auth.service'
import type { ControllerContext, UpdateProfileBody } from '../../types/controller.types'
import flash from '../services/flash.service'

export const dashboardController = {
  async index(ctx: ControllerContext) {
    const token = (ctx.cookie?.auth_token?.value as string) || ''
    const user = await authService.getSessionUser(token)
    return ctx.inertia('home', {
      auth: { user }
    })
  },

  async dashboard(ctx: ControllerContext) {
    return ctx.inertia('dashboard', {
      auth: { user: ctx.user }
    })
  },

  async profile(ctx: ControllerContext) {
    return ctx.inertia('profile', {
      auth: { user: ctx.user }
    })
  },

  async updateProfile(ctx: ControllerContext & { body: UpdateProfileBody }) {
    try {
      await this._updateProfile(ctx.body)
      flash.set(ctx.set, 'success', 'Profile updated successfully')
      ctx.set.headers['Content-Type'] = 'application/json'
      return Response.redirect('/profile', 303)
    } catch (error: unknown) {
      flash.set(ctx.set, 'error', error instanceof Error ? error.message : 'Failed to update profile')
      return Response.redirect('/profile', 303)
    }
  },

  async _updateProfile(body: UpdateProfileBody) {
    // TODO: Implement profile update logic
    // - Update name/email
    // - Update password if provided
    // - Validate current password
    return { success: true }
  }
}
