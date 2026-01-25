import { Eta } from 'eta'
import manifest from "../../dist/.vite/manifest.json"

const eta = new Eta({ views: 'backend/views' })

const asset = (path: string) => {
  const isDev = process.env.NODE_ENV !== 'production'
  if (isDev) {
    return `http://localhost:5173/${path}`
  }
  return `/`+manifest[path as keyof typeof manifest]?.file
}

export const view = {
  render(template: string, props: Record<string, unknown> = {}) {
    const html = eta.render(template, { ...props, asset })
    return new Response(html, {
      headers: { 'Content-Type': 'text/html; charset=utf-8' }
    })
  }
}

export default view
