import { describe, test, expect } from 'bun:test'
import { flash } from '../../../backend/services/flash.service'

describe('Flash Service', () => {
  describe('set', () => {
    test('should set flash error message', () => {
      const set = { headers: {} as Record<string, string> }
      flash.set(set, 'error', 'Test error message')

      expect(set.headers['Set-Cookie']).toContain('flash=')
      expect(set.headers['Set-Cookie']).toContain('Path=/')
      expect(set.headers['Set-Cookie']).toContain('HttpOnly')
      expect(set.headers['Set-Cookie']).toContain('SameSite=Lax')
    })

    test('should set flash success message', () => {
      const set = { headers: {} as Record<string, string> }
      flash.set(set, 'success', 'Test success message')

      expect(set.headers['Set-Cookie']).toContain('flash=')
      expect(set.headers['Set-Cookie']).toContain('success')
    })

    test('should encode message properly', () => {
      const set = { headers: {} as Record<string, string> }
      const message = 'Test with special chars: <script>alert("xss")</script>'
      flash.set(set, 'error', message)

      expect(set.headers['Set-Cookie']).toContain('flash=')
    })
  })

  describe('get', () => {
    test('should return null when no cookie header', () => {
      const request = new Request('http://localhost')
      const result = flash.get(request)

      expect(result).toBeNull()
    })

    test('should return null when no flash cookie', () => {
      const request = new Request('http://localhost', {
        headers: { 'cookie': 'other=value' }
      })
      const result = flash.get(request)

      expect(result).toBeNull()
    })

    test('should return flash message when present', () => {
      const flashData = JSON.stringify({ type: 'error', message: 'Test error' })
      const encoded = encodeURIComponent(flashData)
      const request = new Request('http://localhost', {
        headers: { 'cookie': `flash=${encoded}` }
      })
      const set = { headers: {} as Record<string, string> }

      const result = flash.get(request, set)

      expect(result).toEqual({ type: 'error', message: 'Test error' })
    })

    test('should clear flash cookie after getting', () => {
      const flashData = JSON.stringify({ type: 'error', message: 'Test error' })
      const encoded = encodeURIComponent(flashData)
      const request = new Request('http://localhost', {
        headers: { 'cookie': `flash=${encoded}` }
      })
      const set = { headers: {} as Record<string, string> }

      flash.get(request, set)

      expect(set.headers['Set-Cookie']).toContain('flash=')
      expect(set.headers['Set-Cookie']).toContain('Max-Age=0')
    })

    test('should return null for invalid JSON', () => {
      const request = new Request('http://localhost', {
        headers: { 'cookie': 'flash=invalid-json' }
      })
      const result = flash.get(request)

      expect(result).toBeNull()
    })

    test('should handle multiple cookies', () => {
      const flashData = JSON.stringify({ type: 'success', message: 'Test success' })
      const encoded = encodeURIComponent(flashData)
      const request = new Request('http://localhost', {
        headers: { 'cookie': `other=value; flash=${encoded}; another=value` }
      })

      const result = flash.get(request)

      expect(result).toEqual({ type: 'success', message: 'Test success' })
    })
  })

  describe('clear', () => {
    test('should clear flash cookie', () => {
      const set = { headers: {} as Record<string, string> }
      flash.clear(set)

      expect(set.headers['Set-Cookie']).toBe('flash=; Path=/; HttpOnly; SameSite=Lax; Max-Age=0')
    })
  })
})
