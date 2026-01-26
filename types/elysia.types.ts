import type { AuthUser } from '../backend/services/auth.service'
import type { InertiaHandler } from './controller.types'

export interface AppContext {
  inertia: InertiaHandler
  user?: AuthUser
}
