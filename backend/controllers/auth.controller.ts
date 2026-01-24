import { users, sessions } from '../database/schema'
import db from '../database'
import { eq } from 'drizzle-orm'
import { hashPassword, verifyPassword } from '../utils/hash.util'
import { generateToken } from '../utils/token.util'
import type { AuthUser } from '../middleware/auth.middleware'
import type { ControllerContext } from '../../types/controller.types'
import { uuidv7 } from 'uuidv7'
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

export const authController = {
  async getLogin(ctx: ControllerContext) {
    return ctx.inertia('auth/login', {})
  },

  async postLogin(ctx: ControllerContext & { body: LoginInput }) {
    try {
      const result = await this.login(ctx.body)
      ctx.cookie!.auth_token.value = result.token
      ctx.cookie!.auth_token.httpOnly = true
      ctx.cookie!.auth_token.path = '/'
      ctx.cookie!.auth_token.maxAge = 60 * 60 * 24 * 30
      ctx.set.headers['Content-Type'] = 'application/json'
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
      const result = await this.register(ctx.body)
      ctx.cookie!.auth_token.value = result.token
      ctx.cookie!.auth_token.httpOnly = true
      ctx.cookie!.auth_token.path = '/'
      ctx.cookie!.auth_token.maxAge = 60 * 60 * 24 * 30
      ctx.set.headers['Content-Type'] = 'application/json'
      return Response.redirect('/', 303)
    } catch (error: unknown) {
      ctx.set.status = 400
      return { error: error instanceof Error ? error.message : 'Registration failed' }
    }
  },

  async postLogout(ctx: ControllerContext) {
    const token = (ctx.cookie!.auth_token.value as string) || ''
    if (token) await this.logout(token)
    ctx.cookie!.auth_token.remove()
    ctx.set.headers['Content-Type'] = 'application/json'
    return Response.redirect('/', 303)
  },

  async register(input: RegisterInput) {
    // Check if user already exists
    const existingUser = await db.query.users.findFirst({
      where: eq(users.email, input.email)
    })

    if (existingUser) {
      throw new Error('Email already registered')
    }

    // Hash password
    const hashedPassword = await hashPassword(input.password)

    // Create user
    const [newUser] = await db
      .insert(users)
      .values({
        id: uuidv7(),
        name: input.name,
        email: input.email,
        password: hashedPassword
      })
      .returning()

    // Create session
    const token = generateToken()
    const expiresAt = new Date()
    expiresAt.setDate(expiresAt.getDate() + 30) // 30 days

    await db.insert(sessions).values({
      id: uuidv7(),
      userId: newUser.id,
      token,
      expiresAt
    })

    return {
      user: {
        id: newUser.id,
        name: newUser.name,
        email: newUser.email
      },
      token
    }
  },

  async login(input: LoginInput) {
    // Find user by email
    const user = await db.query.users.findFirst({
      where: eq(users.email, input.email)
    })

    if (!user) {
      throw new Error('Invalid credentials')
    }

    // Verify password
    const isValid = await verifyPassword(input.password, user.password)

    if (!isValid) {
      throw new Error('Invalid credentials')
    }

    // Create session
    const token = generateToken()
    const expiresAt = new Date()
    expiresAt.setDate(expiresAt.getDate() + 30) // 30 days

    await db.insert(sessions).values({
      id: uuidv7(),
      userId: user.id,
      token,
      expiresAt
    })

    return {
      user: {
        id: user.id,
        name: user.name,
        email: user.email
      },
      token
    }
  },

  async logout(token: string) {
    await db.delete(sessions).where(eq(sessions.token, token))
    return { success: true }
  },

  async me(token: string): Promise<AuthUser | null> {
    if (!token) return null

    const session = await db.query.sessions.findFirst({
      where: eq(sessions.token, token),
      with: {
        user: true
      }
    })

    if (!session) return null

    // Check if session is expired
    if (new Date(session.expiresAt) < new Date()) {
      await db.delete(sessions).where(eq(sessions.token, token))
      return null
    }

    const user = session.user as { id: string; name: string; email: string }
    return {
      id: user.id,
      name: user.name,
      email: user.email
    }
  }
}
