import { Elysia } from 'elysia'
import { usersController } from '../../controllers/users.controller'
import { dashboardController } from '../../controllers/dashboard.controller'
import { uploadController } from '../../controllers/upload.controller'
import { authMiddleware } from '../../middleware/auth.middleware'
import type { ControllerContext } from '../../../types/controller.types'

export const authRoutes = (app: Elysia<any>) => app
  .group('/dashboard', (app) => app
    .derive(async ({ cookie }) => {
      const user = await authMiddleware(cookie)
      if (!user) throw new Error('Unauthorized')
      return { user }
    })
    .get('/', async (ctx) => await dashboardController.dashboard(ctx as unknown as ControllerContext))
  )
  .group('/profile', (app) => app
    .derive(async ({ cookie }) => {
      const user = await authMiddleware(cookie)
      if (!user) throw new Error('Unauthorized')
      return { user }
    })
    .get('/', async (ctx) => await dashboardController.profile(ctx as unknown as ControllerContext))
    .post('/', async (ctx) => await dashboardController.updateProfile(ctx as unknown as ControllerContext & { body: any }))
  )
  .group('/users', (app) => app
    .derive(async ({ cookie }) => {
      const user = await authMiddleware(cookie)
      if (!user) throw new Error('Unauthorized')
      return { user }
    })
    .get('/', async (ctx) => await usersController.index(ctx as unknown as ControllerContext))
    .get('/create', async (ctx) => await usersController.create(ctx as unknown as ControllerContext))
    .post('/', async (ctx) => await usersController.store(ctx as unknown as ControllerContext & { body: any }))
    .get('/:id', async (ctx) => await usersController.show(ctx as unknown as ControllerContext & { params: { id: string } }))
    .get('/:id/edit', async (ctx) => await usersController.edit(ctx as unknown as ControllerContext & { params: { id: string } }))
    .put('/:id', async (ctx) => await usersController.update(ctx as unknown as ControllerContext & { params: { id: string }; body: any }))
    .delete('/:id', async (ctx) => await usersController.delete(ctx as unknown as ControllerContext & { params: { id: string } }))
  )
  .group('/upload', (app) => app
    .derive(async ({ cookie }) => {
      const user = await authMiddleware(cookie)
      if (!user) throw new Error('Unauthorized')
      return { user }
    })
    .post('/image', async (ctx) => await uploadController.uploadImage(ctx as unknown as ControllerContext))
    .post('/file', async (ctx) => await uploadController.uploadFile(ctx as unknown as ControllerContext))
    .delete('/:id', async (ctx) => await uploadController.delete(ctx as unknown as ControllerContext & { params: { id: string } }))
  )
