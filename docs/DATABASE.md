# Database Guide

This project uses Drizzle ORM with bun:sqlite for database management.

## Setup

### Database Location
- SQLite database files: `data/dev.sqlite`, `data/prod.sqlite`, `data/test.sqlite`
- Schema location: `backend/database/schema/index.ts`
- Migrations: `backend/database/migrations/`

### Configuration

**drizzle.config.ts**
```typescript
import type { Config } from 'drizzle-kit'

const env = process.env.NODE_ENV || 'dev'

export default {
  schema: './backend/database/schema/index.ts',
  out: './backend/database/migrations',
  dialect: 'sqlite',
  dbCredentials: {
    url: `./data/${env}.sqlite`
  }
} satisfies Config
```

## Schema

### Users Table
```typescript
export const users = sqliteTable('users', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  name: text('name').notNull(),
  email: text('email').notNull().unique(),
  password: text('password').notNull(),
  createdAt: integer('created_at', { mode: 'timestamp' }).notNull(),
  updatedAt: integer('updated_at', { mode: 'timestamp' }).notNull()
})
```

### Sessions Table
```typescript
export const sessions = sqliteTable('sessions', {
  id: text('id').primaryKey(),
  userId: integer('user_id').references(() => users.id, { onDelete: 'cascade' }),
  token: text('token').notNull().unique(),
  expiresAt: integer('expires_at', { mode: 'timestamp' }).notNull(),
  createdAt: integer('created_at', { mode: 'timestamp' }).notNull()
})
```

## Usage

### Import Database
```typescript
import { db } from './database'
import { users, sessions } from './database/schema'
import { eq } from 'drizzle-orm'
```

### Register User
```typescript
const newUser = await db.insert(users).values({
  name: 'John Doe',
  email: 'john@example.com',
  password: await hashPassword('password123')
}).returning()
```

### Login User
```typescript
const user = await db.select()
  .from(users)
  .where(eq(users.email, 'john@example.com'))
```

### Create Session
```typescript
const session = await db.insert(sessions).values({
  id: generateId(),
  userId: user.id,
  token: generateToken(),
  expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
}).returning()
```

### Delete Session
```typescript
await db.delete(sessions)
  .where(eq(sessions.token, token))
```

## Migrations

### Generate Migration
```bash
bun run db:generate
```
Creates SQL migration files from schema changes.

### Run Migration

**Development (default)**
```bash
bun run db:migrate
```

**Production**
```bash
NODE_ENV=production bun run db:migrate
```

**Test**
```bash
NODE_ENV=test bun run db:migrate
```

Applies pending migrations to database.

### Workflow
1. Edit schema in `backend/database/schema/index.ts`
2. Run `bun run db:generate` to create migration
3. Run `bun run db:migrate` to apply to database

## Database Studio

View and edit database using Drizzle Studio:
```bash
bun run db:studio
```

## Environment Variables

### Development (.env)
```bash
DB_PATH=./data/dev.sqlite
NODE_ENV=dev
```

### Production (.env.production)
```bash
DB_PATH=./data/prod.sqlite
NODE_ENV=production
```

### Test (.env.test)
```bash
DB_PATH=./data/test.sqlite
NODE_ENV=test
```

### Database Files
- `data/dev.sqlite` - Development database
- `data/prod.sqlite` - Production database
- `data/test.sqlite` - Testing database
