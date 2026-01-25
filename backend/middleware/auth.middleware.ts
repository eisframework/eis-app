import { users, sessions } from '../database/schema'
import db from '../database'
import { eq } from 'drizzle-orm'

export interface AuthUser {
  id: string
  name: string
  email: string
  role: string
}

export async function getSessionUser(token: string): Promise<AuthUser | null> {
  if (!token) return null

  const session = await db.query.sessions.findFirst({
    where: eq(sessions.token, token),
    with: {
      user: true
    }
  })

  if (!session) return null

  // Check if session is expired
  if (new Date(session.expiresAt) < new Date()) {
    await db.delete(sessions).where(eq(sessions.token, token))
    return null
  }

  const user = session.user as { id: string; name: string; email: string; role: string }
  return {
    id: user.id,
    name: user.name,
    email: user.email,
    role: user.role
  }
}

export async function authMiddleware(cookie: any): Promise<AuthUser | null> {
  const token = cookie.auth_token?.value || ''
  return getSessionUser(token)
}
