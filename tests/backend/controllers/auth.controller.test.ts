import { describe, test, expect, beforeEach, afterEach, vi } from 'bun:test'
import authController from '../../../backend/controllers/auth.controller'
import type { ControllerContext } from '../../../types/controller.types'

// Mock dependencies
vi.mock('../../../backend/services/auth.service', () => ({
  default: {
    login: vi.fn(),
    register: vi.fn(),
    logout: vi.fn(),
    forgotPassword: vi.fn(),
    resetPassword: vi.fn(),
    impersonate: vi.fn(),
    setAuthCookie: vi.fn(),
    removeAuthCookie: vi.fn()
  }
}))

vi.mock('../../../backend/services/flash.service', () => ({
  default: {
    set: vi.fn()
  }
}))

describe('Auth Controller', () => {
  let mockContext: ControllerContext & { body: any }
  let mockCookie: any

  beforeEach(() => {
    mockCookie = {
      auth_token: {
        value: '',
        remove: vi.fn()
      }
    }

    mockContext = {
      user: undefined,
      body: {},
      query: {},
      params: {},
      headers: {},
      set: { headers: {} },
      cookie: mockCookie,
      inertia: vi.fn(() => new Response()),
      request: new Request('http://localhost')
    }

    vi.clearAllMocks()
  })

  describe('getLogin', () => {
    test('should render login page', async () => {
      await authController.getLogin(mockContext)

      expect(mockContext.inertia).toHaveBeenCalledWith('auth/login', {})
    })
  })

  describe('postLogin', () => {
    test('should validate email format', async () => {
      mockContext.body = {
        email: 'invalid-email',
        password: 'password123'
      }

      const result = await authController.postLogin(mockContext)

      expect(result).toBeInstanceOf(Response)
      expect(result.status).toBe(303)
    })

    test('should validate password presence', async () => {
      mockContext.body = {
        email: 'test@example.com',
        password: ''
      }

      const result = await authController.postLogin(mockContext)

      expect(result).toBeInstanceOf(Response)
      expect(result.status).toBe(303)
    })

    test('should login successfully with valid credentials', async () => {
      const authService = (await import('../../../backend/services/auth.service')).default
      mockContext.body = {
        email: 'test@example.com',
        password: 'password123'
      }

      authService.login = vi.fn().mockResolvedValue({
        user: { id: '1', email: 'test@example.com', name: 'Test User' },
        token: 'test-token'
      })

      const result = await authController.postLogin(mockContext)

      expect(authService.login).toHaveBeenCalledWith(mockContext.body)
      expect(result).toBeInstanceOf(Response)
      expect(result.status).toBe(303)
      expect(result.headers.get('Location')).toBe('/home')
    })
  })

  describe('postRegister', () => {
    test('should validate name length', async () => {
      mockContext.body = {
        name: 'A',
        email: 'test@example.com',
        password: 'password123'
      }

      const result = await authController.postRegister(mockContext)

      expect(result).toBeInstanceOf(Response)
      expect(result.status).toBe(303)
      expect(result.headers.get('Location')).toBe('/register')
    })

    test('should validate email format', async () => {
      mockContext.body = {
        name: 'Test User',
        email: 'invalid-email',
        password: 'password123'
      }

      const result = await authController.postRegister(mockContext)

      expect(result).toBeInstanceOf(Response)
      expect(result.status).toBe(303)
      expect(result.headers.get('Location')).toBe('/register')
    })

    test('should validate password length', async () => {
      mockContext.body = {
        name: 'Test User',
        email: 'test@example.com',
        password: 'pass'
      }

      const result = await authController.postRegister(mockContext)

      expect(result).toBeInstanceOf(Response)
      expect(result.status).toBe(303)
      expect(result.headers.get('Location')).toBe('/register')
    })

    test('should register successfully and redirect to home', async () => {
      const authService = (await import('../../../backend/services/auth.service')).default
      mockContext.body = {
        name: 'Test User',
        email: 'test@example.com',
        password: 'password123'
      }

      authService.register = vi.fn().mockResolvedValue({
        user: { id: '1', email: 'test@example.com', name: 'Test User' },
        token: 'test-token'
      })

      const result = await authController.postRegister(mockContext)

      expect(authService.register).toHaveBeenCalledWith(mockContext.body)
      expect(result).toBeInstanceOf(Response)
      expect(result.status).toBe(303)
      expect(result.headers.get('Location')).toBe('/home')
    })
  })

  describe('postLogout', () => {
    test('should logout and redirect', async () => {
      mockCookie.auth_token.value = 'test-token'

      const result = await authController.postLogout(mockContext)

      expect(result).toBeInstanceOf(Response)
      expect(result.status).toBe(303)
      expect(result.headers.get('Location')).toBe('/')
    })
  })
})
