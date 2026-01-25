import type { AuthUser } from '../backend/services/auth.service'

// Common types
export interface AppCookieStore {
  auth_token: {
    value?: string
    httpOnly?: boolean
    path?: string
    maxAge?: number
    remove: () => void
  }
}

export interface ResponseSet {
  headers: Record<string, string | number>
  status?: number | string
}

export interface InertiaHandler {
  (page: string, props?: Record<string, unknown>): Response | string
}

// Controller context - matches Elysia's actual context structure
export interface ControllerContext {
  user?: AuthUser
  body?: unknown
  query?: Record<string, string>
  params?: Record<string, string>
  headers: Record<string, string | undefined>
  set: ResponseSet
  cookie?: AppCookieStore
  inertia: InertiaHandler
  request: Request
}

// Helper to create ResponseSet from Elysia context
export function createResponseSet(ctx: ControllerContext): ResponseSet {
  return {
    headers: Object.fromEntries(
      Object.entries(ctx.set.headers).filter(([_, v]) => typeof v === 'string')
    ) as Record<string, string>,
    status: typeof ctx.set.status === 'number' ? ctx.set.status : undefined
  }
}

// Helper to get Request from Elysia context
export function getRequestFromContext(ctx: ControllerContext): Request {
  const url = ctx.headers['host'] ? `https://${ctx.headers['host']}` : 'http://localhost'
  return {
    url,
    headers: new Headers(Object.fromEntries(
      Object.entries(ctx.headers).filter(([_, v]) => v !== undefined)
    ) as Record<string, string>)
  } as Request
}

// Request body types (common ones only)
export interface UpdateProfileBody {
  name?: string
  email?: string
  password?: string
  current_password?: string
}

// Flash message types
export type FlashType = 'success' | 'error'

export interface FlashMessage {
  type: FlashType
  message: string
}

// Flash set context type
export interface FlashSetContext {
  headers: Record<string, string | number>
}
