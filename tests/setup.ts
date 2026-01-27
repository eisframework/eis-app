import { expect, afterEach } from 'vitest'
import { cleanup } from '@testing-library/svelte'
import '@testing-library/jest-dom/vitest'

declare global {
  var Bun: {
    file: (path: string) => {
      text: () => Promise<string>
      arrayBuffer: () => Promise<ArrayBuffer>
    }
    write: (path: string, data: Buffer) => Promise<number>
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
  write: async (path: string, data: Buffer) => data.length
}

afterEach(() => {
  cleanup()
})
