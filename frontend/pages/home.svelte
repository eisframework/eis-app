<script lang="ts">
  import Layout from '@components/Layout.svelte'
  import { Link } from '@inertiajs/svelte'

  let { auth = { user: null } }: { auth: { user: { id: number; name: string; email: string } | null } } = $props()
</script>

<Layout {auth}>
  <div class="py-12">
    <div class="max-w-7xl mx-auto sm:px-6 lg:px-8">
      <div class="bg-white overflow-hidden shadow-sm sm:rounded-lg">
        <div class="p-6 bg-white border-b border-gray-200">
          <h1 class="text-3xl font-bold text-gray-900 mb-4">
            Welcome to Elysia + Inertia + Svelte
          </h1>
          <p class="text-gray-600 mb-8">
            A modern full-stack boilerplate with TailwindCSS
          </p>

          {#if auth.user}
            <p class="text-green-600 mb-4">
              You are logged in as {auth.user.name}
            </p>
          {:else}
            <div class="space-x-4">
              <Link
                href="/login"
                class="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
              >
                Login
              </Link>
              <Link
                href="/register"
                class="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
              >
                Register
              </Link>
            </div>
          {/if}

          <div class="mt-8">
            <h2 class="text-xl font-semibold mb-2">Tech Stack</h2>
            <ul class="list-disc list-inside text-gray-600 space-y-1">
              <li>Elysia.js - Fast TypeScript web framework</li>
              <li>Inertia.js - Modern monolith</li>
              <li>Svelte 5 - Reactive UI framework</li>
              <li>TailwindCSS - Utility-first CSS</li>
              <li>SQLite + Drizzle - Database & ORM</li>
              <li>Bun - Fast JavaScript runtime</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  </div>
</Layout>
