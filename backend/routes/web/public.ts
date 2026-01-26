import { Elysia } from 'elysia'
import { publicController } from '../../controllers/public.controller'
import { authController } from '../../controllers/auth.controller'
import { googleAuthController } from '../../controllers/google-auth.controller'
import { wrapHandler } from '../../utils/type-helpers' 

export const publicRoutes = (app: Elysia<any>) => app
  .get('/', async () => await publicController.landing())
  .get('/test', async () => new Response(""))
  .get('/about', wrapHandler(publicController.about))
  .get('/pricing', wrapHandler(publicController.pricing))
  .get('/features', wrapHandler(publicController.features))
  .get('/contact', wrapHandler(publicController.contact))
  .get('/login', wrapHandler(authController.getLogin))
  .post('/login', wrapHandler(authController.postLogin))
  .get('/register', wrapHandler(authController.getRegister))
  .post('/register', wrapHandler(authController.postRegister))
  .get('/forgot-password', wrapHandler(authController.getForgotPassword))
  .post('/forgot-password', wrapHandler(authController.postForgotPassword))
  .get('/reset-password', wrapHandler(authController.getResetPassword))
  .post('/reset-password', wrapHandler(authController.postResetPassword))
  .post('/logout', wrapHandler(authController.postLogout))
  .post('/impersonate', wrapHandler(authController.postImpersonate))
  .get('/auth/google/redirect', wrapHandler(googleAuthController.getGoogleRedirect))
  .get('/auth/google/callback', wrapHandler(googleAuthController.getGoogleCallback))
