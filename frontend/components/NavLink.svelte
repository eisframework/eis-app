<script lang="ts">
  import { page } from '@inertiajs/svelte'
  import type { Snippet } from 'svelte'

  let { href, children, class: className = '' }: { href: string, children: Snippet, class?: string } = $props()

  let isActive = $derived($page.url.startsWith(href))
</script>

<a
  {href}
  class="{className} inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium
    {isActive
      ? 'border-indigo-500 text-gray-900'
      : 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700'}"
>
  {@render children()}
</a>
