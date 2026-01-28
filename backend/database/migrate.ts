import { Database } from 'bun:sqlite'
import { readdir } from 'fs/promises'
import { join } from 'path'

const migrationsDir = './backend/database/migrations'

// Shared database instance for migrations
let sharedSqlite: Database | null = null

async function runMigrations(externalDb?: Database) {
  const dbPath = process.env.DB_PATH || './data/database.sqlite'
  // Use external db if provided (for tests), otherwise create new connection
  const sqlite = externalDb || sharedSqlite || new Database(dbPath)
  if (!externalDb) sharedSqlite = sqlite

  // Create migrations tracking table if it doesn't exist
  sqlite.exec(`
    CREATE TABLE IF NOT EXISTS _drizzle_migrations (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      hash TEXT NOT NULL UNIQUE,
      created_at INTEGER DEFAULT (unixepoch()) NOT NULL
    )
  `)

  // Read all migration files
  const files = await readdir(migrationsDir)
  const sqlFiles = files.filter(f => f.endsWith('.sql')).sort()

  console.log(`Found ${sqlFiles.length} migration files`)

  for (const file of sqlFiles) {
    const filePath = join(migrationsDir, file)
    const content = await Bun.file(filePath).text()

    // Check if migration already ran
    const hash = Buffer.from(content).toString('base64').substring(0, 32)
    const existing = sqlite.query('SELECT * FROM _drizzle_migrations WHERE hash = ?').get(hash)

    if (existing) {
      console.log(`Skipping ${file} (already applied)`)
      continue
    }

    console.log(`Running ${file}...`)

    // Split and execute each statement
    const statements = content.split('--> statement-breakpoint')
    for (const statement of statements) {
      const trimmed = statement.trim()
      if (trimmed) {
        try {
          sqlite.exec(trimmed)
        } catch (error: any) {
          console.error(`Error executing statement: ${trimmed.substring(0, 100)}...`)
          console.error(error.message)
          throw error
        }
      }
    }

    // Mark migration as run
    sqlite.query('INSERT INTO _drizzle_migrations (hash) VALUES (?)').run(hash)
    console.log(`Applied ${file}`)
  }

  sqlite.close()
  console.log('Migrations completed successfully!')
}

// Export for use in tests
export { runMigrations }

runMigrations().catch(console.error)
