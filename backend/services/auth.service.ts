import { users, sessions } from '../database/schema'
import db from '../database'
import { eq } from 'drizzle-orm'
import { hashPassword, verifyPassword } from '../utils/hash.util'
import { 
  exchangeCodeForTokens,
  getGoogleUserInfo,
} from './google-oauth.service'

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

/**
 * Authentication Service
 * Handles all authentication-related operations
 */
export const authService = {
  /**
   * Set authentication cookie
   */
  setAuthCookie(token: string, cookie: any, set: any): void {
    cookie.auth_token.value = token
    cookie.auth_token.httpOnly = true
    cookie.auth_token.path = '/'
    cookie.auth_token.maxAge = 60 * 60 * 24 * 30 // 30 days
    set.headers['Content-Type'] = 'application/json'
  },

  /**
   * Remove authentication cookie
   */
  removeAuthCookie(cookie: any, set: any): void {
    cookie.auth_token.remove()
    set.headers['Content-Type'] = 'application/json'
  },

  /**
   * Register a new user
   */
  async register(input: RegisterInput): Promise<AuthResult> {
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
        id: Bun.randomUUIDv7(),
        name: input.name,
        email: input.email,
        password: hashedPassword
      })
      .returning()

    // Create session
    const token = Bun.randomUUIDv7()
    const expiresAt = new Date()
    expiresAt.setDate(expiresAt.getDate() + 30)

    await db.insert(sessions).values({
      id: Bun.randomUUIDv7(),
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

  /**
   * Login user with email and password
   */
  async login(input: LoginInput): Promise<AuthResult> {
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
    const token = Bun.randomUUIDv7()
    const expiresAt = new Date()
    expiresAt.setDate(expiresAt.getDate() + 30)

    await db.insert(sessions).values({
      id: Bun.randomUUIDv7(),
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
      const token = Bun.randomUUIDv7()
      const expiresAt = new Date()
      expiresAt.setDate(expiresAt.getDate() + 30)

      await db.insert(sessions).values({
        id: Bun.randomUUIDv7(),
        userId: existingUser.id,
        token,
        expiresAt
      })

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
    const hashedPassword = await Bun.password.hash(googleUser.email)
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
    const token = Bun.randomUUIDv7()
    const expiresAt = new Date()
    expiresAt.setDate(expiresAt.getDate() + 30)

    await db.insert(sessions).values({
      id: Bun.randomUUIDv7(),
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
    const token = Bun.randomUUIDv7()
    const expiresAt = new Date()
    expiresAt.setDate(expiresAt.getDate() + 30)

    await db.insert(sessions).values({
      id: Bun.randomUUIDv7(),
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
  }
}

export default authService
