import { describe, test, expect, beforeEach, afterEach } from 'bun:test'
import * as storageService from '../../../backend/services/storage.service'
import { existsSync, unlinkSync } from 'fs'

describe('Storage Service', () => {
  const testStoragePath = './storage'
  const testKey = 'uploads/test.txt'
  const testContent = Buffer.from('Test content')

  beforeEach(() => {
    // Set test storage path
    process.env.LOCAL_STORAGE_PATH = testStoragePath
    process.env.LOCAL_STORAGE_PUBLIC_URL = '/storage'
  })

  afterEach(() => {
    // Clean up test storage
    try {
      const testFile = `${testStoragePath}/${testKey}`
      if (existsSync(testFile)) {
        unlinkSync(testFile)
      }
    } catch (e) {
      // Ignore cleanup errors
    }
  })

  describe('uploadBuffer', () => {
    test('should upload buffer to storage', async () => {
      await storageService.uploadBuffer(testKey, testContent)

      const exists = await storageService.exists(testKey)
      expect(exists).toBe(true)
    })

    test('should create directory if not exists', async () => {
      const nestedKey = 'uploads/nested/test.txt'

      await storageService.uploadBuffer(nestedKey, testContent)

      const exists = await storageService.exists(nestedKey)
      expect(exists).toBe(true)
    })
  })

  describe('getObject', () => {
    test('should get object from storage', async () => {
      await storageService.uploadBuffer(testKey, testContent)

      const result = await storageService.getObject(testKey)

      expect(result).toBeDefined()
      expect(result.Body).toEqual(testContent)
    })

    test('should throw error for non-existent object', async () => {
      await expect(
        storageService.getObject('non-existent.txt')
      ).rejects.toThrow()
    })
  })

  describe('exists', () => {
    test('should return true for existing object', async () => {
      await storageService.uploadBuffer(testKey, testContent)

      const exists = await storageService.exists(testKey)
      expect(exists).toBe(true)
    })

    test('should return false for non-existent object', async () => {
      const exists = await storageService.exists('non-existent.txt')
      expect(exists).toBe(false)
    })
  })

  describe('deleteObject', () => {
    test('should delete object from storage', async () => {
      await storageService.uploadBuffer(testKey, testContent)

      await storageService.deleteObject(testKey)

      const exists = await storageService.exists(testKey)
      expect(exists).toBe(false)
    })
  })

  describe('getPublicUrl', () => {
    test('should return public URL with default base', () => {
      const url = storageService.getPublicUrl('uploads/test.txt')

      expect(url).toBe('/storage/uploads/test.txt')
    })

    test('should return public URL with custom base', () => {
      process.env.LOCAL_STORAGE_PUBLIC_URL = 'https://cdn.example.com'

      const url = storageService.getPublicUrl('uploads/test.txt')

      expect(url).toBe('https://cdn.example.com/uploads/test.txt')
    })

    test('should handle trailing slash in base URL', () => {
      process.env.LOCAL_STORAGE_PUBLIC_URL = '/storage/'

      const url = storageService.getPublicUrl('uploads/test.txt')

      expect(url).toBe('/storage/uploads/test.txt')
    })
  })
})
