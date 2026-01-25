<script lang="ts">
  import Layout from '@components/Layout.svelte'
  import { Link } from '@inertiajs/svelte'

  let { auth = { user: null } }: { auth: { user: { id: number; name: string; email: string } | null } } = $props()
</script>

<Layout {auth}>
  <div class="min-h-screen bg-background text-foreground">
    <!-- Header -->
    <div class="bg-card border-b border-border">
      <div class="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8">
        <div class="flex items-center justify-between">
          <div>
            <h1 class="text-3xl font-bold text-foreground">
              Welcome back, {auth.user?.name}!
            </h1>
            <p class="text-muted-foreground mt-1">
              You're logged in and ready to build.
            </p>
          </div>
        </div>
      </div>
    </div>

    <!-- Dashboard Content -->
    <div class="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8">
      <!-- Stat Cards -->
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <!-- Stat Cards -->
        <div class="bg-card border border-border rounded-xl p-6">
          <div class="flex items-center justify-between">
            <div>
              <p class="text-muted-foreground text-sm font-medium">Total Users</p>
              <p class="text-2xl font-bold text-foreground mt-1">1,234</p>
            </div>
            <div class="w-10 h-10 rounded-lg bg-blue-900/20 flex items-center justify-center">
              <svg class="w-5 h-5 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z"></path>
              </svg>
            </div>
          </div>
        </div>

        <div class="bg-card border border-border rounded-xl p-6">
          <div class="flex items-center justify-between">
            <div>
              <p class="text-muted-foreground text-sm font-medium">Active Sessions</p>
              <p class="text-2xl font-bold text-foreground mt-1">89</p>
            </div>
            <div class="w-10 h-10 rounded-lg bg-green-900/20 flex items-center justify-center">
              <svg class="w-5 h-5 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path>
              </svg>
            </div>
          </div>
        </div>

        <div class="bg-card border border-border rounded-xl p-6">
          <div class="flex items-center justify-between">
            <div>
              <p class="text-muted-foreground text-sm font-medium">Requests/sec</p>
              <p class="text-2xl font-bold text-foreground mt-1">258k</p>
            </div>
            <div class="w-10 h-10 rounded-lg bg-orange-900/20 flex items-center justify-center">
              <svg class="w-5 h-5 text-orange-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 10V3L4 14h7v7l9-11h-7z"></path>
              </svg>
            </div>
          </div>
        </div>

        <div class="bg-card border border-border rounded-xl p-6">
          <div class="flex items-center justify-between">
            <div>
              <p class="text-muted-foreground text-sm font-medium">Uptime</p>
              <p class="text-2xl font-bold text-foreground mt-1">99.9%</p>
            </div>
            <div class="w-10 h-10 rounded-lg bg-purple-900/20 flex items-center justify-center">
              <svg class="w-5 h-5 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 12h14M5 12a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v4a2 2 0 01-2 2M5 12a2 2 0 00-2 2v4a2 2 0 002 2h14a2 2 0 002-2v-4a2 2 0 00-2-2m-2-4h.01M17 16h.01"></path>
              </svg>
            </div>
          </div>
        </div>
      </div>

      <!-- Quick Actions -->
      <div class="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <Link href="/dashboard" class="bg-card border border-border hover:border-primary/50 rounded-xl p-6 transition-all group">
          <div class="flex items-center gap-4">
            <div class="w-12 h-12 rounded-lg bg-primary/20 flex items-center justify-center group-hover:bg-primary/30 transition-colors">
              <svg class="w-6 h-6 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"></path>
              </svg>
            </div>
            <div>
              <h3 class="text-foreground font-semibold">Dashboard</h3>
              <p class="text-muted-foreground text-sm">View your dashboard</p>
            </div>
          </div>
        </Link>

        <Link href="/users" class="bg-card border border-border hover:border-blue-500/50 rounded-xl p-6 transition-all group">
          <div class="flex items-center gap-4">
            <div class="w-12 h-12 rounded-lg bg-blue-900/20 flex items-center justify-center group-hover:bg-blue-900/30 transition-colors">
              <svg class="w-6 h-6 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z"></path>
              </svg>
            </div>
            <div>
              <h3 class="text-foreground font-semibold">Users</h3>
              <p class="text-muted-foreground text-sm">Manage users</p>
            </div>
          </div>
        </Link>

        <Link href="/profile" class="bg-card border border-border hover:border-purple-500/50 rounded-xl p-6 transition-all group">
          <div class="flex items-center gap-4">
            <div class="w-12 h-12 rounded-lg bg-purple-900/20 flex items-center justify-center group-hover:bg-purple-900/30 transition-colors">
              <svg class="w-6 h-6 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"></path>
              </svg>
            </div>
            <div>
              <h3 class="text-foreground font-semibold">Profile</h3>
              <p class="text-muted-foreground text-sm">Edit your profile</p>
            </div>
          </div>
        </Link>
      </div>

      <!-- Tech Stack Info -->
      <div class="bg-card border border-border rounded-xl p-6">
        <h2 class="text-xl font-bold text-foreground mb-4">Tech Stack</h2>
        <div class="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div class="flex items-center gap-2 text-muted-foreground">
            <svg class="w-5 h-5 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 10V3L4 14h7v7l9-11h-7z"></path>
            </svg>
            <span class="text-sm">Elysia.js</span>
          </div>
          <div class="flex items-center gap-2 text-muted-foreground">
            <svg class="w-5 h-5 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1"></path>
            </svg>
            <span class="text-sm">Inertia.js</span>
          </div>
          <div class="flex items-center gap-2 text-muted-foreground">
            <svg class="w-5 h-5 text-orange-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17.657 18.657A8 8 0 016.343 7.343S7 9 9 10c0-2 .5-5 2.986-7C14 5 16.09 5.777 17.656 7.343A7.975 7.975 0 0120 13a7.975 7.975 0 01-2.343 5.657z"></path>
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9.879 16.121A3 3 0 1012.015 11L11 14H9c0 .768.293 1.536.879 2.121z"></path>
            </svg>
            <span class="text-sm">Svelte 5</span>
          </div>
          <div class="flex items-center gap-2 text-muted-foreground">
            <svg class="w-5 h-5 text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 7v10c0 2.21 3.582 4 8 4s8-1.79 8-4V7M4 7c0 2.21 3.582 4 8 4s8-1.79 8-4M4 7c0-2.21 3.582-4 8-4s8 1.79 8 4m0 5c0 2.21-3.582 4-8 4s-8-1.79-8-4"></path>
            </svg>
            <span class="text-sm">SQLite + Drizzle</span>
          </div>
        </div>
      </div>
    </div>
  </div>
</Layout>
