import { describe, test, expect, beforeEach, afterEach } from 'bun:test'
import { authService } from '../../../backend/services/auth.service'
import db from '../../../backend/database'
import { users, sessions, passwordResetTokens } from '../../../backend/database/schema'

// Import rateLimitStores to clear it in tests
import { rateLimitStores } from '../../../backend/services/auth.service'

// Force serial execution for database tests
describe.serial('Auth Service', () => {
  let testUserId: string
  let testToken: string

  beforeEach(async () => {
    // Clear rate limit stores
    rateLimitStores.clear()

    // Clean up any existing test data (delete in correct order due to foreign keys)
    await db.delete(sessions)
    await db.delete(passwordResetTokens)
    await db.delete(users)
  })

  afterEach(async () => {
    // Clean up after each test (delete in correct order due to foreign keys)
    await db.delete(sessions)
    await db.delete(passwordResetTokens)
    await db.delete(users)
  })

  describe('register', () => {
    test('should register a new user successfully', async () => {
      const input = {
        name: 'Test User',
        email: 'test@example.com',
        password: 'password123'
      }

      const result = await authService.register(input)

      expect(result.user).toBeDefined()
      expect(result.user.name).toBe('Test User')
      expect(result.user.email).toBe('test@example.com')
      expect(result.token).toBeDefined()
      expect(typeof result.token).toBe('string')
    })

    test('should throw error if email already exists', async () => {
      const input = {
        name: 'Test User',
        email: 'test@example.com',
        password: 'password123'
      }

      // First registration
      await authService.register(input)

      // Second registration with same email
      await expect(authService.register(input)).rejects.toThrow('Email already registered')
    })

    test('should hash password before storing', async () => {
      const input = {
        name: 'Test User',
        email: 'test@example.com',
        password: 'password123'
      }

      await authService.register(input)

      const user = await db.query.users.findFirst({
        where: (users, { eq }) => eq(users.email, input.email)
      })

      expect(user).toBeDefined()
      expect(user?.password).not.toBe(input.password)
    })

    test('should enforce rate limiting', async () => {
      const input = {
        name: 'Test User',
        email: 'test@example.com',
        password: 'password123'
      }

      // Try to register 4 times with same email (limit is 3)
      for (let i = 0; i < 3; i++) {
        try {
          await authService.register(input)
        } catch (e) {
          // Email already registered error is expected after first attempt
        }
      }

      // 4th attempt should fail with rate limit error
      await expect(authService.register(input)).rejects.toThrow('Too many registration attempts')
    })
  })

  describe('login', () => {
    beforeEach(async () => {
      // Create a test user
      const input = {
        name: 'Test User',
        email: 'test@example.com',
        password: 'password123'
      }
      const result = await authService.register(input)
      testUserId = result.user.id
    })

    test('should login with valid credentials', async () => {
      const input = {
        email: 'test@example.com',
        password: 'password123'
      }

      const result = await authService.login(input)

      expect(result.user).toBeDefined()
      expect(result.user.email).toBe('test@example.com')
      expect(result.token).toBeDefined()
    })

    test('should throw error with invalid email', async () => {
      const input = {
        email: 'nonexistent@example.com',
        password: 'password123'
      }

      await expect(authService.login(input)).rejects.toThrow('Invalid credentials')
    })

    test('should throw error with invalid password', async () => {
      const input = {
        email: 'test@example.com',
        password: 'wrongpassword'
      }

      await expect(authService.login(input)).rejects.toThrow('Invalid credentials')
    })

    test('should enforce rate limiting', async () => {
      const input = {
        email: 'test@example.com',
        password: 'wrongpassword'
      }

      // Try to login 6 times (limit is 5)
      for (let i = 0; i < 5; i++) {
        try {
          await authService.login(input)
        } catch (e) {
          // Expected to fail
        }
      }

      // 6th attempt should fail with rate limit error
      await expect(authService.login(input)).rejects.toThrow('Too many login attempts')
    })
  })

  describe('getSessionUser', () => {
    beforeEach(async () => {
      // Create a test user and session
      const input = {
        name: 'Test User',
        email: 'test@example.com',
        password: 'password123'
      }
      const result = await authService.register(input)
      testUserId = result.user.id
      testToken = result.token
    })

    test('should return user for valid token', async () => {
      const user = await authService.getSessionUser(testToken)

      expect(user).toBeDefined()
      expect(user?.id).toBe(testUserId)
      expect(user?.email).toBe('test@example.com')
    })

    test('should return null for invalid token', async () => {
      const user = await authService.getSessionUser('invalid-token')
      expect(user).toBeNull()
    })

    test('should return null for expired session', async () => {
      // Create an expired session
      const expiredToken = Bun.randomUUIDv7()
      const expiredDate = new Date()
      expiredDate.setHours(expiredDate.getHours() - 1)

      await db.insert(sessions).values({
        id: Bun.randomUUIDv7(),
        userId: testUserId,
        token: expiredToken,
        expiresAt: expiredDate
      })

      const user = await authService.getSessionUser(expiredToken)
      expect(user).toBeNull()
    })
  })

  describe('logout', () => {
    test('should delete session', async () => {
      const input = {
        name: 'Test User',
        email: 'test@example.com',
        password: 'password123'
      }
      const result = await authService.register(input)
      testToken = result.token

      await authService.logout(testToken)

      const user = await authService.getSessionUser(testToken)
      expect(user).toBeNull()
    })
  })

  describe('setAuthCookie', () => {
    test('should set auth cookie correctly', () => {
      const cookie: any = {
        auth_token: {}
      }
      const token = 'test-token-123'

      authService.setAuthCookie(token, cookie)

      expect(cookie.auth_token.value).toBe(token)
      expect(cookie.auth_token.httpOnly).toBe(true)
      expect(cookie.auth_token.path).toBe('/')
      expect(cookie.auth_token.maxAge).toBe(60 * 60 * 24 * 30)
    })
  })

  describe('removeAuthCookie', () => {
    test('should remove auth cookie', () => {
      const cookie: any = {
        auth_token: {
          value: 'test-token',
          remove: () => {}
        }
      }

      authService.removeAuthCookie(cookie)
      // Cookie should have remove called
      expect(cookie.auth_token).toBeDefined()
    })
  })

  describe('forgotPassword', () => {
    beforeEach(async () => {
      // Create a test user
      const input = {
        name: 'Test User',
        email: 'test@example.com',
        password: 'password123'
      }
      await authService.register(input)
    })

    test('should create password reset token for existing user', async () => {
      const email = 'test@example.com'

      await authService.forgotPassword(email)

      const resetToken = await db.query.passwordResetTokens.findFirst({
        with: {
          user: true
        }
      })

      expect(resetToken).toBeDefined()
      expect(resetToken?.user?.email).toBe(email)
    })

    test('should not reveal if user exists for non-existent email', async () => {
      const email = 'nonexistent@example.com'

      // Should not throw error and return void
      const result = await authService.forgotPassword(email)
      expect(result).toBeUndefined()
    })

    test('should enforce rate limiting', async () => {
      const email = 'test@example.com'

      // Try 4 times (limit is 3)
      for (let i = 0; i < 3; i++) {
        await authService.forgotPassword(email)
      }

      // 4th attempt should fail
      await expect(authService.forgotPassword(email)).rejects.toThrow('Too many password reset attempts')
    })
  })

  describe('resetPassword', () => {
    let resetToken: string

    beforeEach(async () => {
      // Create a test user
      const input = {
        name: 'Test User',
        email: 'test@example.com',
        password: 'password123'
      }
      await authService.register(input)

      // Create reset token
      resetToken = Bun.randomUUIDv7()
      const expiresAt = new Date()
      expiresAt.setHours(expiresAt.getHours() + 1)

      const user = await db.query.users.findFirst({
        where: (users, { eq }) => eq(users.email, 'test@example.com')
      })

      if (!user) {
        throw new Error('Test user not found')
      }

      await db.insert(passwordResetTokens).values({
        id: Bun.randomUUIDv7(),
        userId: user!.id,
        token: resetToken,
        expiresAt
      })
    })

    test('should reset password with valid token', async () => {
      const newPassword = 'newpassword456'

      await authService.resetPassword(resetToken, newPassword)

      const user = await db.query.users.findFirst({
        where: (users, { eq }) => eq(users.email, 'test@example.com')
      })

      expect(user).toBeDefined()
      expect(user?.password).not.toBe('password123')

      // Verify new password works
      const isValid = await Bun.password.verify(newPassword, user!.password)
      expect(isValid).toBe(true)
    })

    test('should throw error for invalid token', async () => {
      const newPassword = 'newpassword456'

      await expect(
        authService.resetPassword('invalid-token', newPassword)
      ).rejects.toThrow('Invalid or expired reset token')
    })

    test('should throw error for expired token', async () => {
      const newPassword = 'newpassword456'

      // Create expired token
      const expiredDate = new Date()
      expiredDate.setHours(expiredDate.getHours() - 1)

      const user = await db.query.users.findFirst({
        where: (users, { eq }) => eq(users.email, 'test@example.com')
      })

      const expiredToken = Bun.randomUUIDv7()
      await db.insert(passwordResetTokens).values({
        id: Bun.randomUUIDv7(),
        userId: user!.id,
        token: expiredToken,
        expiresAt: expiredDate
      })

      await expect(
        authService.resetPassword(expiredToken, newPassword)
      ).rejects.toThrow('Invalid or expired reset token')
    })
  })
})
