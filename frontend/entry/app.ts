import { createInertiaApp } from '@inertiajs/svelte'
import { mount, hydrate } from 'svelte'
import './style.css'

createInertiaApp({
  resolve: async (name: string) => {
    const pages = import.meta.glob('../pages/**/*.svelte', { eager: false }) as Record<string, () => Promise<{ default: any }>>
    const page = pages[`../pages/${name}.svelte`]

    if (!page) {
      throw new Error(`Page not found: ${name}`)
    }

    const module = await page()
    return module
  },
  setup({ el, App, props }: { el: HTMLElement; App: any; props: any }) {
    // Svelte 5: use mount() instead of new Component()
    if (!el) throw new Error('Root element not found')
    
    if (el.dataset.serverRendered === 'true') {
      hydrate(App, { target: el, props })
    } else {
      mount(App, { target: el, props })
    }
  },
  progress: {
    color: '#4B5563',
    showSpinner: true
  }
})
