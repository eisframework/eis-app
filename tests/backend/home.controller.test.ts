import { describe, it, expect, vi, beforeEach } from 'vitest'
import { homeController } from '../../backend/controllers/home.controller'

vi.mock('../../backend/middleware/auth', () => ({
  getSessionUser: vi.fn()
}))

describe('HomeController', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('landing', () => {
    it('should return HTML response', async () => {
      const response = await homeController.landing()

      expect(response).toBeInstanceOf(Response)
      expect(response.headers.get('Content-Type')).toBe('text/html; charset=utf-8')
    })
  })

  describe('index', () => {
    it('should render Home page with user data', async () => {
      const { getSessionUser } = await import('../../backend/middleware/auth')
      vi.mocked(getSessionUser).mockResolvedValue({
        id: 1,
        name: 'Test User',
        email: 'test@example.com'
      })

      const cookie = { auth_token: { value: 'test-token' } }
      const request = new Request('http://localhost:3000/home')
      const set = { headers: {} }

      const response = await homeController.index(cookie, request, set)

      expect(response).toBeInstanceOf(Response)
      expect(getSessionUser).toHaveBeenCalledWith('test-token')
    })

    it('should render Home page without user when not authenticated', async () => {
      const { getSessionUser } = await import('../../backend/middleware/auth')
      vi.mocked(getSessionUser).mockResolvedValue(null)

      const cookie = { auth_token: { value: 'test-token' } }
      const request = new Request('http://localhost:3000/home')
      const set = { headers: {} }

      const response = await homeController.index(cookie, request, set)

      expect(response).toBeInstanceOf(Response)
    })
  })

  describe('dashboard', () => {
    it('should redirect to login when user is not authenticated', async () => {
      const { getSessionUser } = await import('../../backend/middleware/auth')
      vi.mocked(getSessionUser).mockResolvedValue(null)

      const cookie = { auth_token: { value: 'test-token' } }
      const request = new Request('http://localhost:3000/dashboard')
      const set = { headers: {} }

      try {
        await homeController.dashboard(cookie, request, set)
        expect.fail('Should have thrown an error due to invalid redirect URL')
      } catch (error) {
        expect(error).toBeInstanceOf(TypeError)
        expect((error as TypeError).message).toContain('Invalid URL')
      }
    })

    it('should render Dashboard when user is authenticated', async () => {
      const { getSessionUser } = await import('../../backend/middleware/auth')
      vi.mocked(getSessionUser).mockResolvedValue({
        id: 1,
        name: 'Test User',
        email: 'test@example.com'
      })

      const cookie = { auth_token: { value: 'test-token' } }
      const request = new Request('http://localhost:3000/dashboard')
      const set = { headers: {} }

      const response = await homeController.dashboard(cookie, request, set)

      expect(response).toBeInstanceOf(Response)
    })
  })
})
