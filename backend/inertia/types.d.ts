import 'elysia'

declare module 'elysia' {
  interface Elysia {
    use: any
  }
}

declare module 'elysia' {
  interface ElysiaContext {
    render?: (page: string, props?: any) => any
  }
}
