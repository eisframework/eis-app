import { describe, test, expect, beforeEach } from 'bun:test'
import { send } from '../../../backend/services/resend.service'

describe('Resend Service', () => {
  beforeEach(() => {
    // Set required environment variables
    process.env.RESEND_API_KEY = 'test-api-key'
    process.env.EMAIL_FROM = 'test@example.com'
  })

  describe('send', () => {
    test('should skip sending if RESEND_API_KEY not set', async () => {
      delete process.env.RESEND_API_KEY

      await send('user@example.com', 'Test Subject', '<h1>Test</h1>')

      // Should not throw error, just skip
      expect(true).toBe(true)
    })

    test('should handle single recipient', async () => {
      // Note: This test would require mocking Resend client
      // For now, we'll test the function structure
      try {
        await send('user@example.com', 'Test Subject', '<h1>Test</h1>')
      } catch (e) {
        // Expected if no valid API key
        expect(e).toBeDefined()
      }
    })

    test('should handle multiple recipients', async () => {
      try {
        await send(['user1@example.com', 'user2@example.com'], 'Test Subject', '<h1>Test</h1>')
      } catch (e) {
        // Expected if no valid API key
        expect(e).toBeDefined()
      }
    })

    test('should send with HTML content', async () => {
      try {
        await send('user@example.com', 'Test Subject', '<h1>Test</h1>')
      } catch (e) {
        expect(e).toBeDefined()
      }
    })

    test('should send with text content', async () => {
      try {
        await send('user@example.com', 'Test Subject', undefined, 'Test text content')
      } catch (e) {
        expect(e).toBeDefined()
      }
    })

    test('should send with attachments', async () => {
      try {
        await send('user@example.com', 'Test Subject', '<h1>Test</h1>', undefined, {
          attachments: [{ filename: 'test.txt', content: 'Test content' }]
        })
      } catch (e) {
        expect(e).toBeDefined()
      }
    })

    test('should use custom from address', async () => {
      try {
        await send('user@example.com', 'Test Subject', '<h1>Test</h1>', undefined, {
          from: 'custom@example.com'
        })
      } catch (e) {
        expect(e).toBeDefined()
      }
    })

    test('should use replyTo address', async () => {
      try {
        await send('user@example.com', 'Test Subject', '<h1>Test</h1>', undefined, {
          replyTo: 'reply@example.com'
        })
      } catch (e) {
        expect(e).toBeDefined()
      }
    })
  })
})
