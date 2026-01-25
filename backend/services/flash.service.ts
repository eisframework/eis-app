import type { FlashType, FlashMessage, FlashSetContext } from '../../types/controller.types'

export const flash = {
  /**
   * Set flash message as cookie
   */
  set(set: FlashSetContext, type: FlashType, message: string) {
    const flashData = JSON.stringify({ type, message })
    set.headers['Set-Cookie'] = `flash=${encodeURIComponent(flashData)}; Path=/; HttpOnly; SameSite=Lax`
  },

  /**
   * Get flash message from request headers and clear it
   */
  get(request: Request, set?: FlashSetContext): FlashMessage | null {
    const cookieHeader = request.headers.get('cookie')
    if (!cookieHeader) return null

    const cookies = cookieHeader.split(';').reduce((acc: Record<string, string>, cookie: string) => {
      const [key, value] = cookie.trim().split('=')
      acc[key] = value
      return acc
    }, {})

    const flashCookie = cookies.flash
    if (!flashCookie) return null

    if (set) {
      this.clear(set)
    }

    try {
      return JSON.parse(decodeURIComponent(flashCookie))
    } catch {
      return null
    }
  },

  /**
   * Clear flash cookie
   */
  clear(set: FlashSetContext) {
    set.headers['Set-Cookie'] = 'flash=; Path=/; HttpOnly; SameSite=Lax; Max-Age=0'
  }
}

export default flash
