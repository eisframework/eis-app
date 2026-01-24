import { Elysia } from 'elysia'
import { publicRoutes } from './web/public'
import { authRoutes } from './web/auth'

export const routes = (app: Elysia<any>) => {
  return publicRoutes(authRoutes(app))
}
