import { readFileSync } from 'fs'
import { join } from 'path'
import manifest from "../../dist/.vite/manifest.json"

export interface InertiaConfig {
  root: string
  version?: () => string
  sharedProps?: Record<string, any> | (() => Record<string, any>)
}

export class Inertia {
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

  private getTemplate(): string {
    if (!this.cachedTemplate || process.env.NODE_ENV === 'development') {
      const templatePath = join(process.cwd(), this.config.root, 'inertia.html')
      this.cachedTemplate = readFileSync(templatePath, 'utf-8')
    }
    return this.cachedTemplate
  }

  private processViteDirective(html: string): string {
    const viteRegex = /@vite\(['"](.+?)['"]\)/g
     
    return html.replace(viteRegex, (_, entry) => { 
      const isDev = process.env.NODE_ENV !== 'production'
      
      if (isDev) {
        return ` 
    <script type="module" src="http://localhost:5173/frontend/entry/${entry}"></script>`
      }
      
      // Production: would need to read manifest and generate proper tags
      return `<script type="module" src="/${manifest[entry as keyof typeof manifest]?.file}"></script>`
    })
  }

  render(page: string, props: any = {}) {
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

    // Server-side rendering for initial page load
    this.set.headers['Content-Type'] = 'text/html; charset=utf-8'
    
    const template = this.getTemplate()

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
