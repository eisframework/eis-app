import getDb from '../database'
import type { ControllerContext } from '../../types/controller.types'
import flash from '../services/flash.service'
import authService from '../services/auth.service'
import {
  getGoogleAuthURL,
  exchangeCodeForTokens,
  getGoogleUserInfo,
} from '../services/google-oauth.service'

export const googleAuthController = {
  /**
   * Redirect user to Google OAuth login page
   */
  async getGoogleRedirect() {
    const googleAuthUrl = getGoogleAuthURL()
    return Response.redirect(googleAuthUrl, 302)
  },

  /**
   * Handle Google OAuth callback
   */
  async getGoogleCallback({ query, set, cookie }: ControllerContext & { query: { code?: string } }) {
    try {
      const { code } = query

      if (!code) {
        flash.set(set, 'error', 'Authorization code not provided')
        return Response.redirect('/login', 302)
      }

      // Handle Google OAuth callback
      const result = await authService.googleCallback(code)

      // Set auth cookie
      authService.setAuthCookie(result.token, cookie!)

      return Response.redirect('/home', 303)

    } catch (error: unknown) {
      flash.set(set, 'error', error instanceof Error ? error.message : 'Google authentication failed')
      return Response.redirect('/login', 302)
    }
  }
}

export default googleAuthController
