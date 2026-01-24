export type FlashType = 'success' | 'error'

export interface FlashMessage {
  type: FlashType
  message: string
}

export const flash = {
  /**
   * Set flash message as cookie
   */
  set(set: any, type: FlashType, message: string) {
    const flashData = JSON.stringify({ type, message })
    set.headers['Set-Cookie'] = `flash=${encodeURIComponent(flashData)}; Path=/; HttpOnly; SameSite=Lax`
  },

  /**
   * Get flash message from request headers
   */
  get(request: Request): FlashMessage | null {
    const cookieHeader = request.headers.get('cookie')
    if (!cookieHeader) return null

    const cookies = cookieHeader.split(';').reduce((acc: any, cookie: string) => {
      const [key, value] = cookie.trim().split('=')
      acc[key] = value
      return acc
    }, {})

    const flashCookie = cookies.flash
    if (!flashCookie) return null

    try {
      return JSON.parse(decodeURIComponent(flashCookie))
    } catch {
      return null
    }
  },

  /**
   * Clear flash cookie
   */
  clear(set: any) {
    set.headers['Set-Cookie'] = 'flash=; Path=/; HttpOnly; SameSite=Lax; Max-Age=0'
  }
}

export default flash
