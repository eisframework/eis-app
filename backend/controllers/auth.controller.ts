import authService from '../services/auth.service'
import type { AuthUser } from '../services/auth.service'
import type { ControllerContext } from '../../types/controller.types'
import flash from '../services/flash.service'

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
      const { email, password } = ctx.body

      if (!email || !email.includes('@')) {
        flash.set(ctx.set, 'error', 'Invalid email')
        return Response.redirect('/login', 303)
      }

      if (!password || password.length < 1) {
        flash.set(ctx.set, 'error', 'Password is required')
        return Response.redirect('/login', 303)
      }

      const result = await authService.login(ctx.body)

      authService.setAuthCookie(result.token, ctx.cookie!)

      return Response.redirect('/home', 303)
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
    try {
      const { email } = ctx.body

      if (!email || !email.includes('@')) {
        flash.set(ctx.set, 'error', 'Invalid email')
        return Response.redirect('/forgot-password', 303)
      }

      await authService.forgotPassword(ctx.body.email)
      flash.set(ctx.set, 'success', 'Password reset link sent to your email')
      return Response.redirect('/login', 303)
    } catch (error: unknown) {
      flash.set(ctx.set, 'error', error instanceof Error ? error.message : 'Failed to send reset link')
      return Response.redirect('/forgot-password', 303)
    }
  },

  async getResetPassword(ctx: ControllerContext) {
    return ctx.inertia('auth/reset-password', {})
  },

  async postResetPassword(ctx: ControllerContext & { body: { token: string; password: string; password_confirmation: string } }) {
    try {
      const { token, password, password_confirmation } = ctx.body

      if (!token || token.length < 1) {
        flash.set(ctx.set, 'error', 'Token is required')
        return Response.redirect('/reset-password', 303)
      }

      if (!password || password.length < 8) {
        flash.set(ctx.set, 'error', 'Password must be at least 8 characters')
        return Response.redirect('/reset-password', 303)
      }

      if (password !== password_confirmation) {
        flash.set(ctx.set, 'error', 'Passwords do not match')
        return Response.redirect('/reset-password', 303)
      }

      await authService.resetPassword(token, password)
      flash.set(ctx.set, 'success', 'Password reset successfully')
      return Response.redirect('/login', 303)
    } catch (error: unknown) {
      flash.set(ctx.set, 'error', error instanceof Error ? error.message : 'Failed to reset password')
      return Response.redirect('/reset-password', 303)
    }
  },

  async postRegister(ctx: ControllerContext & { body: RegisterInput }) {
    try {
      const { name, email, password } = ctx.body

      if (!name || name.length < 2) {
        flash.set(ctx.set, 'error', 'Name must be at least 2 characters')
        return Response.redirect('/register', 303)
      }

      if (!email || !email.includes('@')) {
        flash.set(ctx.set, 'error', 'Invalid email')
        return Response.redirect('/register', 303)
      }

      if (!password || password.length < 8) {
        flash.set(ctx.set, 'error', 'Password must be at least 8 characters')
        return Response.redirect('/register', 303)
      }

      const result = await authService.register(ctx.body)
      authService.setAuthCookie(result.token, ctx.cookie!)
      return Response.redirect('/home', 303)
    } catch (error: unknown) {
      flash.set(ctx.set, 'error', error instanceof Error ? error.message : 'Registration failed')
      return Response.redirect('/register', 303)
    }
  },

  async postLogout(ctx: ControllerContext) {
    const token = (ctx.cookie!.auth_token.value as string) || ''
    if (token) await authService.logout(token)
    authService.removeAuthCookie(ctx.cookie!)
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
      
      authService.setAuthCookie(result.token, ctx.cookie!)

      return Response.json({ user: result.user, token: result.token })
    
    } catch (error: unknown) {
      ctx.set.status = 400
      return { error: error instanceof Error ? error.message : 'Impersonation failed' }
    }
  }
}

export default authController
