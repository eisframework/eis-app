import { Elysia } from 'elysia'
import { usersController } from '../../controllers/users.controller'
import { dashboardController } from '../../controllers/dashboard.controller'
import { uploadController } from '../../controllers/upload.controller'
import { publicController } from '../../controllers/public.controller'
import authService from '../../services/auth.service'
import { wrapHandler } from '../../utils/type-helpers'

// Auth guard middleware
const authGuard = async ({ user }: { user: any }) => {
  if (!user) throw new Error('Unauthorized')
}

export const authRoutes = (app: Elysia<any>) => app
  // Load user from cookie
  .derive(async ({ cookie }) => {
    const token = (cookie?.auth_token?.value as string) || ''
    const user = await authService.getSessionUser(token)
    return { user }
  })
  // Auth guard for all routes
  .onBeforeHandle(authGuard)
  .get('/home', wrapHandler(publicController.home))
  .group('/dashboard', (app) => app
    .get('/', wrapHandler(dashboardController.dashboard))
  )
  .group('/profile', (app) => app
    .get('/', wrapHandler(dashboardController.profile))
    .post('/', wrapHandler(dashboardController.updateProfile))
  )
  .group('/users', (app) => app
    .get('/', wrapHandler(usersController.index))
    .get('/create', wrapHandler(usersController.create))
    .post('/', wrapHandler(usersController.store))
    .get('/:id', wrapHandler(usersController.show))
    .get('/:id/edit', wrapHandler(usersController.edit))
    .put('/', wrapHandler(usersController.update))
    .delete('/:id', wrapHandler(usersController.delete))
  )
  .group('/upload', (app) => app
    .post('/image', wrapHandler(uploadController.uploadImage))
    .post('/file', wrapHandler(uploadController.uploadFile))
    .delete('/:id', wrapHandler(uploadController.delete))
  )
