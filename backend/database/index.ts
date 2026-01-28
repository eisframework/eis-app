import { drizzle } from 'drizzle-orm/bun-sqlite'
import { Database } from 'bun:sqlite'
import * as schema from './schema'

const dbPath = process.env.DB_PATH || './data/dev.sqlite'
export const sqlite = new Database(dbPath)

// Enable foreign keys and WAL mode
sqlite.exec('PRAGMA foreign_keys = ON')
// WAL mode not supported for :memory: databases
if (dbPath !== ':memory:') {
  sqlite.exec('PRAGMA journal_mode = WAL')
}

export const db = drizzle(sqlite, { schema })

export function closeDatabase() {
  sqlite.close()
}

export default db
