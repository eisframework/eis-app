<script lang="ts"> 
  import NavLink from './NavLink.svelte'
  import type { Snippet } from 'svelte'

  let { auth, children }: { auth: { user: { id: number; name: string; email: string } | null }, children: Snippet } = $props()

  let isAuthenticated = $derived(!!auth?.user)
</script>

<div class="min-h-screen bg-gray-50">
  <nav class="bg-white shadow-sm">
    <div class="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
      <div class="flex justify-between h-16">
        <div class="flex">
          <div class="flex-shrink-0 flex items-center">
            <NavLink href="/">Home</NavLink>
          </div>
          <div class="hidden sm:ml-6 sm:flex sm:space-x-8">
            <NavLink href="/about">About</NavLink>
            {#if isAuthenticated}
              <NavLink href="/dashboard">Dashboard</NavLink>
              <NavLink href="/users">Users</NavLink>
            {:else}
              <NavLink href="/login">Login</NavLink>
              <NavLink href="/register">Register</NavLink>
            {/if}
          </div>
        </div>
        {#if isAuthenticated}
          <div class="flex items-center">
            <span class="text-gray-700 mr-4">{auth.user?.name}</span>
            <form method="POST" action="/logout">
              <button
                type="submit"
                class="text-gray-700 hover:text-gray-900"
              >
                Logout
              </button>
            </form>
          </div>
        {/if}
      </div>
    </div>
  </nav>

  <main>
    {@render children()}
  </main>

  <footer class="bg-white mt-auto">
    <div class="mx-auto max-w-7xl py-6 px-4 sm:px-6 lg:px-8">
      <p class="text-center text-gray-500 text-sm">
        &copy; 2025 Elysia Inertia Svelte Boilerplate
      </p>
    </div>
  </footer>
</div>
