import { Kysely, SqliteDialect, sql } from 'kysely'
import { D1Dialect } from 'kysely-d1'
import { Database } from './types'

const dbPath = process.env.DB_PATH || './data/dev.sqlite'

let db: Kysely<Database> | null = null

export function getDb(d1Binding?: any): Kysely<Database> {
  if (d1Binding) {
    return new Kysely<Database>({
      dialect: new D1Dialect({ database: d1Binding })
    })
  }

  if (!db) {
    db = new Kysely<Database>({
      dialect: new SqliteDialect({
        database: new (require('better-sqlite3').Database)(dbPath)
      })
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
