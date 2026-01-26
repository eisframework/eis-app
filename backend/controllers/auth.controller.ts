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
  async getLogin({ inertia }: ControllerContext) {
    return inertia('auth/login', {})
  },

  async postLogin({ body, set, cookie }: ControllerContext & { body: LoginInput }) {
    try {
      const { email, password } = body

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
  },

  async getRegister({ inertia }: ControllerContext) {
    return inertia('auth/register', {})
  },

  async getForgotPassword({ inertia }: ControllerContext) {
    return inertia('auth/forgot-password', {})
  },

  async postForgotPassword({ body, set }: ControllerContext & { body: { email: string } }) {
    try {
      const { email } = body

      if (!email || !email.includes('@')) {
        flash.set(set, 'error', 'Invalid email')
        return Response.redirect('/forgot-password', 303)
      }

      await authService.forgotPassword(body.email)
      flash.set(set, 'success', 'Password reset link sent to your email')
      return Response.redirect('/login', 303)
    } catch (error: unknown) {
      flash.set(set, 'error', error instanceof Error ? error.message : 'Failed to send reset link')
      return Response.redirect('/forgot-password', 303)
    }
  },

  async getResetPassword({ inertia }: ControllerContext) {
    return inertia('auth/reset-password', {})
  },

  async postResetPassword({ body, set }: ControllerContext & { body: { token: string; password: string; password_confirmation: string } }) {
    try {
      const { token, password, password_confirmation } = body

      if (!token || token.length < 1) {
        flash.set(set, 'error', 'Token is required')
        return Response.redirect('/reset-password', 303)
      }

      if (!password || password.length < 8) {
        flash.set(set, 'error', 'Password must be at least 8 characters')
        return Response.redirect('/reset-password', 303)
      }

      if (password !== password_confirmation) {
        flash.set(set, 'error', 'Passwords do not match')
        return Response.redirect('/reset-password', 303)
      }

      await authService.resetPassword(token, password)
      flash.set(set, 'success', 'Password reset successfully')
      return Response.redirect('/login', 303)
    } catch (error: unknown) {
      flash.set(set, 'error', error instanceof Error ? error.message : 'Failed to reset password')
      return Response.redirect('/reset-password', 303)
    }
  },

  async postRegister({ body, set, cookie }: ControllerContext & { body: RegisterInput }) {
    try {
      const { name, email, password } = body

      if (!name || name.length < 2) {
        flash.set(set, 'error', 'Name must be at least 2 characters')
        return Response.redirect('/register', 303)
      }

      if (!email || !email.includes('@')) {
        flash.set(set, 'error', 'Invalid email')
        return Response.redirect('/register', 303)
      }

      if (!password || password.length < 8) {
        flash.set(set, 'error', 'Password must be at least 8 characters')
        return Response.redirect('/register', 303)
      }

      const result = await authService.register(body)
      authService.setAuthCookie(result.token, cookie!)
      return Response.redirect('/home', 303)
    } catch (error: unknown) {
      flash.set(set, 'error', error instanceof Error ? error.message : 'Registration failed')
      return Response.redirect('/register', 303)
    }
  },

  async postLogout({ cookie }: ControllerContext) {
    const token = (cookie?.auth_token.value as string) || ''
    if (token) await authService.logout(token)
    authService.removeAuthCookie(cookie!)
    return Response.redirect('/', 303)
  },

  /**
   * Impersonate a user (development only, admin only)
   * POST /auth/impersonate
   */
  async postImpersonate({ user, set, body, cookie }: ControllerContext & { user?: AuthUser } & { body: { userId: string } }) {
    if (!user) {
      set.status = 401
      return { error: 'Unauthorized' }
    }

    // Check if current user is admin
    if (user.role !== 'admin') {
      set.status = 403
      return { error: 'Admin only' }
    }

    try {
      const result = await authService.impersonate(body.userId)
      authService.setAuthCookie(result.token, cookie!)
      return Response.json({ user: result.user, token: result.token })
    } catch (error: unknown) {
      set.status = 400
      return { error: error instanceof Error ? error.message : 'Impersonation failed' }
    }
  }
}

export default authController
