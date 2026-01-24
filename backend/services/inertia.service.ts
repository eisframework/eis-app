import { inertia as inertiaInertia } from '../inertia'
import { flash } from './flash.service'

const render = inertiaInertia({
  root: 'backend/views',
  version: () => process.env.APP_VERSION || '1.0.0',
  sharedProps: {}
})

export function inertia(
  request: Request,
  set: { headers: Record<string, string | number>; status?: number | string },
  page: string,
  props: Record<string, unknown> = {}
) {
  const flashMessage = flash.get(request)
  return render(request, set, page, {
    ...props,
    flash: flashMessage
  })
}

export default inertia
