import { Elysia } from 'elysia'
import { publicController } from '../../controllers/public.controller'
import { authController } from '../../controllers/auth.controller'
import { googleAuthController } from '../../controllers/google-auth.controller'
import type { ControllerContext } from '../../../types/controller.types'

export const publicRoutes = (app: Elysia<any>) => app
  .get('/', async () => await publicController.landing())
  .get('/test', async () => new Response(""))
  .get('/about', async (ctx) => await publicController.about(ctx as unknown as ControllerContext))
  .get('/pricing', async (ctx) => await publicController.pricing(ctx as unknown as ControllerContext))
  .get('/features', async (ctx) => await publicController.features(ctx as unknown as ControllerContext))
  .get('/contact', async (ctx) => await publicController.contact(ctx as unknown as ControllerContext))
  .get('/login', async (ctx) => await authController.getLogin(ctx as unknown as ControllerContext))
  .post('/login', async (ctx) => await authController.postLogin(ctx as unknown as ControllerContext & { body: any }))
  .get('/register', async (ctx) => await authController.getRegister(ctx as unknown as ControllerContext))
  .post('/register', async (ctx) => await authController.postRegister(ctx as unknown as ControllerContext & { body: any }))
  .get('/forgot-password', async (ctx) => await authController.getForgotPassword(ctx as unknown as ControllerContext))
  .post('/forgot-password', async (ctx) => await authController.postForgotPassword(ctx as unknown as ControllerContext & { body: any }))
  .get('/reset-password', async (ctx) => await authController.getResetPassword(ctx as unknown as ControllerContext))
  .post('/reset-password', async (ctx) => await authController.postResetPassword(ctx as unknown as ControllerContext & { body: any }))
  .post('/logout', async (ctx) => await authController.postLogout(ctx as unknown as ControllerContext))
  .post('/impersonate', async (ctx) => await authController.postImpersonate(ctx as unknown as ControllerContext & { body: any }))
  .get('/auth/google/redirect', async (ctx) => await googleAuthController.getGoogleRedirect(ctx as unknown as ControllerContext))
  .get('/auth/google/callback', async (ctx) => await googleAuthController.getGoogleCallback(ctx as unknown as ControllerContext & { query: any }))
