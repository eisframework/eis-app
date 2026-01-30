import { Elysia } from 'elysia'
import { routes } from './backend/routes'
import inertia from './backend/plugins/inertia'
import getDb from './backend/database'

export interface Env {
  DB: any
}

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    const db = getDb(env.DB)

    // Create Elysia app with D1 binding
    const app = new Elysia()
      .use(inertia)
      .use(routes)

    // Handle the request
    return app.handle(request)
  }
}
