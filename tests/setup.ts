import { expect, afterEach, beforeEach, beforeAll } from 'bun:test'
import { cleanup } from '@testing-library/svelte'
import '@testing-library/jest-dom/vitest'

// IMPORTANT: Set DB_PATH to in-memory database BEFORE any database imports
process.env.DB_PATH = ':memory:'

// Import database after setting DB_PATH
import db, { closeDatabase, sqlite } from '../backend/database'
import { users, sessions, passwordResetTokens } from '../backend/database/schema'
import { rateLimitStores } from '../backend/services/auth.service'

declare global {
  var Bun: {
    file: (path: string) => {
      text: () => Promise<string>
      arrayBuffer: () => Promise<ArrayBuffer>
    }
    write: (path: string, data: Buffer) => Promise<number>
    randomUUIDv7: () => string
    password: {
      hash: (password: string) => Promise<string>
      verify: (password: string, hash: string) => Promise<boolean>
    }
  }
}

// Mock Bun for tests
global.Bun = {
  file: (path: string) => ({
    text: async () => {
      const fs = await import('fs/promises')
      return await fs.readFile(path, 'utf-8')
    },
    arrayBuffer: async () => new ArrayBuffer(10)
  }),
  write: async (path: string, data: Buffer) => data.length,
  randomUUIDv7: () => 'test-uuid-' + Math.random().toString(36).substring(7),
  password: {
    hash: async (password: string) => `hashed_${password}`,
    verify: async (password: string, hash: string) => hash === `hashed_${password}`
  }
}

afterEach(() => {
  cleanup()
})

// Clean up database and rate limit stores before each test to avoid state sharing between test files
beforeEach(async () => {
  rateLimitStores.clear()
  await db.delete(passwordResetTokens)
  await db.delete(sessions)
  await db.delete(users)
})

// Run migrations and clean database before each test file
beforeAll(async () => {
  const { runMigrations } = await import('../backend/database/migrate')
  // Pass the same sqlite instance to ensure migrations run on the same database
  await runMigrations(sqlite)
  await db.delete(passwordResetTokens)
  await db.delete(sessions)
  await db.delete(users)
})
