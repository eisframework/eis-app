<script lang="ts">
  import { router } from '@inertiajs/svelte'
  import { Eye, EyeOff } from 'lucide-svelte'

  let { flash }: { flash?: { type: 'success' | 'error'; message: string } } = $props()

  let form = $state({
    email: '',
    password: ''
  })

  let isLoading = $state(false)
  let showPassword = $state(false)

  function submit() {
    isLoading = true
    router.post('/login', form, {
      onFinish: () => isLoading = false
    })
  }
</script>

<section class="relative overflow-hidden min-h-screen flex items-center justify-center bg-background m-0 p-0 mt-0 pt-0">
    <div class="absolute top-0 -left-4 w-72 h-72 bg-orange-500/30 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob"></div>
    <div class="absolute top-0 -right-4 w-72 h-72 bg-purple-500/30 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-2000"></div>
    <div class="absolute bottom-0 left-1/4 w-96 h-96 bg-blue-500/20 rounded-full mix-blend-multiply filter blur-3xl opacity-10 animate-blob animation-delay-4000"></div>

    <div class="max-w-4xl mx-auto sm:px-6 lg:px-8 relative z-10 w-full">
      <div class="md:rounded-2xl bg-card/80 backdrop-blur-xl md:border md:border-border/50 md:shadow-2xl overflow-hidden">
        <div class="flex flex-col md:flex-row">
          <!-- Left side - Branding -->
          <div class="md:w-1/2 bg-gradient-to-br from-orange-500 to-red-500 p-12 flex flex-col justify-center items-center text-white">
            <div class="inline-flex items-center justify-center w-20 h-20 rounded-2xl bg-white/20 mb-8 shadow-lg">
              <svg class="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 10V3L4 14h7v7l9-11h-7z"></path>
              </svg>
            </div>
            <h1 class="text-4xl font-extrabold mb-4 tracking-tight text-center">
              Welcome <span class="text-white/90">Back</span>
            </h1>
            <p class="text-white/80 text-lg text-center leading-relaxed">
              Sign in to your account to continue
            </p>
          </div>

          <!-- Right side - Form -->
          <div class="w-full md:w-1/2 p-6 md:p-10">

          {#if flash?.type === 'error'}
            <div class="p-4 bg-red-500/10 border border-red-500/20 rounded-lg mb-6 text-red-400 text-sm">{flash.message}</div>
          {/if}

          <a
            href="/auth/google/redirect"
            class="w-full flex items-center justify-center gap-3 py-3.5 px-4 border border-border rounded-xl font-medium text-foreground bg-background/50 hover:bg-background/80 transition-all shadow-sm hover:shadow-md text-base mb-6"
          >
            <svg class="w-5 h-5" viewBox="0 0 24 24">
              <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
              <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
            </svg>
            Sign in with Google
          </a>

          <div class="relative my-6">
            <div class="absolute inset-0 flex items-center" aria-hidden="true">
              <div class="w-full border-t border-border"></div>
            </div>
            <div class="relative flex justify-center text-sm">
              <span class="px-2 bg-card/80 backdrop-blur-xl text-muted-foreground">Or continue with</span>
            </div>
          </div>

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
              <label for="password" class="block text-sm font-medium text-muted-foreground mb-2.5">Password</label>
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
                  Signing in...
                </span>
              {:else}
                Sign In
              {/if}
            </button>
          </form>

          <div class="mt-6 pt-6 border-t border-border">
            <p class="text-center text-sm text-muted-foreground mb-4">
              Don't have an account?
              <a href="/register" class="text-primary hover:text-primary/90 font-semibold transition-colors ml-1">
                Register
              </a>
            </p>

            <p class="text-center text-sm text-muted-foreground">
              <a href="/forgot-password" class="text-primary hover:text-primary/90 font-semibold transition-colors">
                Forgot your password?
              </a>
            </p>
          </div>
          </div>
        </div>
      </div>
    </div>
  </section>
