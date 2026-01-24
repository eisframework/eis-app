import { Inertia } from './response'

export async function inertiaHandler(
  request: Request,
  set: { headers: Record<string, string>; status?: number },
  config: import('./response').InertiaConfig,
  page: string,
  props: any
) {
  const inertia = new Inertia(request, set, config)
  return await inertia.render(page, props)
}
