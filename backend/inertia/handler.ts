import { Inertia } from './response'

export function inertiaHandler(
  request: Request,
  set: { headers: Record<string, string>; status?: number },
  config: import('./response').InertiaConfig,
  page: string,
  props: any
) {
  const inertia = new Inertia(request, set, config)
  return inertia.render(page, props)
}
