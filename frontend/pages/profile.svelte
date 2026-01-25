<script lang="ts">
  import Layout from '@components/Layout.svelte'
  import { router } from '@inertiajs/svelte'

  let { auth, flash }: { auth: { user: { id: number; name: string; email: string } }; flash?: { type: 'success' | 'error'; message: string } } = $props()

  let form = $state({
    name: '',
    email: '',
    currentPassword: '',
    password: '',
    passwordConfirmation: ''
  })

  $effect(() => {
    form.name = auth.user.name
    form.email = auth.user.email
  })

  let isLoading = $state(false)

  function submit() {
    isLoading = true
    router.post('/profile', form, {
      onFinish: () => isLoading = false
    })
  }
</script>

<Layout {auth}>
  <div class="py-12">
    <div class="max-w-3xl mx-auto sm:px-6 lg:px-8">
      <div class="bg-card border border-border overflow-hidden rounded-lg">
        <div class="p-6">
          <h1 class="text-2xl font-bold text-foreground mb-6">Change Profile</h1>

          {#if flash?.type === 'error'}
            <div class="p-4 bg-red-500/10 border border-red-500/20 rounded-lg mb-4">{flash.message}</div>
          {/if}
          {#if flash?.type === 'success'}
            <div class="p-4 bg-green-500/10 border border-green-500/20 rounded-lg mb-4">{flash.message}</div>
          {/if}

          <form onsubmit={(e) => { e.preventDefault(); submit(); }} class="space-y-5">
            <div>
              <label for="name" class="block text-sm font-medium text-muted-foreground mb-2.5">Name</label>
              <input
                id="name"
                name="name"
                type="text"
                value={form.name}
                oninput={(e) => form.name = (e.target as HTMLInputElement).value}
                required
                class="w-full px-5 py-3.5 bg-background/50 border border-border rounded-xl text-base text-foreground transition-all duration-300
                       focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 focus:bg-background
                       hover:border-border/80"
              />
            </div>

            <div>
              <label for="email" class="block text-sm font-medium text-muted-foreground mb-2.5">Email</label>
              <input
                id="email"
                name="email"
                type="email"
                value={form.email}
                oninput={(e) => form.email = (e.target as HTMLInputElement).value}
                required
                class="w-full px-5 py-3.5 bg-background/50 border border-border rounded-xl text-base text-foreground transition-all duration-300
                       focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 focus:bg-background
                       hover:border-border/80"
              />
            </div>

            <div class="mt-6 pt-6 border-t border-border">
              <h2 class="text-lg font-semibold text-foreground mb-4">Change Password</h2>
              <p class="text-sm text-muted-foreground mb-4">Leave blank if you don't want to change your password</p>

            <div class="space-y-5">
              <div>
                <label for="currentPassword" class="block text-sm font-medium text-muted-foreground mb-2.5">Current Password</label>
                <input
                  id="currentPassword"
                  name="currentPassword"
                  type="password"
                  value={form.currentPassword}
                  oninput={(e) => form.currentPassword = (e.target as HTMLInputElement).value}
                  class="w-full px-5 py-3.5 bg-background/50 border border-border rounded-xl text-base text-foreground transition-all duration-300
                         focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 focus:bg-background
                         hover:border-border/80"
                />
              </div>

              <div>
                <label for="password" class="block text-sm font-medium text-muted-foreground mb-2.5">New Password</label>
                <input
                  id="password"
                  name="password"
                  type="password"
                  value={form.password}
                  oninput={(e) => form.password = (e.target as HTMLInputElement).value}
                  class="w-full px-5 py-3.5 bg-background/50 border border-border rounded-xl text-base text-foreground transition-all duration-300
                         focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 focus:bg-background
                         hover:border-border/80"
                />
              </div>

              <div>
                <label for="passwordConfirmation" class="block text-sm font-medium text-muted-foreground mb-2.5">Confirm New Password</label>
                <input
                  id="passwordConfirmation"
                  name="passwordConfirmation"
                  type="password"
                  value={form.passwordConfirmation}
                  oninput={(e) => form.passwordConfirmation = (e.target as HTMLInputElement).value}
                  class="w-full px-5 py-3.5 bg-background/50 border border-border rounded-xl text-base text-foreground transition-all duration-300
                         focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 focus:bg-background
                         hover:border-border/80"
                />
              </div>
            </div>
            </div>

            <div class="mt-6 flex items-center justify-end">
              <button
                type="submit"
                disabled={isLoading}
                class="w-full flex justify-center py-3.5 px-4 border border-transparent rounded-xl font-bold text-primary-foreground bg-primary hover:bg-primary/90 transition-all shadow-lg disabled:opacity-50 disabled:cursor-not-allowed text-base"
              >
                {#if isLoading}
                  <span class="flex items-center gap-2">
                    <svg class="animate-spin h-5 w-5" viewBox="0 0 24 24">
                      <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4" fill="none"></circle>
                      <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Saving...
                  </span>
                {:else}
                  Save Changes
                {/if}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  </div>
</Layout>
