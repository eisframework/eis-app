import { drizzle } from 'drizzle-orm/bun-sqlite'
import { Database } from 'bun:sqlite'
import * as schema from './schema'

const dbPath = process.env.DB_PATH || './data/database.sqlite'
const sqlite = new Database(dbPath)

// Enable foreign keys and WAL mode
sqlite.exec('PRAGMA foreign_keys = ON')
sqlite.exec('PRAGMA journal_mode = WAL')

export const db = drizzle(sqlite, { schema })

export default db
