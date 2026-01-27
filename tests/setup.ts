import { expect, afterEach } from 'bun:test'
import { cleanup } from '@testing-library/svelte'
import '@testing-library/jest-dom/vitest'

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
