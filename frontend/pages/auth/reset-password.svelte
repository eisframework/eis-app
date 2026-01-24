<script lang="ts">
  import { router } from '@inertiajs/svelte'
  import { Eye, EyeOff } from 'lucide-svelte'

  let { flash }: { flash?: { type: 'success' | 'error'; message: string } } = $props()

  let form = $state({
    token: '',
    email: '',
    password: '',
    passwordConfirmation: ''
  })

  let isLoading = $state(false)
  let showPassword = $state(false)
  let showPasswordConfirmation = $state(false)

  function submit() {
    isLoading = true
    router.post('/reset-password', form, {
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
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"></path>
              </svg>
            </div>
            <h1 class="text-4xl font-extrabold text-foreground mb-3 tracking-tight">
              Reset <span class="text-transparent bg-clip-text bg-gradient-to-r from-orange-400 to-red-500">Password</span>
            </h1>
            <p class="text-muted-foreground text-base leading-relaxed">Create a new secure password</p>
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

            <div class="relative">
              <label for="password" class="block text-sm font-medium text-muted-foreground mb-2.5">New Password</label>
              <div class="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  id="password"
                  name="password"
                  value={form.password}
                  oninput={(e) => form.password = (e.target as HTMLInputElement).value}
                  required
                  placeholder="••••••••"
                  class="w-full px-5 py-3.5 bg-background/50 border border-border rounded-xl text-base text-foreground transition-all duration-300 pr-11
                         focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 focus:bg-background
                         hover:border-border/80"
                />
                <button
                  type="button"
                  onclick={() => showPassword = !showPassword}
                  class="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                >
                  {#if showPassword}
                    <EyeOff class="w-5 h-5" />
                  {:else}
                    <Eye class="w-5 h-5" />
                  {/if}
                </button>
              </div>
            </div>

            <div class="relative">
              <label for="passwordConfirmation" class="block text-sm font-medium text-muted-foreground mb-2.5">Confirm Password</label>
              <div class="relative">
                <input
                  type={showPasswordConfirmation ? 'text' : 'password'}
                  id="passwordConfirmation"
                  name="passwordConfirmation"
                  value={form.passwordConfirmation}
                  oninput={(e) => form.passwordConfirmation = (e.target as HTMLInputElement).value}
                  required
                  placeholder="••••••••"
                  class="w-full px-5 py-3.5 bg-background/50 border border-border rounded-xl text-base text-foreground transition-all duration-300 pr-11
                         focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 focus:bg-background
                         hover:border-border/80"
                />
                <button
                  type="button"
                  onclick={() => showPasswordConfirmation = !showPasswordConfirmation}
                  class="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                  aria-label={showPasswordConfirmation ? 'Hide password' : 'Show password'}
                >
                  {#if showPasswordConfirmation}
                    <EyeOff class="w-5 h-5" />
                  {:else}
                    <Eye class="w-5 h-5" />
                  {/if}
                </button>
              </div>
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
                  Resetting...
                </span>
              {:else}
                Reset Password
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
