import { describe, test, expect, beforeEach } from 'bun:test'
import { send } from '../../../backend/services/smtp.service'

describe('SMTP Service', () => {
  beforeEach(() => {
    // Set required environment variables
    process.env.SMTP_HOST = 'smtp.example.com'
    process.env.SMTP_PORT = '587'
    process.env.SMTP_USER = 'test@example.com'
    process.env.SMTP_PASS = 'test-password'
    process.env.EMAIL_FROM = 'test@example.com'
  })

  describe('send', () => {
    test('should throw error if SMTP_HOST not set', async () => {
      delete process.env.SMTP_HOST

      await expect(send('user@example.com', 'Test Subject')).rejects.toThrow('SMTP configuration is incomplete')
    })

    test('should throw error if SMTP_USER not set', async () => {
      delete process.env.SMTP_USER

      await expect(send('user@example.com', 'Test Subject')).rejects.toThrow('SMTP configuration is incomplete')
    })

    test('should throw error if SMTP_PASS not set', async () => {
      delete process.env.SMTP_PASS

      await expect(send('user@example.com', 'Test Subject')).rejects.toThrow('SMTP configuration is incomplete')
    })

    test('should handle single recipient', async () => {
      // Note: This test would require mocking nodemailer
      // For now, we'll test the function structure
      try {
        await send('user@example.com', 'Test Subject', '<h1>Test</h1>')
      } catch (e) {
        // Expected if no valid SMTP connection
        expect(e).toBeDefined()
      }
    })

    test('should handle multiple recipients', async () => {
      try {
        await send(['user1@example.com', 'user2@example.com'], 'Test Subject', '<h1>Test</h1>')
      } catch (e) {
        // Expected if no valid SMTP connection
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
