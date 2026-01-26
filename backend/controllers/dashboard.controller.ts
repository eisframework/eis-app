import authService from '../services/auth.service'
import type { ControllerContext, UpdateProfileBody } from '../../types/controller.types'
import flash from '../services/flash.service'

export const dashboardController = {
  async index({ inertia, cookie }: ControllerContext) {
    const token = (cookie?.auth_token?.value as string) || ''
    const user = await authService.getSessionUser(token)
    return inertia('home', {
      auth: { user }
    })
  },

  async dashboard({ inertia, user }: ControllerContext) {
    return inertia('dashboard', {
      auth: { user }
    })
  },

  async profile({ inertia, user }: ControllerContext) {
    return inertia('profile', {
      auth: { user }
    })
  },

  async updateProfile({ body, set }: ControllerContext & { body: UpdateProfileBody }) {
    try {
      await this._updateProfile(body)
      flash.set(set, 'success', 'Profile updated successfully')
      set.headers['Content-Type'] = 'application/json'
      return Response.redirect('/profile', 303)
    } catch (error: unknown) {
      flash.set(set, 'error', error instanceof Error ? error.message : 'Failed to update profile')
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
