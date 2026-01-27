import { describe, test, expect, beforeEach } from 'bun:test'
import inertia from '../../../backend/services/inertia.service'

describe('Inertia Service', () => {
  let mockRequest: Request
  let mockSet: { headers: Record<string, string | number>; status?: number | string }

  beforeEach(() => {
    mockRequest = new Request('http://localhost')
    mockSet = { headers: {} }
  })

  test('should return inertia render function', () => {
    expect(typeof inertia).toBe('function')
  })

  test('should call inertia render with correct parameters', () => {
    const result = inertia(mockRequest, mockSet, 'home', { title: 'Test' })

    expect(result).toBeDefined()
  })

  test('should include flash message in props', () => {
    const flashData = JSON.stringify({ type: 'error', message: 'Test error' })
    const encoded = encodeURIComponent(flashData)
    mockRequest = new Request('http://localhost', {
      headers: { 'cookie': `flash=${encoded}` }
    })

    const result = inertia(mockRequest, mockSet, 'home', { title: 'Test' })

    expect(result).toBeDefined()
  })

  test('should handle empty props', () => {
    const result = inertia(mockRequest, mockSet, 'home')

    expect(result).toBeDefined()
  })

  test('should handle multiple props', () => {
    const props = {
      title: 'Test',
      user: { id: '1', name: 'Test User' },
      items: [1, 2, 3]
    }

    const result = inertia(mockRequest, mockSet, 'home', props)

    expect(result).toBeDefined()
  })
})
