import { app } from './app'

const port = Number(process.env.PORT) || 3000

const server = app.listen(port)

console.log(
  `🦊 Elysia is running at ${server.server?.hostname}:${server.server?.port}`
)
