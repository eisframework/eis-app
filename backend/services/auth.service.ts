import { users, sessions, passwordResetTokens } from '../database/schema'
import db from '../database'
import { eq, and, gt } from 'drizzle-orm'
import {
  exchangeCodeForTokens,
  getGoogleUserInfo,
} from './google-oauth.service'
import { send } from './resend.service'
import type { AppCookieStore, ResponseSet } from '../../types/controller.types'

interface RateLimitStore {
  count: number
  resetTime: number
}

const rateLimitStores = new Map<string, RateLimitStore>()

function checkRateLimit(key: string, windowMs: number, maxRequests: number): boolean {
  const now = Date.now()
  let store = rateLimitStores.get(key)

  if (!store || now > store.resetTime) {
    store = {
      count: 0,
      resetTime: now + windowMs
    }
    rateLimitStores.set(key, store)
  }

  store.count++
  return store.count <= maxRequests
}

export interface RegisterInput {
  name: string
  email: string
  password: string
}

export interface LoginInput {
  email: string
  password: string
}

export interface AuthResult {
  user: {
    id: string
    name: string
    email: string
  }
  token: string
}

export interface AuthUser {
  id: string
  name: string
  email: string
  role: string
}

/**
 * Authentication Service
 * Handles all authentication-related operations
 */
export const authService = {
  /**
   * Create a session for a user
   */
  async createSession(userId: string): Promise<string> {
    const token = Bun.randomUUIDv7()
    const expiresAt = new Date()
    expiresAt.setDate(expiresAt.getDate() + 30)

    await db.insert(sessions).values({
      id: Bun.randomUUIDv7(),
      userId,
      token,
      expiresAt
    })

    return token
  },

  /**
   * Set authentication cookie
   */
  setAuthCookie(token: string, cookie: AppCookieStore): void {
    if (!cookie.auth_token) {
      cookie.auth_token = {} as any
    }
    cookie.auth_token.value = token
    cookie.auth_token.httpOnly = true
    cookie.auth_token.path = '/'
    cookie.auth_token.maxAge = 60 * 60 * 24 * 30 // 30 days
  },

  /**
   * Remove authentication cookie
   */
  removeAuthCookie(cookie: AppCookieStore): void {
    if (!cookie.auth_token) {
      cookie.auth_token = {} as any
    }
    cookie.auth_token.remove()
  },

  /**
   * Register a new user
   */
  async register(input: RegisterInput): Promise<AuthResult> {
    // Rate limit check
    const ip = input.email || 'unknown'
    const rateLimitKey = `register:${ip}`
    if (!checkRateLimit(rateLimitKey, 60 * 60 * 1000, 3)) {
      throw new Error('Too many registration attempts. Please try again later.')
    }

    // Check if user already exists
    const existingUser = await db.query.users.findFirst({
      where: eq(users.email, input.email)
    })

    if (existingUser) {
      throw new Error('Email already registered')
    }

    // Hash password
    const hashedPassword = await Bun.password.hash(input.password)

    // Create user
    const [newUser] = await db
      .insert(users)
      .values({
        id: Bun.randomUUIDv7(),
        name: input.name,
        email: input.email,
        password: hashedPassword
      })
      .returning()

    // Create session
    const token = await this.createSession(newUser.id)

    return {
      user: {
        id: newUser.id,
        name: newUser.name,
        email: newUser.email
      },
      token
    }
  },

  /**
   * Login user with email and password
   */
  async login(input: LoginInput): Promise<AuthResult> {
    // Rate limit check
    const ip = input.email || 'unknown'
    const rateLimitKey = `login:${ip}`
    if (!checkRateLimit(rateLimitKey, 15 * 60 * 1000, 5)) {
      throw new Error('Too many login attempts. Please try again later.')
    }

    // Find user by email
    const user = await db.query.users.findFirst({
      where: eq(users.email, input.email)
    })

    if (!user) {
      throw new Error('Invalid credentials')
    }

    // Verify password
    const isValid = await Bun.password.verify(input.password, user.password)

    if (!isValid) {
      throw new Error('Invalid credentials')
    }

    // Create session
    const token = await this.createSession(user.id)

    return {
      user: {
        id: user.id,
        name: user.name,
        email: user.email
      },
      token
    }
  },

  /**
   * Handle Google OAuth callback
   */
  async googleCallback(code: string): Promise<AuthResult> {
    // Exchange code for tokens
    const { access_token } = await exchangeCodeForTokens(code)

    // Get user info from Google
    const googleUser = await getGoogleUserInfo(access_token)

    // Check if user already exists
    const existingUser = await db.query.users.findFirst({
      where: eq(users.email, googleUser.email.toLowerCase())
    })

    if (existingUser) {
      // Create session for existing user
      const token = await this.createSession(existingUser.id)

      return {
        user: {
          id: existingUser.id,
          name: existingUser.name,
          email: existingUser.email
        },
        token
      }
    }

    // Create new user
    const randomPassword = Bun.randomUUIDv7().replace(/-/g, '')
    const hashedPassword = await Bun.password.hash(randomPassword)
    const [newUser] = await db
      .insert(users)
      .values({
        id: Bun.randomUUIDv7(),
        name: googleUser.name,
        email: googleUser.email.toLowerCase(),
        password: hashedPassword,
        role: 'user'
      })
      .returning()

    // Create session for new user
    const token = await this.createSession(newUser.id)

    return {
      user: {
        id: newUser.id,
        name: newUser.name,
        email: newUser.email
      },
      token
    }
  },

  /**
   * Logout user
   */
  async logout(token: string): Promise<void> {
    await db.delete(sessions).where(eq(sessions.token, token))
  },

  /**
   * Impersonate a user
   * Creates a session for a user without password verification
   */
  async impersonate(userId: string): Promise<AuthResult> {
    // Find user
    const user = await db.query.users.findFirst({
      where: eq(users.id, userId)
    })

    if (!user) {
      throw new Error('User not found')
    }

    // Create session
    const token = await this.createSession(user.id)

    return {
      user: {
        id: user.id,
        name: user.name,
        email: user.email
      },
      token
    }
  },

  /**
   * Generate password reset token for a user
   */
  async forgotPassword(email: string): Promise<void> {
    // Rate limit check
    const rateLimitKey = `password-reset:${email}`
    if (!checkRateLimit(rateLimitKey, 60 * 60 * 1000, 3)) {
      throw new Error('Too many password reset attempts. Please try again later.')
    }

    const user = await db.query.users.findFirst({
      where: eq(users.email, email)
    })

    if (!user) {
      // Don't reveal if user exists or not for security
      return
    }

    // Delete any existing reset tokens for this user
    await db.delete(passwordResetTokens).where(eq(passwordResetTokens.userId, user.id))

    // Create new reset token
    const token = Bun.randomUUIDv7()
    const expiresAt = new Date()
    expiresAt.setHours(expiresAt.getHours() + 1) // 1 hour expiry

    await db.insert(passwordResetTokens).values({
      id: Bun.randomUUIDv7(),
      userId: user.id,
      token,
      expiresAt
    })

    // Send email with reset link
    const resetUrl = `${process.env.APP_URL || 'http://localhost:3000'}/reset-password?token=${token}`
    
    await send(
      email,
      'Reset Your Password',
      `
        <h1>Reset Your Password</h1>
        <p>Click the link below to reset your password:</p>
        <a href="${resetUrl}">Reset Password</a>
        <p>This link will expire in 1 hour.</p>
        <p>If you didn't request this, please ignore this email.</p>
      `,
      `Reset your password by visiting: ${resetUrl}`
    )
  },

  /**
   * Reset password using token
   */
  async resetPassword(token: string, newPassword: string): Promise<void> {
    // Find valid reset token
    const now = new Date()
    const resetToken = await db.query.passwordResetTokens.findFirst({
      where: and(
        eq(passwordResetTokens.token, token),
        gt(passwordResetTokens.expiresAt, now)
      )
    })

    if (!resetToken) {
      throw new Error('Invalid or expired reset token')
    }

    // Hash new password
    const hashedPassword = await Bun.password.hash(newPassword)

    // Update user password
    await db
      .update(users)
      .set({ password: hashedPassword })
      .where(eq(users.id, resetToken.userId))

    // Delete the used token
    await db.delete(passwordResetTokens).where(eq(passwordResetTokens.id, resetToken.id))
  },

  /**
   * Get user from session token
   */
  async getSessionUser(token: string): Promise<AuthUser | null> {
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

    const user = session.user as { id: string; name: string; email: string; role: string }
    return {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role
    }
  }
}

export default authService
