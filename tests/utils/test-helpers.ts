import { Elysia } from 'elysia'
import { vi } from 'vitest'

export const createTestApp = () => {
  return new Elysia()
}

export const mockRequest = (options: RequestInit = {}) => {
  return new Request('http://localhost:3000', options)
}

export const mockCookie = (token?: string) => ({
  auth_token: {
    value: token || 'test-token',
    set: vi.fn(),
    remove: vi.fn()
  }
})

export const mockSet = () => ({
  status: vi.fn(),
  headers: vi.fn(),
  redirect: vi.fn()
})
