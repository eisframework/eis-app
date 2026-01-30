import type { Generated } from 'kysely'

export interface Database {
  users: UsersTable
  sessions: SessionsTable
  assets: AssetsTable
  password_reset_tokens: PasswordResetTokensTable
  _kysely_migrations: KyselyMigrationsTable
}

export interface UsersTable {
  id: Generated<string>
  name: string
  email: string
  password: string
  phone: string | null
  role: string
  created_at: Generated<number>
  updated_at: Generated<number>
}

export interface SessionsTable {
  id: Generated<string>
  user_id: string
  token: string
  expires_at: number
  created_at: Generated<number>
}

export interface AssetsTable {
  id: Generated<string>
  type: string
  url: string
  mime_type: string
  name: string
  size: number
  user_id: string
  storage_key: string
  created_at: Generated<number>
  updated_at: Generated<number>
}

export interface PasswordResetTokensTable {
  id: Generated<string>
  user_id: string
  token: string
  expires_at: number
  created_at: Generated<number>
}

export interface KyselyMigrationsTable {
  id: Generated<number>
  hash: string
  created_at: number
}

export type User = UsersTable
export type Session = SessionsTable
export type Asset = AssetsTable
export type PasswordResetToken = PasswordResetTokensTable
