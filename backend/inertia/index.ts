import { Elysia } from 'elysia'
import { inertiaHandler } from './handler'
import type { InertiaConfig } from './response'

export const inertia = (config: InertiaConfig) => {
  // Don't use Elysia hooks - they run on every request
  // Instead, provide a direct function for controllers to call
  return (request: Request, set: any, page: string, props: any = {}) =>
    inertiaHandler(request, set, config, page, props)
}
