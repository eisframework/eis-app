import { Elysia } from 'elysia'
import { staticPlugin } from '@elysiajs/static' 
import { routes } from './routes'
import inertia from './plugins/inertia'
import { join } from 'path'
import { networkInterfaces } from 'os'

const __dirname = import.meta.dir

const getNetworkAddress = () => {
  const nets = networkInterfaces()
  for (const name of Object.keys(nets)) {
    for (const net of nets[name] || []) {
      if (net.family === 'IPv4' && !net.internal) {
        return net.address
      }
    }
  }
  return 'localhost'
}

export const app = new Elysia()
  .use(staticPlugin({
    assets: join(__dirname, '../public'),
    prefix: '/public'
  })) 
  .use(staticPlugin({
    assets: join(__dirname, '../storage'),
    prefix: '/storage'
  })) 
  .use(staticPlugin({
    assets: join(__dirname, '../dist/assets'),
    prefix: '/assets'
  })) 
  .derive(({ request, set }) => ({
    inertia: (page: string, props: Record<string, unknown> = {}) => inertia(request, set, page, props)
  }))
  .use(routes)

const port = Number(process.env.PORT) || 3000
const server = app.listen(port)

const host = server.server?.hostname || 'localhost'
const network = getNetworkAddress()

console.log('🚀 Server is running!')
console.log(`📡 Local:   http://${host}:${port}`)
console.log(`📡 Network: http://${network}:${port}`)
console.log('📝 Press Ctrl+C to stop')