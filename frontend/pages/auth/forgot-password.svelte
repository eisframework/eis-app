<script lang="ts">
  import { router } from '@inertiajs/svelte'

  let { flash }: { flash?: { type: 'success' | 'error'; message: string } } = $props()

  let form = $state({
    email: ''
  })

  let isLoading = $state(false)

  function submit() {
    isLoading = true
    router.post('/forgot-password', form, {
      onFinish: () => isLoading = false
    })
  }
</script>

<section class="relative overflow-hidden min-h-screen flex items-center justify-center py-16 bg-background">
    <div class="absolute top-0 -left-4 w-72 h-72 bg-orange-500/30 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob"></div>
    <div class="absolute top-0 -right-4 w-72 h-72 bg-purple-500/30 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-2000"></div>
    <div class="absolute bottom-0 left-1/4 w-96 h-96 bg-blue-500/20 rounded-full mix-blend-multiply filter blur-3xl opacity-10 animate-blob animation-delay-4000"></div>

    <div class="max-w-md mx-auto sm:px-6 lg:px-8 relative z-10 w-full px-6">
      <div class="rounded-2xl bg-card/80 backdrop-blur-xl border border-border/50 shadow-2xl overflow-hidden">
        <div class="p-10">
          <div class="text-center mb-10">
            <div class="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-orange-500 to-red-500 mb-6 shadow-lg shadow-orange-500/25">
              <svg class="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z"></path>
              </svg>
            </div>
            <h1 class="text-4xl font-extrabold text-foreground mb-3 tracking-tight">
              Forgot <span class="text-transparent bg-clip-text bg-gradient-to-r from-orange-400 to-red-500">Password</span>
            </h1>
            <p class="text-muted-foreground text-base leading-relaxed">Enter your email to receive a reset link</p>
          </div>

          {#if flash?.type === 'error'}
            <div class="p-4 bg-red-500/10 border border-red-500/20 rounded-lg mb-6 text-red-400 text-sm">{flash.message}</div>
          {/if}
          {#if flash?.type === 'success'}
            <div class="p-4 bg-green-500/10 border border-green-500/20 rounded-lg mb-6 text-green-400 text-sm">{flash.message}</div>
          {/if}

          <form onsubmit={(e) => { e.preventDefault(); submit(); }} class="space-y-5">
            <div>
              <label for="email" class="block text-sm font-medium text-muted-foreground mb-2.5">Email</label>
              <input
                type="email"
                id="email"
                name="email"
                value={form.email}
                oninput={(e) => form.email = (e.target as HTMLInputElement).value}
                required
                placeholder="your@email.com"
                class="w-full px-5 py-3.5 bg-background/50 border border-border rounded-xl text-base text-foreground transition-all duration-300
                       focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 focus:bg-background
                       hover:border-border/80"
              />
            </div>

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
                  Sending...
                </span>
              {:else}
                Send Password Reset Link
              {/if}
            </button>
          </form>

          <div class="mt-6 pt-6 border-t border-border">
            <p class="text-center text-sm text-muted-foreground">
              Remember your password?
              <a href="/login" class="text-primary hover:text-primary/90 font-semibold transition-colors ml-1">
                Login
              </a>
            </p>
          </div>
        </div>
      </div>
    </div>
  </section>
