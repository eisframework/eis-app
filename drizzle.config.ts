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
