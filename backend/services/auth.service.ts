import getDb from '../database'
import {
  exchangeCodeForTokens,
  getGoogleUserInfo,
} from './google-oauth.service'
import { send } from './resend.service'
import type { AppCookieStore, ResponseSet } from '../../types/controller.types'
import { uuidv7 } from 'uuidv7'

interface RateLimitStore {
  count: number
  resetTime: number
}

export const rateLimitStores = new Map<string, RateLimitStore>()

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
    const token = uuidv7()
    const expiresAt = new Date()
    expiresAt.setDate(expiresAt.getDate() + 30)

    await getDb()
      .insertInto('sessions')
      .values({
        id: uuidv7(),
        user_id: userId,
        token,
        expires_at: expiresAt.getTime()
      })
      .execute()

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
    const existingUser = await getDb()
      .selectFrom('users')
      .selectAll()
      .where('users.email', '=', input.email)
      .executeTakeFirst()

    if (existingUser) {
      throw new Error('Email already registered')
    }

    // Hash password
    const hashedPassword = await this.hashPassword(input.password)

    // Create user
    const newUser = await getDb()
      .insertInto('users')
      .values({
        id: uuidv7(),
        name: input.name,
        email: input.email,
        password: hashedPassword,
        role: 'user'
      })
      .returningAll()
      .executeTakeFirst()

    if (!newUser) {
      throw new Error('Failed to create user')
    }

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
    const user = await getDb()
      .selectFrom('users')
      .selectAll()
      .where('email', '=', input.email)
      .executeTakeFirst()

    if (!user) {
      throw new Error('Invalid credentials')
    }

    // Verify password
    const isValid = await this.verifyPassword(input.password, user.password)

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
    const existingUser = await getDb()
      .selectFrom('users')
      .selectAll()
      .where('users.email', '=', googleUser.email.toLowerCase())
      .executeTakeFirst()

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
    const randomPassword = uuidv7().replace(/-/g, '')
    const hashedPassword = await this.hashPassword(randomPassword)
    const newUser = await getDb()
      .insertInto('users')
      .values({
        id: uuidv7(),
        name: googleUser.name,
        email: googleUser.email.toLowerCase(),
        password: hashedPassword,
        role: 'user'
      })
      .returningAll()
      .executeTakeFirst()

    if (!newUser) {
      throw new Error('Failed to create user')
    }

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
    await getDb()
      .deleteFrom('sessions')
      .where('token', '=', token)
      .execute()
  },

  /**
   * Impersonate a user
   * Creates a session for a user without password verification
   */
  async impersonate(userId: string): Promise<AuthResult> {
    // Find user
    const user = await getDb()
      .selectFrom('users')
      .selectAll()
      .where('users.id', '=', userId)
      .executeTakeFirst()

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

    const user = await getDb()
      .selectFrom('users')
      .selectAll()
      .where('users.email', '=', email)
      .executeTakeFirst()

    if (!user) {
      // Don't reveal if user exists or not for security
      return
    }

    // Delete any existing reset tokens for this user
    await getDb()
      .deleteFrom('password_reset_tokens')
      .where('user_id', '=', user.id)
      .execute()

    // Create new reset token
    const token = uuidv7()
    const expiresAt = new Date()
    expiresAt.setHours(expiresAt.getHours() + 1) // 1 hour expiry

    await getDb()
      .insertInto('password_reset_tokens')
      .values({
        id: uuidv7(),
        user_id: user.id,
        token,
        expires_at: expiresAt.getTime()
      })
      .execute()

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
    const resetToken = await getDb()
      .selectFrom('password_reset_tokens')
      .selectAll()
      .where('token', '=', token)
      .where('expires_at', '>', now.getTime())
      .executeTakeFirst()

    if (!resetToken) {
      throw new Error('Invalid or expired reset token')
    }

    // Hash new password
    const hashedPassword = await this.hashPassword(newPassword)

    // Update user password
    await getDb()
      .updateTable('users')
      .set({ password: hashedPassword })
      .where('id', '=', resetToken.user_id)
      .execute()

    // Delete the used token
    await getDb()
      .deleteFrom('password_reset_tokens')
      .where('id', '=', resetToken.id)
      .execute()
  },

  /**
   * Get user from session token
   */
  async getSessionUser(token: string): Promise<AuthUser | null> {
    if (!token) return null

    const session = await getDb()
      .selectFrom('sessions')
      .innerJoin('users', (join) => 
        join.on('sessions.user_id', '=', 'users.id')
      )
      .where('sessions.token', '=', token)
      .selectAll()
      .executeTakeFirst()

    if (!session) return null

    // Check if session is expired
    if (new Date(session.expires_at) < new Date()) {
      await getDb()
        .deleteFrom('sessions')
        .where('token', '=', token)
        .execute()
      return null
    }

    return {
      id: session.id,
      name: session.name,
      email: session.email,
      role: session.role
    }
  },

  /**
   * Hash password using Web Crypto API
   */
  async hashPassword(password: string): Promise<string> {
    const encoder = new TextEncoder()
    const data = encoder.encode(password)
    const hash = await crypto.subtle.digest('SHA-256', data)
    return Array.from(new Uint8Array(hash))
      .map(b => b.toString(16).padStart(2, '0'))
      .join('')
  },

  /**
   * Verify password using Web Crypto API
   */
  async verifyPassword(password: string, hash: string): Promise<boolean> {
    const encoder = new TextEncoder()
    const data = encoder.encode(password)
    const hashBuffer = await crypto.subtle.digest('SHA-256', data)
    const computedHash = Array.from(new Uint8Array(hashBuffer))
      .map(b => b.toString(16).padStart(2, '0'))
      .join('')
    return computedHash === hash
  },

  /**
   * Get user from cookie and throw if unauthorized
   */
  async getSessionUserFromCookie(cookie: any): Promise<AuthUser> {
    const token = (cookie?.auth_token?.value as string) || ''
    const user = await this.getSessionUser(token)
    if (!user) throw new Error('Unauthorized')
    return user
  }
}

export default authService
