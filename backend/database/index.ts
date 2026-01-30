import { drizzle } from 'drizzle-orm/bun-sqlite'
import { drizzle as drizzleD1 } from 'drizzle-orm/d1'
import { Database } from 'bun:sqlite'
import * as schema from './schema'

const dbPath = process.env.DB_PATH || './data/dev.sqlite'

// Check if running in Cloudflare Workers (D1) or locally (SQLite)
const isCloudflare = process.env.CLOUDFLARE_ENV === 'production'

let db: ReturnType<typeof drizzle> | null = null
let sqlite: Database | null = null

export function getDb(d1Binding?: any) {
  if (d1Binding) {
    return drizzleD1(d1Binding, { schema })
  }

  if (!db) {
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

  return db
}

export function closeDatabase() {
  if (sqlite) {
    sqlite.close()
  }
}

export default getDb
