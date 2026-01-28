import { describe, test, expect, beforeEach, afterEach, vi } from 'bun:test'
import { usersController } from '../../../backend/controllers/users.controller'
import type { ControllerContext } from '../../../types/controller.types'
import db from '../../../backend/database'
import { users, sessions, passwordResetTokens } from '../../../backend/database/schema'

// Mock flash service
vi.mock('../../../backend/services/flash.service', () => ({
  default: {
    set: vi.fn()
  }
}))

// Note: vi.mock for database doesn't work reliably with bun test when setup.ts imports db first
// So we use real database but clean up after each test

describe('Users Controller', () => {
  let mockContext: ControllerContext & { body: any; params: any }

  beforeEach(() => {
    mockContext = {
      user: { id: '1', name: 'Test User', email: 'test@example.com', role: 'user' },
      body: {},
      query: {},
      params: {},
      headers: {},
      set: { headers: {} },
      inertia: vi.fn(() => new Response()),
      request: new Request('http://localhost')
    }

    vi.clearAllMocks()
  })

  afterEach(async () => {
    // Clean up database after each test to prevent state leaking to other test files
    await db.delete(passwordResetTokens)
    await db.delete(sessions)
    await db.delete(users)
  })

  describe('index', () => {
    test('should render users index page', async () => {
      await usersController.index(mockContext)

      expect(mockContext.inertia).toHaveBeenCalledWith('users/index', {
        auth: { user: mockContext.user },
        users: expect.any(Array)
      })
    })
  })

  describe('create', () => {
    test('should render create user page', async () => {
      await usersController.create(mockContext)

      expect(mockContext.inertia).toHaveBeenCalledWith('users/create', {
        auth: { user: mockContext.user }
      })
    })
  })

  describe('store', () => {
    test('should validate name length', async () => {
      mockContext.body = {
        name: 'A',
        email: 'test@example.com',
        password: 'password123'
      }

      const result = await usersController.store(mockContext)

      expect(result).toBeInstanceOf(Response)
      expect(result.status).toBe(303)
    })

    test('should validate email format', async () => {
      mockContext.body = {
        name: 'Test User',
        email: 'invalid-email',
        password: 'password123'
      }

      const result = await usersController.store(mockContext)

      expect(result).toBeInstanceOf(Response)
      expect(result.status).toBe(303)
    })

    test('should validate password length', async () => {
      mockContext.body = {
        name: 'Test User',
        email: 'test@example.com',
        password: 'pass'
      }

      const result = await usersController.store(mockContext)

      expect(result).toBeInstanceOf(Response)
      expect(result.status).toBe(303)
    })

    test('should create user successfully and redirect', async () => {
      mockContext.body = {
        name: 'Test User',
        email: 'test@example.com',
        password: 'password123'
      }

      const result = await usersController.store(mockContext)

      expect(result).toBeInstanceOf(Response)
      expect(result.status).toBe(303)
      expect(result.headers.get('Location')).toBe('/users')
    })
  })

  describe('show', () => {
    test('should render user show page', async () => {
      // Create a test user first
      const testUserId = 'test-user-id-show'
      await db.insert(users).values({
        id: testUserId,
        name: 'Test User',
        email: 'show@example.com',
        password: 'hashed_password'
      })

      mockContext.params = { id: testUserId }

      await usersController.show(mockContext)

      expect(mockContext.inertia).toHaveBeenCalledWith('users/show', {
        auth: { user: mockContext.user },
        user: expect.any(Object)
      })
    })

    test('should render 404 page if user not found', async () => {
      mockContext.params = { id: 'nonexistent' }

      await usersController.show(mockContext)

      expect(mockContext.inertia).toHaveBeenCalledWith('errors/404', {
        auth: { user: mockContext.user },
        error: 'User not found'
      })
    })
  })

  describe('edit', () => {
    test('should render edit user page', async () => {
      // Create a test user first
      const testUserId = 'test-user-id-edit'
      await db.insert(users).values({
        id: testUserId,
        name: 'Test User',
        email: 'edit@example.com',
        password: 'hashed_password'
      })

      mockContext.params = { id: testUserId }

      await usersController.edit(mockContext)

      expect(mockContext.inertia).toHaveBeenCalledWith('users/edit', {
        auth: { user: mockContext.user },
        user: expect.any(Object)
      })
    })
  })

  describe('update', () => {
    test('should update user successfully and redirect', async () => {
      mockContext.params = { id: '1' }
      mockContext.body = {
        name: 'Updated User',
        email: 'updated@example.com'
      }

      const result = await usersController.update(mockContext)

      expect(result).toBeInstanceOf(Response)
      expect(result.status).toBe(303)
      expect(result.headers.get('Location')).toBe('/users/1')
    })
  })

  describe('delete', () => {
    test('should delete user and redirect', async () => {
      mockContext.params = { id: '1' }

      const result = await usersController.delete(mockContext)

      expect(result).toBeInstanceOf(Response)
      expect(result.status).toBe(303)
      expect(result.headers.get('Location')).toBe('/users')
    })
  })
})
