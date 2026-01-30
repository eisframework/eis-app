import { Kysely, sql } from 'kysely'
import { D1Dialect } from 'kysely-d1'
import { Database as DB } from './types'
import { Database } from 'bun:sqlite'

const dbPath = process.env.DB_PATH || './data/dev.sqlite'

let db: Kysely<DB> | null = null

export function getDb(d1Binding?: any): Kysely<DB> {
  if (d1Binding) {
    return new Kysely<DB>({
      dialect: new D1Dialect({ database: d1Binding })
    })
  }

  if (!db) {
    const sqlite = new Database(dbPath)
    db = new Kysely<DB>({
      dialect: new D1Dialect({ database: sqlite })
    })

    // Enable foreign keys
    sql`PRAGMA foreign_keys = ON`.execute(db)
    // WAL mode not supported for :memory: databases
    if (dbPath !== ':memory:') {
      sql`PRAGMA journal_mode = WAL`.execute(db)
    }
  }

  return db
}

export function closeDatabase() {
  if (db) {
    db.destroy()
    db = null
  }
}

export default getDb
