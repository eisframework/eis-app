import { readdir } from 'fs/promises'
import { join } from 'path'
import { Database } from 'bun:sqlite'

const migrationsDir = './backend/database/migrations'

async function runMigrations() {
  const dbPath = process.env.DB_PATH || './data/dev.sqlite'
  const db = new Database(dbPath)

  // Create migrations tracking table if it doesn't exist
  db.exec(`
    CREATE TABLE IF NOT EXISTS _kysely_migrations (
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
    const existing = db.query('SELECT * FROM _kysely_migrations WHERE hash = ?').get(hash)

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
          db.exec(trimmed)
        } catch (error: any) {
          console.error(`Error executing statement: ${trimmed.substring(0, 100)}...`)
          console.error(error.message)
          throw error
        }
      }
    }

    // Mark migration as run
    db.query('INSERT INTO _kysely_migrations (hash) VALUES (?)').run(hash)
    console.log(`Applied ${file}`)
  }

  db.close()
  console.log('Migrations completed successfully!')
}

runMigrations().catch(console.error)
