import { drizzle } from 'drizzle-orm/bun-sqlite'
import { drizzle as drizzleD1 } from 'drizzle-orm/d1'
import { Database } from 'bun:sqlite'
import * as schema from './schema'

const dbPath = process.env.DB_PATH || './data/dev.sqlite'

// Check if running in Cloudflare Workers (D1) or locally (SQLite)
const isCloudflare = process.env.CLOUDFLARE_ENV === 'production'

let db: ReturnType<typeof drizzle>
let sqlite: Database | null = null

if (isCloudflare) {
  // Cloudflare D1 will be injected via binding
  // Note: In Cloudflare Workers, the D1 binding is accessed via the environment
  throw new Error('D1 binding not initialized. Please initialize D1 in your worker entry point.')
} else {
  // Local SQLite database
  sqlite = new Database(dbPath)

  // Enable foreign keys and WAL mode
  sqlite.exec('PRAGMA foreign_keys = ON')
  // WAL mode not supported for :memory: databases
  if (dbPath !== ':memory:') {
    sqlite.exec('PRAGMA journal_mode = WAL')
  }

  db = drizzle(sqlite, { schema })
}

export function getDb(d1Binding?: any) {
  if (d1Binding) {
    return drizzleD1(d1Binding, { schema })
  }
  return db
}

export function closeDatabase() {
  if (sqlite) {
    sqlite.close()
  }
}

export default db
