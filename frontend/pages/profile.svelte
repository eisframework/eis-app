<script lang="ts">
  import Layout from '@components/Layout.svelte'
  import TextInput from '@components/TextInput.svelte'
  import { router } from '@inertiajs/svelte'

  let { auth, flash }: { auth: { user: { id: number; name: string; email: string } }; flash?: { type: 'success' | 'error'; message: string } } = $props()

  let form = $state({
    name: auth.user.name,
    email: auth.user.email,
    currentPassword: '',
    password: '',
    passwordConfirmation: ''
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
      <div class="bg-white overflow-hidden shadow-sm sm:rounded-lg">
        <div class="p-6">
          <h1 class="text-2xl font-bold text-gray-900 mb-6">Change Profile</h1>

          {#if flash?.type === 'error'}
            <div class="p-4 bg-red-500/10 border border-red-500/20 rounded-lg mb-4">{flash.message}</div>
          {/if}
          {#if flash?.type === 'success'}
            <div class="p-4 bg-green-500/10 border border-green-500/20 rounded-lg mb-4">{flash.message}</div>
          {/if}

          <form onsubmit={(e) => { e.preventDefault(); submit(); }}>
            <TextInput
              name="name"
              type="text"
              label="Name"
              value={form.name}
              oninput={(e) => form.name = (e.target as HTMLInputElement).value}
              required
            />

            <TextInput
              name="email"
              type="email"
              label="Email"
              value={form.email}
              oninput={(e) => form.email = (e.target as HTMLInputElement).value}
              required
            />

            <div class="mt-6 pt-6 border-t border-gray-200">
              <h2 class="text-lg font-semibold text-gray-900 mb-4">Change Password</h2>
              <p class="text-sm text-gray-600 mb-4">Leave blank if you don't want to change your password</p>

              <TextInput
                name="currentPassword"
                type="password"
                label="Current Password"
                value={form.currentPassword}
                oninput={(e) => form.currentPassword = (e.target as HTMLInputElement).value}
              />

              <TextInput
                name="password"
                type="password"
                label="New Password"
                value={form.password}
                oninput={(e) => form.password = (e.target as HTMLInputElement).value}
              />

              <TextInput
                name="passwordConfirmation"
                type="password"
                label="Confirm New Password"
                value={form.passwordConfirmation}
                oninput={(e) => form.passwordConfirmation = (e.target as HTMLInputElement).value}
              />
            </div>

            <div class="mt-6 flex items-center justify-end">
              <button
                type="submit"
                disabled={isLoading}
                class="px-4 py-2 bg-indigo-600 text-white rounded hover:bg-indigo-700 disabled:opacity-50"
              >
                {#if isLoading}
                  Saving...
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
