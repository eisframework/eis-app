# Cloudflare D1 Setup Guide

## Prerequisites

1. Install Wrangler CLI (already done)
2. Login to Cloudflare: `wrangler login`

## Setup Steps

### 1. Create D1 Database

```bash
wrangler d1 create eis-app-db
```

This will output a database ID. Update `wrangler.toml` with this ID:

```toml
[[d1_databases]]
binding = "DB"
database_name = "eis-app-db"
database_id = "your-actual-database-id-here"
```

### 2. Run Migrations on D1

```bash
wrangler d1 execute eis-app-db --local --file=./backend/database/migrations/0000_abnormal_sway.sql
wrangler d1 execute eis-app-db --local --file=./backend/database/migrations/0001_faithful_natasha_romanoff.sql
wrangler d1 execute eis-app-db --local --file=./backend/database/migrations/0002_woozy_ricochet.sql
```

For production:
```bash
wrangler d1 execute eis-app-db --file=./backend/database/migrations/0000_abnormal_sway.sql
wrangler d1 execute eis-app-db --file=./backend/database/migrations/0001_faithful_natasha_romanoff.sql
wrangler d1 execute eis-app-db --file=./backend/database/migrations/0002_woozy_ricochet.sql
```

### 3. Update Backend Entry Point

In your backend entry point (`backend/app.ts`), you need to access the D1 binding:

```typescript
import { Elysia } from 'elysia'
import { getDb } from './database'

const app = new Elysia()

// For Cloudflare Workers with D1
app.get('/', ({ env }) => {
  const db = getDb(env.DB)
  // Use db here
})

// For local development
app.get('/', () => {
  const db = getDb()
  // Use db here
})
```

### 4. Deploy to Cloudflare Workers

```bash
wrangler deploy
```

## Local Development with D1

To test locally with D1:

```bash
wrangler dev
```

This will start a local server that mimics Cloudflare Workers with D1.

## Migration Commands

- Generate new migration: `bun run db:generate`
- Apply migration locally: `wrangler d1 execute eis-app-db --local --file=./backend/database/migrations/XXXX_migration.sql`
- Apply migration to production: `wrangler d1 execute eis-app-db --file=./backend/database/migrations/XXXX_migration.sql`

## Environment Variables

Make sure to set `CLOUDFLARE_ENV=production` when deploying to Cloudflare.

## Notes

- The current setup supports both local SQLite and Cloudflare D1
- Use `getDb()` for local development
- Use `getDb(d1Binding)` for Cloudflare Workers
- The binding name "DB" is defined in wrangler.toml and should match what's used in your code
