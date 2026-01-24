import { Eta } from 'eta'

const eta = new Eta({ views: 'backend/views' })

const asset = (path: string) => {
  const isDev = process.env.NODE_ENV !== 'production'
  if (isDev) {
    return `http://localhost:5173/frontend/${path}`
  }
  return `/${path}`
}

export const view = {
  render(template: string, props: any = {}) {
    const html = eta.render(template, { ...props, asset })
    return new Response(html, {
      headers: { 'Content-Type': 'text/html; charset=utf-8' }
    })
  }
}

export default view
