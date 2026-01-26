import type { ControllerContext } from '../../types/controller.types'

export const asCtx = <T = ControllerContext>(ctx: any): T => ctx as unknown as T

/**
 * Higher-order function to wrap controller handlers with context conversion
 * Usage: .get('/path', wrapHandler(controller.method))
 */
export function wrapHandler<T extends (...args: any[]) => any>(
  handler: T
): (ctx: any) => ReturnType<T> {
  return (ctx: any) => handler(asCtx(ctx))
}
