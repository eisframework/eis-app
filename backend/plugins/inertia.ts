import manifest from "../../dist/.vite/manifest.json"
import { flash } from '../services/flash.service'

export interface InertiaConfig {
  root: string
  version?: () => string
  sharedProps?: Record<string, any> | (() => Record<string, any>)
}

class Inertia {
  private request: Request
  private set: { headers: Record<string, string>; status?: number }
  private config: InertiaConfig
  private cachedTemplate: string | null = null

  constructor(request: Request, set: { headers: Record<string, string>; status?: number }, config: InertiaConfig) {
    this.request = request
    this.set = set
    this.config = config
  }

  private isXhr(): boolean {
    return this.request.headers.get('X-Inertia') === 'true'
  }

  private getSharedProps(): any {
    const shared = this.config.sharedProps || {}
    return typeof shared === 'function' ? shared() : shared
  }

  private getVersion(): string {
    const version = this.config.version || (() => '1.0.0')
    return version()
  }

  private async getTemplate(): Promise<string> {
    if (!this.cachedTemplate || process.env.NODE_ENV === 'development') {
      const templatePath = `${process.cwd()}/${this.config.root}/inertia.html`
      this.cachedTemplate = await Bun.file(templatePath).text()
    }
    return this.cachedTemplate!
  }

  private processViteDirective(html: string): string {
    const viteRegex = /@vite\(['"](.+?)['"]\)/g
     
    return html.replace(viteRegex, (_, entry) => { 
      const isDev = process.env.NODE_ENV !== 'production'
      
      if (isDev) {
        return ` 
    <script type="module" src="http://localhost:5173/${entry}"></script>`
      }
      
      return `<script type="module" src="/${manifest[entry as keyof typeof manifest]?.file}"></script>`
    })
  }

  async render(page: string, props: any = {}) {
    const allProps = { ...this.getSharedProps(), ...props }

    if (this.isXhr()) {
      this.set.headers['X-Inertia'] = 'true'
      this.set.headers['Vary'] = 'Accept'

      return {
        component: page,
        props: allProps,
        url: this.request.url,
        version: this.getVersion()
      }
    }

    this.set.headers['Content-Type'] = 'text/html; charset=utf-8'
    
    const template = await this.getTemplate()

    const pageData = JSON.stringify({
      component: page,
      props: allProps,
      url: this.request.url,
      version: this.getVersion()
    })
 

    const html = this.processViteDirective(template)
    
    return html
      .replace('<div id="app"></div>', `<div id="app" data-page='${pageData}'></div>`)
  }
}

export async function inertiaHandler(
  request: Request,
  set: { headers: Record<string, string>; status?: number },
  config: InertiaConfig,
  page: string,
  props: any
) {
  const inertia = new Inertia(request, set, config)
  return await inertia.render(page, props)
}

export const inertia = (config: InertiaConfig) => {
  return (request: Request, set: any, page: string, props: any = {}) =>
    inertiaHandler(request, set, config, page, props)
}

const render = inertia({
  root: 'backend/views',
  version: () => process.env.APP_VERSION || '1.0.0',
  sharedProps: {}
})

export function inertiaWithFlash(
  request: Request,
  set: { headers: Record<string, string | number>; status?: number | string },
  page: string,
  props: Record<string, unknown> = {}
) {
  const flashMessage = flash.get(request, set)
  return render(request, set, page, {
    ...props,
    flash: flashMessage
  })
}

export default inertiaWithFlash
