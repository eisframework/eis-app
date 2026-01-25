<script lang="ts">
  import NavLink from './NavLink.svelte'
  import type { Snippet } from 'svelte'
  import { Sun, Moon } from 'lucide-svelte'

  let { auth, children }: { auth: { user: { id: number; name: string; email: string } | null }, children: Snippet } = $props()

  let isAuthenticated = $derived(!!auth?.user)
  let mobileMenuOpen = $state(false)
  
  // Initialize dark mode from localStorage or system preference
  const savedDarkMode = localStorage.getItem('darkMode')
  let isDarkMode = $state(savedDarkMode !== null ? savedDarkMode === 'true' : window.matchMedia('(prefers-color-scheme: dark)').matches)

  // Toggle dark mode
  function toggleDarkMode() {
    isDarkMode = !isDarkMode
    if (isDarkMode) {
      document.documentElement.classList.add('dark')
    } else {
      document.documentElement.classList.remove('dark')
    }
    localStorage.setItem('darkMode', isDarkMode ? 'true' : 'false')
  }
</script>

<div class="min-h-screen bg-background text-foreground flex flex-col">
  <!-- Navigation -->
  <nav class="fixed top-0 left-0 right-0 z-50 bg-card/80 backdrop-blur-lg border-b border-border">
    <div class="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
      <div class="flex justify-between h-16">
        <div class="flex items-center">
          <NavLink href="/" class="flex items-center gap-2 text-xl font-bold text-foreground hover:text-primary transition-colors">
            <svg class="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 10V3L4 14h7v7l9-11h-7z"></path>
            </svg>
            <span class="text-transparent bg-clip-text bg-gradient-to-r from-orange-400 to-red-500">EIS Framework</span>
          </NavLink>
        </div>

        <!-- Desktop Navigation -->
        <div class="hidden sm:flex sm:items-center sm:space-x-1">
          <NavLink href="/home" class="px-4 py-2 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted transition-all">Home</NavLink>
          <NavLink href="/users" class="px-4 py-2 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted transition-all">Users</NavLink>
          <NavLink href="/profile" class="px-4 py-2 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted transition-all">Profile</NavLink>
        </div>

        <!-- Right side buttons -->
        <div class="flex items-center gap-2">
          <!-- Dark mode toggle -->
          <button
            type="button"
            onclick={toggleDarkMode}
            class="p-2 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted transition-all"
            title={isDarkMode ? 'Switch to light mode' : 'Switch to dark mode'}
          >
            {#if isDarkMode}
              <Sun class="w-5 h-5" />
            {:else}
              <Moon class="w-5 h-5" />
            {/if}
          </button>

          <!-- Mobile menu button -->
          <div class="flex items-center sm:hidden">
            <button
              type="button"
              class="inline-flex items-center justify-center p-2 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
              onclick={() => mobileMenuOpen = !mobileMenuOpen}
            >
              <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                {#if mobileMenuOpen}
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
                {:else}
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h16"></path>
                {/if}
              </svg>
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Mobile menu -->
    {#if mobileMenuOpen}
      <div class="sm:hidden border-t border-border">
        <div class="px-2 pt-2 pb-3 space-y-1">
          <NavLink href="/home" class="block px-3 py-2 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted transition-all">Home</NavLink>
          <NavLink href="/users" class="block px-3 py-2 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted transition-all">Users</NavLink>
          <NavLink href="/profile" class="block px-3 py-2 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted transition-all">Profile</NavLink>
        </div>
        {#if isAuthenticated}
          <div class="px-4 py-3 border-t border-border">
            <div class="flex items-center justify-between">
              <div class="flex items-center gap-3">
                <div class="w-8 h-8 rounded-full bg-gradient-to-r from-orange-400 to-red-500 flex items-center justify-center text-primary-foreground font-bold text-sm">
                  {auth.user?.name?.charAt(0).toUpperCase() || 'U'}
                </div>
                <div>
                  <p class="text-sm font-medium text-foreground">{auth.user?.name}</p>
                  <p class="text-xs text-muted-foreground">{auth.user?.email}</p>
                </div>
              </div>
              <form method="POST" action="/logout">
                <button
                  type="submit"
                  class="text-sm text-muted-foreground hover:text-foreground transition-colors"
                >
                  Logout
                </button>
              </form>
            </div>
          </div>
        {/if}
      </div>
    {/if}
  </nav>

  <!-- Main Content -->
  <main class="flex-1 pt-16">
    {@render children()}
  </main>
 
</div>
