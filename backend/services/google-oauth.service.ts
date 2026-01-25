/**
 * Google OAuth Authentication Service
 * This service handles the URL parameter generation for Google OAuth authentication flow.
 */

export interface GoogleOAuthConfig {
  clientId: string
  redirectUri: string
}

export interface GoogleOAuthParams {
  client_id: string
  redirect_uri: string
  scope: string
  response_type: string
  access_type: string
  prompt: string
  [key: string]: string
}

/**
 * Generates the URL parameters required for initiating Google OAuth authentication.
 *
 * @returns {string} A URL-encoded string containing all necessary OAuth parameters
 *
 * Parameters included:
 * - client_id: Your application's Google Client ID
 * - redirect_uri: The URL where Google will redirect after authentication
 * - scope: The permissions requested from the user
 *   - userinfo.email: Access to user's email
 *   - userinfo.profile: Access to user's basic profile info
 * - response_type: Set to 'code' for authorization code flow
 * - access_type: Set to 'offline' to receive a refresh token
 * - prompt: Set to 'consent' to always show the consent screen
 *
 * @throws {Error} If required environment variables are not set
 */
export function redirectParamsURL(): string {
  const clientId = process.env.GOOGLE_CLIENT_ID
  const redirectUri = process.env.GOOGLE_REDIRECT_URI

  if (!clientId) {
    throw new Error('GOOGLE_CLIENT_ID environment variable is not set')
  }
  if (!redirectUri) {
    throw new Error('GOOGLE_REDIRECT_URI environment variable is not set')
  }

  const params: GoogleOAuthParams = {
    client_id: clientId as string,
    redirect_uri: redirectUri as string,
    scope: [
      'https://www.googleapis.com/auth/userinfo.email',
      'https://www.googleapis.com/auth/userinfo.profile',
    ].join(' '),
    response_type: 'code',
    access_type: 'offline',
    prompt: 'consent',
  }

  return new URLSearchParams(params).toString()
}

/**
 * Generates the complete Google OAuth authorization URL.
 *
 * @returns {string} The full Google OAuth authorization URL
 *
 * @throws {Error} If required environment variables are not set
 */
export function getGoogleAuthURL(): string {
  const baseUrl = 'https://accounts.google.com/o/oauth2/v2/auth'
  const params = redirectParamsURL()
  return `${baseUrl}?${params}`
}

/**
 * Exchanges an authorization code for access and refresh tokens.
 *
 * @param {string} code - The authorization code received from Google
 * @returns {Promise<{ access_token: string; refresh_token?: string; expires_in: number }>}
 *
 * @throws {Error} If required environment variables are not set or request fails
 */
export async function exchangeCodeForTokens(code: string): Promise<{
  access_token: string
  refresh_token?: string
  expires_in: number
}> {
  const clientId = process.env.GOOGLE_CLIENT_ID
  const clientSecret = process.env.GOOGLE_CLIENT_SECRET
  const redirectUri = process.env.GOOGLE_REDIRECT_URI

  if (!clientId) {
    throw new Error('GOOGLE_CLIENT_ID environment variable is not set')
  }
  if (!clientSecret) {
    throw new Error('GOOGLE_CLIENT_SECRET environment variable is not set')
  }
  if (!redirectUri) {
    throw new Error('GOOGLE_REDIRECT_URI environment variable is not set')
  }

  const tokenEndpoint = 'https://oauth2.googleapis.com/token'
  const response = await fetch(tokenEndpoint, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: new URLSearchParams({
      code,
      client_id: clientId,
      client_secret: clientSecret,
      redirect_uri: redirectUri,
      grant_type: 'authorization_code',
    }),
  })

  if (!response.ok) {
    const errorText = await response.text()
    throw new Error(`Failed to exchange code for tokens: ${errorText}`)
  }

  const data = await response.json()
  return {
    access_token: data.access_token,
    refresh_token: data.refresh_token,
    expires_in: data.expires_in,
  }
}

/**
 * Retrieves user information from Google using an access token.
 *
 * @param {string} accessToken - The access token from Google
 * @returns {Promise<{ id: string; email: string; name: string; picture?: string }>}
 *
 * @throws {Error} If request fails
 */
export async function getGoogleUserInfo(accessToken: string): Promise<{
  id: string
  email: string
  name: string
  picture?: string
}> {
  const userInfoEndpoint = 'https://www.googleapis.com/oauth2/v2/userinfo'
  const response = await fetch(userInfoEndpoint, {
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  })

  if (!response.ok) {
    const errorText = await response.text()
    throw new Error(`Failed to fetch user info: ${errorText}`)
  }

  const data = await response.json()
  return {
    id: data.id,
    email: data.email,
    name: data.name,
    picture: data.picture,
  }
}

export default {
  redirectParamsURL,
  getGoogleAuthURL,
  exchangeCodeForTokens,
  getGoogleUserInfo,
}
