import { users, sessions } from '../database/schema'
import db from '../database'
import { eq } from 'drizzle-orm'
import type { AuthUser } from '../middleware/auth.middleware'
import type { ControllerContext } from '../../types/controller.types'
import flash from '../services/flash.service'
import authService from '../services/auth.service'

export interface RegisterInput {
  name: string
  email: string
  password: string
}

export interface LoginInput {
  email: string
  password: string
}

export interface ExtendedAuthUser extends AuthUser {
  role: string
}

export const authController = {
  async getLogin(ctx: ControllerContext) {
    return ctx.inertia('auth/login', {})
  },

  async postLogin(ctx: ControllerContext & { body: LoginInput }) {
    try {
      const result = await authService.login(ctx.body)
      
      authService.setAuthCookie(result.token, ctx.cookie!, ctx.set)

      return Response.redirect('/', 303)
    } catch (error: unknown) {
      flash.set(ctx.set, 'error', error instanceof Error ? error.message : 'Login failed')
      return Response.redirect('/login', 303)
    }
  },

  async getRegister(ctx: ControllerContext) {
    return ctx.inertia('auth/register', {})
  },

  async getForgotPassword(ctx: ControllerContext) {
    return ctx.inertia('auth/forgot-password', {})
  },

  async postForgotPassword(ctx: ControllerContext & { body: { email: string } }) {
    // TODO: Implement forgot password logic
    ctx.set.status = 200
    return { message: 'Password reset link sent to your email' }
  },

  async getResetPassword(ctx: ControllerContext) {
    return ctx.inertia('auth/reset-password', {})
  },

  async postResetPassword(ctx: ControllerContext & { body: { token: string; password: string; password_confirmation: string } }) {
    // TODO: Implement reset password logic
    ctx.set.status = 200
    return { message: 'Password reset successfully' }
  },

  async postRegister(ctx: ControllerContext & { body: RegisterInput }) {
    try {
      const result = await authService.register(ctx.body)
      authService.setAuthCookie(result.token, ctx.cookie!, ctx.set)
      return Response.redirect('/', 303)
    } catch (error: unknown) {
      ctx.set.status = 400
      return { error: error instanceof Error ? error.message : 'Registration failed' }
    }
  },

  async postLogout(ctx: ControllerContext) {
    const token = (ctx.cookie!.auth_token.value as string) || ''
    if (token) await authService.logout(token)
    authService.removeAuthCookie(ctx.cookie!, ctx.set)
    return Response.redirect('/', 303)
  },

  /**
   * Impersonate a user (development only, admin only)
   * POST /auth/impersonate
   */
  async postImpersonate(ctx: ControllerContext & { user?: AuthUser } & { body: { userId: string } }) {
    if (!ctx.user) {
      ctx.set.status = 401
      return { error: 'Unauthorized' }
    }

    // Check if current user is admin
    if (ctx.user.role !== 'admin') {
      ctx.set.status = 403
      return { error: 'Admin only' }
    }

    try {
      const result = await authService.impersonate(ctx.body.userId)
      authService.setAuthCookie(result.token, ctx.cookie!, ctx.set)
      return Response.json({ user: result.user, token: result.token })
    } catch (error: unknown) {
      ctx.set.status = 400
      return { error: error instanceof Error ? error.message : 'Impersonation failed' }
    }
  }
}

export default authController
