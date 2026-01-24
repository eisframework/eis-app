import { describe, it, expect, vi, beforeEach } from 'vitest'
import { Elysia } from 'elysia'
import { homeRoutes } from '../../../backend/routes/web/home'

describe('Home Routes', () => {
  let app: Elysia

  beforeEach(() => {
    app = new Elysia()
    homeRoutes(app)
  })

  it('should respond to GET /', async () => {
    const response = await app.handle(new Request('http://localhost:3000/'))

    expect(response.status).toBe(200)
  })

  it('should respond to GET /test', async () => {
    const response = await app.handle(new Request('http://localhost:3000/test'))

    expect(response.status).toBe(200)
  })

  it('should respond to GET /home', async () => {
    const response = await app.handle(new Request('http://localhost:3000/home'))

    expect(response.status).toBe(200)
  })

  it('should respond to GET /about', async () => {
    const response = await app.handle(new Request('http://localhost:3000/about'))

    expect(response.status).toBe(200)
  })

  it('should respond to GET /dashboard', async () => {
    const response = await app.handle(new Request('http://localhost:3000/dashboard'))

    expect(response.status).toBe(303)
  })
})
